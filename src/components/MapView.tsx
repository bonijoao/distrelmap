import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import fcose from "cytoscape-fcose";
import { useEffect, useMemo, useRef, useState } from "react";
import { BY_ID, DISTS, EDGES, GROUPS, REL_TYPES, type Edge } from "../data";
import type { Group, RelType } from "../lib/types";
import { href, navigate } from "../router";
import { DetailPanel } from "./DetailPanel";

cytoscape.use(fcose);

export type Selection = { kind: "node"; id: string } | { kind: "edge"; id: string } | null;

const LABEL_ZOOM = 1.7;

function buildElements(): ElementDefinition[] {
  const degree: Record<string, number> = {};
  for (const e of EDGES) {
    degree[e.from] = (degree[e.from] ?? 0) + 1;
    degree[e.to] = (degree[e.to] ?? 0) + 1;
  }
  // posições iniciais determinísticas (círculo por grupo) → layout reproduzível
  const groups: Group[] = ["inference", "continuous", "discrete"];
  const nodes = groups.flatMap((g, gi) => {
    const ds = DISTS.filter((d) => d.group === g);
    return ds.map((d, i) => {
      const ang = (2 * Math.PI * i) / ds.length;
      const cx = [0, 420, -420][gi], cy = [0, 120, 120][gi];
      return {
        data: { id: d.id, label: d.name, group: d.group, size: 18 + 5 * Math.sqrt(degree[d.id] ?? 0) },
        position: { x: cx + 180 * Math.cos(ang), y: cy + 180 * Math.sin(ang) },
      };
    });
  });
  const edges = EDGES.map((e) => ({
    data: { id: e.id, source: e.from, target: e.to, type: e.type, label: e.label },
  }));
  return [...nodes, ...edges];
}

const STYLE: cytoscape.StylesheetJson = [
  {
    selector: "node",
    style: {
      "background-color": "#fff",
      "border-width": 2.5,
      width: "data(size)",
      height: "data(size)",
      label: "data(label)",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": 12,
      "font-weight": 600,
      color: "#1f2937",
      "text-valign": "bottom",
      "text-margin-y": 5,
      "text-outline-color": "#f6f7fb",
      "text-outline-width": 3,
      "transition-property": "opacity, border-width, background-color",
      "transition-duration": 150,
    },
  },
  ...(Object.entries(GROUPS) as [Group, (typeof GROUPS)[Group]][]).map(([g, v]) => ({
    selector: `node[group = "${g}"]`,
    style: {
      "border-color": v.color,
      "background-color": v.color,
      "background-opacity": 0.16,
      shape: v.shape as cytoscape.Css.NodeShape,
    },
  })),
  {
    selector: "edge",
    style: {
      width: 1.8,
      "curve-style": "bezier",
      "control-point-step-size": 28,
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.9,
      label: "data(label)",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": 10,
      color: "#374151",
      "text-background-color": "#ffffff",
      "text-background-opacity": 0.92,
      "text-background-padding": "2px",
      "text-background-shape": "roundrectangle",
      "text-rotation": "autorotate",
      "text-opacity": 0,
      "transition-property": "opacity, width, text-opacity",
      "transition-duration": 150,
    },
  },
  ...(Object.entries(REL_TYPES) as [RelType, (typeof REL_TYPES)[RelType]][]).map(([t, v]) => ({
    selector: `edge[type = "${t}"]`,
    style: {
      "line-color": v.color,
      "target-arrow-color": v.color,
      "line-style": (v.dotted ? "dotted" : v.dash ? "dashed" : "solid") as cytoscape.Css.LineStyle,
    },
  })),
  { selector: "edge.labeled", style: { "text-opacity": 1 } },
  { selector: ".faded", style: { opacity: 0.12 } },
  { selector: "edge.faded", style: { "text-opacity": 0 } },
  { selector: "edge.hl", style: { width: 3, "text-opacity": 1, "z-index": 10 } },
  { selector: "node.hl", style: { "border-width": 4 } },
  { selector: "node:selected", style: { "border-width": 5, "background-opacity": 0.35, "overlay-opacity": 0 } },
  { selector: "edge:selected", style: { width: 4, "text-opacity": 1, "overlay-opacity": 0 } },
  { selector: ".hidden", style: { display: "none" } },
];

