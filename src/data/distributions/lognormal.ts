import d from "@stdlib/stats-base-dists-lognormal";
import type { Dist } from "../../lib/types";

const lognormal: Dist = {
  id: "lognormal",
  name: "Log-normal",
  group: "continuous",
  summary: "Valores positivos cujo logaritmo é Normal.",
  description:
    "Resultado de muitos efeitos multiplicativos pequenos. Descreve preços de ativos, tamanhos biológicos, concentrações e tempos de reparo.",
  uses: ["preços de ativos", "concentrações", "tamanhos e pesos biológicos"],
  params: [
    { key: "mu", symbol: "μ", label: "média do log", default: 0 },
    { key: "sigma", symbol: "σ", label: "desvio padrão do log", default: 0.5, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim LogN(\mu, \sigma^2)`,
  supportTex: String.raw`x > 0`,
  densityTex: String.raw`f(x) = \frac{1}{x\sigma\sqrt{2\pi}}\, e^{-\frac{(\ln x - \mu)^2}{2\sigma^2}}`,
  meanTex: String.raw`E(X) = e^{\mu + \sigma^2/2}`,
  varianceTex: String.raw`Var(X) = \left(e^{\sigma^2} - 1\right) e^{2\mu + \sigma^2}`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.mu, p.sigma),
  cdf: (x, p) => d.cdf(x, p.mu, p.sigma),
  quantile: (u, p) => d.quantile(u, p.mu, p.sigma),
  mean: (p) => d.mean(p.mu, p.sigma),
  variance: (p) => d.variance(p.mu, p.sigma),
  relations: [
    { to: "normal", type: "transform", label: "ln X",
      tex: String.raw`X \sim LogN(\mu, \sigma^2) \;\Rightarrow\; \ln X \sim N(\mu, \sigma^2)` },
  ],
};
export default lognormal;
