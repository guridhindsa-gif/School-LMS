'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { LabNote, Readout } from '../Slider';

// Approximate pH of common substances (textbook values; real samples vary).
const SUBSTANCES: { id: string; ph: number }[] = [
  { id: 'lemon', ph: 2.2 }, { id: 'vinegar', ph: 2.9 }, { id: 'orange', ph: 3.5 }, { id: 'tomato', ph: 4.3 },
  { id: 'milk', ph: 6.5 }, { id: 'water', ph: 7.0 }, { id: 'blood', ph: 7.4 }, { id: 'soda', ph: 8.3 },
  { id: 'toothpaste', ph: 9.0 }, { id: 'soap', ph: 10.0 }, { id: 'magnesia', ph: 10.5 }, { id: 'lime', ph: 12.4 },
];
type Ind = 'universal' | 'litmus' | 'phenol' | 'methyl' | 'turmeric';

/** Universal indicator colours by pH (standard school chart). */
function universal(ph: number) {
  const c = ['#d7263d', '#e8412c', '#f26b1d', '#f7931e', '#fbb829', '#f6d32d', '#c5d931', '#4caf50', '#2a9d8f', '#227c9d', '#1d5fa8', '#3a3f9e', '#4b2c91', '#5b2378', '#4a1d5f'];
  return c[Math.max(0, Math.min(14, Math.round(ph)))];
}
/** Colour of the test solution with an indicator, and the key that describes it. */
function indicator(ind: Ind, ph: number): [string, string] {
  switch (ind) {
    case 'universal': return [universal(ph), 'univ'];
    // litmus changes over roughly pH 4.5–8.3: near neutral it stays purple
    case 'litmus': return ph < 5 ? ['#d7263d', 'litRed'] : ph > 8 ? ['#2b59c3', 'litBlue'] : ['#8a6fb0', 'litNone'];
    case 'phenol': return ph >= 8.2 ? ['#e0368a', 'phPink'] : ['#f2f4f8', 'phColourless'];
    case 'methyl': return ph < 3.1 ? ['#d7263d', 'moRed'] : ph <= 4.4 ? ['#f2771d', 'moOrange'] : ['#f6d32d', 'moYellow'];
    case 'turmeric': return ph > 8 ? ['#8b2e16', 'tuRed'] : ['#f2b705', 'tuYellow'];
  }
}

export default function PhLab() {
  const { t } = useT();
  const [sub, setSub] = useState('vinegar');
  const [ind, setInd] = useState<Ind>('universal');
  const S = SUBSTANCES.find(x => x.id === sub)!;
  const [col, key] = indicator(ind, S.ph);
  const nature = S.ph < 3 ? 'strongAcid' : S.ph < 7 ? 'weakAcid' : S.ph === 7 ? 'neutral' : S.ph <= 11 ? 'weakBase' : 'strongBase';
  const h = Math.pow(10, -S.ph);

  return (
    <div className="grid gap-4">
      <div className="grid items-center gap-5 rounded-card border border-line bg-surface p-4 sm:grid-cols-[auto_1fr]">
        <svg viewBox="0 0 80 170" className="mx-auto h-44" role="img" aria-label={t('ls2.ph.aria', { s: t(`ls2.ph.s.${sub}`), ph: S.ph, ind: t(`ls2.ph.i.${ind}`), col: t(`ls2.ph.c.${key}`) })}>
          <path d="M18 10 V140 a22 22 0 0 0 44 0 V10" fill="rgb(var(--surface-2))" stroke="rgb(var(--ink))" strokeWidth="3" />
          <path d="M20 60 V140 a20 20 0 0 0 40 0 V60 Z" fill={col} style={{ transition: 'fill .4s' }} />
          <line x1="12" y1="10" x2="68" y2="10" stroke="rgb(var(--ink))" strokeWidth="3" />
        </svg>
        <div className="grid gap-3">
          {/* pH scale */}
          <div>
            <div className="relative h-8 overflow-hidden rounded-full" aria-hidden style={{ background: `linear-gradient(to right, ${Array.from({ length: 15 }, (_, i) => universal(i)).join(',')})` }}>
              <span className="absolute top-0 h-8 w-1.5 -translate-x-1/2 rounded bg-white shadow ring-2 ring-ink" style={{ left: `${(S.ph / 14) * 100}%`, transition: 'left .4s' }} />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[11px] text-muted" aria-hidden>{[0, 2, 4, 6, 7, 8, 10, 12, 14].map(n => <span key={n}>{n}</span>)}</div>
            <div className="flex justify-between text-xs font-semibold"><span className="text-bad">{t('ls2.ph.acidic')}</span><span className="text-good">{t('ls2.ph.neutral')}</span><span className="text-primary">{t('ls2.ph.basic')}</span></div>
          </div>
          <p className="text-sm font-semibold" aria-live="polite">{t(`ls2.ph.c.${key}`)}</p>
        </div>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">{t('ls2.ph.substance')}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('ls2.ph.substance')}>
          {SUBSTANCES.map(x => <button key={x.id} role="radio" aria-checked={sub === x.id} onClick={() => setSub(x.id)}
            className={cx('min-h-10 rounded-full border px-3 text-sm font-semibold', sub === x.id ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-surface')}>{t(`ls2.ph.s.${x.id}`)}</button>)}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">{t('ls2.ph.indicator')}</legend>
        <div className="seg w-fit flex-wrap" role="radiogroup" aria-label={t('ls2.ph.indicator')}>
          {(['universal', 'litmus', 'phenol', 'methyl', 'turmeric'] as const).map(i => <button key={i} role="radio" aria-checked={ind === i} onClick={() => setInd(i)}>{t(`ls2.ph.i.${i}`)}</button>)}
        </div>
      </fieldset>
      <Readout items={[[t('ls2.ph.ph'), `≈ ${S.ph.toFixed(1)}`], [t('ls2.ph.nature'), t(`ls2.ph.n.${nature}`)], ['[H⁺]', `≈ ${h.toExponential(1)} mol/L`], [t('ls2.ph.indicator'), t(`ls2.ph.i.${ind}`)]]} />
      <LabNote>{t('ls2.ph.note')}</LabNote>
    </div>
  );
}
