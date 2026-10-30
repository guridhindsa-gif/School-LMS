'use client';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useT } from '@/lib/i18n';
import { Ask, Big, Feedback, Stars } from './kit';

const OBJ = [{ id: 'pencil', len: 9 }, { id: 'crayon', len: 6 }, { id: 'eraser', len: 3 }, { id: 'leaf', len: 5 }, { id: 'key', len: 4 }, { id: 'spoon', len: 11 }];
const CM = 34; // px per cm in the SVG
const W = 12 * CM + 40;

function Thing({ id, len }: { id: string; len: number }) {
  const w = len * CM, c = { pencil: 'var(--accent)', crayon: 'var(--bad)', eraser: 'var(--violet)', leaf: 'var(--good)', key: 'var(--muted)', spoon: 'var(--primary)' }[id] || 'var(--primary)';
  if (id === 'pencil') return <g><rect x="0" y="6" width={w - 20} height="18" rx="2" fill={`rgb(${c})`} /><path d={`M${w - 20} 6 L${w} 15 L${w - 20} 24Z`} fill="#e9c9a0" /><path d={`M${w - 6} 12 L${w} 15 L${w - 6} 18Z`} fill="rgb(var(--ink))" /></g>;
  if (id === 'leaf') return <g><path d={`M0 15 Q${w / 2} -10 ${w} 15 Q${w / 2} 40 0 15Z`} fill={`rgb(${c})`} /><line x1="0" y1="15" x2={w} y2="15" stroke="#fff" strokeOpacity=".6" strokeWidth="2" /></g>;
  if (id === 'key') return <g><circle cx="12" cy="15" r="11" fill="none" stroke={`rgb(${c})`} strokeWidth="6" /><rect x="22" y="12" width={w - 22} height="7" fill={`rgb(${c})`} /><rect x={w - 14} y="19" width="5" height="8" fill={`rgb(${c})`} /></g>;
  if (id === 'spoon') return <g><ellipse cx="18" cy="15" rx="18" ry="11" fill={`rgb(${c})`} /><rect x="34" y="12" width={w - 34} height="6" rx="3" fill={`rgb(${c})`} /></g>;
  return <rect x="0" y="4" width={w} height="22" rx="6" fill={`rgb(${c})`} />;
}

/** Measure objects with a centimetre ruler — the object must start at 0. Then compare two lengths. */
export default function MeasureLab() {
  const { t } = useT();
  const [i, setI] = useState(0);
  const [pos, setPos] = useState(2); // where the object starts, in cm
  const [ans, setAns] = useState<number | null>(null);
  const [stars, setStars] = useState(0);
  const o = OBJ[i % OBJ.length];
  const choices = useMemo(() => Array.from(new Set([o.len, o.len + pos, Math.max(1, o.len - 1), o.len + 1])).sort((a, b) => a - b), [o.len, pos]);
  const end = pos + o.len;
  const ok = ans === null ? null : ans === o.len;
  const move = (d: number) => { setPos(p => Math.max(0, Math.min(12 - o.len, p + d))); setAns(null); };

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.ms.ask', { thing: t(`lp.ms.${o.id}`) })}><Stars n={stars} label={t('lp.kit.stars', { n: stars })} /></Ask>
      <div className="overflow-x-auto rounded-card bg-surface2/60 p-3">
        <svg viewBox={`0 0 ${W} 120`} className="w-full min-w-[480px]" role="img" aria-label={t('lp.ms.aria', { thing: t(`lp.ms.${o.id}`), a: pos, b: end })}>
          <g transform={`translate(${20 + pos * CM} 10)`}><Thing id={o.id} len={o.len} /></g>
          <rect x="10" y="52" width={12 * CM + 20} height="58" rx="6" fill="#f5d98b" stroke="#c9a54a" />
          {Array.from({ length: 121 }, (_, k) => <line key={k} x1={20 + k * CM / 10} y1="52" x2={20 + k * CM / 10} y2={52 + (k % 10 ? (k % 5 ? 9 : 14) : 22)} stroke="#5b4a1a" strokeWidth={k % 10 ? 0.8 : 1.6} />)}
          {Array.from({ length: 13 }, (_, k) => <text key={k} x={20 + k * CM} y="94" textAnchor="middle" fontSize="14" fontWeight="700" fill="#3d3010">{k}</text>)}
          <text x={20 + 12 * CM} y="106" textAnchor="end" fontSize="10" fill="#5b4a1a">cm</text>
          <line x1={20 + pos * CM} y1="2" x2={20 + pos * CM} y2="52" stroke="rgb(var(--bad))" strokeDasharray="4 3" strokeWidth="2" />
          <line x1={20 + end * CM} y1="2" x2={20 + end * CM} y2="52" stroke="rgb(var(--primary))" strokeDasharray="4 3" strokeWidth="2" />
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Big label={t('lp.ms.left')} onClick={() => move(-1)} disabled={pos === 0}><ArrowLeft aria-hidden /></Big>
        <Big label={t('lp.ms.right')} onClick={() => move(1)} disabled={end >= 12}><ArrowRight aria-hidden /></Big>
        <Big tone="primary" onClick={() => { setPos(0); setAns(null); }}>{t('lp.ms.toZero')}</Big>
        <span className="text-muted">{t('lp.ms.startsEnds', { a: pos, b: end })}</span>
      </div>
      <div className="grid gap-2">
        <b>{t('lp.ms.howLong')}</b>
        <div className="flex flex-wrap gap-2">{choices.map(cm => <Big key={cm} active={ans === cm} tone={ans === cm ? (cm === o.len ? 'good' : 'bad') : 'soft'} onClick={() => { setAns(cm); if (cm === o.len) setStars(s => Math.min(3, s + 1)); }}>{cm} cm</Big>)}</div>
      </div>
      <Feedback ok={ok} text={ok ? t('lp.ms.yes', { n: o.len }) : pos > 0 && ans === end ? t('lp.ms.fromZero', { b: end, a: pos }) : t('lp.ms.no')} />
      <div><Big onClick={() => { setI(x => x + 1); setPos(2); setAns(null); }}><RefreshCw size={18} aria-hidden /> {t('lp.ms.next')}</Big></div>
      <p className="text-sm text-muted">{t('lp.ms.note')}</p>
    </div>
  );
}