const LAYOUT = {
  name: "fcose",
  quality: "proof",
  randomize: true,
  animate: true,
  animationDuration: 600,
  nodeRepulsion: () => 12000,
  idealEdgeLength: () => 85,
  edgeElasticity: () => 0.35,
  nodeSeparation: 110,
  gravity: 0.35,
  gravityRange: 3.0,
  numIter: 4000,
  padding: 30,
};

// O fcose usa Math.random; com uma semente fixa o mapa sai sempre igual.
function seeded<T>(seed: number, fn: () => T): T {
  const orig = Math.random;
  let a = seed >>> 0;
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try { return fn(); } finally { Math.random = orig; }
}
const SEED = 7;

export function MapView({ focus }: { focus?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [sel, setSel] = useState<Selection>(focus && BY_ID[focus] ? { kind: "node", id: focus } : null);
  const [hiddenGroups, setHiddenGroups] = useState<Set<Group>>(new Set());
  const [hiddenTypes, setHiddenTypes] = useState<Set<RelType>>(new Set());
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const elements = useMemo(buildElements, []);

  // navegação externa (voltar do navegador, link "ver no mapa")
  useEffect(() => {
    if (focus && BY_ID[focus]) setSel({ kind: "node", id: focus });
  }, [focus]);

  // cria o grafo uma única vez
  useEffect(() => {
    const cy = cytoscape({
      container: box.current,
      elements,
      style: STYLE,
      minZoom: 0.25,
      maxZoom: 3,
      boxSelectionEnabled: false,
    });
    seeded(SEED, () => cy.layout({ ...LAYOUT, animate: false } as cytoscape.LayoutOptions).run());
    cyRef.current = cy;

    const updateLabels = () => cy.edges().toggleClass("labeled", cy.zoom() >= LABEL_ZOOM);
    cy.on("zoom", updateLabels);
    cy.on("tap", "node", (ev) => setSel({ kind: "node", id: ev.target.id() }));
    cy.on("tap", "edge", (ev) => setSel({ kind: "edge", id: ev.target.id() }));
    cy.on("tap", (ev) => { if (ev.target === cy) setSel(null); });
    cy.on("mouseover", "edge", (ev) => ev.target.addClass("hl"));
    cy.on("mouseout", "edge", (ev) => ev.target.removeClass("hl"));
    cy.on("mouseover", "node", () => { if (box.current) box.current.style.cursor = "pointer"; });
    cy.on("mouseout", "node", () => { if (box.current) box.current.style.cursor = ""; });
    cy.fit(undefined, 60);
    updateLabels();
    return () => cy.destroy();
  }, [elements]);

  // destaque da seleção
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.elements().removeClass("faded hl").unselect();
      if (!sel) return;
      const el = cy.getElementById(sel.id);
      if (el.empty()) return;
      const keep = sel.kind === "node" ? el.closedNeighborhood() : el.union(el.connectedNodes());
      cy.elements().not(keep).addClass("faded");
      keep.edges().addClass("hl");
      el.select();
    });
    cy.resize();
    if (sel?.kind === "node") {
      const el = cy.getElementById(sel.id);
      if (el.nonempty()) cy.animate({ fit: { eles: el.closedNeighborhood(), padding: 70 }, duration: 450 });
    }
    // mantém a URL em sincronia com o nó selecionado
    const want = sel?.kind === "node" ? href.map(sel.id) : href.map();
    if (window.location.hash !== want && !(want === "#/" && window.location.hash === "")) {
      history.replaceState(null, "", want);
    }
  }, [sel]);

  // filtros
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().forEach((n) => { n.toggleClass("hidden", hiddenGroups.has(n.data("group"))); });
      cy.edges().forEach((e) => {
        const hide = hiddenTypes.has(e.data("type")) || e.source().hasClass("hidden") || e.target().hasClass("hidden");
        e.toggleClass("hidden", hide);
      });
    });
  }, [hiddenGroups, hiddenTypes]);

  const toggle = <T,>(set: Set<T>, v: T, apply: (s: Set<T>) => void) => {
    const s = new Set(set);
    if (s.has(v)) s.delete(v); else s.add(v);
    apply(s);
  };

  const results = query.trim()
    ? DISTS.filter((d) => {
        const q = query.trim().toLowerCase();
        return d.name.toLowerCase().includes(q) || d.uses.some((u) => u.toLowerCase().includes(q));
      }).slice(0, 8)
    : [];

  const relayoutSeed = useRef(SEED);
  const relayout = () => {
    const cy = cyRef.current;
    if (!cy) return;
    relayoutSeed.current += 1;
    seeded(relayoutSeed.current, () => cy.layout(LAYOUT as cytoscape.LayoutOptions).run());
  };
  const fit = () => cyRef.current?.animate({ fit: { eles: cyRef.current.elements(":visible"), padding: 60 }, duration: 400 });

  let edge: Edge | undefined;
  if (sel?.kind === "edge") edge = EDGES.find((e) => e.id === sel.id);

  return (
    <div className={`map-page ${sel ? "has-sel" : ""}`}>
      <div className="map-canvas" ref={box} />

      <div className="map-toolbar">
        <div className="search">
          <svg viewBox="0 0 24 24" className="icon" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar distribuição ou uso…"
            aria-label="Buscar distribuição"
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) { setSel({ kind: "node", id: results[0].id }); setQuery(""); }
              if (e.key === "Escape") setQuery("");
            }}
          />
          {results.length > 0 && (
            <ul className="search-results">
              {results.map((d) => (
                <li key={d.id}>
                  <button onClick={() => { setSel({ kind: "node", id: d.id }); setQuery(""); }}>
                    <span className="dot" style={{ background: GROUPS[d.group].color }} />
                    <span>{d.name}</span>
                    <small>{d.summary}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="toolbar-btns">
          <button className={`tb ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)} title="Filtros e legenda" aria-label="Filtros e legenda">
            <svg viewBox="0 0 24 24" className="icon"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          </button>
          <button className="tb" onClick={fit} title="Enquadrar tudo" aria-label="Enquadrar tudo">
            <svg viewBox="0 0 24 24" className="icon"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </button>
          <button className="tb" onClick={relayout} title="Reorganizar" aria-label="Reorganizar">
            <svg viewBox="0 0 24 24" className="icon"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
          </button>
        </div>
      </div>

      <div className={`legend ${showFilters ? "open" : ""}`}>
        <div className="legend-title">Relações</div>
        {(Object.entries(REL_TYPES) as [RelType, (typeof REL_TYPES)[RelType]][]).map(([t, v]) => (
          <label key={t} className={`legend-item ${hiddenTypes.has(t) ? "off" : ""}`}>
            <input type="checkbox" checked={!hiddenTypes.has(t)} onChange={() => toggle(hiddenTypes, t, setHiddenTypes)} />
            <svg width="30" height="10" aria-hidden="true">
              <line x1="1" y1="5" x2="29" y2="5" stroke={v.color} strokeWidth="2.5"
                strokeDasharray={v.dotted ? "2 3" : v.dash ? "6 4" : undefined} />
            </svg>
            {v.label}
          </label>
        ))}
        <div className="legend-title">Grupos</div>
        {(Object.entries(GROUPS) as [Group, (typeof GROUPS)[Group]][]).map(([g, v]) => (
          <label key={g} className={`legend-item ${hiddenGroups.has(g) ? "off" : ""}`}>
            <input type="checkbox" checked={!hiddenGroups.has(g)} onChange={() => toggle(hiddenGroups, g, setHiddenGroups)} />
            <span className={`legend-node ${g === "discrete" ? "sq" : ""}`} style={{ borderColor: v.color, background: v.color + "22" }} />
            {v.label}
          </label>
        ))}
        <p className="legend-hint">Aproxime o zoom para ver o rótulo de cada seta.</p>
      </div>

      <DetailPanel
        sel={sel}
        edge={edge}
        onSelect={setSel}
        onOpen={(id) => navigate(href.dist(id))}
        onClose={() => setSel(null)}
      />
    </div>
  );
}
