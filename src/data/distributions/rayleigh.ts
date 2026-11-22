import d from "@stdlib/stats-base-dists-rayleigh";
import type { Dist } from "../../lib/types";

const rayleigh: Dist = {
  id: "rayleigh",
  name: "Rayleigh",
  group: "continuous",
  summary: "Módulo de um vetor 2D com componentes normais.",
  description:
    "Distância à origem de um ponto cujas coordenadas são normais independentes de mesma variância. Usada para amplitude de sinais e velocidade do vento.",
  uses: ["amplitude de sinais", "velocidade do vento", "erro de posicionamento 2D"],
  params: [{ key: "sigma", symbol: "σ", label: "escala", default: 1, min: 0, exclusiveMin: true }],
  notationTex: String.raw`X \sim Rayleigh(\sigma)`,
  supportTex: String.raw`x \geq 0`,
  densityTex: String.raw`f(x) = \frac{x}{\sigma^2} e^{-x^2/(2\sigma^2)}`,
  meanTex: String.raw`E(X) = \sigma\sqrt{\pi/2}`,
  varianceTex: String.raw`Var(X) = \frac{4-\pi}{2}\,\sigma^2`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.sigma),
  cdf: (x, p) => d.cdf(x, p.sigma),
  quantile: (u, p) => d.quantile(u, p.sigma),
  mean: (p) => d.mean(p.sigma),
  variance: (p) => d.variance(p.sigma),
  relations: [
    { to: "exponential", type: "transform", label: "X²",
      tex: String.raw`X \sim Rayleigh(\sigma) \;\Rightarrow\; X^2 \sim Exp\left(\frac{1}{2\sigma^2}\right)` },
  ],
};
export default rayleigh;
