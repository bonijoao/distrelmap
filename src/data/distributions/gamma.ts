import d from "@stdlib/stats-base-dists-gamma";
import type { Dist } from "../../lib/types";

const gamma: Dist = {
  id: "gamma",
  name: "Gama",
  group: "continuous",
  summary: "Família flexível para valores positivos e assimétricos.",
  description:
    "Generaliza a Exponencial: com forma inteira é o tempo até o α-ésimo evento de um processo de Poisson. Muito usada para tempos de espera, valores monetários e como priori conjugada.",
  uses: ["tempos de espera", "sinistros e valores positivos", "priori conjugada (Poisson, Exponencial)"],
  params: [
    { key: "alpha", symbol: "α", label: "forma", default: 2, min: 0, exclusiveMin: true },
    { key: "beta", symbol: "β", label: "taxa", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Gama(\alpha, \beta)`,
  supportTex: String.raw`x > 0`,
  densityTex: String.raw`f(x) = \frac{\beta^\alpha}{\Gamma(\alpha)}\, x^{\alpha-1} e^{-\beta x}`,
  meanTex: String.raw`E(X) = \frac{\alpha}{\beta}`,
  varianceTex: String.raw`Var(X) = \frac{\alpha}{\beta^2}`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.alpha, p.beta),
  cdf: (x, p) => d.cdf(x, p.alpha, p.beta),
  quantile: (u, p) => d.quantile(u, p.alpha, p.beta),
  mean: (p) => p.alpha / p.beta,
  variance: (p) => p.alpha / p.beta ** 2,
  relations: [
    { to: "exponential", type: "special", label: "α = 1",
      tex: String.raw`Gama(1, \beta) = Exp(\beta)`,
      check: { from: { alpha: 1, beta: 2 }, to: { lambda: 2 } } },
    { to: "erlang", type: "special", label: "α inteiro",
      tex: String.raw`Gama(k, \beta) = Erlang(k, \beta), \; k \in \{1, 2, \dots\}`,
      check: { from: { alpha: 3, beta: 2 }, to: { k: 3, lambda: 2 } } },
    { to: "chisquare", type: "special", label: "α = k/2, β = 1/2",
      tex: String.raw`Gama(k/2,\, 1/2) = \chi^2_k`,
      check: { from: { alpha: 2.5, beta: 0.5 }, to: { k: 5 } } },
    { to: "beta", type: "transform", label: "X₁/(X₁ + X₂)",
      tex: String.raw`X_i \sim Gama(\alpha_i, \beta) \text{ indep.} \;\Rightarrow\; \frac{X_1}{X_1 + X_2} \sim Beta(\alpha_1, \alpha_2)` },
    { to: "invgamma", type: "transform", label: "1/X",
      tex: String.raw`X \sim Gama(\alpha, \beta) \;\Rightarrow\; 1/X \sim GamaInv(\alpha, \beta)` },
    { to: "normal", type: "limit", label: "α → ∞",
      tex: String.raw`Gama(\alpha,\beta) \approx N\left(\frac{\alpha}{\beta}, \frac{\alpha}{\beta^2}\right) \text{ para } \alpha \text{ grande}` },
    { to: "poisson", type: "conjugate", label: "priori de λ",
      tex: String.raw`\lambda \sim Gama(\alpha,\beta),\; X_i \mid \lambda \sim Poisson(\lambda) \;\Rightarrow\; \lambda \mid x \sim Gama\left(\alpha + \textstyle\sum x_i,\; \beta + n\right)` },
    { to: "exponential", type: "conjugate", label: "priori de λ",
      tex: String.raw`\lambda \sim Gama(\alpha,\beta),\; X_i \mid \lambda \sim Exp(\lambda) \;\Rightarrow\; \lambda \mid x \sim Gama\left(\alpha + n,\; \beta + \textstyle\sum x_i\right)` },
  ],
};
export default gamma;
