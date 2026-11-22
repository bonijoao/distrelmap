import d from "@stdlib/stats-base-dists-invgamma";
import type { Dist } from "../../lib/types";

const invgamma: Dist = {
  id: "invgamma",
  name: "Gama Inversa",
  group: "continuous",
  summary: "Recíproco de uma Gama.",
  description:
    "Distribuição de 1/X quando X é Gama. Seu uso mais comum é como priori conjugada para a variância de uma Normal.",
  uses: ["priori conjugada para variância", "estatística bayesiana"],
  params: [
    { key: "alpha", symbol: "α", label: "forma", default: 3, min: 0, exclusiveMin: true },
    { key: "beta", symbol: "β", label: "escala", default: 2, min: 0, exclusiveMin: true },
  ],
  notationTex: String.raw`X \sim GamaInv(\alpha, \beta)`,
  supportTex: String.raw`x > 0`,
  densityTex: String.raw`f(x) = \frac{\beta^\alpha}{\Gamma(\alpha)}\, x^{-\alpha-1} e^{-\beta/x}`,
  meanTex: String.raw`E(X) = \frac{\beta}{\alpha - 1} \quad (\alpha > 1)`,
  varianceTex: String.raw`Var(X) = \frac{\beta^2}{(\alpha-1)^2(\alpha-2)} \quad (\alpha > 2)`,
  support: () => [0, Infinity],
  density: (x, p) => d.pdf(x, p.alpha, p.beta),
  cdf: (x, p) => d.cdf(x, p.alpha, p.beta),
  quantile: (u, p) => d.quantile(u, p.alpha, p.beta),
  mean: (p) => (p.alpha > 1 ? p.beta / (p.alpha - 1) : Infinity),
  variance: (p) => (p.alpha > 2 ? p.beta ** 2 / ((p.alpha - 1) ** 2 * (p.alpha - 2)) : Infinity),
  relations: [
    { to: "normal", type: "conjugate", label: "priori de σ²",
      tex: String.raw`\sigma^2 \sim GamaInv(\alpha,\beta),\; X_i \mid \sigma^2 \sim N(\mu, \sigma^2) \;\Rightarrow\; \sigma^2 \mid x \sim GamaInv\left(\alpha + \tfrac{n}{2},\; \beta + \tfrac{1}{2}\textstyle\sum (x_i-\mu)^2\right)`,
      note: "Com μ conhecido." },
  ],
};
export default invgamma;
