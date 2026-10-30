'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { LabNote, Readout, Slider } from '../Slider';

/** A light beam on a pivot: balanced when clockwise and anticlockwise moments (F × d) are equal. */
export default function LeverLab() {
  const { t } = useT();
  const [f, setF] = useState(0);       // fulcrum position on the beam, m (beam runs −5 … +5)
  const [w1, setW1] = useState(40);    // left weight, N
  const [p1, setP1] = useState(-3);    // left weight position, m
  const [w2, setW2] = useState(60);    // right weight, N
  const [p2, setP2] = useState(2);     // right weight position, m
  const [cls, setCls] = useState<1 | 2 | 3>(1);
  const P1 = Math.min(p1, f - 0.5), P2 = Math.max(p2, f + 0.5);
  const d1 = f - P1, d2 = P2 - f;
  const acw = w1 * d1, cw = w2 * d2, net = cw - acw;
  const balanced = Math.abs(net) < 0.01;
  const ang = balanced ? 0 : Math.max(-12, Math.min(12, net / 15)); // degrees, visual only
  const s = 34, cx0 = 230, by = 120; // px per metre
  const X = (m: number) => cx0 + m * s;
  const state = balanced ? t('ls2.lever.balanced') : net > 0 ? t('ls2.lever.tipsRight') : t('ls2.lever.tipsLeft');
  const block = (m: number, w: number, c: string) => {
    const sz = 14 + w / 5;
    return <g><rect x={X(m) - sz / 2} y={by - 6 - sz} width={sz} height={sz} rx="3" fill={c} /><text x={X(m)} y={by - 10 - sz} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--ink))">{w} N</text></g>;
  };

  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <svg viewBox="0 0 460 200" className="w-full min-w-[320px]" role="img" aria-label={t('ls2.lever.aria', { acw: acw.toFixed(0), cw: cw.toFixed(0), state })}>
          <g transform={`rotate(${ang} ${X(f)} ${by})`} style={{ transition: 'transform .5s ease' }}>
            <rect x={X(-5)} y={by - 6} width={10 * s} height="10" rx="3" fill="rgb(var(--night-2))" />
            {Array.from({ length: 11 }, (_, i) => <line key={i} x1={X(i - 5)} x2={X(i - 5)} y1={by - 6} y2={by + 4} stroke="rgb(var(--on-night))" strokeOpacity=".4" />)}
            {block(P1, w1, 'rgb(var(--primary))')}
            {block(P2, w2, 'rgb(var(--teal))')}
          </g>
          <path d={`M${X(f)} ${by + 4} l-16 34 h32 z`} fill="rgb(var(--accent))" />
          <text x={X(f)} y={by + 54} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">{t('ls2.lever.fulcrum')}</text>
          <text x="230" y="186" textAnchor="middle" fontSize="14" fontWeight="700" fill="rgb(var(--ink))">{state}</text>
        </svg>
      </div>
      <Slider id="lv-f" label={t('ls2.lever.fulcrumPos')} value={f} min={-3} max={3} step={0.5} unit=" m" onChange={setF} />
      <Slider id="lv-w1" label={t('ls2.lever.leftW')} value={w1} min={10} max={100} step={5} unit=" N" onChange={setW1} />
      <Slider id="lv-p1" label={t('ls2.lever.leftPos')} value={P1} min={-5} max={f - 0.5} step={0.5} unit=" m" onChange={setP1} />
      <Slider id="lv-w2" label={t('ls2.lever.rightW')} value={w2} min={10} max={100} step={5} unit=" N" onChange={setW2} />
      <Slider id="lv-p2" label={t('ls2.lever.rightPos')} value={P2} min={f + 0.5} max={5} step={0.5} unit=" m" onChange={setP2} />
      <Readout items={[
        [t('ls2.lever.acw'), `${w1} × ${d1.toFixed(1)} = ${acw.toFixed(0)} N·m`], [t('ls2.lever.cw'), `${w2} × ${d2.toFixed(1)} = ${cw.toFixed(0)} N·m`],
        [t('ls2.lever.net'), `${Math.abs(net).toFixed(0)} N·m`], [t('ls2.lever.result'), state],
      ]} />
      <section className="grid gap-3 rounded-card border border-line bg-surface2/40 p-4" aria-labelledby="lv-cls">
        <h3 id="lv-cls" className="text-base font-bold">{t('ls2.lever.classes')}</h3>
        <div className="seg w-fit" role="radiogroup" aria-label={t('ls2.lever.classes')}>
          {([1, 2, 3] as const).map(c => <button key={c} role="radio" aria-checked={cls === c} onClick={() => setCls(c)}>{t('ls2.lever.classN', { n: c })}</button>)}
        </div>
        <div className="grid items-center gap-3 sm:grid-cols-[200px_1fr]">
          <svg viewBox="0 0 200 70" className="w-full" role="img" aria-label={t(`ls2.lever.c${cls}`)}>
            <rect x="10" y="30" width="180" height="6" rx="3" fill="rgb(var(--ink))" opacity=".7" />
            {(() => {
              const pos = cls === 1 ? { F: 100, L: 30, E: 170 } : cls === 2 ? { F: 20, L: 100, E: 180 } : { F: 20, L: 180, E: 100 };
              return <>
                <path d={`M${pos.F} 36 l-10 20 h20 z`} fill="rgb(var(--accent))" />
                <rect x={pos.L - 10} y="12" width="20" height="18" rx="3" fill="rgb(var(--teal))" />
                <path d={`M${pos.E} 2 v24`} stroke="rgb(var(--primary))" strokeWidth="4" /><path d={`M${pos.E - 6} 20 l6 8 l6 -8 z`} fill="rgb(var(--primary))" />
                <text x={pos.F} y="68" fontSize="10" textAnchor="middle" fill="rgb(var(--muted))">F</text>
                <text x={pos.L} y="10" fontSize="10" textAnchor="middle" fill="rgb(var(--muted))">L</text>
                <text x={pos.E + 9} y="12" fontSize="10" fill="rgb(var(--muted))">E</text>
              </>;
            })()}
          </svg>
          <p className={cx('text-sm')} aria-live="polite">{t(`ls2.lever.c${cls}`)}</p>
        </div>
      </section>
      <LabNote>{t('ls2.lever.note')}</LabNote>
    </div>
  );
}
