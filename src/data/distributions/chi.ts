import d from "@stdlib/stats-base-dists-chi";
import type { Dist } from "../../lib/types";

const chi: Dist = {
  id: "chi",
  name: "Qui",
  group: "inference",
  summary: "Raiz quadrada de uma qui-quadrado.",
  description:
    "Distribuição da norma (comprimento) de um vetor de k normais padrão independentes. Para k = 2 é a Rayleigh; para k = 3, a Maxwell–Boltzmann.",
  uses: ["norma de vetores aleatórios", "desvio padrão amostral (escalado)"],
  params: [{ key: "k", symbol: "k", label: "graus de liberdade", default: 3, min: 0, exclusiveMin: true }],
  notationTex: String.raw`X \sim \chi_k`,
  supportTex: String.raw`x > 0`,
  densityTex: String.raw`f(x) = \frac{x^{k-1} e^{-x^2/2}}{2^{k/2-1}\,\Gamma(k/2)}`,
  meanTex: String.raw`E(X) = \sqrt{2}\,\frac{\Gamma((k+1)/2)}{\Gamma(k/2)}`,
  varianceTex: String.raw`Var(X) = k - E(X)^2`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.k),
  cdf: (x, p) => d.cdf(x, p.k),
  quantile: (u, p) => d.quantile(u, p.k),
  mean: (p) => d.mean(p.k),
  variance: (p) => d.variance(p.k),
  relations: [
    { to: "rayleigh", type: "special", label: "k = 2",
      tex: String.raw`\chi_2 = Rayleigh(\sigma = 1)`,
      check: { from: { k: 2 }, to: { sigma: 1 } } },
  ],
};
export default chi;
