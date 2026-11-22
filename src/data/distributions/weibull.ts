import d from "@stdlib/stats-base-dists-weibull";
import type { Dist } from "../../lib/types";

const weibull: Dist = {
  id: "weibull",
  name: "Weibull",
  group: "continuous",
  summary: "Tempo de vida com taxa de falha crescente ou decrescente.",
  description:
    "Padrão em confiabilidade: forma k < 1 indica falhas precoces, k = 1 taxa constante (Exponencial) e k > 1 desgaste. Também usada para velocidade do vento.",
  uses: ["confiabilidade", "análise de sobrevivência", "velocidade do vento"],
  params: [
    { key: "k", symbol: "k", label: "forma", default: 2, min: 0, exclusiveMin: true },
    { key: "lambda", symbol: "λ", label: "escala", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Weibull(k, \lambda)`,
  supportTex: String.raw`x \geq 0`,
  densityTex: String.raw`f(x) = \frac{k}{\lambda}\left(\frac{x}{\lambda}\right)^{k-1} e^{-(x/\lambda)^k}`,
  meanTex: String.raw`E(X) = \lambda\, \Gamma\left(1 + \frac{1}{k}\right)`,
  varianceTex: String.raw`Var(X) = \lambda^2\left[\Gamma\left(1+\frac{2}{k}\right) - \Gamma^2\left(1+\frac{1}{k}\right)\right]`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.k, p.lambda),
  cdf: (x, p) => d.cdf(x, p.k, p.lambda),
  quantile: (u, p) => d.quantile(u, p.k, p.lambda),
  mean: (p) => d.mean(p.k, p.lambda),
  variance: (p) => d.variance(p.k, p.lambda),
  relations: [
    { to: "exponential", type: "special", label: "k = 1",
      tex: String.raw`Weibull(1, \lambda) = Exp(1/\lambda)`,
      check: { from: { k: 1, lambda: 2 }, to: { lambda: 0.5 } } },
    { to: "rayleigh", type: "special", label: "k = 2",
      tex: String.raw`Weibull(2,\, \sigma\sqrt{2}) = Rayleigh(\sigma)`,
      check: { from: { k: 2, lambda: 2 * Math.SQRT2 }, to: { sigma: 2 } } },
  ],
};
export default weibull;
