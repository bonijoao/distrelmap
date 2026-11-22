import d from "@stdlib/stats-base-dists-arcsine";
import type { Dist } from "../../lib/types";

const arcsine: Dist = {
  id: "arcsine",
  name: "Arcoseno",
  group: "continuous",
  summary: "Em forma de U: valores concentrados nas pontas.",
  description:
    "Surge na lei do arcoseno dos passeios aleatórios: a fração do tempo que um passeio passa acima de zero tende a ficar perto de 0 ou de 1, não de ½.",
  uses: ["passeios aleatórios", "posição de um oscilador harmônico"],
  params: [
    { key: "a", symbol: "a", label: "mínimo", default: 0 },
    { key: "b", symbol: "b", label: "máximo", default: 1 },
  ],
  notationTex: String.raw`X \sim Arcoseno(a, b)`,
  supportTex: String.raw`a < x < b`,
  densityTex: String.raw`f(x) = \frac{1}{\pi\sqrt{(x-a)(b-x)}}`,
  meanTex: String.raw`E(X) = \frac{a+b}{2}`,
  varianceTex: String.raw`Var(X) = \frac{(b-a)^2}{8}`,
  support: (p) => [p.a, p.b],
  density: (x, p) => d.pdf(x, p.a, p.b),
  cdf: (x, p) => d.cdf(x, p.a, p.b),
  quantile: (u, p) => d.quantile(u, p.a, p.b),
  mean: (p) => (p.a + p.b) / 2,
  variance: (p) => (p.b - p.a) ** 2 / 8,
  validate: (p) => (p.a < p.b ? null : "a deve ser menor que b."),
  defaultX: (p) => p.a + 0.9 * (p.b - p.a),
  relations: [],
};
export default arcsine;
