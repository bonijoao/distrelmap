// Aba de uma distribuição: calculadora (gráfico + resultado) e ficha.
import { useEffect, useMemo, useState } from "react";
import { BY_ID, GROUPS, REL_TYPES, incoming, outgoing } from "../data";
import type { Dist, Params } from "../lib/types";
import { isDiscrete } from "../lib/types";
import {
  defaultParams, defaultX, isInterval, probFromX, probTypes, validateParams, xFromProb, type ProbType,
} from "../lib/stats";
import { fmtNum, fmtProb, formatEvent, parseNum, probTypeLabel, toField } from "../lib/format";
import { href } from "../router";
import { Plot } from "./Plot";
import { Tex } from "./Tex";

type Driver = "x" | "prob";

interface Result {
  error?: string;
  x1?: number;
  x2?: number;
  prob?: number;
  target?: number;
  mode?: Driver;
}

function Field({ label, value, onChange, hint, disabled }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; disabled?: boolean;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input inputMode="decimal" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function DistView({ d }: { d: Dist }) {
  const discrete = isDiscrete(d);
  const [pText, setPText] = useState<Record<string, string>>(() =>
    Object.fromEntries(d.params.map((q) => [q.key, toField(q.default)])),
  );
  const [type, setType] = useState<ProbType>(probTypes(d)[0]);
  const [x1Text, setX1Text] = useState(() => toField(defaultX(d, defaultParams(d), probTypes(d)[0])[0]));
  const [x2Text, setX2Text] = useState("");
  const [probText, setProbText] = useState("");
  const [driver, setDriver] = useState<Driver>("x");

  const params: Params = useMemo(
    () => Object.fromEntries(d.params.map((q) => [q.key, parseNum(pText[q.key] ?? "")])),
    [d, pText],
  );
  const paramError = validateParams(d, params);
  const interval = isInterval(type);
  const mode: Driver = driver === "prob" && type !== "equal" ? "prob" : "x";

  const result: Result = useMemo(() => {
    if (paramError) return { error: paramError };
    if (mode === "prob") {
      const target = parseNum(probText);
      if (!Number.isFinite(target)) return { error: "Informe a probabilidade." };
      if (target < 0 || target > 1) return { error: "A probabilidade deve estar entre 0 e 1." };
      const xs = xFromProb(d, params, target, type);
      if (!xs) return { error: "Não existe x que satisfaça essa probabilidade." };
      const x2 = interval ? xs[1] : undefined;
      return { x1: xs[0], x2, target, mode, prob: probFromX(d, params, type, xs[0], x2) };
    }
    const x1 = parseNum(x1Text);
    const x2 = interval ? parseNum(x2Text) : undefined;
    if (!Number.isFinite(x1) || (interval && !Number.isFinite(x2!))) {
      return { error: interval ? "Informe a e b." : "Informe o valor de x." };
    }
    return { x1, x2, mode, prob: probFromX(d, params, type, x1, x2) };
  }, [d, params, paramError, type, interval, mode, x1Text, x2Text, probText]);

  // mantém o outro campo sincronizado (o último editado manda)
  useEffect(() => {
    if (result.error) return;
    if (result.mode === "x") setProbText(toField(result.prob!));
    else {
      setX1Text(toField(result.x1!));
      if (result.x2 !== undefined) setX2Text(toField(result.x2));
    }
  }, [result]);

  const changeType = (t: ProbType) => {
    if (isInterval(t) && !isInterval(type) && mode === "x" && !paramError) {
      const xs = defaultX(d, params, t);
      setX1Text(toField(xs[0]));
      setX2Text(toField(xs[1]));
    }
    if (t === "equal") setDriver("x");
    setType(t);
  };

  const reset = () => {
    const p0 = defaultParams(d);
    setPText(Object.fromEntries(d.params.map((q) => [q.key, toField(q.default)])));
    const t0 = probTypes(d)[0];
    setType(t0);
    setX1Text(toField(defaultX(d, p0, t0)[0]));
    setX2Text("");
    setDriver("x");
  };

  const g = GROUPS[d.group];
  const m = paramError ? NaN : d.mean(params);
  const v = paramError ? NaN : d.variance(params);
  const fmtMoment = (x: number) => (Number.isNaN(x) ? "não existe" : fmtNum(x));
  const rels = [...outgoing(d.id).map((e) => ({ e, other: e.to })), ...incoming(d.id).map((e) => ({ e, other: e.from }))];

  return (
    <div className="dist-page">
      <header className="dist-header">
        <div>
          <span className="badge" style={{ color: g.color, borderColor: g.color + "55", background: g.color + "12" }}>{g.label}</span>
          <h1>{d.name} <Tex tex={d.notationTex} className="dist-notation" /></h1>
          <p className="summary">{d.summary}</p>
        </div>
        <a className="btn" href={href.map(d.id)}>
          <svg viewBox="0 0 24 24" className="icon" aria-hidden="true"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="10" cy="18" r="2.5" /><path d="M8 7l8 1M7 8l2 8M16 10l-5 6" /></svg>
          Ver no mapa
        </a>
      </header>

      <div className="calc-grid">
        <section className="card">
          <div className="card-head">
            <h3>Parâmetros</h3>
            <button className="btn-ghost" onClick={reset} title="Restaurar valores padrão">Restaurar</button>
          </div>
          <div className={`param-grid n${d.params.length}`}>
            {d.params.map((q) => (
              <Field key={q.key} label={`${q.symbol} — ${q.label}`} value={pText[q.key] ?? ""}
                onChange={(val) => setPText((s) => ({ ...s, [q.key]: val }))} />
            ))}
          </div>
          <div className="sep" />
          <label className="field">
            <span className="field-label">Tipo de probabilidade</span>
            <select value={type} onChange={(e) => changeType(e.target.value as ProbType)}>
              {probTypes(d).map((t) => <option key={t} value={t}>{probTypeLabel(t, discrete)}</option>)}
            </select>
          </label>
          {!discrete && <p className="hint">Distribuição contínua: P(X = x) = 0, então P(X &lt; x) = P(X ≤ x).</p>}
          <div className={`xrow ${interval ? "two" : ""}`}>
            <Field label={interval ? "Limite inferior a" : "Valor de x"} value={x1Text}
              onChange={(val) => { setX1Text(val); setDriver("x"); }} />
            {interval && (
              <Field label="Limite superior b" value={x2Text} onChange={(val) => { setX2Text(val); setDriver("x"); }} />
            )}
          </div>
          {type === "equal" ? (
            <p className="hint">P(X = x) não tem inversa: informe x.</p>
          ) : (
            <Field label="Probabilidade" value={probText} onChange={(val) => { setProbText(val); setDriver("prob"); }} />
          )}
          <p className="hint hint-accent">Digite x <b>ou</b> a probabilidade: o outro valor é calculado automaticamente.</p>
        </section>

        <section className="card">
          {result.error ? (
            <div className="result error">{result.error}</div>
          ) : (
            <>
              <Plot d={d} p={params} type={type} x1={result.x1!} x2={result.x2} />
              <div className="result">
                <div className="result-main">
                  <span className="result-event">{formatEvent(type, result.x1!, result.x2, discrete)}</span>
                  <span className="result-eq">=</span>
                  <span className="result-prob">{fmtProb(result.prob)}</span>
                </div>
                {result.mode === "prob" && (
                  <div className="result-note">
                    x calculado a partir da probabilidade {fmtProb(result.target)}.
                    {discrete && " Em distribuições discretas a probabilidade exata alcançada pode diferir da informada."}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <section className="card sheet">
        <h3>Sobre a distribuição</h3>
        <p>{d.description}</p>
        <div className="sheet-grid">
          <div><div className="k">Suporte</div><Tex tex={d.supportTex} /></div>
          <div><div className="k">Densidade</div><Tex tex={d.densityTex} /></div>
          <div><div className="k">Média</div><Tex tex={d.meanTex} /> <span className="val">= {fmtMoment(m)}</span></div>
          <div><div className="k">Variância</div><Tex tex={d.varianceTex} /> <span className="val">= {fmtMoment(v)}</span></div>
        </div>
        <div className="chips">{d.uses.map((u) => <span key={u} className="chip-tag">{u}</span>)}</div>
        {rels.length > 0 && (
          <>
            <h4>Relações</h4>
            <ul className="sheet-rels">
              {rels.map(({ e, other }) => (
                <li key={e.id}>
                  <span className="rel-type" style={{ color: REL_TYPES[e.type].color }}>{REL_TYPES[e.type].label}</span>
                  <Tex tex={e.tex} />
                  <a href={href.dist(other)}>{BY_ID[other].name} →</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
