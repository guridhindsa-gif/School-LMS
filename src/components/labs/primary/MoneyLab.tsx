'use client';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Ask, Big, Feedback, Stars, rnd } from './kit';

const COINS = [1, 2, 5, 10];
const NOTES = [10, 20, 50, 100];
type Item = { v: number; note: boolean; key: number };
const TONE: Record<number, string> = { 10: 'var(--accent)', 20: 'var(--good)', 50: 'var(--teal)', 100: 'var(--violet)' };

function Coin({ v, size = 56 }: { v: number; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden><circle cx="28" cy="28" r="26" fill="rgb(var(--surface-3))" stroke="rgb(var(--muted))" strokeWidth="3" /><circle cx="28" cy="28" r="20" fill="none" stroke="rgb(var(--muted))" strokeOpacity=".5" /><text x="28" y="35" textAnchor="middle" fontSize="18" fontWeight="800" fill="rgb(var(--ink))">₹{v}</text></svg>;
}
function Note({ v, w = 96 }: { v: number; w?: number }) {
  return <svg viewBox="0 0 96 50" width={w} height={w * 50 / 96} aria-hidden><rect x="1" y="1" width="94" height="48" rx="6" fill={`rgb(${TONE[v]} / .3)`} stroke={`rgb(${TONE[v]})`} strokeWidth="2.5" /><circle cx="70" cy="25" r="13" fill={`rgb(${TONE[v]} / .35)`} /><text x="30" y="33" textAnchor="middle" fontSize="20" fontWeight="800" fill="rgb(var(--ink))">₹{v}</text></svg>;
}

/** Make an amount with Indian coins and notes. */
export default function MoneyLab() {
  const { t } = useT();
  const [target, setTarget] = useState(() => rnd(6, 60));
  const [tray, setTray] = useState<Item[]>([]);
  const [stars, setStars] = useState(0);
  const [k, setK] = useState(0);
  const total = tray.reduce((a, i) => a + i.v, 0);
  const ok = total === target ? true : total > target ? false : null;
  const add = (v: number, note: boolean) => { setTray(tr => [...tr, { v, note, key: k }]); setK(x => x + 1); };
  const next = () => { if (total === target) setStars(s => Math.min(3, s + 1)); setTarget(rnd(6, stars >= 1 ? 190 : 60)); setTray([]); };

  return (
    <div className="grid gap-5">
      <Ask text={t('lp.mn.ask', { n: target })}><Stars n={stars} label={t('lp.kit.stars', { n: stars })} /></Ask>
      <div className="grid gap-3">
        <b>{t('lp.mn.coins')}</b>
        <div className="flex flex-wrap gap-2">{COINS.map(v => <button key={`c${v}`} onClick={() => add(v, false)} aria-label={t('lp.mn.addCoin', { v })} className="rounded-full p-1 transition hover:scale-105 active:scale-95"><Coin v={v} /></button>)}</div>
        <b>{t('lp.mn.notes')}</b>
        <div className="flex flex-wrap gap-2">{NOTES.map(v => <button key={`n${v}`} onClick={() => add(v, true)} aria-label={t('lp.mn.addNote', { v })} className="rounded-lg p-1 transition hover:scale-105 active:scale-95"><Note v={v} /></button>)}</div>
      </div>
      <section className="grid min-h-[8rem] content-start gap-2 rounded-card border-2 border-dashed border-line bg-surface2/50 p-3" aria-label={t('lp.mn.tray')}>
        <div className="flex items-center justify-between gap-2"><b>{t('lp.mn.tray')}</b><span className="font-display text-3xl font-extrabold tabular-nums" aria-live="polite">₹{total}</span></div>
        <div className="flex flex-wrap gap-1.5">
          {tray.map((i, idx) => <button key={i.key} onClick={() => setTray(tr => tr.filter((_, j) => j !== idx))} aria-label={t('lp.mn.remove', { v: i.v })} className="transition hover:opacity-70">{i.note ? <Note v={i.v} w={72} /> : <Coin v={i.v} size={44} />}</button>)}
          {!tray.length && <p className="text-muted">{t('lp.mn.empty')}</p>}
        </div>
      </section>
      <Feedback ok={ok} text={ok ? t('lp.mn.yes', { n: target }) : t('lp.mn.over', { n: total - target })} />
      <div className="flex flex-wrap gap-2">
        <Big tone="primary" onClick={next}><RefreshCw size={18} aria-hidden /> {t('lp.kit.new')}</Big>
        <Big onClick={() => setTray([])} disabled={!tray.length}><Trash2 size={18} aria-hidden /> {t('lp.mn.clear')}</Big>
      </div>
      <p className="text-sm text-muted">{t('lp.mn.note')}</p>
    </div>
  );
}
