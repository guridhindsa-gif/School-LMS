'use client';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import type { MasteryBand } from '@/lib/adaptive';

export const cx = clsx;

export function Card({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <As className={cx('card p-5', className)}>{children}</As>;
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0.001, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Animated mastery ring (0..1). */
export function Ring({ value, size = 64, stroke = 7, label, color }: { value: number; size?: number; stroke?: number; label?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  const col = color || masteryColor(v);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--surface-2))" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute font-display font-bold tabular-nums" style={{ fontSize: size * 0.26 }}>{label ?? `${Math.round(v * 100)}%`}</span>
    </div>
  );
}

/** Mastery colour scale: amber (started) → indigo (practising) → teal-green (strong). Never red for a learner who is trying. */
export function masteryColor(v: number) {
  return v >= 0.8 ? 'rgb(var(--good))' : v >= 0.5 ? 'rgb(var(--primary))' : v > 0 ? 'rgb(var(--accent))' : 'rgb(var(--line))';
}

export function Bar({ value, color, className }: { value: number; color?: string; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-surface2', className)}>
      <motion.div className="h-full rounded-full" style={{ background: color || masteryColor(v) }}
        initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

const BAND: Record<MasteryBand, [string, string]> = {
  new: ['Not started', 'bg-surface2 text-muted'],
  learning: ['Learning', 'bg-accent/20 text-warn'],
  practising: ['Practising', 'bg-primary/12 text-primary'],
  strong: ['Strong', 'bg-good/15 text-good'],
  mastered: ['Mastered', 'bg-good text-white'],
};
export function BandPill({ band }: { band: MasteryBand }) {
  return <span className={cx('pill', BAND[band][1])}>{BAND[band][0]}</span>;
}

export function VerifiedPill({ v }: { v: string | boolean }) {
  if (v === 'draft') return <span className="pill bg-marigold/20 text-warn">Draft · not from official PDF</span>;
  if (v === 'secondary_only' || v === false) return <span className="pill bg-marigold/20 text-warn">Verify</span>;
  if (v === 'partly_official') return <span className="pill bg-primary/12 text-primary">Partly verified</span>;
  return <span className="pill bg-good/15 text-good">Official syllabus</span>;
}

export function Skeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skeleton h-4" style={{ width: `${92 - (i % 3) * 14}%` }} />)}
    </div>
  );
}

export function Dots() {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map(i => (
        <motion.i key={i} className="block h-2 w-2 rounded-full bg-primary"
          animate={{ y: [0, -5, 0], opacity: [1, 0.5, 1] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}

export function Empty({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-card border border-dashed border-line bg-surface/60 p-10 text-center">
      {icon && <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</span>}
      <h3 className="text-xl">{title}</h3>
      {children && <p className="max-w-md text-muted">{children}</p>}
      {action}
    </div>
  );
}

export function host(u?: string | null) {
  if (!u) return '';
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'link'; }
}

/** Consistent page heading: eyebrow, title, description and actions. */
export function PageHeader({ eyebrow, title, desc, actions, className }: { eyebrow?: ReactNode; title: ReactNode; desc?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <Reveal className={cx('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="grid min-w-0 max-w-3xl gap-1.5">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="h-page">{title}</h1>
        {desc && <p className="text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </Reveal>
  );
}

const TONE = {
  info: 'border-primary/25 bg-primary/[.07] text-ink',
  success: 'border-good/30 bg-good/10 text-ink',
  warn: 'border-accent/40 bg-accent/10 text-ink',
  error: 'border-bad/30 bg-bad/10 text-ink',
};
/** Inline feedback. Errors are announced immediately; others politely. */
export function Notice({ tone = 'info', title, children, action, className }: { tone?: keyof typeof TONE; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex flex-wrap items-start gap-3 rounded-ctl border px-4 py-3 text-sm', TONE[tone], className)}>
      <div className="grid min-w-0 flex-1 gap-0.5">
        {title && <b className={cx(tone === 'error' && 'text-bad', tone === 'success' && 'text-good')}>{title}</b>}
        {children && <div className="text-muted">{children}</div>}
      </div>
      {action}
    </div>
  );
}

/** Small label for numbers that come from sample (not live) data. */
export function SampleBadge({ children = 'Sample data' }: { children?: ReactNode }) {
  return <span className="pill border border-dashed border-line bg-surface text-muted" title="These figures are illustrative until the school data service is connected">{children}</span>;
}

/** Keeps keyboard focus inside a dialog, closes on Escape and returns focus to the opener. */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const sel = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el || el.contains(document.activeElement)) return;
      (el.querySelector<HTMLElement>('[data-autofocus]') || el.querySelector<HTMLElement>(sel))?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); close.current(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(sel)).filter(n => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey, true); try { opener?.focus(); } catch { /* gone */ } };
  }, [active, ref]);
}
