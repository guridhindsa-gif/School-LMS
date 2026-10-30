'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Droplets, RefreshCw, Sun, Wind } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '../../ui';
import { Ask, Big, Feedback } from './kit';

/** A seedling grows only when it gets water, sunlight and air. Missing one shows what goes wrong. */
export default function PlantNeedsLab() {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [water, setWater] = useState(true), [sun, setSun] = useState(false), [air, setAir] = useState(true);
  const [day, setDay] = useState(0);
  const [growth, setGrowth] = useState(0); // 0..4
  const all = water && sun && air;
  const missing = !water ? 'water' : !sun ? 'sun' : !air ? 'air' : null;
  const nextDay = () => { setDay(d => d + 1); setGrowth(g => (all ? Math.min(4, g + 1) : g)); };
  const reset = () => { setDay(0); setGrowth(0); };
  const h = 20 + growth * 26;
  const leaf = all || growth === 0 ? 'rgb(var(--good))' : !sun ? '#d9d27a' : '#a3a06a';
  const droop = !water && growth > 0 ? 18 : 0;
  const toggles = [
    { id: 'water', on: water, set: setWater, icon: Droplets },
    { id: 'sun', on: sun, set: setSun, icon: Sun },
    { id: 'air', on: air, set: setAir, icon: Wind },
  ];

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.pn.ask')} />
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 240 220" className="mx-auto w-full max-w-sm" role="img" aria-label={t('lp.pn.aria', { day, stage: t(`lp.pn.stage${growth}`) })}>
          <rect width="240" height="220" rx="16" fill={sun ? 'rgb(var(--accent) / .15)' : 'rgb(var(--night) / .35)'} />
          {sun && <motion.circle cx="200" cy="40" r="22" fill="rgb(var(--accent))" animate={reduce ? {} : { scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }} />}
          {air && [0, 1, 2].map(i => <motion.path key={i} d={`M${20 + i * 18} ${50 + i * 22} q14 -8 28 0 t28 0`} stroke="rgb(var(--teal))" strokeWidth="3" fill="none" strokeLinecap="round" animate={reduce ? {} : { x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }} />)}
          {water && [0, 1, 2, 3].map(i => <motion.path key={i} d="M0 0 q-5 8 0 12 q5 -4 0 -12Z" fill="rgb(var(--primary))" transform={`translate(${100 + i * 14} 120)`} animate={reduce ? {} : { y: [0, 30], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }} />)}
          <path d="M60 170 h120 l-10 44 h-100Z" fill="#a8693a" />
          <ellipse cx="120" cy="170" rx="62" ry="8" fill="#6b3f1f" />
          <motion.g animate={{ rotate: droop }} style={{ transformOrigin: '120px 168px', transformBox: 'view-box' } as React.CSSProperties}>
            <rect x="117" y={168 - h} width="6" height={h} rx="3" fill="rgb(var(--good))" />
            {growth > 0 && Array.from({ length: growth }, (_, i) => (
              <g key={i} transform={`translate(120 ${160 - i * 24})`}>
                <path d="M0 0 q-24 -14 -30 4 q14 6 30 -4Z" fill={leaf} /><path d="M0 -6 q24 -14 30 4 q-14 6 -30 -4Z" fill={leaf} />
              </g>
            ))}
            {growth === 4 && <circle cx="120" cy={162 - h} r="10" fill="rgb(var(--accent))" />}
            {growth === 0 && <ellipse cx="120" cy="166" rx="8" ry="5" fill="#d9b27a" />}
          </motion.g>
        </svg>
        <div className="grid gap-3">
          {toggles.map(x => (
            <button key={x.id} onClick={() => x.set(v => !v)} aria-pressed={x.on}
              className={cx('flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 text-lg font-bold transition', x.on ? 'border-good bg-good/10' : 'border-line bg-surface text-muted')}>
              <x.icon size={26} aria-hidden />{t(`lp.pn.${x.id}`)}<span className="ml-auto text-sm">{x.on ? t('lp.pn.on') : t('lp.pn.off')}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Big tone="primary" onClick={nextDay} disabled={growth === 4}>{t('lp.pn.nextDay')}</Big>
        <Big onClick={reset}><RefreshCw size={18} aria-hidden /> {t('lp.pn.again')}</Big>
        <span className="font-semibold">{t('lp.pn.day', { n: day })}</span>
      </div>
      <Feedback ok={day === 0 ? null : all} text={all ? (growth === 4 ? t('lp.pn.flower') : t('lp.pn.growing')) : t(`lp.pn.need.${missing}`)} />
      <p className="text-sm text-muted">{t('lp.pn.note')}</p>
    </div>
  );
}
