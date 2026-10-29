'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle, Play } from 'lucide-react';
import { compile } from '@/lib/expr';
import type { Scene } from '@/lib/visual';
import { LabView } from '../labs/LabView';
import { cx } from '../ui';

type Of<T extends Scene['type']> = Extract<Scene, { type: T }>;
export interface SceneProps<T extends Scene['type']> { scene: Of<T>; onDone: () => void; onQuiz?: (correct: boolean) => void; young?: boolean }

const delay = (i: number, step = 0.09, base = 0.1) => ({ animationDelay: `${base + i * step}s` });
const E = ({ e, className }: { e?: string; className?: string }) => (e ? <span className={cx('emoji', className)} aria-hidden>{e}</span> : null);

/* ---------- intro ---------- */
export function IntroScene({ scene, onDone }: SceneProps<'intro'>) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
      <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full bg-marigold/15 sm:h-52 sm:w-52">
        <span className="v-pulse absolute inset-6 rounded-full" />
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-marigold/50 v-spin" />
        <E e={scene.emoji || '✨'} className="v-pop v-float text-7xl sm:text-8xl" />
      </div>
      <div className="grid gap-3">
        <ul className="grid gap-2">
          {scene.bullets.map((b, i) => (
            <li key={i} className="v-left flex items-center gap-3 rounded-xl bg-surface2 px-4 py-2.5 text-lg" style={delay(i, 0.18, 0.4)}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-board text-sm font-bold text-chalk">{i + 1}</span>{b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- concept map ---------- */
export function ConceptMapScene({ scene, onDone }: SceneProps<'concept_map'>) {
  const [sel, setSel] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const n = scene.nodes.length;
  const pos = scene.nodes.map((_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return { x: 50 + 38 * Math.cos(a), y: 50 + 36 * Math.sin(a) }; });
  useEffect(() => { if (seen.size >= Math.min(n, 3)) onDone(); }, [seen, n, onDone]);
  const pick = (i: number) => { setSel(i); setSeen(s => new Set(s).add(i)); };
  return (
    <div className="grid gap-4">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {pos.map((p, i) => <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} stroke={sel === i ? 'rgb(var(--marigold))' : 'rgb(var(--line))'} strokeWidth={sel === i ? 0.9 : 0.5} className="v-draw" style={delay(i, 0.12, 0.3)} vectorEffect="non-scaling-stroke" />)}
        </svg>
        <div className="v-pop absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-1 rounded-3xl bg-board px-5 py-4 text-center text-chalk shadow-lift">
          <E e={scene.center.emoji} className="text-4xl" /><b className="max-w-[12rem] font-display text-lg leading-tight">{scene.center.label}</b>
        </div>
        {scene.nodes.map((nd, i) => (
          <button key={i} onClick={() => pick(i)} style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%`, ...delay(i, 0.12, 0.5) }}
            className={cx('v-pop absolute grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-0.5 rounded-2xl border bg-surface px-3 py-2 text-center shadow-soft transition hover:scale-105',
              sel === i ? 'border-marigold ring-2 ring-marigold' : seen.has(i) ? 'border-good/60' : 'border-line')}>
            <E e={nd.emoji} className="text-2xl sm:text-3xl" /><span className="max-w-[8.5rem] text-xs font-semibold leading-tight sm:text-sm">{nd.label}</span>
          </button>
        ))}
      </div>
      <div className="min-h-16 rounded-2xl bg-surface2 px-4 py-3 text-center" aria-live="polite">
        {sel === null ? <span className="text-muted">Tap an idea around the circle.</span>
          : <span key={sel} className="v-up inline-block"><b>{scene.nodes[sel].label}:</b> {scene.nodes[sel].detail || ''}</span>}
      </div>
    </div>
  );
}

/* ---------- steps (process flow) ---------- */
export function StepsScene({ scene, onDone }: SceneProps<'steps'>) {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const N = scene.steps.length;
  useEffect(() => { if (!auto) return; const t = setInterval(() => setCur(c => { if (c >= N - 1) { setAuto(false); return c; } return c + 1; }), 2200); return () => clearInterval(t); }, [auto, N]);
  useEffect(() => { if (cur === N - 1) onDone(); }, [cur, N, onDone]);
  const st = scene.steps[cur];
  return (
    <div className="grid gap-5">
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
        {scene.steps.map((s, i) => (
          <li key={i} className="flex flex-1 flex-col items-stretch md:flex-row md:items-center">
            <button onClick={() => { setAuto(false); setCur(i); }} style={delay(i, 0.1)}
              className={cx('v-up flex flex-1 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition md:flex-col md:text-center',
                i === cur ? 'border-marigold bg-marigold/15 shadow-lift md:-translate-y-1' : i < cur ? 'border-good/50 bg-good/10' : 'border-line bg-surface')}>
              <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-full text-2xl transition', i === cur ? 'bg-marigold v-glow' : 'bg-surface2')}><E e={s.emoji || String(i + 1)} /></span>
              <span className="text-sm font-semibold leading-tight">{s.label}</span>
            </button>
            {i < N - 1 && (
              <svg className="mx-auto h-6 w-6 shrink-0 rotate-90 md:mx-1 md:rotate-0" viewBox="0 0 24 24" aria-hidden>
                <path d="M3 12h16m-5-5 5 5-5 5" fill="none" stroke={i < cur ? 'rgb(var(--good))' : 'rgb(var(--muted))'} strokeWidth="2" className={i === cur ? 'v-flow' : ''} />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <div key={cur} className="v-up flex items-start gap-4 rounded-2xl bg-surface2 p-4">
        <E e={st.emoji} className="text-4xl" />
        <div><p className="font-mono text-xs uppercase tracking-widest text-muted">Step {cur + 1} of {N}</p><b className="text-lg">{st.label}</b>{st.detail && <p className="text-muted">{st.detail}</p>}</div>
        <button className="btn-ghost ml-auto shrink-0 text-sm" onClick={() => { setCur(0); setAuto(true); }}><RotateCcw size={15} /> Replay</button>
      </div>
    </div>
  );
}

/* ---------- cycle ---------- */
export function CycleScene({ scene, onDone }: SceneProps<'cycle'>) {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const N = scene.stages.length;
  useEffect(() => { if (!auto) return; const t = setInterval(() => setCur(c => (c + 1) % N), 2400); return () => clearInterval(t); }, [auto, N]);
  const loops = useRef(0);
  useEffect(() => { if (cur === N - 1 && ++loops.current >= 1) onDone(); }, [cur, N, onDone]);
  const pos = scene.stages.map((_, i) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; return { x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a) }; });
  return (
    <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.2fr)_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgb(var(--line))" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgb(var(--marigold))" strokeWidth="1.6" className="v-flow" />
          <g style={{ transformOrigin: '50px 50px', transform: `rotate(${(cur / N) * 360}deg)`, transition: 'transform .9s cubic-bezier(.22,1,.36,1)' }}>
            <circle cx="50" cy="14" r="2.6" fill="rgb(var(--marigold))" />
          </g>
        </svg>
        {scene.stages.map((s, i) => (
          <button key={i} onClick={() => { setAuto(false); setCur(i); }} style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%`, ...delay(i, 0.12, 0.3) }}
            className={cx('v-pop absolute grid w-24 -translate-x-1/2 -translate-y-1/2 justify-items-center gap-0.5 rounded-2xl border bg-surface px-2 py-2 text-center shadow-soft transition sm:w-28',
              i === cur ? 'scale-110 border-marigold ring-2 ring-marigold' : 'border-line')}>
            <E e={s.emoji} className="text-3xl" /><span className="text-[11px] font-semibold leading-tight sm:text-xs">{s.label}</span>
          </button>
        ))}
      </div>
      <div key={cur} className="v-right grid gap-2 rounded-2xl bg-surface2 p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Stage {cur + 1} of {N}</p>
        <div className="flex items-center gap-3"><E e={scene.stages[cur].emoji} className="text-5xl" /><b className="text-xl">{scene.stages[cur].label}</b></div>
        {scene.stages[cur].detail && <p className="text-muted">{scene.stages[cur].detail}</p>}
        <button className="btn-ghost justify-self-start text-sm" onClick={() => setAuto(a => !a)}>{auto ? 'Pause' : <><Play size={14} /> Play cycle</>}</button>
      </div>
    </div>
  );
}

