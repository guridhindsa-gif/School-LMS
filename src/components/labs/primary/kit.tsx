'use client';
/** Shared building blocks for the junior (Classes 1–5) labs: big buttons, Listen, stars, feedback. */
import { Volume2 } from 'lucide-react';
import { useCallback, type ReactNode } from 'react';
import { Star } from '@/components/art';
import { cx } from '../../ui';
import { localeOf, useT } from '@/lib/i18n';

/** Speak a short instruction in the learner's language (no-op where speech is unavailable). */
export function useSay() {
  const { lang } = useT();
  return useCallback((text: string) => {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = localeOf(lang); u.rate = 0.9; speechSynthesis.speak(u); } catch { /* no audio */ }
  }, [lang]);
}

export function Listen({ text, className }: { text: string; className?: string }) {
  const say = useSay();
  const { t } = useT();
  return (
    <button type="button" onClick={() => say(text)} aria-label={`${t('common.listen')}: ${text}`}
      className={cx('inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-primary px-4 font-semibold text-onprimary shadow-soft hover:bg-primary2', className)}>
      <Volume2 size={18} aria-hidden /><span className="hidden sm:inline">{t('common.listen')}</span>
    </button>
  );
}

/** Instruction line with its Listen button. */
export function Ask({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="min-w-0 flex-1 font-display text-xl font-bold leading-snug sm:text-2xl">{text}</p>
      <Listen text={text} />
      {children}
    </div>
  );
}

export function Stars({ n, of = 3, label }: { n: number; of?: number; label: string }) {
  return <span className="inline-flex gap-1" role="img" aria-label={label}>{Array.from({ length: of }, (_, i) => <Star key={i} size={26} filled={i < n} />)}</span>;
}

export function Big({ children, onClick, active, tone = 'soft', label, disabled, className }: { children: ReactNode; onClick: () => void; active?: boolean; tone?: 'soft' | 'primary' | 'good' | 'bad'; label?: string; disabled?: boolean; className?: string }) {
  const tones = { soft: 'bg-surface2 hover:bg-surface3 text-ink', primary: 'bg-primary text-onprimary hover:bg-primary2', good: 'bg-good text-white', bad: 'bg-bad/15 text-bad' };
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={active} disabled={disabled}
      className={cx('inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-2xl px-4 text-lg font-bold transition active:scale-95 disabled:opacity-60', tones[tone], active && 'ring-4 ring-primary/40', className)}>
      {children}
    </button>
  );
}

/** Polite live feedback line (correct = cheerful, else gentle). */
export function Feedback({ ok, text }: { ok: boolean | null; text: string }) {
  return (
    <p role="status" aria-live="polite" className={cx('min-h-8 rounded-xl px-3 py-1.5 text-lg font-semibold', ok === true && 'bg-good/10 text-good', ok === false && 'bg-accent/15 text-warn')}>
      {ok === null ? '' : text}
    </p>
  );
}

export const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
