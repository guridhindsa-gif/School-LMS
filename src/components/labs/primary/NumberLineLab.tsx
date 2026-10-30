'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, Play } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Ask, Big, Feedback } from './kit';

const X = (n: number) => 20 + n * 28; // 0..20 → 20..580

/** Addition and subtraction as hops on a 0–20 number line. */
export default function NumberLineLab() {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [start, setStart] = useState(4);
  const [jump, setJump] = useState(3);
  const [op, setOp] = useState<'+' | '-'>('+');
  const [played, setPlayed] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const end = op === '+' ? start + jump : start - jump;
  const change = (f: () => void) => { f(); setGuess(null); setPlayed(0); };
  const valid = end >= 0 && end <= 20;
  const hops = Array.from({ length: jump }, (_, i) => (op === '+' ? start + i : start - i));
  const sentence = `${start} ${op} ${jump} = ${valid ? end : '?'}`;
  const choices = valid ? Array.from(new Set([end, Math.max(0, end - 1), Math.min(20, end + 1), Math.min(20, end + 2)])).sort((a, b) => a - b) : [];

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.nl.ask', { a: start, op: op === '+' ? t('lp.nl.plus') : t('lp.nl.minus'), b: jump })} />
      <div className="overflow-x-auto rounded-card bg-surface2/60 p-2">
        <svg viewBox="0 0 600 120" className="min-w-[560px] w-full" role="img" aria-label={t('lp.nl.aria', { a: start, op, b: jump, c: valid ? end : '?' })}>
          <line x1="12" y1="84" x2="588" y2="84" stroke="rgb(var(--ink))" strokeWidth="3" />
          {Array.from({ length: 21 }, (_, n) => (
            <g key={n}>
              <line x1={X(n)} y1="76" x2={X(n)} y2="92" stroke="rgb(var(--ink))" strokeWidth={n % 5 ? 1.5 : 3} />
              <text x={X(n)} y="112" textAnchor="middle" fontSize="15" fontWeight={n === start || (valid && n === end) ? 800 : 500} fill={n === start ? 'rgb(var(--primary))' : valid && n === end && played ? 'rgb(var(--good))' : 'rgb(var(--ink))'}>{n}</text>
            </g>
          ))}
          <circle cx={X(start)} cy="84" r="8" fill="rgb(var(--primary))" />
          {valid && hops.map((from, i) => {
            const to = op === '+' ? from + 1 : from - 1;
            const d = `M${X(from)} 78 Q${(X(from) + X(to)) / 2} 30 ${X(to)} 78`;
            return <motion.path key={`${played}-${i}`} d={d} fill="none" stroke="rgb(var(--accent))" strokeWidth="4" strokeLinecap="round"
              initial={reduce || !played ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.35, duration: 0.35 }} />;
          })}
          {valid && played > 0 && <circle cx={X(end)} cy="84" r="9" fill="rgb(var(--good))" />}
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-2"><b>{t('lp.nl.start')}</b><div className="flex items-center gap-2"><Big label={t('lp.nl.less')} onClick={() => change(() => setStart(s => Math.max(0, s - 1)))}><Minus aria-hidden /></Big><span className="w-10 text-center font-display text-3xl font-bold">{start}</span><Big label={t('lp.nl.more')} onClick={() => change(() => setStart(s => Math.min(20, s + 1)))}><Plus aria-hidden /></Big></div></div>
        <div className="grid gap-2"><b>{t('lp.nl.sign')}</b><div className="flex gap-2"><Big active={op === '+'} onClick={() => change(() => setOp('+'))} label={t('lp.nl.plus')}>+</Big><Big active={op === '-'} onClick={() => change(() => setOp('-'))} label={t('lp.nl.minus')}>−</Big></div></div>
        <div className="grid gap-2"><b>{t('lp.nl.hops')}</b><div className="flex items-center gap-2"><Big label={t('lp.nl.fewer')} onClick={() => change(() => setJump(s => Math.max(1, s - 1)))}><Minus aria-hidden /></Big><span className="w-10 text-center font-display text-3xl font-bold">{jump}</span><Big label={t('lp.nl.moreHops')} onClick={() => change(() => setJump(s => Math.min(10, s + 1)))}><Plus aria-hidden /></Big></div></div>
      </div>
      {!valid && <p className="rounded-xl bg-accent/15 px-3 py-2 font-semibold text-warn">{t('lp.nl.offLine')}</p>}
      {valid && (
        <div className="grid gap-2">
          <b>{t('lp.nl.guess')}</b>
          <div className="flex flex-wrap gap-2">{choices.map(c => <Big key={c} active={guess === c} tone={guess === c ? (c === end ? 'good' : 'bad') : 'soft'} onClick={() => setGuess(c)}>{c}</Big>)}</div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Big tone="primary" onClick={() => setPlayed(p => p + 1)} disabled={!valid}><Play size={18} aria-hidden /> {t('lp.nl.hop')}</Big>
        <span className="font-display text-3xl font-bold tabular-nums">{played || guess === end ? sentence : `${start} ${op} ${jump} = ?`}</span>
      </div>
      <Feedback ok={guess === null ? null : guess === end} text={guess === end ? t('lp.nl.right', { s: sentence }) : t('lp.nl.tryHop')} />
    </div>
  );
}
