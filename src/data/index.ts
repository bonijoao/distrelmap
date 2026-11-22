// Registro automático: todo arquivo em ./distributions vira uma distribuição.
// Para adicionar uma nova, basta criar o arquivo — nada mais muda.
import type { Dist, Group, RelType, Relation } from "../lib/types";

const modules = import.meta.glob<{ default: Dist }>("./distributions/*.ts", { eager: true });

export const DISTS: Dist[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.name.localeCompare(b.name, "pt"));

export const BY_ID: Record<string, Dist> = Object.fromEntries(DISTS.map((d) => [d.id, d]));

export interface Edge extends Relation {
  id: string;
  from: string;
}

export const EDGES: Edge[] = DISTS.flatMap((d) =>
  d.relations.map((r, i) => ({ ...r, from: d.id, id: `${d.id}-${r.type}-${r.to}-${i}` })),
);

export const GROUPS: Record<Group, { label: string; color: string; shape: string }> = {
  discrete: { label: "Discretas", color: "#2f7fd8", shape: "round-rectangle" },
  inference: { label: "Inferência clássica", color: "#12a37f", shape: "ellipse" },
  continuous: { label: "Contínuas aplicadas", color: "#e07a2f", shape: "ellipse" },
};

export const REL_TYPES: Record<RelType, { label: string; color: string; dash: boolean; dotted: boolean; verb: string }> = {
  special: { label: "Caso particular", color: "#3a5ccc", dash: false, dotted: false, verb: "é caso particular" },
  transform: { label: "Transformação", color: "#d9822b", dash: false, dotted: false, verb: "transformação" },
  limit: { label: "Limite / aproximação", color: "#16a34a", dash: true, dotted: false, verb: "limite" },
  conjugate: { label: "Priori conjugada", color: "#9b4dca", dash: false, dotted: true, verb: "priori conjugada" },
};

export const outgoing = (id: string) => EDGES.filter((e) => e.from === id);
export const incoming = (id: string) => EDGES.filter((e) => e.to === id);
