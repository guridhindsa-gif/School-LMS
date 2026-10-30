'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { Arrow, C, fmt, useFrameTime } from './kit';

const G = 9.8;

/** Block on a rough surface: applied force, static vs kinetic friction, free-body diagram and F = ma. */
export default function NewtonLab() {
  const { t } = useT();
  const [F, setF] = useState(40);
  const [m, setM] = useState(5);
  const [us, setUs] = useState(0.5);
  const [uk, setUk] = useState(0.3);
  const muK = Math.min(uk, us); // kinetic friction is never larger than static
  const W = m * G, N = W;
  const fsMax = us * N;
  const moving = F > fsMax;
  const friction = moving ? muK * N : F; // static friction just balances F
  const net = moving ? F - friction : 0;
  const acc = net / m;
  const time = useFrameTime(moving);
  // decorative slide: position grows with ½at², wrapped across the strip (static when reduced motion)
  const slide = moving ? ((0.5 * acc * (time % 3) ** 2) * 6) % 40 : 0;
  const sc = (n: number) => Math.min(80, 8 + n * 0.9); // arrow length (px) for a force in N

  return (
    <div className="grid gap-4">
      <svg viewBox="0 0 320 200" className="w-full rounded-ctl border border-line bg-surface2" role="img"
        aria-label={t(moving ? 'lsr.nw.ariaMove' : 'lsr.nw.ariaRest', { F: fmt(F), f: fmt(friction, 3), a: fmt(acc, 3) })}>
        <rect x="0" y="140" width="320" height="60" fill={C.line} opacity=".55" />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 20} y1="140" x2={i * 20 + 12} y2="152" stroke={C.muted} opacity=".5" />)}
        <g transform={`translate(${90 + slide} 0)`}>
          <rect x="0" y="95" width="70" height="45" rx="4" fill={C.primary} />
          <text x="35" y="122" fontSize="12" fontWeight="700" textAnchor="middle" fill="#fff">{m} kg</text>
          <Arrow x1={70} y1={117} x2={70 + sc(F)} y2={117} color={C.accent} label="F" />
          {friction > 0.01 && <Arrow x1={0} y1={133} x2={-sc(friction)} y2={133} color={C.bad} label="f" lx={-sc(friction) - 2} ly={128} />}
          <Arrow x1={35} y1={95} x2={35} y2={95 - sc(N) * 0.8} color={C.teal} label="N" />
          <Arrow x1={35} y1={140} x2={35} y2={140 + Math.min(55, sc(W) * 0.6)} color={C.violet} label="mg" />
        </g>
        <text x="10" y="20" fontSize="12" fontWeight="700" fill={moving ? C.good : C.muted}>{moving ? t('lsr.nw.moving') : t('lsr.nw.rest')}</text>
      </svg>

      <div className="grid gap-3">
        <Slider id="nw-f" label={t('lsr.nw.F')} value={F} min={0} max={120} unit=" N" onChange={setF} />
        <Slider id="nw-m" label={t('lsr.nw.m')} value={m} min={1} max={20} unit=" kg" onChange={setM} />
        <Slider id="nw-us" label={t('lsr.nw.us')} value={us} min={0} max={1} step={0.05} onChange={v => { setUs(v); if (uk > v) setUk(v); }} />
        <Slider id="nw-uk" label={t('lsr.nw.uk')} value={muK} min={0} max={1} step={0.05} onChange={v => setUk(Math.min(v, us))} />
      </div>
      <Readout items={[
        [t('lsr.nw.weight'), `${fmt(W, 3)} N`],
        [t('lsr.nw.fsmax'), `${fmt(fsMax, 3)} N`],
        [t('lsr.nw.friction'), `${fmt(friction, 3)} N`],
        ['a = (F − μₖN)/m', `${fmt(acc, 3)} m/s²`],
      ]} />
      <Legend items={[[C.accent, t('lsr.nw.legF')], [C.bad, t('lsr.nw.legf')], [C.teal, t('lsr.nw.legN')], [C.violet, t('lsr.nw.legW')]]} />
      <LabNote>{t('lsr.nw.note')}</LabNote>
    </div>
  );
}
