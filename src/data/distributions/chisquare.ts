import d from "@stdlib/stats-base-dists-chisquare";
import type { Dist } from "../../lib/types";

const chisquare: Dist = {
  id: "chisquare",
  name: "Qui-quadrado",
  group: "inference",
  summary: "Soma de quadrados de normais padrão.",
  description:
    "Aparece em testes de aderência e independência, na distribuição da variância amostral e em testes de razão de verossimilhança.",
  uses: ["teste qui-quadrado", "variância amostral", "razão de verossimilhança"],
  params: [{ key: "k", symbol: "k", label: "graus de liberdade", default: 4, min: 0, exclusiveMin: true }],
  notationTex: String.raw`X \sim \chi^2_k`,
  supportTex: String.raw`x > 0`,
  densityTex: String.raw`f(x) = \frac{1}{2^{k/2}\,\Gamma(k/2)}\, x^{k/2-1} e^{-x/2}`,
  meanTex: String.raw`E(X) = k`,
  varianceTex: String.raw`Var(X) = 2k`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.k),
  cdf: (x, p) => d.cdf(x, p.k),
  quantile: (u, p) => d.quantile(u, p.k),
  mean: (p) => p.k,
  variance: (p) => 2 * p.k,
  defaultX: (p) => d.quantile(0.95, p.k),
  relations: [
    { to: "f", type: "transform", label: "(V₁/d₁)/(V₂/d₂)",
      tex: String.raw`V_1 \sim \chi^2_{d_1},\; V_2 \sim \chi^2_{d_2} \text{ indep.} \;\Rightarrow\; \frac{V_1/d_1}{V_2/d_2} \sim F_{d_1,d_2}` },
    { to: "chi", type: "transform", label: "√V",
      tex: String.raw`V \sim \chi^2_k \;\Rightarrow\; \sqrt{V} \sim \chi_k` },
    { to: "exponential", type: "special", label: "k = 2",
      tex: String.raw`\chi^2_2 = Exp(\lambda = 1/2)`,
      check: { from: { k: 2 }, to: { lambda: 0.5 } } },
    { to: "normal", type: "limit", label: "k → ∞",
      tex: String.raw`\chi^2_k \approx N(k,\, 2k) \text{ para } k \text{ grande}` },
  ],
};
export default chisquare;
