'use client';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '../../ui';
import { Ask, Big, Feedback, Stars } from './kit';

type Shape = { id: string; sides: number; pts: [number, number][] | null; color: string };
const poly = (n: number, r = 34, rot = -90): [number, number][] => Array.from({ length: n }, (_, i) => { const a = (rot + (360 / n) * i) * Math.PI / 180; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; });
const SHAPES: Shape[] = [
  { id: 'triangle', sides: 3, pts: poly(3, 38, -90).map(([x, y]) => [x, y + 6]), color: 'var(--primary)' },
  { id: 'square', sides: 4, pts: [[20, 20], [80, 20], [80, 80], [20, 80]], color: 'var(--teal)' },
  { id: 'rectangle', sides: 4, pts: [[10, 30], [90, 30], [90, 70], [10, 70]], color: 'var(--accent)' },
  { id: 'pentagon', sides: 5, pts: poly(5, 38), color: 'var(--violet)' },
  { id: 'hexagon', sides: 6, pts: poly(6, 38, 0), color: 'var(--good)' },
  { id: 'circle', sides: 0, pts: null, color: 'var(--bad)' },
];

/** 2-D shapes: tap a shape to count its sides and corners, then find the shape that matches a clue. */
export default function ShapesLab() {
  const { t } = useT();
  const [sel, setSel] = useState<string | null>(null);
  const [clue, setClue] = useState(0);
  const [stars, setStars] = useState(0);
  const [ok, setOk] = useState<boolean | null>(null);
  const target = SHAPES[clue % SHAPES.length];
  const cur = SHAPES.find(s => s.id === sel);

  function pick(s: Shape) {
    setSel(s.id);
    const right = s.id === target.id;
    setOk(right);
    if (right) { setStars(n => Math.min(3, n + 1)); setTimeout(() => { setClue(c => c + 1 + Math.floor(Math.random() * 3)); setOk(null); }, 1600); }
  }

  return (
    <div className="grid gap-5">
      <Ask text={t(`lp.sh.clue.${target.id}`)}><Stars n={stars} label={t('lp.kit.stars', { n: stars })} /></Ask>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {SHAPES.map(s => (
          <button key={s.id} onClick={() => pick(s)} aria-pressed={sel === s.id} aria-label={t(`lp.sh.${s.id}`)}
            className={cx('grid min-h-[7.5rem] justify-items-center gap-1 rounded-2xl border-2 bg-surface p-2 transition active:scale-95',
              sel === s.id ? (ok === false ? 'border-accent' : 'border-primary') : 'border-line hover:border-primary/40')}>
            <svg viewBox="0 0 100 100" className="h-20 w-20" aria-hidden>
              {s.pts ? <polygon points={s.pts.map(p => p.join(',')).join(' ')} fill={`rgb(${s.color} / .25)`} stroke={`rgb(${s.color})`} strokeWidth="5" strokeLinejoin="round" />
                : <circle cx="50" cy="50" r="36" fill={`rgb(${s.color} / .25)`} stroke={`rgb(${s.color})`} strokeWidth="5" />}
              {sel === s.id && s.pts?.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" fill="rgb(var(--ink))" />)}
            </svg>
            <span className="text-sm font-semibold">{t(`lp.sh.${s.id}`)}</span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="grid grid-cols-2 gap-3 sm:max-w-md" aria-live="polite">
          <div className="rounded-2xl bg-surface2 p-3 text-center"><p className="text-sm text-muted">{t('lp.sh.sides')}</p><p className="font-display text-4xl font-extrabold">{cur.sides}</p></div>
          <div className="rounded-2xl bg-surface2 p-3 text-center"><p className="text-sm text-muted">{t('lp.sh.corners')}</p><p className="font-display text-4xl font-extrabold">{cur.sides}</p></div>
        </div>
      )}
      <Feedback ok={ok} text={ok ? t('lp.sh.yes', { name: t(`lp.sh.${target.id}`) }) : t('lp.sh.no', { name: cur ? t(`lp.sh.${cur.id}`) : '' })} />
      <div><Big onClick={() => { setClue(c => c + 1); setOk(null); setSel(null); }}><RefreshCw size={18} aria-hidden /> {t('lp.sh.newClue')}</Big></div>
      <p className="text-sm text-muted">{t('lp.sh.note')}</p>
    </div>
  );
}
