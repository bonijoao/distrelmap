import d from "@stdlib/stats-base-dists-poisson";
import type { Dist } from "../../lib/types";

const poisson: Dist = {
  id: "poisson",
  name: "Poisson",
  group: "discrete",
  summary: "Contagem de eventos raros num intervalo.",
  description:
    "Número de eventos num intervalo de tempo ou espaço quando eles ocorrem de forma independente a uma taxa constante. Média e variância são iguais a λ.",
  uses: ["contagens", "chegadas em filas", "acidentes, defeitos e chamadas"],
  params: [{ key: "lambda", symbol: "λ", label: "taxa média", default: 4, min: 0, exclusiveMin: true }],
  notationTex: String.raw`X \sim Poisson(\lambda)`,
  supportTex: String.raw`x \in \{0, 1, 2, \dots\}`,
  densityTex: String.raw`P(X = x) = \frac{\lambda^x e^{-\lambda}}{x!}`,
  meanTex: String.raw`E(X) = \lambda`,
  varianceTex: String.raw`Var(X) = \lambda`,
  support: () => [0, Infinity],
  density: (x, p) => d.pmf(x, p.lambda),
  cdf: (x, p) => d.cdf(x, p.lambda),
  quantile: (u, p) => d.quantile(u, p.lambda),
  mean: (p) => p.lambda,
  variance: (p) => p.lambda,
  relations: [
    { to: "normal", type: "limit", label: "λ → ∞",
      tex: String.raw`Poisson(\lambda) \approx N(\lambda, \lambda) \text{ para } \lambda \text{ grande}` },
  ],
};
export default poisson;
