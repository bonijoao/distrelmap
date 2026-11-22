// Gráfico em SVG puro: curva (contínuas) ou barras (discretas), com a região
// do evento sombreada, os limites marcados e a probabilidade de cada região.
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dist, Params } from "../lib/types";
import { isDiscrete } from "../lib/types";
import { inEvent, plotRange, type ProbType } from "../lib/stats";
import { fmtNum, fmtProb } from "../lib/format";

interface Props {
  d: Dist;
  p: Params;
  type: ProbType;
  x1: number;
  x2?: number;
  height?: number;
}

const M = { l: 46, r: 14, t: 18, b: 34 };

function niceTicks(lo: number, hi: number, n: number): number[] {
  const span = hi - lo;
  if (!(span > 0)) return [lo];
  const raw = span / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Number(v.toPrecision(12)));
  return out;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function Plot({ d, p, type, x1, x2, height = 330 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const discrete = isDiscrete(d);

  const model = useMemo(() => {
    const xs = [x1, ...(x2 !== undefined ? [x2] : [])];
    const [lo, hi] = plotRange(d, p, xs);
    if (discrete) {
      const pts: { x: number; y: number; on: boolean }[] = [];
      for (let k = lo; k <= hi; k++) pts.push({ x: k, y: d.density(k, p), on: inEvent(k, type, x1, x2, true) });
      const ymax = Math.max(...pts.map((q) => q.y), 1e-12);
      return { lo: lo - 0.6, hi: hi + 0.6, ytop: ymax * 1.15, pts, segs: [], bounds: [] as number[] };
    }
    const bounds = xs.filter((b) => b >= lo && b <= hi);
    const n = 500;
    const grid = Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n);
    const xsAll = [...new Set([...grid, ...bounds])].sort((a, b) => a - b);
    const pts = xsAll.map((x) => {
      const y = d.density(x, p);
      return { x, y: Number.isFinite(y) ? y : NaN, on: inEvent(x, type, x1, x2, false) };
    });
    const ys = pts.map((q) => q.y).filter(Number.isFinite).sort((a, b) => a - b);
    const q95 = ys[Math.floor(0.95 * (ys.length - 1))];
    const ymax = ys[ys.length - 1];
    const cap = 1.5 * q95; // densidades que explodem num extremo: corta o eixo
    const ytop = (ymax > cap ? cap : ymax) * 1.12;
    // segmentos contíguos da região sombreada
    const segs: { x: number; y: number }[][] = [];
    let cur: { x: number; y: number }[] = [];
    for (const q of pts) {
      if (q.on && Number.isFinite(q.y)) cur.push(q);
      else if (cur.length) { segs.push(cur); cur = []; }
    }
    if (cur.length) segs.push(cur);
    return { lo, hi, ytop, pts, segs, bounds };
  }, [d, p, type, x1, x2, discrete]);

  const iw = width - M.l - M.r;
  const ih = height - M.t - M.b;
  const sx = (x: number) => M.l + ((x - model.lo) / (model.hi - model.lo)) * iw;
  const sy = (y: number) => M.t + ih - (Math.min(y, model.ytop) / model.ytop) * ih;
  const xticks = discrete
    ? niceTicks(Math.ceil(model.lo), Math.floor(model.hi), Math.max(3, Math.floor(iw / 70))).filter((v) => Number.isInteger(v))
    : niceTicks(model.lo, model.hi, Math.max(3, Math.floor(iw / 80)));
  const yticks = niceTicks(0, model.ytop / 1.12, 4);
  const mean = d.mean(p);
  const showMean = Number.isFinite(mean) && mean >= model.lo && mean <= model.hi;

  const pathOf = (pts: { x: number; y: number }[]) => {
    let s = "";
    let pen = false;
    for (const q of pts) {
      if (!Number.isFinite(q.y)) { pen = false; continue; }
      s += `${pen ? "L" : "M"}${sx(q.x).toFixed(1)},${sy(q.y).toFixed(1)}`;
      pen = true;
    }
    return s;
  };
  const areaOf = (pts: { x: number; y: number }[]) => {
    const f = pts.filter((q) => Number.isFinite(q.y));
    if (!f.length) return "";
    return `M${sx(f[0].x)},${sy(0)}` + f.map((q) => `L${sx(q.x).toFixed(1)},${sy(q.y).toFixed(1)}`).join("") + `L${sx(f[f.length - 1].x)},${sy(0)}Z`;
  };

  return (
    <div ref={ref} className="plot">
      <svg width={width} height={height} role="img" aria-label={`Gráfico da distribuição ${d.name}`}>
        <defs>
          <clipPath id="plot-clip"><rect x={M.l} y={M.t - 2} width={iw} height={ih + 2} /></clipPath>
        </defs>
        {yticks.map((v) => (
          <g key={`y${v}`}>
            <line x1={M.l} x2={M.l + iw} y1={sy(v)} y2={sy(v)} className="grid" />
            <text x={M.l - 8} y={sy(v)} className="tick" textAnchor="end" dominantBaseline="middle">{fmtNum(v, 3)}</text>
          </g>
        ))}
        {xticks.map((v) => (
          <text key={`x${v}`} x={sx(v)} y={M.t + ih + 18} className="tick" textAnchor="middle">{fmtNum(v, 3)}</text>
        ))}
        <line x1={M.l} x2={M.l + iw} y1={sy(0)} y2={sy(0)} className="axis" />

        <g clipPath="url(#plot-clip)">
          {discrete ? (
            (() => {
              const step = iw / (model.hi - model.lo);
              const bw = Math.max(1, Math.min(step * 0.72, 46));
              return model.pts.map((q) => (
                <rect key={q.x} x={sx(q.x) - bw / 2} y={sy(q.y)} width={bw} height={Math.max(0, sy(0) - sy(q.y))}
                  rx={Math.min(3, bw / 4)} className={q.on ? "bar on" : "bar"} />
              ));
            })()
          ) : (
            <>
              <path d={areaOf(model.pts)} className="area-all" />
              {model.segs.map((s, i) => <path key={i} d={areaOf(s)} className="area-on" />)}
              <path d={pathOf(model.pts)} className="curve" />
            </>
          )}
          {showMean && (
            <line x1={sx(mean)} x2={sx(mean)} y1={M.t} y2={sy(0)} className="mean-line" />
          )}
        </g>
        {showMean && (
          <text x={sx(mean) + 4} y={M.t + 10} className="mean-label">E(X)</text>
        )}

        {/* rótulos das barras destacadas, se couberem */}
        {discrete && model.pts.length <= 16 &&
          model.pts.filter((q) => q.on && q.y > 0).map((q) => (
            <text key={`l${q.x}`} x={sx(q.x)} y={sy(q.y) - 5} className="bar-label" textAnchor="middle">{q.y.toFixed(3)}</text>
          ))}

        {/* limites do evento + probabilidade de cada região (contínuas) */}
        {!discrete && model.bounds.map((b, i) => {
          const yb = Math.min(d.density(b, p), model.ytop / 1.12);
          const y = Number.isFinite(yb) ? sy(yb) : M.t;
          const label = fmtNum(b);
          const w = label.length * 7 + 12;
          return (
            <g key={`b${i}`}>
              <line x1={sx(b)} x2={sx(b)} y1={sy(0)} y2={y} className="bound" />
              <rect x={sx(b) - w / 2} y={y - 24} width={w} height={19} rx={5} className="chip" />
              <text x={sx(b)} y={y - 11} className="chip-text" textAnchor="middle">{label}</text>
            </g>
          );
        })}
        {!discrete && model.segs.map((s, i) => {
          const a = s[0].x, b = s[s.length - 1].x;
          const lo = a <= model.lo + 1e-12 ? -Infinity : a;
          const hi = b >= model.hi - 1e-12 ? Infinity : b;
          const pr = d.cdf(hi, p) - d.cdf(lo, p);
          if (!(pr >= 1e-4)) return null;
          let sw = 0, sxw = 0;
          for (const q of s) { sw += q.y; sxw += q.x * q.y; }
          const cx = sxw / sw;
          const cyv = Math.min(d.density(cx, p), model.ytop / 1.12) * 0.42 + 0.05 * model.ytop;
          const label = fmtProb(pr);
          const w = label.length * 7.4 + 14;
          return (
            <g key={`p${i}`}>
              <rect x={sx(cx) - w / 2} y={sy(cyv) - 11} width={w} height={22} rx={6} className="prob-chip" />
              <text x={sx(cx)} y={sy(cyv) + 4} className="prob-chip-text" textAnchor="middle">{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
