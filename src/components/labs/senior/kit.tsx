'use client';
/** Small shared toolkit for the senior lab pack: SVG plots, segmented controls and a play/scrub clock. */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export const C = {
  primary: 'rgb(var(--primary))', teal: 'rgb(var(--teal))', accent: 'rgb(var(--accent))', bad: 'rgb(var(--bad))',
  good: 'rgb(var(--good))', violet: 'rgb(var(--violet))', ink: 'rgb(var(--ink))', muted: 'rgb(var(--muted))',
  line: 'rgb(var(--line))', surface: 'rgb(var(--surface))', s2: 'rgb(var(--surface-2))',
};

/** Number formatting with sensible significant figures (scientific notation for very large/small values). */
export function fmt(v: number, sig = 3): string {
  if (!isFinite(v)) return '—';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = v.toExponential(sig - 1).split('e');
    return `${m} × 10${sup(Number(e))}`;
  }
  return Number(v.toPrecision(sig)).toString();
}
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const sup = (n: number) => String(n).split('').map(c => SUP[c] ?? c).join('');

export interface Series { pts: [number, number][]; color: string; dash?: string; width?: number }

/** A labelled line chart in SVG (responsive, token colours). */
export function Plot({ series, xMin, xMax, yMin, yMax, xLabel, yLabel, label, marks = [], vlines = [], height = 200 }: {
  series: Series[]; xMin: number; xMax: number; yMin: number; yMax: number; xLabel: string; yLabel: string; label: string;
  marks?: { x: number; y: number; color?: string }[]; vlines?: { x: number; color?: string; text?: string }[]; height?: number;
}) {
  const W = 320, H = height, L = 38, R = 10, T = 12, B = 30;
  const sx = (x: number) => L + ((x - xMin) / (xMax - xMin || 1)) * (W - L - R);
  const sy = (y: number) => H - B - ((Math.min(Math.max(y, yMin), yMax) - yMin) / (yMax - yMin || 1)) * (H - T - B);
  const ticks = (a: number, b: number) => [a, a + (b - a) / 2, b];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-ctl border border-line bg-surface" role="img" aria-label={label}>
      {ticks(yMin, yMax).map(v => <line key={`y${v}`} x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} stroke={C.line} strokeWidth="0.8" />)}
      {yMin < 0 && yMax > 0 && <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} stroke={C.muted} strokeWidth="1" />}
      <line x1={L} x2={L} y1={T} y2={H - B} stroke={C.muted} />
      <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke={C.muted} />
      {ticks(yMin, yMax).map(v => <text key={`t${v}`} x={L - 4} y={sy(v) + 3} fontSize="9" textAnchor="end" fill={C.muted}>{fmt(v, 2)}</text>)}
      {ticks(xMin, xMax).map(v => <text key={`x${v}`} x={sx(v)} y={H - B + 12} fontSize="9" textAnchor="middle" fill={C.muted}>{fmt(v, 2)}</text>)}
      <text x={(L + W - R) / 2} y={H - 4} fontSize="10" textAnchor="middle" fill={C.ink}>{xLabel}</text>
      <text x={10} y={(T + H - B) / 2} fontSize="10" textAnchor="middle" fill={C.ink} transform={`rotate(-90 10 ${(T + H - B) / 2})`}>{yLabel}</text>
      {vlines.map((v, i) => (
        <g key={i}><line x1={sx(v.x)} x2={sx(v.x)} y1={T} y2={H - B} stroke={v.color || C.accent} strokeDasharray="4 3" />
          {v.text && <text x={sx(v.x) + 3} y={T + 9} fontSize="9" fill={v.color || C.accent}>{v.text}</text>}</g>
      ))}
      {series.map((s, i) => s.pts.length > 1 && (
        <polyline key={i} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeDasharray={s.dash} strokeLinejoin="round"
          points={s.pts.filter(p => isFinite(p[1])).map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} />
      ))}
      {marks.map((m, i) => <circle key={i} cx={sx(m.x)} cy={sy(m.y)} r="4" fill={m.color || C.accent} stroke={C.surface} strokeWidth="1.5" />)}
    </svg>
  );
}

/** Accessible segmented control (radio group). */
export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg flex-wrap" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

/**
 * Lab clock: `t` advances from 0 to `end` (seconds of simulated time) while playing.
 * With reduced motion, Play jumps straight to the end state. `setT` lets a slider scrub time.
 */
export function useLabClock(end: number, speed = 1) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    if (!playing) return;
    if (reduce) { setT(end); setPlaying(false); return; }
    let last = performance.now();
    const step = (now: number) => {
      const dt = ((now - last) / 1000) * speed; last = now;
      setT(prev => { const n = prev + dt; if (n >= end) { setPlaying(false); return end; } return n; });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, end, speed, reduce]);
  useEffect(() => { setT(prev => Math.min(prev, end)); }, [end]);
  const play = () => { if (t >= end) setT(0); setPlaying(true); };
  return { t, setT: (v: number) => { setPlaying(false); setT(v); }, playing, play, pause: () => setPlaying(false), reset: () => { setPlaying(false); setT(0); }, reduce: !!reduce };
}

/** Animation frame time (seconds) for decorative motion; 0 and static when reduced motion is on. */
export function useFrameTime(active = true) {
  const reduce = useReducedMotion();
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (reduce || !active) return;
    let raf = 0; const s = performance.now();
    const loop = (n: number) => { setNow((n - s) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, active]);
  return now;
}

/** Arrow (SVG) from (x1,y1) to (x2,y2). */
export function Arrow({ x1, y1, x2, y2, color, width = 2.5, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number; label?: string; lx?: number; ly?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1), l = Math.hypot(x2 - x1, y2 - y1);
  if (l < 2) return null;
  const hx = x2 - 9 * Math.cos(a - 0.4), hy = y2 - 9 * Math.sin(a - 0.4), kx = x2 - 9 * Math.cos(a + 0.4), ky = y2 - 9 * Math.sin(a + 0.4);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 6 * Math.cos(a)} y2={y2 - 6 * Math.sin(a)} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx},${hy} ${kx},${ky}`} fill={color} />
      {label && <text x={lx ?? x2 + 4} y={ly ?? y2 - 4} fontSize="11" fontWeight="600" fill={color}>{label}</text>}
    </g>
  );
}