/* ---------- compare ---------- */
export function CompareScene({ scene, onDone }: SceneProps<'compare'>) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, [onDone]);
  const cols = scene.columns.length;
  return (
    <div className={cx('grid gap-4', cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
      {scene.columns.map((c, i) => (
        <div key={i} className={cx('grid content-start gap-3 rounded-2xl border p-5', i === 0 ? 'v-left border-sky/40 bg-sky/5' : i === 1 ? 'v-right border-marigold/50 bg-marigold/5' : 'v-up border-good/40 bg-good/5')} style={delay(i, 0.15)}>
          <div className="flex items-center gap-3"><E e={c.emoji} className="text-4xl" /><h4 className="text-xl">{c.heading}</h4></div>
          <ul className="grid gap-2">{c.points.map((p, k) => <li key={k} className="v-up flex gap-2 rounded-xl bg-surface px-3 py-2" style={delay(k, 0.1, 0.4 + i * 0.15)}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold" />{p}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

/* ---------- sort (drag or tap to place) ---------- */
export function SortScene({ scene, onDone }: SceneProps<'sort'>) {
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [held, setHeld] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const left = scene.items.map((_, i) => i).filter(i => placed[i] === undefined);
  useEffect(() => { if (!left.length) onDone(); }, [left.length, onDone]);
  function drop(item: number, bucket: number) {
    if (scene.items[item].bucket === bucket) { setPlaced(p => ({ ...p, [item]: bucket })); setHeld(null); }
    else { setWrong(item); setHeld(null); setTimeout(() => setWrong(null), 600); }
  }
  return (
    <div className="grid gap-5">
      <div className="flex min-h-16 flex-wrap justify-center gap-2 rounded-2xl border border-dashed border-line p-3" aria-label="Items to sort">
        {left.length ? left.map((i, k) => (
          <button key={i} draggable onDragStart={e => e.dataTransfer.setData('text/plain', String(i))} onClick={() => setHeld(held === i ? null : i)} style={delay(k, 0.06)}
            className={cx('v-pop flex items-center gap-2 rounded-full border bg-surface px-3 py-2 font-semibold shadow-soft transition', held === i ? '-translate-y-1 border-marigold ring-2 ring-marigold' : 'border-line hover:border-board', wrong === i && 'v-shake border-bad')}>
            <E e={scene.items[i].emoji} className="text-xl" />{scene.items[i].label}
          </button>
        )) : <span className="v-pop self-center font-semibold text-good">All sorted! 🎉</span>}
      </div>
      <p className="text-center text-sm text-muted">{held !== null ? `Now tap the group for “${scene.items[held].label}”.` : 'Tap an item, then tap its group — or drag it.'}</p>
      <div className={cx('grid gap-3', scene.buckets.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {scene.buckets.map((b, bi) => (
          <button key={bi} onClick={() => held !== null && drop(held, bi)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); drop(Number(e.dataTransfer.getData('text/plain')), bi); }}
            className={cx('grid min-h-36 content-start gap-2 rounded-2xl border-2 p-4 text-left transition', held !== null ? 'border-marigold bg-marigold/10' : 'border-line bg-surface2/60')}>
            <b className="font-display text-lg">{b}</b>
            <div className="flex flex-wrap gap-2">
              {scene.items.map((it, i) => placed[i] === bi && <span key={i} className="v-pop flex items-center gap-1.5 rounded-full bg-good/15 px-3 py-1 text-sm font-semibold text-good"><E e={it.emoji} />{it.label}</span>)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- hotspot (labelled picture) ---------- */
export function HotspotScene({ scene, onDone }: SceneProps<'hotspot'>) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<number | null>(null);
  const N = scene.parts.length;
  useEffect(() => { if (open.size === N) onDone(); }, [open, N, onDone]);
  const pos = scene.parts.map((_, i) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2 + Math.PI / N; return { x: 50 + 40 * Math.cos(a), y: 50 + 38 * Math.sin(a), px: 50 + 15 * Math.cos(a), py: 50 + 15 * Math.sin(a) }; });
  return (
    <div className="grid gap-4">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[620px] rounded-3xl bg-gradient-to-b from-sky/10 to-surface2">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {pos.map((p, i) => <line key={i} x1={p.px} y1={p.py} x2={p.x} y2={p.y} stroke={open.has(i) ? 'rgb(var(--marigold))' : 'rgb(var(--muted) / .5)'} strokeWidth="0.5" strokeDasharray={open.has(i) ? '0' : '1.5 1.5'} vectorEffect="non-scaling-stroke" />)}
        </svg>
        <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 justify-items-center">
          <E e={scene.emoji} className="v-pop v-float text-[5.5rem] sm:text-[7rem]" />
          <span className="mt-1 rounded-full bg-surface/80 px-3 py-0.5 text-xs font-semibold text-muted">{scene.label}</span>
        </div>
        {scene.parts.map((p, i) => (
          <button key={i} onClick={() => { setSel(i); setOpen(s => new Set(s).add(i)); }} style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%`, ...delay(i, 0.12, 0.4) }}
            className={cx('v-pop absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-soft transition',
              open.has(i) ? 'border-marigold bg-surface' : 'v-glow border-board bg-board text-chalk', sel === i && 'ring-2 ring-marigold')}>
            <span className={cx('grid h-5 w-5 place-items-center rounded-full text-[11px]', open.has(i) ? 'bg-marigold text-[#2b1b02]' : 'bg-chalk text-board')}>{i + 1}</span>
            {open.has(i) ? p.label : '?'}
          </button>
        ))}
      </div>
      <div className="min-h-16 rounded-2xl bg-surface2 px-4 py-3 text-center" aria-live="polite">
        {sel === null ? <span className="text-muted">Tap the glowing labels to uncover each part ({open.size}/{N}).</span>
          : <span key={sel} className="v-up inline-block"><b>{scene.parts[sel].label}:</b> {scene.parts[sel].detail}</span>}
      </div>
    </div>
  );
}

/* ---------- formula with sliders + live graph ---------- */
export function FormulaScene({ scene, onDone }: SceneProps<'formula'>) {
  const c = useMemo(() => { try { return compile(scene.expression, scene.degrees); } catch { return null; } }, [scene.expression, scene.degrees]);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(scene.variables.map(v => [v.symbol, v.value])));
  const [sweeping, setSweeping] = useState(false);
  const moved = useRef(0);
  const v0 = scene.variables[0];
  const calc = (vv: Record<string, number>) => { try { const r = c!.fn(vv); return isFinite(r) ? r : NaN; } catch { return NaN; } };
  const result = calc(vals);
  const pts = useMemo(() => Array.from({ length: 41 }, (_, i) => { const x = v0.min + ((v0.max - v0.min) * i) / 40; return [x, calc({ ...vals, [v0.symbol]: x })] as const; }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vals, v0.symbol, v0.min, v0.max]);
  const ys = pts.map(p => p[1]).filter(isFinite);
  const yMin = Math.min(0, ...ys), yMax = Math.max(...ys, yMin + 1e-9);
  const X = (x: number) => 8 + ((x - v0.min) / (v0.max - v0.min || 1)) * 88, Y = (y: number) => 52 - ((y - yMin) / (yMax - yMin || 1)) * 44;
  const path = pts.filter(p => isFinite(p[1])).map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(2)} ${Y(p[1]).toFixed(2)}`).join(' ');
  function set(sym: string, x: number) { setVals(v => ({ ...v, [sym]: x })); if (++moved.current === 3) onDone(); }
  useEffect(() => {
    if (!sweeping) return;
    let x = v0.min; const step = (v0.max - v0.min) / 60;
    const t = setInterval(() => { x += step; if (x > v0.max) { clearInterval(t); setSweeping(false); onDone(); return; } setVals(v => ({ ...v, [v0.symbol]: +x.toFixed(4) })); }, 40);
    return () => clearInterval(t);
  }, [sweeping, v0, onDone]);
  if (!c) return <p className="text-bad">This formula could not be displayed.</p>;
  const fmt = (n: number) => (!isFinite(n) ? '—' : Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0) ? n.toExponential(2) : (+n.toFixed(2)).toString());
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="grid content-start gap-4">
        <div className="v-pop chalkboard rounded-2xl px-5 py-4 text-center font-display text-3xl tracking-wide">{scene.display || `${scene.result.symbol} = ${scene.expression}`}</div>
        {scene.variables.map(v => (
          <label key={v.symbol} className="grid grid-cols-[minmax(6rem,auto)_1fr_auto] items-center gap-3 text-sm">
            <span><b className="font-mono">{v.symbol}</b> <span className="text-muted">{v.label}</span></span>
            <input type="range" min={v.min} max={v.max} step={v.step} value={vals[v.symbol]} onChange={e => set(v.symbol, Number(e.target.value))} className="w-full accent-[rgb(var(--marigold))]" aria-label={v.label} />
            <span className="min-w-[5.5rem] text-right font-mono tabular-nums">{fmt(vals[v.symbol])} {v.unit}</span>
          </label>
        ))}
        <button className="btn-ghost justify-self-start text-sm" onClick={() => setSweeping(true)} disabled={sweeping}><Play size={14} /> Animate {v0.label.toLowerCase()}</button>
      </div>
      <div className="grid content-start gap-3">
        <div className="rounded-2xl bg-surface2 p-4 text-center">
          <p className="text-sm text-muted">{scene.result.label}</p>
          <p className="font-display text-5xl font-bold tabular-nums text-board dark:text-marigold">{scene.result.symbol} = {fmt(result)}<span className="ml-1 text-2xl text-muted">{scene.result.unit}</span></p>
        </div>
        <svg viewBox="0 0 100 60" className="w-full rounded-2xl border border-line bg-surface" role="img" aria-label={`${scene.result.label} against ${v0.label}`}>
          <line x1="8" y1="52" x2="96" y2="52" stroke="rgb(var(--line))" strokeWidth=".4" /><line x1="8" y1="6" x2="8" y2="52" stroke="rgb(var(--line))" strokeWidth=".4" />
          <path d={path} fill="none" stroke="rgb(var(--board))" strokeWidth="1.1" className="dark:stroke-[rgb(var(--marigold))]" />
          {isFinite(result) && <circle cx={X(vals[v0.symbol])} cy={Y(result)} r="1.8" fill="rgb(var(--marigold))" style={{ transition: 'all .15s' }} />}
          <text x="96" y="58" fontSize="3.2" textAnchor="end" fill="rgb(var(--muted))">{v0.symbol} ({v0.unit || '–'}) →</text>
          <text x="9" y="5" fontSize="3.2" fill="rgb(var(--muted))">{scene.result.symbol}</text>
        </svg>
      </div>
    </div>
  );
}

/* ---------- timeline ---------- */
export function TimelineScene({ scene, onDone }: SceneProps<'timeline'>) {
  const [sel, setSel] = useState(0);
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto pb-2">
        <div className="relative flex min-w-max gap-3 px-2 pt-6">
          <svg className="absolute inset-x-0 top-[2.15rem] h-1 w-full" preserveAspectRatio="none" viewBox="0 0 100 1" aria-hidden><line x1="0" y1=".5" x2="100" y2=".5" stroke="rgb(var(--marigold))" strokeWidth="1" className="v-draw" vectorEffect="non-scaling-stroke" /></svg>
          {scene.events.map((ev, i) => (
            <button key={i} onClick={() => setSel(i)} style={delay(i, 0.15, 0.3)} className="v-up relative grid w-36 justify-items-center gap-1 text-center">
              <span className={cx('z-10 grid h-9 w-9 place-items-center rounded-full border-2 bg-surface text-lg transition', sel === i ? 'scale-125 border-marigold' : 'border-board')}><E e={ev.emoji || '•'} /></span>
              <b className="font-mono text-xs text-muted">{ev.when}</b><span className="text-sm font-semibold leading-tight">{ev.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div key={sel} className="v-up flex items-start gap-3 rounded-2xl bg-surface2 p-4"><E e={scene.events[sel].emoji} className="text-4xl" /><div><b className="font-mono text-sm text-muted">{scene.events[sel].when}</b><p className="text-lg font-semibold">{scene.events[sel].title}</p>{scene.events[sel].detail && <p className="text-muted">{scene.events[sel].detail}</p>}</div></div>
    </div>
  );
}

/* ---------- flashcards ---------- */
export function FlashcardsScene({ scene, onDone }: SceneProps<'flashcards'>) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  useEffect(() => { if (flipped.size === scene.cards.length) onDone(); }, [flipped, scene.cards.length, onDone]);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {scene.cards.map((c, i) => (
        <button key={i} onClick={() => setFlipped(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })} aria-pressed={flipped.has(i)}
          className={cx('flip v-pop relative block h-44 w-full', flipped.has(i) && 'on')} style={delay(i, 0.08)}>
          <div className="flip-inner">
            <div className="flip-face border border-line bg-surface shadow-soft"><div className="grid gap-2"><E e={c.emoji} className="text-4xl" /><b className="text-base leading-tight">{c.front}</b><span className="text-xs text-muted">Tap to flip</span></div></div>
            <div className="flip-face flip-back chalkboard"><span className="text-sm leading-snug">{c.back}</span></div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- order (tap in sequence) ---------- */
export function OrderScene({ scene, onDone }: SceneProps<'order'>) {
  const shuffled = useMemo(() => { const a = scene.items.map((t, i) => ({ t, i })); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(((k * 7919) % 13) / 13 * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } if (a.every((x, k) => x.i === k)) a.reverse(); return a; }, [scene.items]);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  useEffect(() => { if (done.length === scene.items.length) onDone(); }, [done.length, scene.items.length, onDone]);
  function tap(i: number) { if (done.includes(i)) return; if (i === done.length) setDone(d => [...d, i]); else { setWrong(i); setTimeout(() => setWrong(null), 500); } }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="grid content-start gap-2">
        <p className="text-sm font-semibold text-muted">Tap in the right order</p>
        {shuffled.map(({ t, i }, k) => (
          <button key={i} onClick={() => tap(i)} disabled={done.includes(i)} style={delay(k, 0.07)}
            className={cx('v-left rounded-xl border px-4 py-3 text-left font-semibold transition', done.includes(i) ? 'border-line bg-surface2 text-muted line-through opacity-60' : 'border-line bg-surface hover:border-board', wrong === i && 'v-shake border-bad bg-bad/10')}>{t}</button>
        ))}
      </div>
      <ol className="grid content-start gap-2">
        <p className="text-sm font-semibold text-muted">Your sequence</p>
        {scene.items.map((t, k) => (
          <li key={k} className={cx('flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 transition', done[k] !== undefined ? 'v-pop border-good bg-good/10' : 'border-line')}>
            <span className={cx('grid h-7 w-7 place-items-center rounded-full text-sm font-bold', done[k] !== undefined ? 'bg-good text-white' : 'bg-surface2 text-muted')}>{k + 1}</span>
            <span className="font-semibold">{done[k] !== undefined ? scene.items[done[k]] : ''}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- quiz ---------- */
export function QuizScene({ scene, onDone, onQuiz }: SceneProps<'quiz'>) {
  const [pick, setPick] = useState<number | null>(null);
  const ok = pick === scene.answer;
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <p className="v-up text-center text-xl font-semibold">{scene.q}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {scene.options.map((o, i) => (
          <button key={i} disabled={pick !== null} onClick={() => { setPick(i); onQuiz?.(i === scene.answer); onDone(); }} style={delay(i, 0.08)}
            className={cx('v-pop flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg font-semibold transition',
              pick === null ? 'border-line bg-surface hover:-translate-y-0.5 hover:border-board' : i === scene.answer ? 'border-good bg-good/10' : i === pick ? 'v-shake border-bad bg-bad/10' : 'border-line opacity-60')}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 font-mono text-sm">{'ABCD'[i]}</span>{o}
            {pick !== null && i === scene.answer && <CheckCircle2 className="ml-auto text-good" size={20} />}
            {pick === i && !ok && <XCircle className="ml-auto text-bad" size={20} />}
          </button>
        ))}
      </div>
      {pick !== null && <div className={cx('v-up rounded-2xl px-4 py-3', ok ? 'bg-good/10' : 'bg-bad/10')}><b>{ok ? 'Correct! 🎉' : 'Not quite.'}</b> {scene.explanation}</div>}
    </div>
  );
}

export function LabScene({ scene, onDone }: SceneProps<'lab'>) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return <LabView id={scene.lab} />;
}

export const SCENES: Record<Scene['type'], (p: SceneProps<never>) => JSX.Element> = {
  intro: IntroScene as never, concept_map: ConceptMapScene as never, steps: StepsScene as never, cycle: CycleScene as never,
  compare: CompareScene as never, sort: SortScene as never, hotspot: HotspotScene as never, formula: FormulaScene as never,
  timeline: TimelineScene as never, flashcards: FlashcardsScene as never, order: OrderScene as never, quiz: QuizScene as never, lab: LabScene as never,
};
export const INTERACTIVE = new Set<Scene['type']>(['concept_map', 'sort', 'hotspot', 'formula', 'flashcards', 'order', 'quiz', 'lab']);
