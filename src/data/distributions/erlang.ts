import d from "@stdlib/stats-base-dists-erlang";
import type { Dist } from "../../lib/types";

const erlang: Dist = {
  id: "erlang",
  name: "Erlang",
  group: "continuous",
  summary: "Tempo até o k-ésimo evento de um processo de Poisson.",
  description:
    "Soma de k exponenciais independentes com a mesma taxa. Nasceu na teoria de filas de telefonia e é a Gama com forma inteira.",
  uses: ["teoria de filas", "tempo até k eventos", "telecomunicações"],
  params: [
    { key: "k", symbol: "k", label: "forma (nº de eventos)", default: 3, min: 1, step: 1, integer: true },
    { key: "lambda", symbol: "λ", label: "taxa", default: 1, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim Erlang(k, \lambda)`,
  supportTex: String.raw`x \geq 0`,
  densityTex: String.raw`f(x) = \frac{\lambda^k x^{k-1} e^{-\lambda x}}{(k-1)!}`,
  meanTex: String.raw`E(X) = \frac{k}{\lambda}`,
  varianceTex: String.raw`Var(X) = \frac{k}{\lambda^2}`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.k, p.lambda),
  cdf: (x, p) => d.cdf(x, p.k, p.lambda),
  quantile: (u, p) => d.quantile(u, p.k, p.lambda),
  mean: (p) => p.k / p.lambda,
  variance: (p) => p.k / p.lambda ** 2,
  relations: [
    { to: "exponential", type: "special", label: "k = 1",
      tex: String.raw`Erlang(1, \lambda) = Exp(\lambda)`,
      check: { from: { k: 1, lambda: 1.5 }, to: { lambda: 1.5 } } },
  ],
};
export default erlang;
