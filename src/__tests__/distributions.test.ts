// Testes de contrato: rodam para TODA distribuição em src/data/distributions.
// Uma distribuição nova que passa aqui está pronta para o app.
import { describe, expect, it } from "vitest";
import { BY_ID, DISTS, EDGES } from "../data";
import { defaultParams, discreteGrid, validateParams } from "../lib/stats";
import { isDiscrete } from "../lib/types";

const HEAVY_TAIL: Record<string, Record<string, number>> = {
  pareto: { alpha: 8 },
  invgamma: { alpha: 8 },
};

const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

describe.each(DISTS.map((d) => [d.id, d] as const))("%s", (_id, d) => {
  const p = defaultParams(d);

  it("tem textos e parâmetros padrão válidos", () => {
    expect(d.name.length).toBeGreaterThan(0);
    expect(d.description.length).toBeGreaterThan(20);
    expect(validateParams(d, p)).toBeNull();
  });

  it("quantil inverte a acumulada", () => {
    for (const u of [0.05, 0.3, 0.5, 0.8, 0.95]) {
      const q = d.quantile(u, p);
      if (isDiscrete(d)) {
        expect(d.cdf(q, p)).toBeGreaterThanOrEqual(u - 1e-12);
        expect(d.cdf(q - 1, p)).toBeLessThan(u);
      } else {
        expect(close(d.cdf(q, p), u, 1e-7)).toBe(true);
      }
    }
  });

  it("densidade é coerente com a acumulada", () => {
    if (isDiscrete(d)) {
      const g = discreteGrid(d, p);
      const total = g.reduce((s, k) => s + d.density(k, p), 0);
      expect(close(total, 1, 1e-8)).toBe(true);
      const x = g[Math.min(4, g.length - 1)];
      const acc = g.filter((k) => k <= x).reduce((s, k) => s + d.density(k, p), 0);
      expect(close(d.cdf(x, p), acc, 1e-9)).toBe(true);
    } else {
      // derivada numérica da acumulada ≈ densidade em pontos interiores
      for (const u of [0.2, 0.5, 0.8]) {
        const x = d.quantile(u, p);
        const h = 1e-5 * Math.max(1, Math.abs(x));
        const deriv = (d.cdf(x + h, p) - d.cdf(x - h, p)) / (2 * h);
        expect(close(deriv, d.density(x, p), 1e-4)).toBe(true);
      }
    }
  });

  it("média e variância batem com a integração numérica", () => {
    // caudas pesadas (4º momento infinito) fazem a integração convergir mal:
    // conferimos essas com um parâmetro de forma maior
    const p = { ...defaultParams(d), ...(HEAVY_TAIL[d.id] ?? {}) };
    const m = d.mean(p);
    const v = d.variance(p);
    if (!Number.isFinite(m) || !Number.isFinite(v)) return;
    let em: number, ev: number;
    if (isDiscrete(d)) {
      const g = discreteGrid(d, p);
      em = g.reduce((s, k) => s + k * d.density(k, p), 0);
      ev = g.reduce((s, k) => s + (k - em) ** 2 * d.density(k, p), 0);
    } else {
      // E[g(X)] = ∫₀¹ g(Q(u)) du — regra do ponto médio no espaço u
      const N = 200000;
      let s1 = 0, s2 = 0;
      for (let i = 0; i < N; i++) {
        const q = d.quantile((i + 0.5) / N, p);
        s1 += q;
        s2 += q * q;
      }
      em = s1 / N;
      ev = s2 / N - em * em;
    }
    expect(close(m, em, 2e-3)).toBe(true);
    expect(close(v, ev, 2e-2)).toBe(true);
  });
});

describe("relações", () => {
  it("todo destino existe e não há laços", () => {
    for (const e of EDGES) {
      expect(BY_ID[e.to], `${e.from} → ${e.to}`).toBeDefined();
      expect(e.to).not.toBe(e.from);
    }
  });

  it("não há relações duplicadas", () => {
    const keys = EDGES.map((e) => `${e.from}|${e.to}|${e.type}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("toda distribuição está ligada ao mapa", () => {
    const linked = new Set(EDGES.flatMap((e) => [e.from, e.to]));
    for (const d of DISTS) expect(linked.has(d.id), d.id).toBe(true);
  });

  it("casos particulares: os parâmetros declarados geram a mesma distribuição", () => {
    const specials = EDGES.filter((e) => e.type === "special");
    for (const e of specials) {
      expect(e.check, `${e.from} → ${e.to} sem check`).toBeDefined();
      const A = BY_ID[e.from], B = BY_ID[e.to];
      const pa = { ...defaultParams(A), ...e.check!.from };
      const pb = { ...defaultParams(B), ...e.check!.to };
      for (const u of [0.1, 0.25, 0.5, 0.75, 0.9]) {
        const x = B.quantile(u, pb);
        expect(close(A.cdf(x, pa), B.cdf(x, pb), 1e-8), `${e.from} → ${e.to} em x=${x}`).toBe(true);
        expect(close(A.density(x, pa), B.density(x, pb), 1e-6), `${e.from} → ${e.to} f(${x})`).toBe(true);
      }
    }
  });
});
