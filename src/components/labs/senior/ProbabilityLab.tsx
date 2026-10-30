'use client';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout } from '../Slider';
import { C, Plot, Seg, fmt } from './kit';

type Mode = 'coin' | 'die' | 'dice';
/** Outcomes and their theoretical probabilities for each experiment. */
export const OUTCOMES: Record<Mode, { labels: string[]; p: number[]; event: number }> = {
  coin: { labels: ['H', 'T'], p: [1 / 2, 1 / 2], event: 0 },
  die: { labels: ['1', '2', '3', '4', '5', '6'], p: Array(6).fill(1 / 6), event: 5 },
  dice: { labels: Array.from({ length: 11 }, (_, i) => String(i + 2)), p: Array.from({ length: 11 }, (_, i) => (6 - Math.abs(i + 2 - 7)) / 36), event: 5 },
};
const roll = (m: Mode) => m === 'coin' ? (Math.random() < 0.5 ? 0 : 1) : m === 'die' ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6);

/** Simulate coins and dice; relative frequency approaches theoretical probability as trials grow. */
export default function ProbabilityLab() {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('coin');
  const [counts, setCounts] = useState<number[]>(Array(2).fill(0));
  const [history, setHistory] = useState<[number, number][]>([]);
  const O = OUTCOMES[mode];
  const n = counts.reduce((a, b) => a + b, 0);
  const reset = (m: Mode = mode) => { setCounts(Array(OUTCOMES[m].labels.length).fill(0)); setHistory([]); };
  const run = (k: number) => {
    const c = [...counts]; let total = n, hit = c[O.event];
    const hist: [number, number][] = [];
    const every = Math.max(1, Math.floor((n + k) / 300));
    for (let i = 0; i < k; i++) {
      const r = roll(mode); c[r]++; total++; if (r === O.event) hit++;
      if (total % every === 0 || i === k - 1) hist.push([total, hit / total]);
    }
    setCounts(c); setHistory(h => [...h, ...hist].slice(-600));
  };
  const rel = n ? counts[O.event] / n : 0;
  const maxBar = Math.max(...O.p, ...counts.map(c => (n ? c / n : 0))) * 1.15;
  const eventName = t(`lsr.pr.event.${mode}`);

  return (
    <div className="grid gap-4">
      <Seg label={t('lsr.pr.mode')} value={mode} onChange={m => { setMode(m); reset(m); }} options={[['coin', t('lsr.pr.coin')], ['die', t('lsr.pr.die')], ['dice', t('lsr.pr.dice')]]} />
      <div className="grid gap-4 md:grid-cols-2">
        <svg viewBox="0 0 320 200" className="w-full rounded-ctl border border-line bg-surface" role="img"
          aria-label={t('lsr.pr.histAria', { n, list: O.labels.map((l, i) => `${l}: ${counts[i]}`).join(', ') })}>
          {O.labels.map((l, i) => {
            const w = 280 / O.labels.length, x = 24 + i * w, rf = n ? counts[i] / n : 0;
            const yBar = (v: number) => 170 - (v / maxBar) * 150;
            return (
              <g key={l}>
                <rect x={x + w * 0.15} y={yBar(rf)} width={w * 0.7} height={170 - yBar(rf)} fill={i === O.event ? C.accent : C.primary} opacity=".85" rx="2" />
                <line x1={x + w * 0.08} x2={x + w * 0.92} y1={yBar(O.p[i])} y2={yBar(O.p[i])} stroke={C.ink} strokeWidth="2" strokeDasharray="4 2" />
                <text x={x + w / 2} y="186" fontSize="10" textAnchor="middle" fill={C.ink}>{l}</text>
              </g>
            );
          })}
          <line x1="20" x2="306" y1="170" y2="170" stroke={C.muted} />
        </svg>
        <Plot label={t('lsr.pr.convAria', { e: eventName })} xLabel={t('lsr.pr.trials')} yLabel={t('lsr.pr.relFreq')} xMin={0} xMax={Math.max(10, n)} yMin={0} yMax={Math.min(1, O.p[O.event] * 2.5)}
          series={[{ pts: [[0, O.p[O.event]], [Math.max(10, n), O.p[O.event]]], color: C.ink, dash: '4 3' }, { pts: history, color: C.accent }]} />
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 10, 100, 1000].map(k => <button key={k} className={k === 1000 ? 'btn-primary' : 'btn-ghost'} onClick={() => run(k)}>+{k}</button>)}
        <button className="btn-ghost" onClick={() => reset()}><RotateCcw size={16} aria-hidden /> {t('lsr.c.reset')}</button>
      </div>
      <Readout items={[
        [t('lsr.pr.trials'), String(n)],
        [t('lsr.pr.relOf', { e: eventName }), n ? fmt(rel, 3) : '—'],
        [t('lsr.pr.theory'), `${fmt(O.p[O.event], 3)}${mode === 'dice' ? ' (6/36)' : mode === 'die' ? ' (1/6)' : ' (1/2)'}`],
        [t('lsr.pr.gap'), n ? fmt(Math.abs(rel - O.p[O.event]), 2) : '—'],
      ]} />
      <Legend items={[[C.primary, t('lsr.pr.legBars')], [C.accent, t('lsr.pr.legEvent', { e: eventName })], [C.ink, t('lsr.pr.legTheory')]]} />
      <LabNote>{t('lsr.pr.note')}</LabNote>
    </div>
  );
}
