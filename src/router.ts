// Roteamento por hash: funciona igual no GitHub Pages e dentro do app Android.
//   #/            mapa
//   #/m/<id>      mapa com uma distribuição selecionada
//   #/d           lista de distribuições
//   #/d/<id>      calculadora/ficha de uma distribuição
import { useEffect, useState } from "react";

export type Route =
  | { page: "map"; focus?: string }
  | { page: "list" }
  | { page: "dist"; id: string };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "d" && parts[1]) return { page: "dist", id: decodeURIComponent(parts[1]) };
  if (parts[0] === "d") return { page: "list" };
  if (parts[0] === "m" && parts[1]) return { page: "map", focus: decodeURIComponent(parts[1]) };
  return { page: "map" };
}

export const href = {
  map: (focus?: string) => (focus ? `#/m/${focus}` : "#/"),
  list: () => "#/d",
  dist: (id: string) => `#/d/${id}`,
};

export function navigate(to: string) {
  window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
