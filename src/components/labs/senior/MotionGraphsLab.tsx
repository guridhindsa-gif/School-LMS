'use client';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Plot, fmt, useLabClock } from './kit';

/** A cart moving with uniform acceleration: live x–t, v–t and a–t graphs and the equations of motion. */
export default function MotionGraphsLab() {
  const { t } = useT();
  const [u, setU] = useState(4);
  const [a, setA] = useState(1.5);
  const END = 10;
  const clock = useLabClock(END, 1.5);
  const tm = clock.t;
  const x = (s: number) => u * s + 0.5 * a * s * s;
  const v = (s: number) => u + a * s;
  const N = 80;
  const full = Array.from({ length: N + 1 }, (_, i) => (i / N) * END);
  const upto = full.filter(s => s <= tm + 1e-9).concat(tm);
  const xs = full.map(x), xMin = Math.min(0, ...xs), xMax = Math.max(1, ...xs);
  const vs = full.map(v), vMin = Math.min(0, ...vs), vMax = Math.max(1, ...vs);
  const pos = x(tm), vel = v(tm);
  // area under the v–t graph, measured numerically (trapezoids) — equals the displacement
  const area = upto.slice(1).reduce((acc, s, i) => acc + ((v(upto[i]) + v(s)) / 2) * (s - upto[i]), 0);
  const check = vel * vel - (u * u + 2 * a * pos); // v² = u² + 2as  → ≈ 0
  // track: cart position mapped to the range of positions over the run
  const tx = (m: number) => 20 + ((m - xMin) / (xMax - xMin || 1)) * 280;

  return (
    <div className="grid gap-4">
      <svg viewBox="0 0 320 70" className="w-full rounded-ctl border border-line bg-surface2" role="img"
        aria-label={t('lsr.mg.aria', { t: fmt(tm, 3), x: fmt(pos, 3), v: fmt(vel, 3) })}>
        <line x1="14" x2="306" y1="52" y2="52" stroke={C.muted} strokeWidth="2" />
        {[0, 0.25, 0.5, 0.75, 1].map(f => { const m = xMin + f * (xMax - xMin); return <g key={f}><line x1={tx(m)} x2={tx(m)} y1="52" y2="57" stroke={C.muted} /><text x={tx(m)} y="67" fontSize="8" textAnchor="middle" fill={C.muted}>{fmt(m, 2)} m</text></g>; })}
        <g transform={`translate(${tx(pos)} 0)`}>
          <rect x="-14" y="30" width="28" height="16" rx="4" fill={C.primary} />
          <circle cx="-8" cy="48" r="4" fill={C.ink} /><circle cx="8" cy="48" r="4" fill={C.ink} />
          {Math.abs(vel) > 0.05 && <path d={vel > 0 ? 'M16 24h14l-4-4m4 4-4 4' : 'M-16 24h-14l4-4m-4 4 4 4'} stroke={C.accent} strokeWidth="2" fill="none" />}
        </g>
      </svg>

      <div className="grid gap-3 md:grid-cols-3">
        <Plot label={t('lsr.mg.xtAria')} xLabel="t (s)" yLabel="x (m)" xMin={0} xMax={END} yMin={xMin} yMax={xMax} height={170}
          series={[{ pts: full.map(s => [s, x(s)]), color: C.line, dash: '3 3' }, { pts: upto.map(s => [s, x(s)]), color: C.primary }]} marks={[{ x: tm, y: pos }]} />
        <Plot label={t('lsr.mg.vtAria')} xLabel="t (s)" yLabel="v (m/s)" xMin={0} xMax={END} yMin={vMin} yMax={vMax} height={170}
          series={[{ pts: full.map(s => [s, v(s)]), color: C.line, dash: '3 3' }, { pts: upto.map(s => [s, v(s)]), color: C.teal }]} marks={[{ x: tm, y: vel, color: C.teal }]} />
        <Plot label={t('lsr.mg.atAria')} xLabel="t (s)" yLabel="a (m/s²)" xMin={0} xMax={END} yMin={Math.min(-5, a - 1)} yMax={Math.max(5, a + 1)} height={170}
          series={[{ pts: [[0, a], [tm, a]], color: C.violet }]} marks={[{ x: tm, y: a, color: C.violet }]} />
      </div>

      <div className="grid gap-3">
        <Slider id="mg-u" label={t('lsr.mg.u')} value={u} min={-10} max={15} step={0.5} unit=" m/s" onChange={v => { setU(v); clock.reset(); }} />
        <Slider id="mg-a" label={t('lsr.mg.a')} value={a} min={-4} max={4} step={0.1} unit=" m/s²" onChange={v => { setA(v); clock.reset(); }} />
        <Slider id="mg-t" label={t('lsr.c.time')} value={Number(tm.toFixed(1))} min={0} max={END} step={0.1} unit=" s" onChange={clock.setT} />
      </div>
      <div className="flex flex-wrap gap-2">
        {clock.playing
          ? <button className="btn-ghost" onClick={clock.pause}><Pause size={16} aria-hidden /> {t('lsr.c.pause')}</button>
          : <button className="btn-primary" onClick={clock.play}><Play size={16} aria-hidden /> {t('lsr.c.play')}</button>}
        <button className="btn-ghost" onClick={clock.reset}><RotateCcw size={16} aria-hidden /> {t('lsr.c.reset')}</button>
      </div>
      <Readout items={[
        ['x = ut + ½at²', `${fmt(pos, 3)} m`],
        ['v = u + at', `${fmt(vel, 3)} m/s`],
        [t('lsr.mg.area'), `${fmt(area, 3)} m`],
        ['v² − (u² + 2as)', fmt(Math.abs(check) < 1e-9 ? 0 : check, 2)],
      ]} />
      <Legend items={[[C.primary, t('lsr.mg.legX')], [C.teal, t('lsr.mg.legV')], [C.violet, t('lsr.mg.legA')]]} />
      <LabNote>{t('lsr.mg.note')}</LabNote>
    </div>
  );
}
