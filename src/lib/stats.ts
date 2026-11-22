// Cálculo genérico — não conhece nenhuma distribuição específica.
import { Dist, Params, isDiscrete } from "./types";

export type ProbType =
  | "less" | "less_eq" | "greater" | "greater_eq" | "equal" | "between" | "outside";

// Em contínuas P(X = x) = 0, então não há "=" nem distinção entre < e ≤.
export const CONTINUOUS_TYPES: ProbType[] = ["less", "greater", "between", "outside"];
export const DISCRETE_TYPES: ProbType[] = ["less_eq", "less", "greater_eq", "greater", "equal", "between"];

export const probTypes = (d: Dist) => (isDiscrete(d) ? DISCRETE_TYPES : CONTINUOUS_TYPES);
export const isInterval = (t: ProbType) => t === "between" || t === "outside";

export const defaultParams = (d: Dist): Params =>
  Object.fromEntries(d.params.map((p) => [p.key, p.default]));

/** Mensagem de erro, ou null se os parâmetros são válidos */
export function validateParams(d: Dist, p: Params): string | null {
  for (const par of d.params) {
    const v = p[par.key];
    if (v === undefined || !Number.isFinite(v)) return `Preencha ${par.symbol}.`;
    if (par.integer && Math.abs(v - Math.round(v)) > 1e-9) return `${par.symbol} deve ser inteiro.`;
    if (par.min !== undefined) {
      if (par.exclusiveMin ? v <= par.min : v < par.min) {
        return `${par.symbol} deve ser ${par.exclusiveMin ? "maior que" : "no mínimo"} ${par.min}.`;
      }
    }
    if (par.max !== undefined && v > par.max) return `${par.symbol} deve ser no máximo ${par.max}.`;
  }
  return d.validate ? d.validate(p) : null;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** P(evento) dado x (e x2 nos intervalos) */
export function probFromX(d: Dist, p: Params, type: ProbType, x: number, x2?: number): number {
  const F = (q: number) => d.cdf(q, p);
  const a = Math.min(x, x2 ?? x);
  const b = Math.max(x, x2 ?? x);
  let r: number;
  if (isDiscrete(d)) {
    switch (type) {
      case "less_eq": r = F(Math.floor(x)); break;
      case "less": r = F(Math.ceil(x) - 1); break;
      case "greater_eq": r = 1 - F(Math.ceil(x) - 1); break;
      case "greater": r = 1 - F(Math.floor(x)); break;
      case "equal": r = Math.abs(x - Math.round(x)) < 1e-9 ? d.density(Math.round(x), p) : 0; break;
      case "between": r = F(Math.floor(b)) - F(Math.ceil(a) - 1); break;
      default: throw new Error(`tipo inválido para discreta: ${type}`);
    }
  } else {
    switch (type) {
      case "less": r = F(x); break;
      case "greater": r = 1 - F(x); break;
      case "between": r = F(b) - F(a); break;
      case "outside": r = 1 - (F(b) - F(a)); break;
      default: throw new Error(`tipo inválido para contínua: ${type}`);
    }
  }
  return clamp01(r);
}

/** Inteiros cobrindo praticamente todo o suporte de uma discreta */
export function discreteGrid(d: Dist, p: Params): number[] {
  const [lo0, hi0] = d.support(p);
  const lo = Number.isFinite(lo0) ? lo0 : d.quantile(1e-12, p);
  let hi = Math.min(hi0, d.quantile(1 - 1e-12, p));
  hi = Math.min(hi, lo + 200000);
  const out: number[] = [];
  for (let k = lo; k <= hi; k++) out.push(k);
  return out;
}

/**
 * x (ou [a, b]) dado P; null quando não há solução.
 * Contínuas: quantil exato; intervalos centrais (caudas iguais).
 * Discretas, convenção de valor crítico:
 *   P(X ≤ x) ≥ p, P(X < x) ≥ p → menor x;  P(X ≥ x) ≥ p, P(X > x) ≥ p → maior x.
 */
export function xFromProb(d: Dist, p: Params, prob: number, type: ProbType): number[] | null {
  if (!Number.isFinite(prob) || prob < 0 || prob > 1) return null;
  const Q = (u: number) => d.quantile(u, p);
  let xs: number[];
  if (isDiscrete(d)) {
    switch (type) {
      case "less_eq": xs = [Q(prob)]; break;
      case "less": xs = [Q(prob) + 1]; break;
      case "greater_eq":
      case "greater": {
        const ok = discreteGrid(d, p).filter((g) => probFromX(d, p, type, g) >= prob - 1e-12);
        if (!ok.length) return null;
        xs = [ok[ok.length - 1]];
        break;
      }
      case "between": xs = [Q((1 - prob) / 2), Q((1 + prob) / 2)]; break;
      default: return null;
    }
  } else {
    switch (type) {
      case "less": xs = [Q(prob)]; break;
      case "greater": xs = [Q(1 - prob)]; break;
      case "between": xs = [Q((1 - prob) / 2), Q((1 + prob) / 2)]; break;
      case "outside": xs = [Q(prob / 2), Q(1 - prob / 2)]; break;
      default: return null;
    }
  }
  return xs.every(Number.isFinite) ? xs : null;
}

/** x inicial sugerido para um tipo de probabilidade */
export function defaultX(d: Dist, p: Params, type: ProbType): number[] {
  const nice = (v: number) => (isDiscrete(d) ? Math.round(v) : Number(v.toPrecision(3)));
  if (isInterval(type)) return [nice(d.quantile(0.025, p)), nice(d.quantile(0.975, p))];
  const v = d.defaultX ? d.defaultX(p) : isDiscrete(d) ? d.quantile(0.5, p) : d.quantile(0.95, p);
  return [nice(v)];
}

/** Faixa de x do gráfico: 99,9% da massa, incluindo os x do usuário */
export function plotRange(d: Dist, p: Params, xs: number[] = []): [number, number] {
  const Q = (u: number) => d.quantile(u, p);
  const [slo, shi] = d.support(p);
  let lo = Q(0.0005);
  let hi = Q(0.9995);
  const fx = xs.filter(Number.isFinite);
  if (fx.length) {
    lo = Math.min(lo, Math.max(Math.min(...fx), Q(1e-6)));
    hi = Math.max(hi, Math.min(Math.max(...fx), Q(1 - 1e-6)));
  }
  const span = hi - lo;
  if (Number.isFinite(slo) && lo - slo < 0.08 * span) lo = slo;
  if (Number.isFinite(shi) && shi - hi < 0.08 * span) hi = shi;
  lo = Math.max(lo, slo);
  hi = Math.min(hi, shi);
  if (isDiscrete(d)) {
    lo = Math.floor(lo);
    hi = Math.max(Math.ceil(hi), lo + 1);
  }
  return [lo, hi];
}

/** Pertence ao evento? (para sombrear o gráfico) */
// Nas discretas < e > são estritos; nas contínuas a fronteira entra nas duas
// regiões (tem probabilidade zero), o que deixa o sombreado sem buracos.
export function inEvent(x: number, type: ProbType, x1: number, x2: number | undefined, discrete: boolean): boolean {
  const a = Math.min(x1, x2 ?? x1);
  const b = Math.max(x1, x2 ?? x1);
  const e = 1e-9;
  switch (type) {
    case "less": return discrete ? x < x1 - e : x <= x1 + e;
    case "less_eq": return x <= x1 + e;
    case "greater": return discrete ? x > x1 + e : x >= x1 - e;
    case "greater_eq": return x >= x1 - e;
    case "equal": return Math.abs(x - x1) < e;
    case "between": return x >= a - e && x <= b + e;
    case "outside": return x <= a + e || x >= b - e;
  }
}
