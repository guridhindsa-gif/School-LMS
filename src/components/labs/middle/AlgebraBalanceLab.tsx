'use client';
import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Readout } from '../Slider';
import { C, btn } from './ui';

/** State of the scale: left = a·x + b units, right = c units (always a true equation unless tilted on purpose). */
interface Eq { a: number; b: number; c: number }
const PRESETS: [number, number, number][] = [[2, 3, 4], [3, 5, 2], [4, 1, 3], [5, 2, 4], [2, 6, 7], [3, 0, 6]]; // [a, b, x]

/** Solve a·x + b = c on a balance: whatever you do to one pan you must do to the other. */
export default function AlgebraBalanceLab() {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [p, setP] = useState(0);
  const [a0, b0, x] = PRESETS[p];
  const start: Eq = { a: a0, b: b0, c: a0 * x + b0 };
  const [eq, setEq] = useState<Eq>(start);
  const [log, setLog] = useState<string[]>([]);
  const [tilt, setTilt] = useState(0); // −1 left heavy, 1 right heavy, 0 balanced

  const str = (e: Eq) => `${e.a === 1 ? '' : e.a}x${e.b ? ` + ${e.b}` : ''} = ${e.c}`;
  const apply = (next: Eq, msg: string) => { setLog(l => [...l, `${msg} → ${str(next)}`]); setEq(next); setTilt(0); };
  const reset = (i = p) => { const [a, b, xx] = PRESETS[i]; setP(i); setEq({ a, b, c: a * xx + b }); setLog([]); setTilt(0); };
  const solved = eq.a === 1 && eq.b === 0;

  // pans
  const box = (k: number, px: number, py: number) => <g key={`x${k}`}><rect x={px} y={py} width="22" height="22" rx="4" fill={C.primary} /><text x={px + 11} y={py + 15} fontSize="12" textAnchor="middle" fill="#fff" fontWeight="700">x</text></g>;
  const unit = (k: number, px: number, py: number) => <circle key={`u${k}`} cx={px + 8} cy={py + 8} r="8" fill={C.accent} />;
  const items = (n: number, kind: 'x' | 'u', ox: number, oy: number, perRow: number) =>
    Array.from({ length: n }, (_, i) => (kind === 'x' ? box : unit)(i, ox + (i % perRow) * (kind === 'x' ? 25 : 18), oy - Math.floor(i / perRow) * (kind === 'x' ? 25 : 18)));
  const ang = tilt * 8;

  return (
    <div className="grid gap-5">
      <svg viewBox="0 0 340 210" className="w-full max-w-xl rounded-card border border-line bg-surface" role="img"
        aria-label={t(tilt ? 'lm.alg.ariaTilt' : 'lm.alg.aria', { eq: str(eq) })}>
        <polygon points="170,200 150,200 160,120 180,120 190,200" fill={C.muted} opacity=".5" />
        <g transform={`rotate(${ang} 170 120)`} style={{ transition: reduce ? 'none' : 'transform .5s' }}>
          <line x1="30" y1="120" x2="310" y2="120" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="120" x2="45" y2="160" stroke={C.muted} /><line x1="135" y1="120" x2="135" y2="160" stroke={C.muted} />
          <line x1="205" y1="120" x2="205" y2="160" stroke={C.muted} /><line x1="295" y1="120" x2="295" y2="160" stroke={C.muted} />
          <path d="M35 160h110l-8 10H43z" fill={C.s2} stroke={C.line} /><path d="M195 160h110l-8 10H203z" fill={C.s2} stroke={C.line} />
          {items(eq.a, 'x', 40, 136, 4)}
          {items(eq.b, 'u', 40 + Math.min(eq.a, 4) * 25, 142, 3)}
          {items(Math.max(0, eq.c), 'u', 200, 142, 6)}
        </g>
        <text x="90" y="198" fontSize="12" textAnchor="middle" fontWeight="700" fill={C.ink}>{eq.a === 1 ? '' : eq.a}x{eq.b ? ` + ${eq.b}` : ''}</text>
        <text x="250" y="198" fontSize="12" textAnchor="middle" fontWeight="700" fill={C.ink}>{eq.c}</text>
      </svg>

      <div className="flex flex-wrap gap-2">
        <button className={btn()} disabled={eq.b === 0} onClick={() => apply({ ...eq, b: eq.b - 1, c: eq.c - 1 }, t('lm.alg.minus1'))}>{t('lm.alg.minus1')}</button>
        <button className={btn()} disabled={eq.b === 0} onClick={() => apply({ ...eq, b: 0, c: eq.c - eq.b }, t('lm.alg.minusB', { b: eq.b }))}>{t('lm.alg.minusB', { b: eq.b })}</button>
        <button className={btn(eq.b === 0 && eq.a > 1)} disabled={eq.b !== 0 || eq.a === 1} onClick={() => apply({ a: 1, b: 0, c: eq.c / eq.a }, t('lm.alg.divide', { a: eq.a }))}>{t('lm.alg.divide', { a: eq.a })}</button>
        <button className={btn()} disabled={eq.b === 0 || tilt !== 0} onClick={() => setTilt(1)}>{t('lm.alg.oneSide')}</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={btn()} onClick={() => reset()}>{t('lm.alg.reset')}</button>
        <button className={btn()} onClick={() => reset((p + 1) % PRESETS.length)}>{t('lm.alg.new')}</button>
      </div>
      {tilt !== 0 && <p role="alert" className="rounded-ctl border border-bad/30 bg-bad/10 px-3 py-2 text-sm">{t('lm.alg.tiltMsg')} <button className="font-semibold underline" onClick={() => setTilt(0)}>{t('lm.alg.putBack')}</button></p>}
      {solved && <p role="status" className="rounded-ctl border border-good/30 bg-good/10 px-3 py-2 text-sm font-semibold">{t('lm.alg.solved', { x: eq.c })}</p>}
      <Readout items={[[t('lm.alg.start'), str(start)], [t('lm.alg.now'), str(eq)], [t('lm.alg.check'), solved ? `${start.a}×${eq.c}${start.b ? ` + ${start.b}` : ''} = ${start.c} ✓` : '—']]} />
      {log.length > 0 && (
        <ol className="grid gap-1 rounded-ctl border border-line bg-surface2/60 p-3 font-mono text-sm" aria-label={t('lm.alg.steps')}>
          {log.map((l, i) => <li key={i}>{i + 1}. {l}</li>)}
        </ol>
      )}
      <LabNote>{t('lm.alg.note')}</LabNote>
    </div>
  );
}
