'use client';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Plot, Seg, fmt, useLabClock } from './kit';

/** τ in seconds for R in kΩ and C in μF. */
export const tauOf = (RkOhm: number, CuF: number) => RkOhm * 1e3 * CuF * 1e-6;
export const vCharge = (V0: number, t: number, tau: number) => V0 * (1 - Math.exp(-t / tau));

/** RC circuit: charging and discharging curves, time constant τ = RC and the current. */
export default function CapacitorLab() {
  const { t } = useT();
  const [mode, setMode] = useState<'charge' | 'discharge'>('charge');
  const [R, setR] = useState(10);
  const [Cap, setCap] = useState(100);
  const [V0, setV0] = useState(9);
  const tau = tauOf(R, Cap);
  const END = 5 * tau;
  const clock = useLabClock(END, END / 5); // a full run takes ~5 s of real time
  const tm = Math.min(clock.t, END);
  const Vc = (s: number) => (mode === 'charge' ? vCharge(V0, s, tau) : V0 * Math.exp(-s / tau));
  const I = (s: number) => (V0 / (R * 1e3)) * Math.exp(-s / tau) * 1e3; // mA (magnitude)
  const N = 100, ts = Array.from({ length: N + 1 }, (_, i) => (i / N) * END);
  const upto = ts.filter(s => s <= tm).concat(tm);
  const pct = (Vc(tm) / V0) * 100;

  return (
    <div className="grid gap-4">
      <Seg label={t('lsr.rc.mode')} value={mode} onChange={v => { setMode(v); clock.reset(); }} options={[['charge', t('lsr.rc.charge')], ['discharge', t('lsr.rc.discharge')]]} />
      <div className="grid items-start gap-4 md:grid-cols-[180px_1fr_1fr]">
        <svg viewBox="0 0 170 130" className="mx-auto w-full max-w-[200px]" role="img" aria-label={t('lsr.rc.aria', { t: fmt(tm, 3), v: fmt(Vc(tm), 3), p: pct.toFixed(0) })}>
          <path d="M20 30H150V100H20Z" fill="none" stroke={C.ink} strokeWidth="2" />
          {mode === 'charge' && <g><rect x="12" y="52" width="16" height="26" fill={C.surface} /><line x1="10" x2="30" y1="58" y2="58" stroke={C.ink} strokeWidth="3" /><line x1="14" x2="26" y1="70" y2="70" stroke={C.ink} strokeWidth="3" /><text x="34" y="68" fontSize="10" fill={C.ink}>{V0} V</text></g>}
          <rect x="65" y="22" width="40" height="16" fill={C.surface} stroke={C.ink} strokeWidth="2" /><text x="85" y="16" fontSize="10" textAnchor="middle" fill={C.ink}>R = {R} kΩ</text>
          <rect x="140" y="56" width="20" height="18" fill={C.surface} />
          <line x1="138" x2="162" y1="60" y2="60" stroke={C.ink} strokeWidth="3" /><line x1="138" x2="162" y1="70" y2="70" stroke={C.ink} strokeWidth="3" />
          <rect x="140" y={74 - (pct / 100) * 14} width="20" height={(pct / 100) * 14} fill={C.accent} opacity=".5" />
          <text x="150" y="92" fontSize="10" textAnchor="middle" fill={C.ink}>{Cap} μF</text>
          <text x="85" y="122" fontSize="11" fontWeight="700" textAnchor="middle" fill={C.primary}>Vc = {fmt(Vc(tm), 3)} V</text>
        </svg>
        <Plot label={t('lsr.rc.vAria')} xLabel="t (s)" yLabel="Vc (V)" xMin={0} xMax={END} yMin={0} yMax={V0}
          series={[{ pts: ts.map(s => [s, Vc(s)]), color: C.line, dash: '3 3' }, { pts: upto.map(s => [s, Vc(s)]), color: C.primary }]}
          marks={[{ x: tm, y: Vc(tm) }, { x: tau, y: Vc(tau), color: C.teal }]} vlines={[{ x: tau, text: 'τ', color: C.teal }]} />
        <Plot label={t('lsr.rc.iAria')} xLabel="t (s)" yLabel="I (mA)" xMin={0} xMax={END} yMin={0} yMax={I(0)}
          series={[{ pts: ts.map(s => [s, I(s)]), color: C.line, dash: '3 3' }, { pts: upto.map(s => [s, I(s)]), color: C.violet }]} marks={[{ x: tm, y: I(tm), color: C.violet }]} vlines={[{ x: tau, text: 'τ', color: C.teal }]} />
      </div>
      <div className="grid gap-3">
        <Slider id="rc-r" label={t('lsr.rc.R')} value={R} min={1} max={100} unit=" kΩ" onChange={v => { setR(v); clock.reset(); }} />
        <Slider id="rc-c" label={t('lsr.rc.C')} value={Cap} min={10} max={1000} step={10} unit=" μF" onChange={v => { setCap(v); clock.reset(); }} />
        <Slider id="rc-v" label={t('lsr.rc.V0')} value={V0} min={1} max={12} unit=" V" onChange={setV0} />
        <Slider id="rc-t" label={t('lsr.c.time')} value={Number(tm.toFixed(2))} min={0} max={Number(END.toFixed(2))} step={END / 200} unit=" s" onChange={clock.setT} />
      </div>
      <div className="flex flex-wrap gap-2">
        {clock.playing ? <button className="btn-ghost" onClick={clock.pause}><Pause size={16} aria-hidden /> {t('lsr.c.pause')}</button>
          : <button className="btn-primary" onClick={clock.play}><Play size={16} aria-hidden /> {t('lsr.c.play')}</button>}
        <button className="btn-ghost" onClick={clock.reset}><RotateCcw size={16} aria-hidden /> {t('lsr.c.reset')}</button>
      </div>
      <Readout items={[['τ = RC', `${fmt(tau, 3)} s`], ['Vc / V₀', `${pct.toFixed(1)} %`], ['I', `${fmt(I(tm), 3)} mA`], ['Q = CVc', `${fmt(Cap * Vc(tm), 3)} μC`]]} />
      <Legend items={[[C.primary, t('lsr.rc.legV')], [C.violet, t('lsr.rc.legI')], [C.teal, t('lsr.rc.legTau')]]} />
      <LabNote>{t('lsr.rc.note')}</LabNote>
    </div>
  );
}
