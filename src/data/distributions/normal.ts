import d from "@stdlib/stats-base-dists-normal";
import type { Dist } from "../../lib/types";

const normal: Dist = {
  id: "normal",
  name: "Normal",
  group: "inference",
  summary: "Simétrica em forma de sino.",
  description:
    "Modela variação contínua gerada pela soma de muitos efeitos pequenos e independentes. É a referência para erros de medida e para aproximações em grandes amostras (Teorema Central do Limite).",
  uses: ["erro de medida", "variação de processos", "resíduos de regressão", "aproximação em grandes amostras"],
  params: [
    { key: "mu", symbol: "μ", label: "média", default: 0 },
    { key: "sigma", symbol: "σ", label: "desvio padrão", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim N(\mu, \sigma^2)`,
  supportTex: String.raw`x \in \mathbb{R}`,
  densityTex: String.raw`f(x) = \frac{1}{\sigma\sqrt{2\pi}}\, e^{-\frac{(x-\mu)^2}{2\sigma^2}}`,
  meanTex: String.raw`E(X) = \mu`,
  varianceTex: String.raw`Var(X) = \sigma^2`,
  support: () => [-Infinity, Infinity],
  density: (x, p) => d.pdf(x, p.mu, p.sigma),
  cdf: (x, p) => d.cdf(x, p.mu, p.sigma),
  quantile: (u, p) => d.quantile(u, p.mu, p.sigma),
  mean: (p) => p.mu,
  variance: (p) => p.sigma ** 2,
  defaultX: (p) => p.mu + 1.96 * p.sigma,
  relations: [
    { to: "lognormal", type: "transform", label: "eˣ",
      tex: String.raw`X \sim N(\mu,\sigma^2) \;\Rightarrow\; e^{X} \sim LogN(\mu,\sigma^2)` },
    { to: "chisquare", type: "transform", label: "Σ Z²",
      tex: String.raw`Z_1,\dots,Z_k \overset{iid}{\sim} N(0,1) \;\Rightarrow\; \sum_{i=1}^k Z_i^2 \sim \chi^2_k` },
    { to: "chi", type: "transform", label: "√(Σ Z²)",
      tex: String.raw`Z_1,\dots,Z_k \overset{iid}{\sim} N(0,1) \;\Rightarrow\; \sqrt{\textstyle\sum Z_i^2} \sim \chi_k` },
    { to: "t", type: "transform", label: "Z / √(V/ν)",
      tex: String.raw`Z \sim N(0,1),\; V \sim \chi^2_\nu \text{ independentes} \;\Rightarrow\; \frac{Z}{\sqrt{V/\nu}} \sim t_\nu` },
    { to: "cauchy", type: "transform", label: "Z₁ / Z₂",
      tex: String.raw`Z_1, Z_2 \overset{iid}{\sim} N(0,1) \;\Rightarrow\; Z_1/Z_2 \sim Cauchy(0,1)` },
  ],
};
export default normal;
