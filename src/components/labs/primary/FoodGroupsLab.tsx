'use client';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '../../ui';
import { Ask, Big, Feedback, Stars } from './kit';

type Group = 'energy' | 'body' | 'protect';
/** Groups follow the NCERT primary classification: energy-giving (cereals, fats), body-building (pulses, milk, eggs), protective (fruits, vegetables). */
const FOODS: { id: string; g: Group; c: string }[] = [
  { id: 'roti', g: 'energy', c: '#d9a35b' }, { id: 'rice', g: 'energy', c: '#e8e2d0' }, { id: 'potato', g: 'energy', c: '#c8a06a' }, { id: 'ghee', g: 'energy', c: '#f2cf5b' },
  { id: 'dal', g: 'body', c: '#e3b23c' }, { id: 'egg', g: 'body', c: '#f5f0e6' }, { id: 'milk', g: 'body', c: '#f8f8f8' }, { id: 'paneer', g: 'body', c: '#efe7d2' },
  { id: 'spinach', g: 'protect', c: '#3f9a4d' }, { id: 'carrot', g: 'protect', c: '#ec7a26' }, { id: 'apple', g: 'protect', c: '#d23b3b' }, { id: 'orange', g: 'protect', c: '#f39c1f' },
];
const GROUPS: Group[] = ['energy', 'body', 'protect'];

function FoodPic({ id, c }: { id: string; c: string }) {
  const shapes: Record<string, JSX.Element> = {
    roti: <circle cx="24" cy="24" r="18" fill={c} />, rice: <><ellipse cx="24" cy="30" rx="18" ry="9" fill="rgb(var(--primary) / .4)" /><ellipse cx="24" cy="25" rx="15" ry="8" fill={c} /></>,
    potato: <ellipse cx="24" cy="24" rx="17" ry="12" fill={c} />, ghee: <><rect x="12" y="14" width="24" height="24" rx="4" fill={c} /><rect x="10" y="10" width="28" height="6" rx="2" fill="rgb(var(--muted))" /></>,
    dal: <><ellipse cx="24" cy="30" rx="18" ry="9" fill="rgb(var(--muted) / .5)" /><ellipse cx="24" cy="26" rx="15" ry="7" fill={c} /></>, egg: <ellipse cx="24" cy="25" rx="12" ry="16" fill={c} stroke="rgb(var(--muted))" />,
    milk: <><rect x="14" y="10" width="20" height="30" rx="5" fill={c} stroke="rgb(var(--muted))" /><rect x="14" y="20" width="20" height="5" fill="rgb(var(--primary) / .5)" /></>, paneer: <rect x="12" y="14" width="24" height="20" rx="3" fill={c} stroke="rgb(var(--muted))" />,
    spinach: <path d="M24 42 C8 30 10 12 24 6 C38 12 40 30 24 42Z" fill={c} />, carrot: <><path d="M14 10 L34 14 L22 44Z" fill={c} /><path d="M14 10 l-4 -6 M18 10 l0 -7" stroke="#3f9a4d" strokeWidth="3" /></>,
    apple: <><circle cx="24" cy="27" r="15" fill={c} /><path d="M24 12 q4 -6 8 -4" stroke="#3f9a4d" strokeWidth="3" fill="none" /></>, orange: <circle cx="24" cy="25" r="15" fill={c} />,
  };
  return <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>{shapes[id]}</svg>;
}

/** Sort foods into energy-giving, body-building and protective groups (food groups only; no amounts or diets). */
export default function FoodGroupsLab() {
  const { t } = useT();
  const [held, setHeld] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, Group>>({});
  const [ok, setOk] = useState<boolean | null>(null);
  const left = FOODS.filter(f => !placed[f.id]);
  const right = Object.entries(placed).filter(([id, g]) => FOODS.find(f => f.id === id)!.g === g).length;
  const stars = right >= 12 ? 3 : right >= 8 ? 2 : right >= 4 ? 1 : 0;

  function drop(g: Group) {
    if (!held) return;
    const f = FOODS.find(x => x.id === held)!;
    if (f.g === g) { setPlaced(p => ({ ...p, [f.id]: g })); setOk(true); setHeld(null); } else setOk(false);
  }

  return (
    <div className="grid gap-5">
      <Ask text={held ? t('lp.fg.whereGo', { food: t(`lp.fg.${held}`) }) : t('lp.fg.ask')}><Stars n={stars} label={t('lp.kit.stars', { n: stars })} /></Ask>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('lp.fg.foods')}>
        {left.map(f => (
          <button key={f.id} onClick={() => { setHeld(f.id); setOk(null); }} aria-pressed={held === f.id}
            className={cx('grid min-h-[5.5rem] w-24 justify-items-center gap-1 rounded-2xl border-2 bg-surface p-2 transition active:scale-95', held === f.id ? 'border-primary bg-primary/10' : 'border-line hover:border-primary/40')}>
            <FoodPic id={f.id} c={f.c} /><span className="text-sm font-semibold">{t(`lp.fg.${f.id}`)}</span>
          </button>
        ))}
        {!left.length && <p className="font-display text-xl font-bold text-good">{t('lp.fg.allDone')}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {GROUPS.map(g => (
          <button key={g} onClick={() => drop(g)} disabled={!held} aria-label={t('lp.fg.putIn', { group: t(`lp.fg.g.${g}`) })}
            className={cx('grid min-h-[9rem] content-start gap-2 rounded-card border-2 border-dashed p-3 text-left transition', held ? 'border-primary/60 bg-primary/[.05] hover:bg-primary/10' : 'border-line bg-surface2/50')}>
            <b className="text-lg leading-tight">{t(`lp.fg.g.${g}`)}</b>
            <span className="text-sm text-muted">{t(`lp.fg.g.${g}.hint`)}</span>
            <span className="flex flex-wrap gap-1">{FOODS.filter(f => placed[f.id] === g).map(f => <span key={f.id} title={t(`lp.fg.${f.id}`)}><FoodPic id={f.id} c={f.c} /></span>)}</span>
          </button>
        ))}
      </div>
      <Feedback ok={ok} text={ok ? t('lp.fg.yes') : t('lp.fg.no')} />
      <div><Big onClick={() => { setPlaced({}); setHeld(null); setOk(null); }}><RefreshCw size={18} aria-hidden /> {t('lp.fg.again')}</Big></div>
      <p className="text-sm text-muted">{t('lp.fg.note')}</p>
    </div>
  );
}
