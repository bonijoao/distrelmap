import { BY_ID, DISTS, EDGES, GROUPS, REL_TYPES, incoming, outgoing, type Edge } from "../data";
import { Tex } from "./Tex";
import type { Selection } from "./MapView";

interface Props {
  sel: Selection;
  edge?: Edge;
  onSelect: (s: Selection) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}

function RelLine({ type }: { type: Edge["type"] }) {
  const v = REL_TYPES[type];
  return (
    <svg width="22" height="10" className="rel-line" aria-hidden="true">
      <line x1="1" y1="5" x2="21" y2="5" stroke={v.color} strokeWidth="2.5"
        strokeDasharray={v.dotted ? "2 3" : v.dash ? "5 3" : undefined} />
    </svg>
  );
}

function RelList({ title, edges, dir, onSelect }: { title: string; edges: Edge[]; dir: "out" | "in"; onSelect: Props["onSelect"] }) {
  if (!edges.length) return null;
  return (
    <section className="rel-section">
      <h4>{title}</h4>
      <ul className="rel-list">
        {edges.map((e) => {
          const other = BY_ID[dir === "out" ? e.to : e.from];
          return (
            <li key={e.id}>
              <button onClick={() => onSelect({ kind: "edge", id: e.id })}>
                <RelLine type={e.type} />
                <span className="rel-name">{other.name}</span>
                <span className="rel-label">{e.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DetailPanel({ sel, edge, onSelect, onOpen, onClose }: Props) {
  if (!sel) {
    return (
      <aside className="panel panel-empty">
        <h2>Mapa das distribuições</h2>
        <p>
          {DISTS.length} distribuições e {EDGES.length} relações. Toque numa distribuição para ver de onde ela vem e
          para onde leva; toque numa seta para ver a relação.
        </p>
        <p className="muted">
          A seta vai da distribuição mais geral para o caso particular, do original para o transformado e da exata
          para a aproximação.
        </p>
        <p className="muted ref">
          Referência: Leemis, L. M. &amp; McQueston, J. T. (2008). <i>Univariate Distribution Relationships</i>. The
          American Statistician, 62(1), 45–53.
        </p>
      </aside>
    );
  }

  if (sel.kind === "edge" && edge) {
    const A = BY_ID[edge.from], B = BY_ID[edge.to];
    const t = REL_TYPES[edge.type];
    return (
      <aside className="panel">
        <button className="panel-close" onClick={onClose} aria-label="Fechar">×</button>
        <span className="badge" style={{ color: t.color, borderColor: t.color + "55", background: t.color + "12" }}>{t.label}</span>
        <h2 className="edge-title">
          <button className="link" onClick={() => onSelect({ kind: "node", id: A.id })}>{A.name}</button>
          <span className="arrow">→</span>
          <button className="link" onClick={() => onSelect({ kind: "node", id: B.id })}>{B.name}</button>
        </h2>
        <div className="formula-box"><Tex tex={edge.tex} display /></div>
        {edge.note && <p className="muted">{edge.note}</p>}
        <div className="panel-actions">
          <button className="btn" onClick={() => onOpen(A.id)}>Calcular {A.name}</button>
          <button className="btn" onClick={() => onOpen(B.id)}>Calcular {B.name}</button>
        </div>
      </aside>
    );
  }

  const d = sel.kind === "node" ? BY_ID[sel.id] : undefined;
  if (!d) return null;
  const g = GROUPS[d.group];
  return (
    <aside className="panel">
      <button className="panel-close" onClick={onClose} aria-label="Fechar">×</button>
      <span className="badge" style={{ color: g.color, borderColor: g.color + "55", background: g.color + "12" }}>{g.label}</span>
      <h2>{d.name}</h2>
      <p className="summary">{d.summary}</p>
      <div className="notation"><Tex tex={d.notationTex} /></div>
      <p>{d.description}</p>
      <div className="formula-box"><Tex tex={d.densityTex} display /></div>
      <div className="chips">{d.uses.map((u) => <span key={u} className="chip-tag">{u}</span>)}</div>
      <button className="btn btn-primary btn-block" onClick={() => onOpen(d.id)}>Abrir calculadora</button>
      <RelList title="Leva a" edges={outgoing(d.id)} dir="out" onSelect={onSelect} />
      <RelList title="Vem de" edges={incoming(d.id)} dir="in" onSelect={onSelect} />
    </aside>
  );
}
