import d from "@stdlib/stats-base-dists-beta";
import type { Dist } from "../../lib/types";

const beta: Dist = {
  id: "beta",
  name: "Beta",
  group: "continuous",
  summary: "Proporções e probabilidades no intervalo (0, 1).",
  description:
    "Família muito flexível em (0, 1): simétrica, assimétrica, em U ou uniforme. É a priori conjugada natural para uma probabilidade p.",
  uses: ["proporções", "priori para probabilidades", "estatísticas de ordem da uniforme"],
  params: [
    { key: "alpha", symbol: "α", label: "forma 1", default: 2, min: 0, exclusiveMin: true },
    { key: "beta", symbol: "β", label: "forma 2", default: 5, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Beta(\alpha, \beta)`,
  supportTex: String.raw`0 < x < 1`,
  densityTex: String.raw`f(x) = \frac{x^{\alpha-1}(1-x)^{\beta-1}}{B(\alpha, \beta)}`,
  meanTex: String.raw`E(X) = \frac{\alpha}{\alpha+\beta}`,
  varianceTex: String.raw`Var(X) = \frac{\alpha\beta}{(\alpha+\beta)^2(\alpha+\beta+1)}`,
  support: () => [0, 1],
  density: (x, p) => d.pdf(x, p.alpha, p.beta),
  cdf: (x, p) => d.cdf(x, p.alpha, p.beta),
  quantile: (u, p) => d.quantile(u, p.alpha, p.beta),
  mean: (p) => d.mean(p.alpha, p.beta),
  variance: (p) => d.variance(p.alpha, p.beta),
  relations: [
    { to: "uniform", type: "special", label: "α = β = 1",
      tex: String.raw`Beta(1, 1) = U(0, 1)`,
      check: { from: { alpha: 1, beta: 1 }, to: { a: 0, b: 1 } } },
    { to: "arcsine", type: "special", label: "α = β = ½",
      tex: String.raw`Beta(1/2, 1/2) = Arcoseno(0, 1)`,
      check: { from: { alpha: 0.5, beta: 0.5 }, to: { a: 0, b: 1 } } },
    { to: "bernoulli", type: "conjugate", label: "priori de p",
      tex: String.raw`p \sim Beta(\alpha,\beta),\; X_i \mid p \sim Bernoulli(p) \;\Rightarrow\; p \mid x \sim Beta\left(\alpha + \textstyle\sum x_i,\; \beta + n - \sum x_i\right)` },
    { to: "binomial", type: "conjugate", label: "priori de p",
      tex: String.raw`p \sim Beta(\alpha,\beta),\; X \mid p \sim B(n, p) \;\Rightarrow\; p \mid x \sim Beta(\alpha + x,\; \beta + n - x)` },
    { to: "geometric", type: "conjugate", label: "priori de p",
      tex: String.raw`p \sim Beta(\alpha,\beta),\; X_i \mid p \sim Geom(p) \;\Rightarrow\; p \mid x \sim Beta\left(\alpha + n,\; \beta + \textstyle\sum x_i\right)` },
    { to: "negbinomial", type: "conjugate", label: "priori de p",
      tex: String.raw`p \sim Beta(\alpha,\beta),\; X_i \mid p \sim BN(r, p) \;\Rightarrow\; p \mid x \sim Beta\left(\alpha + rn,\; \beta + \textstyle\sum x_i\right)` },
  ],
};
export default beta;
