import d from "@stdlib/stats-base-dists-pareto-type1";
import type { Dist } from "../../lib/types";

const pareto: Dist = {
  id: "pareto",
  name: "Pareto",
  group: "continuous",
  summary: "Cauda pesada: poucos valores muito grandes.",
  description:
    "Lei de potência para valores acima de um mínimo. Descreve renda e riqueza, tamanho de cidades e perdas extremas (\"regra 80/20\").",
  uses: ["renda e riqueza", "perdas extremas", "tamanho de arquivos e cidades"],
  params: [
    { key: "alpha", symbol: "α", label: "forma", default: 3, min: 0, exclusiveMin: true },
    { key: "xm", symbol: "xₘ", label: "mínimo (escala)", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Pareto(\alpha, x_m)`,
  supportTex: String.raw`x \geq x_m`,
  densityTex: String.raw`f(x) = \frac{\alpha\, x_m^\alpha}{x^{\alpha+1}}`,
  meanTex: String.raw`E(X) = \frac{\alpha x_m}{\alpha - 1} \quad (\alpha > 1)`,
  varianceTex: String.raw`Var(X) = \frac{\alpha x_m^2}{(\alpha-1)^2(\alpha-2)} \quad (\alpha > 2)`,
  support: (p) => [p.xm, Infinity],
  density: (x, p) => d.pdf(x, p.alpha, p.xm),
  cdf: (x, p) => d.cdf(x, p.alpha, p.xm),
  quantile: (u, p) => d.quantile(u, p.alpha, p.xm),
  mean: (p) => (p.alpha > 1 ? (p.alpha * p.xm) / (p.alpha - 1) : Infinity),
  variance: (p) => (p.alpha > 2 ? (p.alpha * p.xm ** 2) / ((p.alpha - 1) ** 2 * (p.alpha - 2)) : Infinity),
  relations: [
    { to: "exponential", type: "transform", label: "ln(X/xₘ)",
      tex: String.raw`X \sim Pareto(\alpha, x_m) \;\Rightarrow\; \ln(X/x_m) \sim Exp(\alpha)` },
  ],
};
export default pareto;
