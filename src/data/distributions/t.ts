import d from "@stdlib/stats-base-dists-t";
import type { Dist } from "../../lib/types";

const t: Dist = {
  id: "t",
  name: "t de Student",
  group: "inference",
  summary: "Simétrica, com caudas mais pesadas que a Normal.",
  description:
    "Distribuição da média padronizada quando o desvio padrão é estimado pela amostra. Base de testes t e intervalos de confiança para médias.",
  uses: ["teste t", "intervalo de confiança para a média", "regressão (coeficientes)"],
  params: [{ key: "nu", symbol: "ν", label: "graus de liberdade", default: 5, min: 0, exclusiveMin: true }],
  notationTex: String.raw`X \sim t_\nu`,
  supportTex: String.raw`x \in \mathbb{R}`,
  densityTex: String.raw`f(x) = \frac{\Gamma\left(\frac{\nu+1}{2}\right)}{\sqrt{\nu\pi}\,\Gamma\left(\frac{\nu}{2}\right)} \left(1+\frac{x^2}{\nu}\right)^{-\frac{\nu+1}{2}}`,
  meanTex: String.raw`E(X) = 0 \quad (\nu > 1)`,
  varianceTex: String.raw`Var(X) = \frac{\nu}{\nu-2} \quad (\nu > 2)`,
  support: () => [-Infinity, Infinity],
  density: (x, p) => d.pdf(x, p.nu),
  cdf: (x, p) => d.cdf(x, p.nu),
  quantile: (u, p) => d.quantile(u, p.nu),
  mean: (p) => (p.nu > 1 ? 0 : NaN),
  variance: (p) => (p.nu > 2 ? p.nu / (p.nu - 2) : p.nu > 1 ? Infinity : NaN),
  defaultX: (p) => d.quantile(0.975, p.nu),
  relations: [
    { to: "normal", type: "limit", label: "ν → ∞",
      tex: String.raw`t_\nu \xrightarrow{\;\nu\to\infty\;} N(0,1)` },
    { to: "cauchy", type: "special", label: "ν = 1",
      tex: String.raw`t_1 = Cauchy(0, 1)`,
      check: { from: { nu: 1 }, to: { x0: 0, gamma: 1 } } },
    { to: "f", type: "transform", label: "T²",
      tex: String.raw`T \sim t_\nu \;\Rightarrow\; T^2 \sim F_{1,\nu}` },
  ],
};
export default t;
