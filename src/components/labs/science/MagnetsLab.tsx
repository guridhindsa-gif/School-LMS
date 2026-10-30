'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { LabNote, Legend, Readout, Slider } from '../Slider';

type Pole = 'N' | 'S';
const MATERIALS: { id: string; magnetic: boolean }[] = [
  { id: 'iron', magnetic: true }, { id: 'steel', magnetic: true }, { id: 'nickel', magnetic: true }, { id: 'cobalt', magnetic: true },
  { id: 'copper', magnetic: false }, { id: 'aluminium', magnetic: false }, { id: 'plastic', magnetic: false }, { id: 'wood', magnetic: false }, { id: 'rubber', magnetic: false }, { id: 'glass', magnetic: false },
];

/** Two bar magnets: like poles repel, unlike poles attract; force weakens quickly with distance. */
export default function MagnetsLab() {
  const { t } = useT();
  const [flipA, setFlipA] = useState(false);
  const [flipB, setFlipB] = useState(false);
  const [gap, setGap] = useState(6); // cm between facing ends
  const [mat, setMat] = useState('iron');
  // Magnet A: left end S, right end N (unless flipped). Magnet B: left end S (unless flipped).
  const aRight: Pole = flipA ? 'S' : 'N', aLeft: Pole = flipA ? 'N' : 'S';
  const bLeft: Pole = flipB ? 'N' : 'S', bRight: Pole = flipB ? 'S' : 'N';
  const attract = aRight !== bLeft;
  // Relative force between pole ends falls roughly as 1/d²; normalised to 1 at 2 cm.
  const rel = Math.min(1, 4 / (gap * gap));
  const level = rel > 0.25 ? 'strong' : rel > 0.06 ? 'medium' : 'weak';
  const px = 14; // px per cm
  const ax2 = 190, bx1 = ax2 + gap * px; // facing ends
  const cy = 90;
  const arrow = 10 + rel * 40;
  const m = MATERIALS.find(x => x.id === mat)!;
  const poleFill = (p: Pole) => (p === 'N' ? 'rgb(var(--bad))' : 'rgb(var(--primary))');
  const bar = (x: number, left: Pole, right: Pole) => (
    <g>
      <rect x={x} y={cy - 18} width="60" height="36" rx="4" fill={poleFill(left)} />
      <rect x={x + 60} y={cy - 18} width="60" height="36" rx="4" fill={poleFill(right)} />
      <text x={x + 30} y={cy + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">{left}</text>
      <text x={x + 90} y={cy + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">{right}</text>
    </g>
  );
  // simple field lines between the facing poles
  const lines = [-14, -6, 6, 14].map((o, i) => attract
    ? <path key={i} d={`M${ax2} ${cy + o} C ${ax2 + 20} ${cy + o * 1.6}, ${bx1 - 20} ${cy + o * 1.6}, ${bx1} ${cy + o}`} />
    : <path key={i} d={`M${ax2} ${cy + o} Q ${(ax2 + bx1) / 2 - 8} ${cy + o * 4 + Math.sign(o) * 10}, ${ax2 + 10} ${cy + o * 5 + Math.sign(o) * 30}`} />);
  const linesB = !attract ? [-14, -6, 6, 14].map((o, i) => <path key={`b${i}`} d={`M${bx1} ${cy + o} Q ${(ax2 + bx1) / 2 + 8} ${cy + o * 4 + Math.sign(o) * 10}, ${bx1 - 10} ${cy + o * 5 + Math.sign(o) * 30}`} />) : null;
  const result = attract ? t('ls2.magnets.attract') : t('ls2.magnets.repel');

  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <svg viewBox="0 0 560 180" className="w-full min-w-[320px]" role="img"
          aria-label={t('ls2.magnets.aria', { a: aRight, b: bLeft, gap, result })}>
          <g stroke="rgb(var(--muted))" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity=".7">{lines}{linesB}</g>
          {bar(ax2 - 120, aLeft, aRight)}
          {bar(bx1, bLeft, bRight)}
          {/* force arrows on magnet B */}
          <g stroke="rgb(var(--accent))" strokeWidth="4" strokeLinecap="round" fill="rgb(var(--accent))">
            {attract
              ? <><line x1={bx1 + 60} y1={cy - 30} x2={bx1 + 60 - arrow} y2={cy - 30} /><path d={`M${bx1 + 60 - arrow - 8} ${cy - 30} l10 -6 v12 z`} /></>
              : <><line x1={bx1 + 60} y1={cy - 30} x2={bx1 + 60 + arrow} y2={cy - 30} /><path d={`M${bx1 + 60 + arrow + 8} ${cy - 30} l-10 -6 v12 z`} /></>}
          </g>
          <text x="280" y="168" textAnchor="middle" fontSize="15" fontWeight="700" fill="rgb(var(--ink))">{result}</text>
        </svg>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost text-sm" onClick={() => setFlipA(f => !f)} aria-pressed={flipA}>{t('ls2.magnets.flipA')}</button>
        <button className="btn-ghost text-sm" onClick={() => setFlipB(f => !f)} aria-pressed={flipB}>{t('ls2.magnets.flipB')}</button>
      </div>
      <Slider id="mg-gap" label={t('ls2.magnets.gap')} value={gap} min={2} max={20} unit=" cm" onChange={setGap} />
      <Readout items={[[t('ls2.magnets.facing'), `${aRight} – ${bLeft}`], [t('ls2.magnets.result'), result], [t('ls2.magnets.force'), t(`ls2.magnets.${level}`)], [t('ls2.magnets.gap'), `${gap} cm`]]} />
      <Legend items={[['rgb(var(--bad))', t('ls2.magnets.north')], ['rgb(var(--primary))', t('ls2.magnets.south')], ['rgb(var(--accent))', t('ls2.magnets.forceArrow')]]} />

      <section className="grid gap-3 rounded-card border border-line bg-surface2/40 p-4" aria-labelledby="mg-test">
        <h3 id="mg-test" className="text-base font-bold">{t('ls2.magnets.testTitle')}</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('ls2.magnets.testTitle')}>
          {MATERIALS.map(x => (
            <button key={x.id} role="radio" aria-checked={mat === x.id} onClick={() => setMat(x.id)}
              className={cx('min-h-10 rounded-full border px-3 text-sm font-semibold', mat === x.id ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-surface')}>
              {t(`ls2.magnets.m.${x.id}`)}
            </button>
          ))}
        </div>
        <p className={cx('rounded-ctl px-3 py-2 text-sm font-semibold', m.magnetic ? 'bg-good/10 text-good' : 'bg-surface text-muted')} aria-live="polite">
          {m.magnetic ? t('ls2.magnets.isMagnetic', { m: t(`ls2.magnets.m.${mat}`) }) : t('ls2.magnets.notMagnetic', { m: t(`ls2.magnets.m.${mat}`) })}
        </p>
      </section>
      <LabNote>{t('ls2.magnets.note')}</LabNote>
    </div>
  );
}
