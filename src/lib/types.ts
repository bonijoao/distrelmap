// Contrato de uma distribuição. Cada arquivo em src/data/distributions/
// exporta um objeto `Dist` como default; o registro é automático.

export type Params = Record<string, number>;

export type Group = "discrete" | "inference" | "continuous";

export type RelType = "special" | "transform" | "limit" | "conjugate";

export interface Param {
  key: string;
  /** símbolo curto, em texto (ex.: "μ", "σ", "n") */
  symbol: string;
  label: string;
  default: number;
  min?: number;
  max?: number;
  /** se true, o valor precisa ser estritamente maior que `min` */
  exclusiveMin?: boolean;
  step?: number;
  integer?: boolean;
}

export interface Relation {
  /** id da distribuição de destino */
  to: string;
  type: RelType;
  /** rótulo curto da seta, em texto (ex.: "n = 1", "TCL") */
  label: string;
  /** enunciado completo em LaTeX */
  tex: string;
  /** observação opcional em texto */
  note?: string;
  /**
   * Só para casos particulares: parâmetros de origem e destino que devem
   * produzir a MESMA distribuição. Os testes verificam isso numericamente.
   */
  check?: { from: Params; to: Params };
}

export interface Dist {
  id: string;
  name: string;
  group: Group;
  /** frase curta */
  summary: string;
  /** 1–3 frases explicando para que serve */
  description: string;
  uses: string[];
  params: Param[];
  notationTex: string;
  supportTex: string;
  densityTex: string;
  meanTex: string;
  varianceTex: string;
  support: (p: Params) => [number, number];
  density: (x: number, p: Params) => number;
  cdf: (x: number, p: Params) => number;
  quantile: (u: number, p: Params) => number;
  mean: (p: Params) => number;
  variance: (p: Params) => number;
  /** validação além dos limites declarados em `params`; devolve a mensagem de erro */
  validate?: (p: Params) => string | null;
  /** x inicial sugerido */
  defaultX?: (p: Params) => number;
  relations: Relation[];
}

export const isDiscrete = (d: Dist) => d.group === "discrete";
