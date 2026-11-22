import d from "@stdlib/stats-base-dists-exponential";
import type { Dist } from "../../lib/types";

const exponential: Dist = {
  id: "exponential",
  name: "Exponencial",
  group: "continuous",
  summary: "Tempo até o próximo evento; sem memória.",
  description:
    "Tempo de espera entre eventos de um processo de Poisson. É a única contínua sem memória: P(X > s + t | X > s) = P(X > t).",
  uses: ["tempo de vida", "tempo entre chegadas", "confiabilidade (MTBF)"],
  params: [{ key: "lambda", symbol: "λ", label: "taxa", default: 1, min: 0, exclusiveMin: true }],
  notationTex: String.raw`X \sim Exp(\lambda)`,
  supportTex: String.raw`x \geq 0`,
  densityTex: String.raw`f(x) = \lambda e^{-\lambda x}`,
  meanTex: String.raw`E(X) = \frac{1}{\lambda}`,
  varianceTex: String.raw`Var(X) = \frac{1}{\lambda^2}`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.lambda),
  cdf: (x, p) => d.cdf(x, p.lambda),
  quantile: (u, p) => d.quantile(u, p.lambda),
  mean: (p) => 1 / p.lambda,
  variance: (p) => 1 / p.lambda ** 2,
  relations: [
    { to: "erlang", type: "transform", label: "Σ Xᵢ",
      tex: String.raw`X_1,\dots,X_k \overset{iid}{\sim} Exp(\lambda) \;\Rightarrow\; \sum X_i \sim Erlang(k, \lambda)` },
    { to: "weibull", type: "transform", label: "λ X^(1/k)",
      tex: String.raw`X \sim Exp(1) \;\Rightarrow\; \lambda X^{1/k} \sim Weibull(k, \lambda)` },
    { to: "pareto", type: "transform", label: "xₘ eˣ",
      tex: String.raw`X \sim Exp(\alpha) \;\Rightarrow\; x_m e^{X} \sim Pareto(\alpha, x_m)` },
    { to: "laplace", type: "transform", label: "X₁ − X₂",
      tex: String.raw`X_1, X_2 \overset{iid}{\sim} Exp(\lambda) \;\Rightarrow\; X_1 - X_2 \sim Laplace(0, 1/\lambda)` },
    { to: "gumbel", type: "transform", label: "−ln X",
      tex: String.raw`X \sim Exp(1) \;\Rightarrow\; -\ln X \sim Gumbel(0, 1)` },
    { to: "geometric", type: "transform", label: "⌊X⌋",
      tex: String.raw`X \sim Exp(\lambda) \;\Rightarrow\; \lfloor X \rfloor \sim Geom(p = 1 - e^{-\lambda})` },
  ],
};
export default exponential;
