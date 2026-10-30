'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { LabNote, Readout, Slider } from '../Slider';

// Typical textbook densities in g/cm³ (real samples vary a little).
const OBJECTS: { id: string; rho: number; color: string }[] = [
  { id: 'cork', rho: 0.24, color: '#b9855a' }, { id: 'wood', rho: 0.6, color: '#c89b61' }, { id: 'wax', rho: 0.9, color: '#efe3b0' },
  { id: 'ice', rho: 0.92, color: '#cfe9f7' }, { id: 'pvc', rho: 1.38, color: '#9aa5b8' }, { id: 'glass', rho: 2.5, color: '#9fd3c7' },
  { id: 'aluminium', rho: 2.7, color: '#c3c9d1' }, { id: 'iron', rho: 7.87, color: '#5f646b' },
];
const LIQUIDS: { id: string; rho: number; color: string }[] = [
  { id: 'oil', rho: 0.91, color: 'rgb(234 179 8 / .45)' }, { id: 'water', rho: 1.0, color: 'rgb(56 189 248 / .4)' },
  { id: 'salt', rho: 1.03, color: 'rgb(45 212 191 / .4)' }, { id: 'honey', rho: 1.42, color: 'rgb(217 119 6 / .55)' },
];

/** Sink or float: an object floats when its density is less than the liquid's. */
export default function DensityLab() {
  const { t } = useT();
  const [obj, setObj] = useState('wood');
  const [liq, setLiq] = useState('water');
  const [vol, setVol] = useState(50); // cm³
  const O = OBJECTS.find(x => x.id === obj)!, Lq = LIQUIDS.find(x => x.id === liq)!;
  const mass = O.rho * vol;
  const floats = O.rho < Lq.rho;
  const frac = Math.min(1, O.rho / Lq.rho); // fraction of volume under the surface when floating
  const side = 26 + Math.cbrt(vol) * 9;      // block size in px grows with volume
  const surf = 80, bottom = 230, cx0 = 200;
  const top = floats ? surf - side * (1 - frac) : bottom - side;
  const verdict = floats ? t('ls2.density.floats', { pct: Math.round(frac * 100) }) : t('ls2.density.sinks');

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <svg viewBox="0 0 400 250" className="w-full" role="img"
          aria-label={t('ls2.density.aria', { obj: t(`ls2.density.o.${obj}`), liq: t(`ls2.density.l.${liq}`), ro: O.rho, rl: Lq.rho, verdict })}>
          <rect x="90" y={surf} width="220" height={bottom - surf + 6} fill={Lq.color} />
          <path d={`M90 30 V${bottom + 6} H310 V30`} fill="none" stroke="rgb(var(--ink))" strokeWidth="3" />
          <line x1="90" y1={surf} x2="310" y2={surf} stroke="rgb(var(--primary))" strokeWidth="1.5" strokeDasharray="5 4" />
          <rect x={cx0 - side / 2} y={top} width={side} height={side} rx="4" fill={O.color} stroke="rgb(var(--ink))" strokeWidth="1.5" style={{ transition: 'y .5s ease' }} />
          <text x="320" y={surf + 4} fontSize="11" fill="rgb(var(--muted))">{t('ls2.density.surface')}</text>
        </svg>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">{t('ls2.density.object')}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('ls2.density.object')}>
          {OBJECTS.map(x => <button key={x.id} role="radio" aria-checked={obj === x.id} onClick={() => setObj(x.id)}
            className={cx('min-h-10 rounded-full border px-3 text-sm font-semibold', obj === x.id ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-surface')}>{t(`ls2.density.o.${x.id}`)}</button>)}
        </div>
      </fieldset>
      <div className="seg w-fit flex-wrap" role="radiogroup" aria-label={t('ls2.density.liquid')}>
        {LIQUIDS.map(x => <button key={x.id} role="radio" aria-checked={liq === x.id} onClick={() => setLiq(x.id)}>{t(`ls2.density.l.${x.id}`)}</button>)}
      </div>
      <Slider id="dn-v" label={t('ls2.density.volume')} value={vol} min={10} max={200} step={10} unit=" cm³" onChange={setVol} />
      <Readout items={[
        [t('ls2.density.mass'), `${mass.toFixed(1)} g`], [t('ls2.density.rhoObj'), `${O.rho.toFixed(2)} g/cm³`],
        [t('ls2.density.rhoLiq'), `${Lq.rho.toFixed(2)} g/cm³`], [t('ls2.density.result'), verdict],
      ]} />
      <LabNote>{t('ls2.density.note')}</LabNote>
    </div>
  );
}
