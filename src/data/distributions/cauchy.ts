import d from "@stdlib/stats-base-dists-cauchy";
import type { Dist } from "../../lib/types";

const cauchy: Dist = {
  id: "cauchy",
  name: "Cauchy",
  group: "continuous",
  summary: "Simétrica, sem média nem variância.",
  description:
    "Caudas tão pesadas que a média e a variância não existem; a média amostral de Cauchys é Cauchy. Contraexemplo clássico do Teorema Central do Limite e modelo de linhas espectrais (Lorentz).",
  uses: ["contraexemplo do TCL", "espectroscopia (Lorentziana)", "priori robusta"],
  params: [
    { key: "x0", symbol: "x₀", label: "posição (mediana)", default: 0 },
    { key: "gamma", symbol: "γ", label: "escala", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Cauchy(x_0, \gamma)`,
  supportTex: String.raw`x \in \mathbb{R}`,
  densityTex: String.raw`f(x) = \frac{1}{\pi\gamma\left[1 + \left(\frac{x - x_0}{\gamma}\right)^2\right]}`,
  meanTex: String.raw`E(X) \text{ não existe}`,
  varianceTex: String.raw`Var(X) \text{ não existe}`,
  support: () => [-Infinity, Infinity],
  density: (x, p) => d.pdf(x, p.x0, p.gamma),
  cdf: (x, p) => d.cdf(x, p.x0, p.gamma),
  quantile: (u, p) => d.quantile(u, p.x0, p.gamma),
  mean: () => NaN,
  variance: () => NaN,
  defaultX: (p) => p.x0 + 2 * p.gamma,
  relations: [],
};
export default cauchy;
