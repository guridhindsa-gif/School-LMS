'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Readout, Slider } from '../Slider';
import { fmt } from './ui';

const BLUE = [37, 99, 235], YELLOW = [250, 204, 21];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const mix = (b: number, y: number) => {
  const tot = b + y || 1;
  return `rgb(${BLUE.map((c, i) => Math.round((c * b + YELLOW[i] * y) / tot)).join(',')})`;
};

/** Paint mixer: the colour depends only on the ratio blue : yellow, so equivalent ratios look identical. */
export default function RatioLab() {
  const { t } = useT();
  const [b, setB] = useState(2), [y, setY] = useState(3);
  const [litres, setLitres] = useState(10);
  const g = gcd(b, y) || 1;
  const sb = b / g, sy = y / g, total = b + y;
  const col = b + y ? mix(b, y) : 'rgb(var(--surface-2))';
  const tin = (k: number) => (
    <figure key={k} className="grid justify-items-center gap-1">
      <svg viewBox="0 0 60 70" className="w-16" aria-hidden><path d="M8 14h44v46a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill={col} stroke="rgb(var(--ink))" strokeOpacity=".3" /><ellipse cx="30" cy="14" rx="22" ry="5" fill={col} stroke="rgb(var(--ink))" strokeOpacity=".3" /></svg>
      <figcaption className="font-mono text-xs font-semibold">{sb * k} : {sy * k}</figcaption>
    </figure>
  );

  return (
    <div className="grid gap-5">
      <div className="grid items-center gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="grid justify-items-center gap-2">
          <div className="h-32 w-32 rounded-full border-4 border-line shadow-soft" style={{ background: col }} role="img" aria-label={t('lm.ratio.aria', { b, y })} />
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: b }, (_, i) => <i key={`b${i}`} className="h-4 w-4 rounded-sm" style={{ background: `rgb(${BLUE})` }} />)}
            {Array.from({ length: y }, (_, i) => <i key={`y${i}`} className="h-4 w-4 rounded-sm" style={{ background: `rgb(${YELLOW})` }} />)}
          </div>
        </div>
        <div className="grid gap-3">
          <Slider id="r-b" label={t('lm.ratio.blue')} value={b} min={0} max={12} onChange={setB} />
          <Slider id="r-y" label={t('lm.ratio.yellow')} value={y} min={0} max={12} onChange={setY} />
          <Slider id="r-l" label={t('lm.ratio.batch')} value={litres} min={1} max={30} unit=" L" onChange={setLitres} />
        </div>
      </div>
      <Readout items={[
        [t('lm.ratio.ratio'), `${b} : ${y}`],
        [t('lm.ratio.simplest'), b + y ? `${sb} : ${sy}` : '—'],
        [t('lm.ratio.blueIn', { l: litres }), total ? `${fmt((litres * b) / total)} L` : '—'],
        [t('lm.ratio.yellowIn', { l: litres }), total ? `${fmt((litres * y) / total)} L` : '—'],
      ]} />
      {b + y > 0 && (
        <section aria-labelledby="ratio-eq" className="grid gap-2">
          <h3 id="ratio-eq" className="text-sm font-semibold">{t('lm.ratio.equivalent')}</h3>
          <div className="flex flex-wrap gap-4">{[1, 2, 3, 4].map(tin)}</div>
        </section>
      )}
      <LabNote>{t('lm.ratio.note')}</LabNote>
    </div>
  );
}
