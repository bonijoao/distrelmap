import d from "@stdlib/stats-base-dists-logistic";
import type { Dist } from "../../lib/types";

const logistic: Dist = {
  id: "logistic",
  name: "Logística",
  group: "continuous",
  summary: "Parecida com a Normal, com caudas um pouco mais pesadas.",
  description:
    "Sua acumulada é a função logística (sigmoide). É a distribuição latente por trás da regressão logística e modela curvas de crescimento.",
  uses: ["regressão logística (variável latente)", "curvas de crescimento", "rating Elo"],
  params: [
    { key: "mu", symbol: "μ", label: "posição", default: 0 },
    { key: "s", symbol: "s", label: "escala", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Logística(\mu, s)`,
  supportTex: String.raw`x \in \mathbb{R}`,
  densityTex: String.raw`f(x) = \frac{e^{-(x-\mu)/s}}{s\left(1 + e^{-(x-\mu)/s}\right)^2}`,
  meanTex: String.raw`E(X) = \mu`,
  varianceTex: String.raw`Var(X) = \frac{s^2\pi^2}{3}`,
  support: () => [-Infinity, Infinity],
  density: (x, p) => d.pdf(x, p.mu, p.s),
  cdf: (x, p) => d.cdf(x, p.mu, p.s),
  quantile: (u, p) => d.quantile(u, p.mu, p.s),
  mean: (p) => p.mu,
  variance: (p) => (p.s ** 2 * Math.PI ** 2) / 3,
  relations: [],
};
export default logistic;
