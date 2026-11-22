import d from "@stdlib/stats-base-dists-f";
import type { Dist } from "../../lib/types";

const f: Dist = {
  id: "f",
  name: "F de Snedecor",
  group: "inference",
  summary: "Razão de duas qui-quadrado escaladas.",
  description:
    "Distribuição da razão entre duas variâncias amostrais. Base da ANOVA e do teste F de significância global em regressão.",
  uses: ["ANOVA", "comparação de variâncias", "teste F em regressão"],
  params: [
    { key: "d1", symbol: "d₁", label: "g.l. do numerador", default: 5, min: 0, exclusiveMin: true },
    { key: "d2", symbol: "d₂", label: "g.l. do denominador", default: 10, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim F_{d_1, d_2}`,
  supportTex: String.raw`x > 0`,
  densityTex: String.raw`f(x) = \frac{\sqrt{\frac{(d_1 x)^{d_1} d_2^{d_2}}{(d_1 x + d_2)^{d_1+d_2}}}}{x\, B\left(\frac{d_1}{2}, \frac{d_2}{2}\right)}`,
  meanTex: String.raw`E(X) = \frac{d_2}{d_2-2} \quad (d_2 > 2)`,
  varianceTex: String.raw`Var(X) = \frac{2 d_2^2 (d_1+d_2-2)}{d_1 (d_2-2)^2 (d_2-4)} \quad (d_2 > 4)`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.d1, p.d2),
  cdf: (x, p) => d.cdf(x, p.d1, p.d2),
  quantile: (u, p) => d.quantile(u, p.d1, p.d2),
  mean: (p) => (p.d2 > 2 ? p.d2 / (p.d2 - 2) : Infinity),
  variance: (p) => (p.d2 > 4 ? d.variance(p.d1, p.d2) : p.d2 > 2 ? Infinity : NaN),
  defaultX: (p) => d.quantile(0.95, p.d1, p.d2),
  relations: [
    { to: "beta", type: "transform", label: "d₁X/(d₁X + d₂)",
      tex: String.raw`X \sim F_{d_1,d_2} \;\Rightarrow\; \frac{d_1 X}{d_1 X + d_2} \sim Beta\left(\frac{d_1}{2}, \frac{d_2}{2}\right)` },
    { to: "chisquare", type: "limit", label: "d₂ → ∞",
      tex: String.raw`X \sim F_{d_1,d_2} \;\Rightarrow\; d_1 X \xrightarrow{\;d_2\to\infty\;} \chi^2_{d_1}` },
  ],
};
export default f;
