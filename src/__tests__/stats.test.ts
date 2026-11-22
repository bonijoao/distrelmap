import { describe, expect, it } from "vitest";
import { BY_ID, DISTS } from "../data";
import { defaultParams, defaultX, isInterval, plotRange, probFromX, probTypes, xFromProb } from "../lib/stats";
import { formatEvent, fmtNum, fmtProb, parseNum, probTypeLabel } from "../lib/format";
import { isDiscrete } from "../lib/types";

const N = BY_ID.normal, B = BY_ID.binomial;
const n01 = { mu: 0, sigma: 1 };

describe("tipos de probabilidade", () => {
  it("contínuas não oferecem P(X = x)", () => {
    for (const d of DISTS.filter((d) => !isDiscrete(d))) {
      expect(probTypes(d)).not.toContain("equal");
      for (const t of probTypes(d)) expect(probTypeLabel(t, false)).not.toContain("X =");
    }
  });
  it("o evento exibido é o calculado (regressão do probcalc)", () => {
    expect(formatEvent("less", 2)).toBe("P(X < 2)");
    expect(formatEvent("between", 3, -1)).toBe("P(-1 < X < 3)");
    expect(formatEvent("between", 2, 7, true)).toBe("P(2 ≤ X ≤ 7)");
  });
});

describe("probFromX", () => {
  it("contínuas", () => {
    expect(probFromX(N, n01, "less", 1.96)).toBeCloseTo(0.9750021, 6);
    expect(probFromX(N, n01, "outside", -1.96, 1.96)).toBeCloseTo(0.0499958, 6);
    expect(probFromX(N, { mu: 10, sigma: 2 }, "less", 12)).toBeCloseTo(0.8413447, 6);
  });
  it("discretas", () => {
    const p = { n: 10, p: 0.5 };
    expect(probFromX(B, p, "less_eq", 3)).toBeCloseTo(0.171875, 9);
    expect(probFromX(B, p, "less", 3)).toBeCloseTo(0.0546875, 9);
    expect(probFromX(B, p, "greater_eq", 3)).toBeCloseTo(0.9453125, 9);
    expect(probFromX(B, p, "greater", 3)).toBeCloseTo(0.828125, 9);
    expect(probFromX(B, p, "equal", 3)).toBeCloseTo(0.1171875, 9);
    expect(probFromX(B, p, "equal", 3.5)).toBe(0);
    expect(probFromX(B, p, "between", 2, 8)).toBeCloseTo(0.9785156, 6);
  });
});

describe("xFromProb", () => {
  it("contínuas invertem exatamente", () => {
    for (const d of DISTS.filter((d) => !isDiscrete(d))) {
      const p = defaultParams(d);
      for (const t of probTypes(d)) {
        const xs = xFromProb(d, p, 0.9, t)!;
        expect(xs, `${d.id} ${t}`).not.toBeNull();
        expect(probFromX(d, p, t, xs[0], isInterval(t) ? xs[1] : undefined)).toBeCloseTo(0.9, 6);
      }
    }
  });
  it("discretas seguem a convenção de valor crítico", () => {
    for (const d of DISTS.filter(isDiscrete)) {
      const p = defaultParams(d);
      for (const t of ["less_eq", "less", "greater_eq", "greater"] as const) {
        const xs = xFromProb(d, p, 0.6, t);
        if (!xs) continue; // ex.: P(X > x) ≥ 0,6 pode não ter solução
        const x = xs[0];
        expect(probFromX(d, p, t, x)).toBeGreaterThanOrEqual(0.6 - 1e-12);
        const step = t === "less_eq" || t === "less" ? -1 : 1;
        expect(probFromX(d, p, t, x + step), `${d.id} ${t}`).toBeLessThan(0.6);
      }
    }
    expect(xFromProb(B, { n: 10, p: 0.5 }, 0.5, "equal")).toBeNull();
    expect(xFromProb(N, n01, 1.5, "less")).toBeNull();
  });
});

describe("defaultX e plotRange", () => {
  it("todo x inicial gera probabilidade válida", () => {
    for (const d of DISTS) {
      const p = defaultParams(d);
      for (const t of probTypes(d)) {
        const xs = defaultX(d, p, t);
        const pr = probFromX(d, p, t, xs[0], xs[1]);
        expect(pr >= 0 && pr <= 1, `${d.id} ${t}`).toBe(true);
      }
    }
  });
  it("faixa respeita suporte e inclui o x do usuário", () => {
    const r = plotRange(N, { mu: 100, sigma: 15 }, [160]);
    expect(r[0]).toBeLessThanOrEqual(55);
    expect(r[1]).toBeGreaterThanOrEqual(160);
    expect(plotRange(BY_ID.exponential, { lambda: 1 })[0]).toBe(0);
    expect(plotRange(BY_ID.beta, { alpha: 2, beta: 2 })).toEqual([0, 1]);
  });
});

describe("formatação", () => {
  it("números", () => {
    expect(fmtNum(2)).toBe("2");
    expect(fmtNum(1.959964)).toBe("1.96");
    expect(fmtNum(Infinity)).toBe("∞");
    expect(fmtProb(0.97725)).toBe("0.9772");
    expect(parseNum("1,96")).toBe(1.96);
    expect(Number.isNaN(parseNum("-"))).toBe(true);
  });
});
