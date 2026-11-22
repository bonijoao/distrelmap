import d from "@stdlib/stats-base-dists-gumbel";
import type { Dist } from "../../lib/types";

const gumbel: Dist = {
  id: "gumbel",
  name: "Gumbel",
  group: "continuous",
  summary: "Máximos (valores extremos) de amostras grandes.",
  description:
    "Distribuição limite do máximo de muitas variáveis com caudas exponenciais. Usada para cheias, ventos máximos e outros eventos extremos.",
  uses: ["cheias e chuvas máximas", "valores extremos", "engenharia de risco"],
  params: [
    { key: "mu", symbol: "μ", label: "posição", default: 0 },
    { key: "beta", symbol: "β", label: "escala", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Gumbel(\mu, \beta)`,
  supportTex: String.raw`x \in \mathbb{R}`,
  densityTex: String.raw`f(x) = \frac{1}{\beta}\, e^{-(z + e^{-z})}, \quad z = \frac{x-\mu}{\beta}`,
  meanTex: String.raw`E(X) = \mu + \beta\gamma_E \quad (\gamma_E \approx 0{,}5772)`,
  varianceTex: String.raw`Var(X) = \frac{\pi^2}{6}\beta^2`,
  support: () => [-Infinity, Infinity],
  density: (x, p) => d.pdf(x, p.mu, p.beta),
  cdf: (x, p) => d.cdf(x, p.mu, p.beta),
  quantile: (u, p) => d.quantile(u, p.mu, p.beta),
  mean: (p) => d.mean(p.mu, p.beta),
  variance: (p) => d.variance(p.mu, p.beta),
  relations: [],
};
export default gumbel;
