import { useEffect } from "react";
import { BY_ID } from "./data";
import { href, useRoute } from "./router";
import { MapView } from "./components/MapView";
import { DistView } from "./components/DistView";
import { DistList } from "./components/DistList";

function NavIcon({ kind }: { kind: "map" | "list" }) {
  return kind === "map" ? (
    <svg viewBox="0 0 24 24" className="icon" aria-hidden="true"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="10" cy="18" r="2.5" /><path d="M8 7l8 1M7 8l2 8M16 10l-5 6" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="icon" aria-hidden="true"><path d="M4 20c3 0 4-3 5-7s2-9 3-9 2 5 3 9 2 7 5 7" /></svg>
  );
}

export default function App() {
  const route = useRoute();
  const dist = route.page === "dist" ? BY_ID[route.id] : undefined;

  useEffect(() => {
    document.title = dist ? `${dist.name} · Mapa das Distribuições` : "Mapa das Distribuições";
    if (route.page !== "map") window.scrollTo(0, 0);
  }, [route, dist]);

  const onMap = route.page === "map";
  const onList = route.page === "list" || route.page === "dist";

  return (
    <div className={`app ${onMap ? "app-map" : ""}`}>
      <header className="topbar">
        <a className="brand" href={href.map()}>
          <img src="./icon.svg" alt="" width="30" height="30" />
          <span>Mapa das Distribuições</span>
        </a>
        <nav className="tabs">
          <a className={onMap ? "active" : ""} href={href.map()}><NavIcon kind="map" />Mapa</a>
          <a className={onList ? "active" : ""} href={href.list()}><NavIcon kind="list" />Distribuições</a>
        </nav>
      </header>
      <main>
        {route.page === "map" && <MapView focus={route.focus} />}
        {route.page === "list" && <DistList />}
        {route.page === "dist" && (dist ? <DistView key={dist.id} d={dist} /> : (
          <div className="list-page"><h1>Distribuição não encontrada</h1><a href={href.list()}>Ver todas</a></div>
        ))}
      </main>
    </div>
  );
}
