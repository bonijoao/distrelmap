import d from "@stdlib/stats-base-dists-geometric";
import type { Dist } from "../../lib/types";

const geometric: Dist = {
  id: "geometric",
  name: "Geométrica",
  group: "discrete",
  summary: "Nº de fracassos antes do 1º sucesso.",
  description:
    "Análogo discreto da Exponencial e a única discreta sem memória. Aqui X conta os fracassos (x = 0, 1, …); para contar tentativas, use X + 1.",
  uses: ["tentativas até o sucesso", "tempo discreto de espera", "confiabilidade discreta"],
  params: [{ key: "p", symbol: "p", label: "prob. de sucesso", default: 0.3, min: 0, max: 1, exclusiveMin: true, step: 0.05 }],
  notationTex: String.raw`X \sim Geom(p)`,
  supportTex: String.raw`x \in \{0, 1, 2, \dots\}`,
  densityTex: String.raw`P(X = x) = p(1-p)^x`,
  meanTex: String.raw`E(X) = \frac{1-p}{p}`,
  varianceTex: String.raw`Var(X) = \frac{1-p}{p^2}`,
  support: () => [0, Infinity],
  density: (x, p) => d.pmf(x, p.p),
  cdf: (x, p) => d.cdf(x, p.p),
  quantile: (u, p) => d.quantile(u, p.p),
  mean: (p) => (1 - p.p) / p.p,
  variance: (p) => (1 - p.p) / p.p ** 2,
  relations: [
    { to: "negbinomial", type: "transform", label: "Σ Xᵢ",
      tex: String.raw`X_1,\dots,X_r \overset{iid}{\sim} Geom(p) \;\Rightarrow\; \sum X_i \sim BN(r, p)` },
  ],
};
export default geometric;
