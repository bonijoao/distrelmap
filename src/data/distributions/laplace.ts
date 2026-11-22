import d from "@stdlib/stats-base-dists-laplace";
import type { Dist } from "../../lib/types";

const laplace: Dist = {
  id: "laplace",
  name: "Laplace",
  group: "continuous",
  summary: "Dupla exponencial: pico agudo e caudas exponenciais.",
  description:
    "Diferença de duas exponenciais iguais. Aparece em regressão por mínimos desvios absolutos (mediana), em privacidade diferencial e como priori que induz esparsidade (LASSO).",
  uses: ["regressão L1 / mediana", "privacidade diferencial", "priori do LASSO"],
  params: [
    { key: "mu", symbol: "μ", label: "posição", default: 0 },
    { key: "b", symbol: "b", label: "escala", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Laplace(\mu, b)`,
  supportTex: String.raw`x \in \mathbb{R}`,
  densityTex: String.raw`f(x) = \frac{1}{2b}\, e^{-|x-\mu|/b}`,
  meanTex: String.raw`E(X) = \mu`,
  varianceTex: String.raw`Var(X) = 2b^2`,
  support: () => [-Infinity, Infinity],
  density: (x, p) => d.pdf(x, p.mu, p.b),
  cdf: (x, p) => d.cdf(x, p.mu, p.b),
  quantile: (u, p) => d.quantile(u, p.mu, p.b),
  mean: (p) => p.mu,
  variance: (p) => 2 * p.b ** 2,
  relations: [
    { to: "exponential", type: "transform", label: "|X − μ|",
      tex: String.raw`X \sim Laplace(\mu, b) \;\Rightarrow\; |X - \mu| \sim Exp(1/b)` },
  ],
};
export default laplace;
