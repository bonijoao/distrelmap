import d from "@stdlib/stats-base-dists-uniform";
import type { Dist } from "../../lib/types";

const uniform: Dist = {
  id: "uniform",
  name: "Uniforme",
  group: "continuous",
  summary: "Todos os valores de um intervalo igualmente prováveis.",
  description:
    "Modela ignorância total dentro de um intervalo. A Uniforme(0, 1) é a matéria-prima da simulação: qualquer distribuição se obtém dela pela transformada inversa.",
  uses: ["simulação (transformada inversa)", "erro de arredondamento", "priori não informativa"],
  params: [
    { key: "a", symbol: "a", label: "mínimo", default: 0 },
    { key: "b", symbol: "b", label: "máximo", default: 1 },
  ],
  notationTex: String.raw`X \sim U(a, b)`,
  supportTex: String.raw`a \leq x \leq b`,
  densityTex: String.raw`f(x) = \frac{1}{b - a}`,
  meanTex: String.raw`E(X) = \frac{a+b}{2}`,
  varianceTex: String.raw`Var(X) = \frac{(b-a)^2}{12}`,
  support: (p) => [p.a, p.b],
  density: (x, p) => d.pdf(x, p.a, p.b),
  cdf: (x, p) => d.cdf(x, p.a, p.b),
  quantile: (u, p) => d.quantile(u, p.a, p.b),
  mean: (p) => (p.a + p.b) / 2,
  variance: (p) => (p.b - p.a) ** 2 / 12,
  validate: (p) => (p.a < p.b ? null : "a deve ser menor que b."),
  relations: [
    { to: "exponential", type: "transform", label: "−ln(U)/λ",
      tex: String.raw`U \sim U(0,1) \;\Rightarrow\; -\frac{\ln U}{\lambda} \sim Exp(\lambda)` },
    { to: "logistic", type: "transform", label: "ln(U/(1−U))",
      tex: String.raw`U \sim U(0,1) \;\Rightarrow\; \ln\frac{U}{1-U} \sim Logística(0, 1)` },
  ],
};
export default uniform;
