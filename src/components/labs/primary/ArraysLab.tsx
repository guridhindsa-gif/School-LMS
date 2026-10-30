'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Ask, Big, Feedback, Stars } from './kit';

const TARGETS = [12, 18, 24, 16, 20, 36];

/** Multiplication as an array of rows × columns; repeated addition; turning the array shows a × b = b × a. */
export default function ArraysLab() {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [r, setR] = useState(3), [c, setC] = useState(4);
  const [ti, setTi] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const target = TARGETS[ti % TARGETS.length];
  const p = r * c;
  const key = `${Math.min(r, c)}x${Math.max(r, c)}`;
  const hit = p === target;
  const record = () => { if (hit && !found.includes(key)) setFound(f => [...f, key]); };
  const repeated = Array.from({ length: r }, () => c).join(' + ');
  const size = Math.min(34, 300 / Math.max(r, c, 1));

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.ar.ask', { n: target })}><Stars n={Math.min(3, found.length)} label={t('lp.kit.stars', { n: Math.min(3, found.length) })} /></Ask>
      <div className="grid items-start gap-5 md:grid-cols-[auto_1fr]">
        <svg viewBox={`0 0 ${c * size + 8} ${r * size + 8}`} className="mx-auto h-auto max-h-80 w-full max-w-sm" role="img" aria-label={t('lp.ar.aria', { r, c, p })}>
          {Array.from({ length: r * c }, (_, i) => (
            <motion.circle key={`${r}-${c}-${i}`} cx={4 + (i % c) * size + size / 2} cy={4 + Math.floor(i / c) * size + size / 2} r={size * 0.36}
              fill={Math.floor(i / c) % 2 ? 'rgb(var(--teal))' : 'rgb(var(--primary))'} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.012 }} />
          ))}
        </svg>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><b>{t('lp.ar.rows')}</b><div className="flex items-center gap-2"><Big label={t('lp.ar.fewerRows')} onClick={() => setR(v => Math.max(1, v - 1))}><Minus aria-hidden /></Big><span className="w-8 text-center font-display text-3xl font-bold">{r}</span><Big label={t('lp.ar.moreRows')} onClick={() => setR(v => Math.min(10, v + 1))}><Plus aria-hidden /></Big></div></div>
            <div className="grid gap-2"><b>{t('lp.ar.cols')}</b><div className="flex items-center gap-2"><Big label={t('lp.ar.fewerCols')} onClick={() => setC(v => Math.max(1, v - 1))}><Minus aria-hidden /></Big><span className="w-8 text-center font-display text-3xl font-bold">{c}</span><Big label={t('lp.ar.moreCols')} onClick={() => setC(v => Math.min(10, v + 1))}><Plus aria-hidden /></Big></div></div>
          </div>
          <div className="rounded-card bg-night p-4 text-onnight" aria-live="polite">
            <p className="font-display text-4xl font-extrabold tabular-nums">{r} × {c} = {p}</p>
            <p className="mt-1 break-words font-mono text-sm text-onnight/80">{repeated} = {p}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Big onClick={() => { setR(c); setC(r); }}><RotateCw size={18} aria-hidden /> {t('lp.ar.turn')}</Big>
            <Big tone="primary" onClick={record}>{t('lp.kit.check')}</Big>
            <Big onClick={() => { setTi(x => x + 1); setFound([]); }}>{t('lp.kit.new')}</Big>
          </div>
        </div>
      </div>
      <Feedback ok={hit ? true : null} text={found.includes(key) ? t('lp.ar.again', { r, c, n: target }) : t('lp.ar.yes', { r, c, n: target })} />
      {found.length > 0 && <p className="font-semibold">{t('lp.ar.found', { list: found.map(f => f.replace('x', ' × ')).join(', ') })}</p>}
      <p className="text-sm text-muted">{t('lp.ar.note')}</p>
    </div>
  );
}
