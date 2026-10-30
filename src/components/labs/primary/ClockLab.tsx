'use client';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { Ask, Big, Feedback, Stars } from './kit';

const TARGETS = [180 + 30, 7 * 60, 600 + 15, 6 * 60 + 45, 2 * 60 + 30, 9 * 60, 11 * 60 + 15, 4 * 60 + 45, 60 + 30, 8 * 60 + 15]; // minutes after 12:00
const fmt = (m: number) => { const h = Math.floor(m / 60) % 12 || 12; return `${h}:${String(m % 60).padStart(2, '0')}`; };

/** Read and set an analog clock. The hour hand moves with the minutes (at 3:30 it is half-way between 3 and 4). */
export default function ClockLab() {
  const { t } = useT();
  const [m, setM] = useState(3 * 60); // 0..719 minutes after 12:00
  const [k, setK] = useState(0);
  const [stars, setStars] = useState(0);
  const [checked, setChecked] = useState<boolean | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const target = TARGETS[k % TARGETS.length];
  const add = (d: number) => { setM(v => ((v + d) % 720 + 720) % 720); setChecked(null); };
  const minA = (m % 60) * 6, hourA = (m / 60) * 30; // degrees clockwise from 12

  function onMove(e: { clientX: number; clientY: number }) {
    if (!drag.current || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const deg = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    const newMin = Math.round(deg / 6 / 5) * 5 % 60;
    setM(v => { const old = v % 60; let h = Math.floor(v / 60); if (old >= 45 && newMin <= 15) h++; else if (old <= 15 && newMin >= 45) h--; return ((h * 60 + newMin) % 720 + 720) % 720; });
    setChecked(null);
  }
  const hand = (a: number, len: number, w: number, c: string) => <line x1="100" y1="100" x2={100 + len * Math.sin(a * Math.PI / 180)} y2={100 - len * Math.cos(a * Math.PI / 180)} stroke={c} strokeWidth={w} strokeLinecap="round" />;

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.ck.ask', { time: fmt(target) })}><Stars n={stars} label={t('lp.kit.stars', { n: stars })} /></Ask>
      <div className="grid items-center gap-5 md:grid-cols-[auto_1fr]">
        <svg ref={svg} viewBox="0 0 200 200" className="mx-auto w-64 max-w-full touch-none select-none" role="img" aria-label={t('lp.ck.aria', { time: fmt(m) })}
          onPointerMove={onMove} onPointerUp={() => (drag.current = false)} onPointerLeave={() => (drag.current = false)}>
          <circle cx="100" cy="100" r="94" fill="rgb(var(--surface))" stroke="rgb(var(--primary))" strokeWidth="6" />
          {Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 84 : 78; return <line key={i} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + 88 * Math.sin(a)} y2={100 - 88 * Math.cos(a)} stroke="rgb(var(--muted))" strokeWidth={i % 5 ? 1 : 2.5} />; })}
          {Array.from({ length: 12 }, (_, i) => { const n = i || 12, a = i * 30 * Math.PI / 180; return <text key={i} x={100 + 64 * Math.sin(a)} y={100 - 64 * Math.cos(a) + 7} textAnchor="middle" fontSize="19" fontWeight="800" fill="rgb(var(--ink))">{n}</text>; })}
          {hand(hourA, 44, 8, 'rgb(var(--ink))')}
          <g onPointerDown={e => { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }} className="cursor-grab">
            {hand(minA, 74, 5, 'rgb(var(--primary))')}
            <circle cx={100 + 74 * Math.sin(minA * Math.PI / 180)} cy={100 - 74 * Math.cos(minA * Math.PI / 180)} r="11" fill="rgb(var(--primary) / .25)" />
          </g>
          <circle cx="100" cy="100" r="6" fill="rgb(var(--accent))" />
        </svg>
        <div className="grid gap-4">
          <p className="font-display text-6xl font-extrabold tabular-nums" aria-live="polite">{fmt(m)}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><b>{t('lp.ck.hour')}</b><div className="flex gap-2"><Big label={t('lp.ck.hourBack')} onClick={() => add(-60)}><Minus aria-hidden /></Big><Big label={t('lp.ck.hourOn')} onClick={() => add(60)}><Plus aria-hidden /></Big></div></div>
            <div className="grid gap-2"><b>{t('lp.ck.minutes')}</b><div className="flex gap-2"><Big label={t('lp.ck.minBack')} onClick={() => add(-5)}><Minus aria-hidden /></Big><Big label={t('lp.ck.minOn')} onClick={() => add(5)}><Plus aria-hidden /></Big></div></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Big tone="primary" onClick={() => { const ok = m === target; setChecked(ok); if (ok) setStars(s => Math.min(3, s + 1)); }}>{t('lp.kit.check')}</Big>
            <Big onClick={() => { setK(x => x + 1); setChecked(null); }}><RefreshCw size={18} aria-hidden /> {t('lp.ck.newTime')}</Big>
          </div>
        </div>
      </div>
      <Feedback ok={checked} text={checked ? t('lp.ck.yes', { time: fmt(target) }) : t('lp.ck.no')} />
      <p className="text-sm text-muted">{t('lp.ck.note')}</p>
    </div>
  );
}
