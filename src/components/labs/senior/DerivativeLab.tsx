'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Seg, fmt } from './kit';

type Fn = 'sq' | 'cubic' | 'sin' | 'exp';
export const FNS: Record<Fn, { f: (x: number) => number; d: (x: number) => number; label: string; dLabel: string; x: [number, number]; y: [number, number] }> = {
  sq: { f: x => x * x, d: x => 2 * x, label: 'f(x) = x²', dLabel: "f′(x) = 2x", x: [-3, 3], y: [-4, 9] },
  cubic: { f: x => x ** 3 - 3 * x, d: x => 3 * x * x - 3, label: 'f(x) = x³ − 3x', dLabel: "f′(x) = 3x² − 3", x: [-2.5, 2.5], y: [-6, 8] },
  sin: { f: Math.sin, d: Math.cos, label: 'f(x) = sin x', dLabel: "f′(x) = cos x", x: [-Math.PI, Math.PI], y: [-1.6, 1.6] },
  exp: { f: Math.exp, d: Math.exp, label: 'f(x) = eˣ', dLabel: "f′(x) = eˣ", x: [-2, 2], y: [-1, 8] },
};

/** Secant through (x, f(x)) and (x+h, f(x+h)); as h → 0 its slope approaches the derivative (tangent). */
export default function DerivativeLab() {
  const { t } = useT();
  const [fn, setFn] = useState<Fn>('sq');
  const F = FNS[fn];
  const [x0, setX0] = useState(1);
  const [h, setH] = useState(1);
  const x = Math.min(Math.max(x0, F.x[0]), F.x[1]);
  const secant = (F.f(x + h) - F.f(x)) / h;
  const exact = F.d(x);
  const W = 320, H = 220, P = 24;
  const X = (v: number) => P + ((v - F.x[0]) / (F.x[1] - F.x[0])) * (W - 2 * P);
  const Y = (v: number) => H - P - ((v - F.y[0]) / (F.y[1] - F.y[0])) * (H - 2 * P);
  const pts = (g: (v: number) => number) => Array.from({ length: 121 }, (_, i) => { const v = F.x[0] + (i / 120) * (F.x[1] - F.x[0]); return `${X(v).toFixed(1)},${Y(Math.max(F.y[0] - 5, Math.min(F.y[1] + 5, g(v)))).toFixed(1)}`; }).join(' ');
  const line = (m: number, c: number) => { const a = F.x[0], b = F.x[1]; return { x1: X(a), y1: Y(m * (a - x) + c), x2: X(b), y2: Y(m * (b - x) + c) }; };

  return (
    <div className="grid gap-4">
      <Seg label={t('lsr.dv.fn')} value={fn} onChange={v => { setFn(v); setX0(1); }} options={(Object.keys(FNS) as Fn[]).map(k => [k, FNS[k].label])} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-ctl border border-line bg-surface" role="img"
        aria-label={t('lsr.dv.aria', { x: fmt(x, 3), h: fmt(h, 3), s: fmt(secant, 4), d: fmt(exact, 4) })}>
        <defs><clipPath id="dv-clip"><rect x={P} y={P} width={W - 2 * P} height={H - 2 * P} /></clipPath></defs>
        <line x1={P} x2={W - P} y1={Y(0)} y2={Y(0)} stroke={C.muted} /><line x1={X(0)} x2={X(0)} y1={P} y2={H - P} stroke={C.muted} />
        <g clipPath="url(#dv-clip)">
          <polyline points={pts(F.d)} fill="none" stroke={C.violet} strokeWidth="1.5" strokeDasharray="5 4" />
          <polyline points={pts(F.f)} fill="none" stroke={C.primary} strokeWidth="2.5" />
          <line {...line(exact, F.f(x))} stroke={C.teal} strokeWidth="2" />
          <line {...line(secant, F.f(x))} stroke={C.accent} strokeWidth="2" />
        </g>
        <circle cx={X(x)} cy={Y(F.f(x))} r="5" fill={C.teal} />
        <circle cx={X(x + h)} cy={Y(F.f(x + h))} r="4.5" fill={C.accent} />
        <text x={W - P} y={P - 6} fontSize="10" textAnchor="end" fill={C.ink}>{F.label}</text>
      </svg>
      <div className="grid gap-3">
        <Slider id="dv-x" label={t('lsr.dv.x')} value={Number(x.toFixed(2))} min={Number(F.x[0].toFixed(2))} max={Number(F.x[1].toFixed(2))} step={0.05} onChange={setX0} />
        <Slider id="dv-h" label={t('lsr.dv.h')} value={h} min={0.01} max={2} step={0.01} onChange={setH} />
      </div>
      <Readout items={[
        [t('lsr.dv.secant'), fmt(secant, 5)],
        [F.dLabel, fmt(exact, 5)],
        [t('lsr.dv.diff'), fmt(Math.abs(secant - exact), 3)],
        ['h', fmt(h, 3)],
      ]} />
      <Legend items={[[C.primary, 'f(x)'], [C.accent, t('lsr.dv.legSec')], [C.teal, t('lsr.dv.legTan')], [C.violet, "f′(x)"]]} />
      <LabNote>{t('lsr.dv.note')}</LabNote>
    </div>
  );
}
