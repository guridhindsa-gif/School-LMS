'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Seg, fmt } from './ui';

type Mode = 'right' | 'any';
type P = [number, number];

/** Square drawn outward on side p→q (away from the third vertex o). */
function squareOn(p: P, q: P, o: P): P[] {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  let nx = -dy, ny = dx;
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
  if ((o[0] - mx) * nx + (o[1] - my) * ny > 0) { nx = -nx; ny = -ny; }
  return [p, q, [q[0] + nx, q[1] + ny], [p[0] + nx, p[1] + ny]];
}

/** Squares on the sides of a triangle: for a right angle, a² + b² = c² exactly. */
export default function PythagorasLab() {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('right');
  const [a, setA] = useState(3), [b, setB] = useState(4);
  const [ang, setAng] = useState(110);
  const theta = mode === 'right' ? 90 : ang;
  const r = (theta * Math.PI) / 180;
  // right-angle (or chosen angle) at O, legs along x and at theta
  const O: P = [0, 0], A: P = [a, 0], B: P = [b * Math.cos(r), b * Math.sin(r)];
  const c2 = a * a + b * b - 2 * a * b * Math.cos(r); // law of cosines; = a² + b² when theta = 90°
  const c = Math.sqrt(c2);
  const sqA = squareOn(O, A, B), sqB = squareOn(O, B, A), sqC = squareOn(A, B, O);
  const all = [...sqA, ...sqB, ...sqC];
  const minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0]));
  const minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
  const s = Math.min(300 / (maxX - minX), 260 / (maxY - minY));
  const T = (p: P) => `${(10 + (p[0] - minX) * s).toFixed(1)},${(270 - (p[1] - minY) * s).toFixed(1)}`;
  const poly = (ps: P[]) => ps.map(T).join(' ');
  const sum = a * a + b * b;
  const rel = Math.abs(c2 - sum) < 1e-9 ? '=' : c2 < sum ? '<' : '>';

  return (
    <div className="grid gap-5">
      <Seg label={t('lm.py.mode')} value={mode} onChange={setMode} options={[['right', t('lm.py.right')], ['any', t('lm.py.any')]]} />
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 280" className="w-full max-w-md rounded-card border border-line bg-surface" role="img" aria-label={t('lm.py.aria', { a, b, c: fmt(c), deg: theta, rel })}>
          <polygon points={poly(sqA)} fill={C.primary} fillOpacity=".25" stroke={C.primary} strokeWidth="1.5" />
          <polygon points={poly(sqB)} fill={C.teal} fillOpacity=".25" stroke={C.teal} strokeWidth="1.5" />
          <polygon points={poly(sqC)} fill={C.accent} fillOpacity=".3" stroke={C.accent} strokeWidth="1.5" />
          <polygon points={poly([O, A, B])} fill={C.surface} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
          {mode === 'right' && (() => { const k = 0.6; const p1: P = [k, 0], p2: P = [k, k], p3: P = [0, k]; return <polyline points={poly([p1, p2, p3])} fill="none" stroke={C.ink} strokeWidth="1.5" />; })()}
        </svg>
        <div className="grid content-start gap-3">
          <Slider id="py-a" label={t('lm.py.legA')} value={a} min={1} max={10} onChange={setA} />
          <Slider id="py-b" label={t('lm.py.legB')} value={b} min={1} max={10} onChange={setB} />
          {mode === 'any' && <Slider id="py-ang" label={t('lm.py.angle')} value={ang} min={30} max={150} unit="°" onChange={setAng} />}
          <Legend items={[[C.primary, `a² = ${a * a}`], [C.teal, `b² = ${b * b}`], [C.accent, `c² = ${fmt(c2)}`]]} />
        </div>
      </div>
      <Readout items={[
        ['a² + b²', `${a * a} + ${b * b} = ${sum}`],
        ['c²', fmt(c2)],
        ['c', fmt(c)],
        [t('lm.py.relation'), `c² ${rel} a² + b²`],
      ]} />
      <p className="text-sm font-semibold" role="status">{rel === '=' ? t('lm.py.equal') : rel === '<' ? t('lm.py.less') : t('lm.py.more')}</p>
      <LabNote>{t('lm.py.note')}</LabNote>
    </div>
  );
}
