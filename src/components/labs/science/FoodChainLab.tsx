'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { LabNote, Readout, Slider } from '../Slider';

const CHAIN = ['grass', 'grasshopper', 'frog', 'snake', 'eagle'] as const;
const TONES = ['#4caf50', '#8bc34a', '#2a9d8f', '#c97b4a', '#6d4c41'];

/** A food chain and its energy pyramid: only about 10% of energy passes to the next level. */
export default function FoodChainLab() {
  const { t, locale } = useT();
  const [levels, setLevels] = useState(5);
  const [E0, setE0] = useState(10000); // J of energy stored by the producers
  const [removed, setRemoved] = useState<number | null>(null);
  const chain = CHAIN.slice(0, levels);
  const energy = chain.map((_, i) => E0 * Math.pow(0.1, i));
  const fmt = (n: number) => n >= 1 ? n.toLocaleString(locale, { maximumFractionDigits: 0 }) : n.toLocaleString(locale, { maximumSignificantDigits: 2 });
  const maxW = 280;
  const width = (i: number) => Math.max(28, maxW * Math.pow(0.55, i)); // shrinking bars (not to scale: true widths would be 10× smaller each level)
  const toggle = (i: number) => setRemoved(r => (r === i ? null : i));

  return (
    <div className="grid gap-4">
      <ol className="flex flex-wrap items-center gap-2" aria-label={t('ls2.food.chain')}>
        {chain.map((id, i) => (
          <li key={id} className="flex items-center gap-2">
            <button onClick={() => toggle(i)} aria-pressed={removed === i}
              className={cx('min-h-11 rounded-ctl border-2 px-3 py-1.5 text-left text-sm font-semibold transition', removed === i ? 'border-bad bg-bad/10 line-through opacity-70' : 'border-line bg-surface hover:border-primary')}>
              <span className="mr-1.5 inline-block h-3 w-3 rounded-full align-middle" style={{ background: TONES[i] }} aria-hidden />{t(`ls2.food.o.${id}`)}
              <span className="block text-xs font-normal text-muted">{t(`ls2.food.r${i}`)}</span>
            </button>
            {i < chain.length - 1 && <span aria-hidden className="text-muted">→</span>}
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted">{t('ls2.food.tapHint')}</p>

      <svg viewBox="0 0 320 210" className="w-full max-w-xl justify-self-center" role="img"
        aria-label={t('ls2.food.aria', { n: levels, top: fmt(energy[levels - 1]), base: fmt(E0) })}>
        {chain.map((id, i) => {
          const w = width(i), y = 200 - (i + 1) * 38;
          return (
            <g key={id} opacity={removed === i ? 0.3 : 1}>
              <rect x={160 - w / 2} y={y} width={w} height="34" rx="4" fill={TONES[i]} />
              <text x="160" y={y + 21} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{fmt(energy[i])} J</text>
            </g>
          );
        })}
      </svg>

      <div className="seg w-fit" role="radiogroup" aria-label={t('ls2.food.levels')}>
        {[2, 3, 4, 5].map(n => <button key={n} role="radio" aria-checked={levels === n} onClick={() => { setLevels(n); setRemoved(null); }}>{t('ls2.food.levelsN', { n })}</button>)}
      </div>
      <Slider id="fc-e" label={t('ls2.food.energy')} value={E0} min={1000} max={100000} step={1000} unit=" J" onChange={setE0} />
      <Readout items={[
        [t('ls2.food.producer'), `${fmt(E0)} J`], [t('ls2.food.top'), `${fmt(energy[levels - 1])} J`],
        [t('ls2.food.share'), `${(Math.pow(0.1, levels - 1) * 100).toLocaleString(locale, { maximumSignificantDigits: 2 })}%`], [t('ls2.food.levels'), String(levels)],
      ]} />
      {removed !== null && (
        <p className="rounded-ctl border border-accent/40 bg-accent/10 p-3 text-sm" aria-live="polite">
          {removed === 0 ? t('ls2.food.noProducer')
            : removed === levels - 1 ? t('ls2.food.noTop', { below: t(`ls2.food.o.${chain[removed - 1]}`) })
            : t('ls2.food.effect', { below: t(`ls2.food.o.${chain[removed - 1]}`), above: t(`ls2.food.o.${chain[removed + 1]}`) })}
        </p>
      )}
      <LabNote>{t('ls2.food.note')}</LabNote>
    </div>
  );
}
