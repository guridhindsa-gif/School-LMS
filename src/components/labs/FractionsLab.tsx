'use client';
import { useT } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Slider, Readout } from './Slider';

const toggleIn = (s: Set<number>, i: number) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; };

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Cut a roti into equal parts, shade pieces; see equivalent fractions and decimals. */
export default function FractionsLab() {
  const [parts, setParts] = useState(4);
  const { t } = useT();
  const [shaded, setShaded] = useState<Set<number>>(new Set([0, 1, 2]));
  const [target] = useState<[number, number]>([3, 4]);
  const k = shaded.size;
  const g = gcd(k, parts) || 1;
  const ok = k * target[1] === parts * target[0];

  const slices = useMemo(() => Array.from({ length: parts }, (_, i) => {
    const a0 = (i / parts) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / parts) * Math.PI * 2 - Math.PI / 2, r = 92;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M0 0 L${(r * Math.cos(a0)).toFixed(1)} ${(r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 ${large} 1 ${(r * Math.cos(a1)).toFixed(1)} ${(r * Math.sin(a1)).toFixed(1)}Z`;
  }), [parts]);

  return (
    <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
      <svg viewBox="-104 -104 208 208" className="mx-auto w-64 max-w-full" role="img" aria-label={t('lb.fr.aria', { parts, k })}>
        <circle r="100" fill="#c98a3a" />
        {slices.map((d, i) => (
          <motion.path key={`${parts}-${i}`} d={d} onClick={() => setShaded(s => toggleIn(s, i))}
            role="checkbox" tabIndex={0} aria-checked={shaded.has(i)} aria-label={t('lb.fr.piece', { i: i + 1, parts })}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setShaded(s => toggleIn(s, i)); } }}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1, fill: shaded.has(i) ? '#e2900f' : '#f1d39a' }} transition={{ delay: i * 0.03 }}
            stroke="#8a5520" strokeWidth="2" className="cursor-pointer outline-none focus-visible:stroke-[rgb(var(--primary))] focus-visible:[stroke-width:4]" />
        ))}
        {[[-30, -20], [25, 30], [10, -45], [-40, 35], [45, -10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#8a5520" opacity=".4" pointerEvents="none" />)}
      </svg>
      <div className="grid gap-4">
        <p className="text-sm text-muted">{t('lb.fr.tap')}</p>
        <h3 className="font-display text-2xl">{t('lb.fr.shade', { f: `${target[0]}/${target[1]}` })}</h3>
        <Slider id="fr-parts" label={t('lb.fr.parts')} value={parts} min={2} max={12} onChange={v => { setParts(v); setShaded(new Set()); }} />
        <Readout items={[[t('lb.fr.youShaded'), `${k}/${parts}`], [t('lb.fr.simplest'), k ? `${k / g}/${parts / g}` : '0'], [t('lb.fr.decimal'), (k / parts).toFixed(3)], [t('lb.fr.percent'), `${Math.round((k / parts) * 100)}%`]]} />
        <motion.p key={`${k}-${parts}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          role="status" className={ok ? 'rounded-ctl bg-good/15 px-4 py-3 font-semibold text-good' : 'rounded-ctl bg-surface2 px-4 py-3 text-muted'}>
          {ok ? t('lb.fr.ok', { a: `${k}/${parts}`, b: `${target[0]}/${target[1]}` }) : parts % target[1] ? t('lb.fr.noDivide', { d: target[1], parts }) : t('lb.fr.hint', { n: (parts / target[1]) * target[0], parts })}
        </motion.p>
      </div>
    </div>
  );
}
