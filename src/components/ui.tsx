'use client';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
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
  const col = color || (v >= 0.8 ? 'rgb(var(--good))' : v >= 0.5 ? 'rgb(var(--marigold))' : v > 0 ? 'rgb(var(--bad))' : 'rgb(var(--line))');
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

export function Bar({ value, color, className }: { value: number; color?: string; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-surface2', className)}>
      <motion.div className="h-full rounded-full" style={{ background: color || (v >= 0.8 ? 'rgb(var(--good))' : v >= 0.5 ? 'rgb(var(--marigold))' : 'rgb(var(--bad))') }}
        initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

const BAND: Record<MasteryBand, [string, string]> = {
  new: ['Not started', 'bg-surface2 text-muted'],
  learning: ['Learning', 'bg-bad/15 text-bad'],
  practising: ['Practising', 'bg-marigold/20 text-warn'],
  strong: ['Strong', 'bg-good/15 text-good'],
  mastered: ['Mastered', 'bg-good text-white'],
};
export function BandPill({ band }: { band: MasteryBand }) {
  return <span className={cx('pill', BAND[band][1])}>{BAND[band][0]}</span>;
}

export function VerifiedPill({ v }: { v: string | boolean }) {
  if (v === 'draft') return <span className="pill bg-marigold/20 text-warn">Draft · not from official PDF</span>;
  if (v === 'secondary_only' || v === false) return <span className="pill bg-marigold/20 text-warn">Verify</span>;
  if (v === 'partly_official') return <span className="pill bg-sky/15 text-sky">Partly verified</span>;
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
        <motion.i key={i} className="block h-2 w-2 rounded-full bg-marigold"
          animate={{ y: [0, -5, 0], opacity: [1, 0.5, 1] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-line p-8 text-center">
      <h3 className="text-lg">{title}</h3>
      {children && <p className="max-w-md text-muted">{children}</p>}
      {action}
    </div>
  );
}

export function host(u?: string | null) {
  if (!u) return '';
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'link'; }
}
