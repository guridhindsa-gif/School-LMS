'use client';
import { useT } from '@/lib/i18n';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Confetti } from '../Confetti';
import { cx } from '../ui';

const say = (t: string, lang = 'en-IN') => { try { const u = new SpeechSynthesisUtterance(t); u.lang = lang; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* no audio */ } };

function Mango() {
  return (
    <svg viewBox="0 0 44 50" width="44" height="50" aria-hidden>
      <path d="M22 8c11 0 18 10 17 22-1 11-9 18-18 18S4 41 5 30C6 17 12 8 22 8z" fill="#f2a516" />
      <path d="M22 9c2-5 7-7 12-6-2 5-7 7-12 6z" fill="#3f9a4d" />
      <ellipse cx="15" cy="22" rx="4" ry="6" fill="#fff" opacity=".35" />
    </svg>
  );
}

/** Foundational stage: count mangoes that drop into a basket; voice instructions. */
export default function CountingLab() {
  const [n, setN] = useState(3);
  const { t, locale } = useT();
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [right, setRight] = useState(false);
  const [fire, setFire] = useState(0);

  useEffect(() => { setN(prev => { let x; do { x = 2 + Math.floor(Math.random() * 7); } while (x === prev); return x; }); setRight(false); setWrong(null); }, [round]);

  function tap(k: number) {
    if (right) return;
    if (k === n) {
      setRight(true); setStars(s => Math.min(5, s + 1)); setFire(f => f + 1); say(t('lb.cnt.well', { n }), locale);
      setTimeout(() => setRound(r => r + 1), 1500);
    } else { setWrong(k); say(t('lb.cnt.again'), locale); setTimeout(() => setWrong(null), 500); }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-2xl">{t('lb.cnt.q')}</h3>
        <button className="btn-primary" onClick={() => say(t('lb.cnt.q'), locale)}><Volume2 size={17} aria-hidden /> {t('common.listen')}</button>
        <div className="ml-auto flex gap-1" role="img" aria-label={t('lb.cnt.stars', { n: stars })}>
          {Array.from({ length: 5 }, (_, i) => <Star key={i} size={24} className={i < stars ? 'fill-accent text-accent' : 'text-line'} aria-hidden />)}
        </div>
      </div>
      <div className="relative h-60 overflow-hidden rounded-card bg-gradient-to-b from-primary/10 to-surface2" role="img" aria-label={t('lb.cnt.basket')}>
        <AnimatePresence>
          {Array.from({ length: n }, (_, i) => (
            <motion.div key={`${round}-${i}`} className="absolute" style={{ left: `calc(50% - 150px + ${(i / Math.max(1, n - 1)) * 260}px)`, bottom: 58 + (i % 2) * 18 }}
              initial={{ y: -260, rotate: -30 }} animate={{ y: 0, rotate: 0 }} exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: i * 0.12 }}>
              <Mango />
            </motion.div>
          ))}
        </AnimatePresence>
        <svg className="absolute bottom-2 left-1/2 h-20 w-[min(340px,85%)] -translate-x-1/2" viewBox="0 0 320 84" preserveAspectRatio="none" aria-hidden>
          <path d="M6 10h308l-26 70H32z" fill="#b5772f" /><path d="M6 10h308" stroke="#8a5520" strokeWidth="10" strokeLinecap="round" />
          <path d="M40 30h240M48 50h224" stroke="#8a5520" strokeWidth="3" opacity=".6" />
        </svg>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(k => (
          <motion.button key={k} onClick={() => tap(k)} whileTap={{ scale: 0.92 }} aria-label={t('lb.cnt.btn', { n: k })}
            animate={wrong === k ? { x: [0, -6, 6, -4, 0] } : right && k === n ? { scale: [1, 1.2, 1] } : {}}
            className={cx('rounded-2xl py-3 font-display text-3xl font-extrabold transition', right && k === n ? 'bg-good text-white' : wrong === k ? 'bg-bad/15 text-bad' : 'bg-surface2 hover:bg-surface3')}>{k}</motion.button>
        ))}
      </div>
      <p className="sr-only" role="status">{right ? t('lb.cnt.correct', { n }) : wrong ? t('lb.cnt.notQuite') : ''}</p>
      <p className="text-sm text-muted">{t('lb.cnt.note')}</p>
      <Confetti fire={fire} />
    </div>
  );
}
