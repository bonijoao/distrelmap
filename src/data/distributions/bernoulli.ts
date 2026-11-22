import d from "@stdlib/stats-base-dists-bernoulli";
import type { Dist } from "../../lib/types";

const bernoulli: Dist = {
  id: "bernoulli",
  name: "Bernoulli",
  group: "discrete",
  summary: "Um único ensaio: sucesso (1) ou fracasso (0).",
  description:
    "O bloco mais simples da probabilidade discreta. Somas de Bernoullis dão a Binomial; esperar o primeiro sucesso dá a Geométrica.",
  uses: ["evento sim/não", "classificação binária", "bloco de construção de outras discretas"],
  params: [{ key: "p", symbol: "p", label: "prob. de sucesso", default: 0.3, min: 0, max: 1, step: 0.05 }],
  notationTex: String.raw`X \sim Bernoulli(p)`,
  supportTex: String.raw`x \in \{0, 1\}`,
  densityTex: String.raw`P(X = x) = p^x (1-p)^{1-x}`,
  meanTex: String.raw`E(X) = p`,
  varianceTex: String.raw`Var(X) = p(1-p)`,
  support: () => [0, 1],
  density: (x, p) => d.pmf(x, p.p),
  cdf: (x, p) => d.cdf(x, p.p),
  quantile: (u, p) => d.quantile(u, p.p),
  mean: (p) => p.p,
  variance: (p) => p.p * (1 - p.p),
  defaultX: () => 1,
  relations: [
    { to: "binomial", type: "transform", label: "Σ Xᵢ",
      tex: String.raw`X_1,\dots,X_n \overset{iid}{\sim} Bernoulli(p) \;\Rightarrow\; \sum X_i \sim B(n, p)` },
  ],
};
export default bernoulli;
