import type { ProbType } from "./stats";

export function fmtNum(x: number | undefined | null, digits = 4): string {
  if (x === undefined || x === null || Number.isNaN(x)) return "—";
  if (!Number.isFinite(x)) return x > 0 ? "∞" : "−∞";
  if (Math.abs(x - Math.round(x)) < 1e-9 && Math.abs(x) < 1e9) return String(Math.round(x));
  if (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-4) return x.toExponential(3);
  return x.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

export function fmtProb(p: number | undefined | null): string {
  if (p === undefined || p === null || Number.isNaN(p)) return "—";
  if (p > 0 && p < 1e-4) return p.toExponential(3);
  return p.toFixed(4);
}

/** Texto do evento: "P(X < 1.96)", "P(2 ≤ X ≤ 7)". Aceita números ou rótulos. */
export function formatEvent(type: ProbType, x: number | string, x2?: number | string, discrete = false): string {
  const f = (v: number | string) => (typeof v === "string" ? v : fmtNum(v));
  let a = x, b = x2 ?? x;
  if (typeof a === "number" && typeof b === "number" && a > b) [a, b] = [b, a];
  const rel = discrete ? "≤" : "<";
  switch (type) {
    case "less": return `P(X < ${f(x)})`;
    case "less_eq": return `P(X ≤ ${f(x)})`;
    case "greater": return `P(X > ${f(x)})`;
    case "greater_eq": return `P(X ≥ ${f(x)})`;
    case "equal": return `P(X = ${f(x)})`;
    case "between": return `P(${f(a)} ${rel} X ${rel} ${f(b)})`;
    case "outside": return `P(X < ${f(a)}) + P(X > ${f(b)})`;
  }
}

export const probTypeLabel = (type: ProbType, discrete: boolean) =>
  type === "between" || type === "outside"
    ? formatEvent(type, "a", "b", discrete)
    : formatEvent(type, "x", undefined, discrete);

/** Aceita vírgula ou ponto como separador decimal */
export function parseNum(s: string): number {
  const t = s.trim().replace(",", ".");
  if (t === "" || t === "-" || t === ".") return NaN;
  return Number(t);
}

/** Valor para exibir num campo de texto, com vírgula (pt-BR) */
export function toField(x: number, digits = 6): string {
  if (!Number.isFinite(x)) return "";
  const s = Math.abs(x) < 1e-4 && x !== 0 ? x.toExponential(4) : String(Number(x.toPrecision(digits)));
  return s.replace(".", ",");
}
