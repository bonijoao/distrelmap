import d from "@stdlib/stats-base-dists-discrete-uniform";
import type { Dist } from "../../lib/types";

const discreteuniform: Dist = {
  id: "discreteuniform",
  name: "Uniforme Discreta",
  group: "discrete",
  summary: "Inteiros de a a b, todos com a mesma chance.",
  description:
    "Modela escolhas equiprováveis entre um número finito de inteiros, como o resultado de um dado honesto.",
  uses: ["dados e sorteios", "escolha aleatória", "priori não informativa discreta"],
  params: [
    { key: "a", symbol: "a", label: "mínimo", default: 1, step: 1, integer: true },
    { key: "b", symbol: "b", label: "máximo", default: 6, step: 1, integer: true },
  ],
  notationTex: String.raw`X \sim UD(a, b)`,
  supportTex: String.raw`x \in \{a, a+1, \dots, b\}`,
  densityTex: String.raw`P(X = x) = \frac{1}{b - a + 1}`,
  meanTex: String.raw`E(X) = \frac{a+b}{2}`,
  varianceTex: String.raw`Var(X) = \frac{(b-a+1)^2 - 1}{12}`,
  support: (p) => [p.a, p.b],
  density: (x, p) => d.pmf(x, p.a, p.b),
  cdf: (x, p) => d.cdf(x, p.a, p.b),
  // menor x com F(x) ≥ u (o quantil do stdlib erra por 1 quando u·n é inteiro)
  quantile: (u, p) => {
    if (!(u >= 0 && u <= 1)) return NaN;
    const n = p.b - p.a + 1;
    return p.a + Math.max(0, Math.ceil(u * n - 1e-9) - 1);
  },
  mean: (p) => (p.a + p.b) / 2,
  variance: (p) => ((p.b - p.a + 1) ** 2 - 1) / 12,
  validate: (p) => (p.a <= p.b ? null : "a não pode ser maior que b."),
  relations: [
    { to: "uniform", type: "limit", label: "b − a → ∞",
      tex: String.raw`X \sim UD(a, b) \;\Rightarrow\; \frac{X - a}{b - a} \xrightarrow{\;b-a\to\infty\;} U(0, 1)` },
  ],
};
export default discreteuniform;
