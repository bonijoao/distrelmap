import { useState } from "react";
import { DISTS, GROUPS, incoming, outgoing } from "../data";
import type { Group } from "../lib/types";
import { href } from "../router";

export function DistList() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = (name: string, uses: string[]) =>
    !query || name.toLowerCase().includes(query) || uses.some((u) => u.toLowerCase().includes(query));

  return (
    <div className="list-page">
      <div className="list-head">
        <h1>Distribuições</h1>
        <input className="list-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou uso…" aria-label="Buscar" />
      </div>
      {(Object.keys(GROUPS) as Group[]).map((g) => {
        const ds = DISTS.filter((d) => d.group === g && match(d.name, d.uses));
        if (!ds.length) return null;
        return (
          <section key={g}>
            <h2 className="group-title"><span className="dot" style={{ background: GROUPS[g].color }} />{GROUPS[g].label}</h2>
            <div className="dist-grid">
              {ds.map((d) => (
                <a key={d.id} className="dist-card" href={href.dist(d.id)} style={{ borderTopColor: GROUPS[g].color }}>
                  <strong>{d.name}</strong>
                  <span>{d.summary}</span>
                  <small>{(() => { const n = outgoing(d.id).length + incoming(d.id).length; return `${n} ${n === 1 ? "relação" : "relações"}`; })()}</small>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
