'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '../../ui';
import { Ask, Big, useSay } from './kit';

const STAGES = ['evaporation', 'condensation', 'precipitation', 'collection'] as const;
type Stage = (typeof STAGES)[number];

/** The water cycle: the sun heats water, vapour rises, cools into clouds, falls as rain and collects again. */
export default function WaterCycleLab() {
  const { t } = useT();
  const say = useSay();
  const reduce = useReducedMotion();
  const [sel, setSel] = useState<Stage>('evaporation');
  const [heat, setHeat] = useState(2); // 1 low, 2 medium, 3 high
  const pick = (s: Stage) => { setSel(s); say(`${t(`lp.wc.${s}`)}. ${t(`lp.wc.${s}.say`)}`); };
  const on = (s: Stage) => sel === s;
  const vapour = heat * 3;

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.wc.ask')} />
      <svg viewBox="0 0 360 230" className="w-full rounded-card" role="img" aria-label={t('lp.wc.aria', { stage: t(`lp.wc.${sel}`) })}>
        <rect width="360" height="230" fill="rgb(var(--primary) / .08)" />
        {/* sun */}
        <motion.circle cx="44" cy="40" r={14 + heat * 4} fill="rgb(var(--accent))" animate={reduce ? {} : { scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2.4 }} />
        {/* mountain and sea */}
        <path d="M200 190 L270 90 L340 190Z" fill="rgb(var(--good) / .55)" />
        <path d="M0 180 Q90 170 200 186 L200 230 L0 230Z" fill="rgb(var(--primary) / .55)" stroke={on('collection') ? 'rgb(var(--accent))' : 'none'} strokeWidth="4" />
        <path d="M250 190 Q275 205 340 200 L360 230 L230 230Z" fill="rgb(var(--primary) / .4)" />
        {/* evaporation: vapour rising */}
        {Array.from({ length: vapour }, (_, i) => (
          <motion.circle key={`v${i}-${heat}`} cx={40 + i * (140 / vapour)} r="3" fill="rgb(var(--teal))" opacity={on('evaporation') ? 0.95 : 0.45}
            initial={{ cy: 178 }} animate={reduce ? { cy: 120 } : { cy: [178, 80], opacity: [0.9, 0] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.25 }} />
        ))}
        {/* condensation: cloud */}
        <g stroke={on('condensation') ? 'rgb(var(--accent))' : 'none'} strokeWidth="3">
          <ellipse cx="190" cy="52" rx="54" ry="22" fill="rgb(var(--surface-3))" /><ellipse cx="160" cy="44" rx="28" ry="20" fill="rgb(var(--surface-3))" /><ellipse cx="220" cy="42" rx="26" ry="18" fill="rgb(var(--surface-3))" />
        </g>
        {/* precipitation: rain over the mountain */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.line key={`r${i}`} x1={168 + i * 10} x2={164 + i * 10} stroke="rgb(var(--primary))" strokeWidth="2.5" strokeLinecap="round" opacity={on('precipitation') ? 1 : 0.5}
            initial={{ y1: 78, y2: 88 }} animate={reduce ? {} : { y1: [78, 150], y2: [88, 160] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.12 }} />
        ))}
        {/* arrows */}
        <path d="M120 150 Q125 100 150 70" fill="none" stroke="rgb(var(--ink) / .5)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#wa)" />
        <path d="M250 70 Q300 100 300 150" fill="none" stroke="rgb(var(--ink) / .5)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#wa)" />
        <path d="M280 205 Q240 215 205 200" fill="none" stroke="rgb(var(--ink) / .5)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#wa)" />
        <defs><marker id="wa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="rgb(var(--ink) / .6)" /></marker></defs>
      </svg>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t('lp.wc.stages')}>
        {STAGES.map((s, i) => (
          <button key={s} onClick={() => pick(s)} aria-pressed={on(s)}
            className={cx('grid min-h-16 content-center gap-0.5 rounded-2xl border-2 px-3 py-2 text-left transition', on(s) ? 'border-primary bg-primary/10' : 'border-line bg-surface hover:border-primary/40')}>
            <span className="text-xs font-semibold text-muted">{i + 1}</span><b className="text-base leading-tight">{t(`lp.wc.${s}`)}</b>
          </button>
        ))}
      </div>
      <p className="rounded-card bg-surface2 p-4 text-lg" aria-live="polite"><b>{t(`lp.wc.${sel}`)}:</b> {t(`lp.wc.${sel}.say`)}</p>
      <div className="flex flex-wrap items-center gap-2">
        <b>{t('lp.wc.heat')}</b>
        {[1, 2, 3].map(hh => <Big key={hh} active={heat === hh} onClick={() => setHeat(hh)}>{t(`lp.wc.heat${hh}`)}</Big>)}
      </div>
      <p className="text-sm text-muted">{t('lp.wc.note')}</p>
    </div>
  );
}
