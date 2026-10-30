'use client';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Ask, Big, Feedback, Stars, rnd } from './kit';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** English number name for 0–999. */
export function words(n: number): string {
  if (n === 0) return 'zero';
  const h = Math.floor(n / 100), r = n % 100;
  const rest = r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? '-' + ONES[r % 10] : '');
  return [h ? `${ONES[h]} hundred` : '', rest].filter(Boolean).join(' and ');
}

/** Build a number from hundreds, tens and ones blocks; regroup ten ones into a ten. */
export default function PlaceValueLab() {
  const { t, lang } = useT();
  const [h, setH] = useState(1), [te, setTe] = useState(2), [o, setO] = useState(4);
  const [target, setTarget] = useState(() => rnd(21, 349));
  const [stars, setStars] = useState(0);
  const n = 100 * h + 10 * te + o;
  const done = n === target;
  const name = lang === 'en' ? words(n) : t('lp.pv.expanded', { h, t: te, o });
  const step = (set: (f: (v: number) => number) => void, d: number, max: number) => set(v => Math.max(0, Math.min(max, v + d)));
  const next = () => { if (done) setStars(s => Math.min(3, s + 1)); setTarget(rnd(21, 349)); };

  const cols = [
    { k: 'h', label: t('lp.pv.hundreds'), v: h, set: setH, max: 9, color: 'rgb(var(--primary))' },
    { k: 't', label: t('lp.pv.tens'), v: te, set: setTe, max: 19, color: 'rgb(var(--teal))' },
    { k: 'o', label: t('lp.pv.ones'), v: o, set: setO, max: 19, color: 'rgb(var(--accent))' },
  ];
  return (
    <div className="grid gap-5">
      <Ask text={t('lp.pv.ask', { n: target })}><Stars n={stars} label={t('lp.kit.stars', { n: stars })} /></Ask>
      <div className="grid gap-3 sm:grid-cols-3">
        {cols.map(c => (
          <section key={c.k} className="grid content-start gap-3 rounded-card border border-line bg-surface p-3" aria-label={`${c.label}: ${c.v}`}>
            <div className="flex items-center justify-between gap-2">
              <b className="text-lg">{c.label}</b>
              <span className="font-display text-3xl font-extrabold tabular-nums" style={{ color: c.color }}>{c.v}</span>
            </div>
            <svg viewBox="0 0 120 120" className="h-32 w-full" role="img" aria-label={t('lp.pv.blocks', { n: c.v, kind: c.label })}>
              {c.k === 'h' && Array.from({ length: c.v }, (_, i) => (
                <g key={i} transform={`translate(${4 + (i % 3) * 38} ${4 + Math.floor(i / 3) * 38})`}>
                  <rect width="34" height="34" rx="2" fill={c.color} opacity=".9" />
                  {[1, 2, 3, 4].map(j => <g key={j}><line x1={j * 6.8} y1="0" x2={j * 6.8} y2="34" stroke="#fff" strokeOpacity=".4" /><line y1={j * 6.8} x1="0" y2={j * 6.8} x2="34" stroke="#fff" strokeOpacity=".4" /></g>)}
                </g>))}
              {c.k === 't' && Array.from({ length: c.v }, (_, i) => <rect key={i} x={4 + (i % 10) * 11.6} y={4 + Math.floor(i / 10) * 58} width="8" height="54" rx="2" fill={c.color} />)}
              {c.k === 'o' && Array.from({ length: c.v }, (_, i) => <rect key={i} x={6 + (i % 5) * 22} y={6 + Math.floor(i / 5) * 22} width="17" height="17" rx="3" fill={c.color} />)}
            </svg>
            <div className="flex justify-between gap-2">
              <Big label={t('lp.pv.less', { kind: c.label })} onClick={() => step(c.set, -1, c.max)} disabled={c.v === 0}><Minus aria-hidden /></Big>
              <Big label={t('lp.pv.more', { kind: c.label })} onClick={() => step(c.set, 1, c.max)} disabled={c.v === c.max}><Plus aria-hidden /></Big>
            </div>
            {c.k !== 'h' && c.v >= 10 && (
              <Big tone="primary" onClick={() => { c.set(v => v - 10); (c.k === 'o' ? setTe : setH)(v => Math.min(c.k === 'o' ? 19 : 9, v + 1)); }}>
                {c.k === 'o' ? t('lp.pv.makeTen') : t('lp.pv.makeHundred')}
              </Big>
            )}
          </section>
        ))}
      </div>
      <div className="grid gap-1 rounded-card bg-night p-4 text-onnight" aria-live="polite">
        <p className="font-mono text-sm text-onnight/75">{h} × 100 + {te} × 10 + {o} × 1 =</p>
        <p className="font-display text-5xl font-extrabold tabular-nums">{n}</p>
        <p className="text-lg text-onnight/85">{name}</p>
      </div>
      <Feedback ok={done ? true : null} text={t('lp.pv.yes', { n })} />
      <div className="flex flex-wrap gap-2">
        <Big tone="primary" onClick={next}><RefreshCw size={18} aria-hidden /> {t('lp.kit.new')}</Big>
      </div>
      <p className="text-sm text-muted">{t('lp.pv.note')}</p>
    </div>
  );
}
