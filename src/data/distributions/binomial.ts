import d from "@stdlib/stats-base-dists-binomial";
import type { Dist } from "../../lib/types";

const binomial: Dist = {
  id: "binomial",
  name: "Binomial",
  group: "discrete",
  summary: "Nº de sucessos em n ensaios independentes.",
  description:
    "Conta sucessos em um número fixo de ensaios independentes com a mesma probabilidade p. Base de testes e intervalos para proporções.",
  uses: ["proporções", "controle de qualidade", "ensaios clínicos"],
  params: [
    { key: "n", symbol: "n", label: "nº de ensaios", default: 10, min: 1, step: 1, integer: true },
    { key: "p", symbol: "p", label: "prob. de sucesso", default: 0.5, min: 0, max: 1, step: 0.05 },
  ],
  notationTex: String.raw`X \sim B(n, p)`,
  supportTex: String.raw`x \in \{0, 1, \dots, n\}`,
  densityTex: String.raw`P(X = x) = \binom{n}{x} p^x (1-p)^{n-x}`,
  meanTex: String.raw`E(X) = np`,
  varianceTex: String.raw`Var(X) = np(1-p)`,
  support: (p) => [0, p.n],
  density: (x, p) => d.pmf(x, p.n, p.p),
  cdf: (x, p) => d.cdf(x, p.n, p.p),
  quantile: (u, p) => d.quantile(u, p.n, p.p),
  mean: (p) => p.n * p.p,
  variance: (p) => p.n * p.p * (1 - p.p),
  relations: [
    { to: "bernoulli", type: "special", label: "n = 1",
      tex: String.raw`B(1, p) = Bernoulli(p)`,
      check: { from: { n: 1, p: 0.3 }, to: { p: 0.3 } } },
    { to: "poisson", type: "limit", label: "n → ∞, np = λ",
      tex: String.raw`B(n, p) \xrightarrow{\;n\to\infty,\; np = \lambda\;} Poisson(\lambda)` },
    { to: "normal", type: "limit", label: "TCL",
      tex: String.raw`B(n, p) \approx N\big(np,\; np(1-p)\big) \text{ para } n \text{ grande}` },
  ],
};
export default binomial;
