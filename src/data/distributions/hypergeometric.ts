import d from "@stdlib/stats-base-dists-hypergeometric";
import type { Dist } from "../../lib/types";

const hypergeometric: Dist = {
  id: "hypergeometric",
  name: "Hipergeométrica",
  group: "discrete",
  summary: "Sucessos numa amostra sem reposição.",
  description:
    "Conta sucessos ao sortear n itens, sem reposição, de uma população de N itens com K sucessos. Base do teste exato de Fisher e da inspeção de lotes.",
  uses: ["amostragem sem reposição", "inspeção de lotes", "teste exato de Fisher"],
  params: [
    { key: "N", symbol: "N", label: "tamanho da população", default: 50, min: 1, step: 1, integer: true },
    { key: "K", symbol: "K", label: "sucessos na população", default: 20, min: 0, step: 1, integer: true },
    { key: "n", symbol: "n", label: "tamanho da amostra", default: 10, min: 1, step: 1, integer: true },
  ],
  notationTex: String.raw`X \sim H(N, K, n)`,
  supportTex: String.raw`x \in \{\max(0, n-N+K), \dots, \min(n, K)\}`,
  densityTex: String.raw`P(X = x) = \frac{\binom{K}{x}\binom{N-K}{n-x}}{\binom{N}{n}}`,
  meanTex: String.raw`E(X) = n\frac{K}{N}`,
  varianceTex: String.raw`Var(X) = n\frac{K}{N}\left(1 - \frac{K}{N}\right)\frac{N-n}{N-1}`,
  support: (p) => [Math.max(0, p.n - (p.N - p.K)), Math.min(p.n, p.K)],
  density: (x, p) => d.pmf(x, p.N, p.K, p.n),
  cdf: (x, p) => d.cdf(x, p.N, p.K, p.n),
  quantile: (u, p) => d.quantile(u, p.N, p.K, p.n),
  mean: (p) => (p.n * p.K) / p.N,
  variance: (p) => (p.N > 1 ? ((p.n * p.K) / p.N) * (1 - p.K / p.N) * ((p.N - p.n) / (p.N - 1)) : 0),
  validate: (p) => (p.K > p.N ? "K não pode ser maior que N." : p.n > p.N ? "n não pode ser maior que N." : null),
  relations: [
    { to: "binomial", type: "limit", label: "N → ∞, K/N = p",
      tex: String.raw`H(N, K, n) \xrightarrow{\;N\to\infty,\; K/N = p\;} B(n, p)`,
      note: "Na prática, vale quando a amostra é pequena perto da população (n/N < 5%)." },
  ],
};
export default hypergeometric;
