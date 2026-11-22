import d from "@stdlib/stats-base-dists-negative-binomial";
import type { Dist } from "../../lib/types";

const negbinomial: Dist = {
  id: "negbinomial",
  name: "Binomial Negativa",
  group: "discrete",
  summary: "Nº de fracassos antes do r-ésimo sucesso.",
  description:
    "Generaliza a Geométrica. Também é a contagem com sobredispersão (variância maior que a média), alternativa à Poisson quando os dados variam demais.",
  uses: ["contagens com sobredispersão", "tentativas até r sucessos", "ecologia e epidemiologia"],
  params: [
    { key: "r", symbol: "r", label: "nº de sucessos", default: 3, min: 0, exclusiveMin: true },
    { key: "p", symbol: "p", label: "prob. de sucesso", default: 0.5, min: 0, max: 1, exclusiveMin: true, step: 0.05 },
  ],
  notationTex: String.raw`X \sim BN(r, p)`,
  supportTex: String.raw`x \in \{0, 1, 2, \dots\}`,
  densityTex: String.raw`P(X = x) = \binom{x + r - 1}{x} p^r (1-p)^x`,
  meanTex: String.raw`E(X) = \frac{r(1-p)}{p}`,
  varianceTex: String.raw`Var(X) = \frac{r(1-p)}{p^2}`,
  support: () => [0, Infinity],
  density: (x, p) => d.pmf(x, p.r, p.p),
  cdf: (x, p) => d.cdf(x, p.r, p.p),
  quantile: (u, p) => d.quantile(u, p.r, p.p),
  mean: (p) => (p.r * (1 - p.p)) / p.p,
  variance: (p) => (p.r * (1 - p.p)) / p.p ** 2,
  relations: [
    { to: "geometric", type: "special", label: "r = 1",
      tex: String.raw`BN(1, p) = Geom(p)`,
      check: { from: { r: 1, p: 0.4 }, to: { p: 0.4 } } },
    { to: "poisson", type: "limit", label: "r → ∞",
      tex: String.raw`BN(r, p) \xrightarrow{\;r\to\infty,\; r(1-p)/p = \lambda\;} Poisson(\lambda)` },
  ],
};
export default negbinomial;
