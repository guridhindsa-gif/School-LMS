'use client';
import { cx } from '@/components/ui';

/** Segmented choice used by the middle-school labs (radio semantics, keyboard focusable). */
export function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg flex-wrap" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className="min-h-8">{l}</button>)}
    </div>
  );
}

export const btn = (on?: boolean) => cx('btn min-h-10 border text-sm', on ? 'border-primary bg-primary text-onprimary' : 'border-line bg-surface hover:bg-surface2');

/** Format a number for display: integers stay integers, others get up to `d` decimals. */
export const fmt = (v: number, d = 2) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(d))));

export const C = {
  ink: 'rgb(var(--ink))', muted: 'rgb(var(--muted))', line: 'rgb(var(--line))', surface: 'rgb(var(--surface))', s2: 'rgb(var(--surface-2))',
  primary: 'rgb(var(--primary))', teal: 'rgb(var(--teal))', accent: 'rgb(var(--accent))', bad: 'rgb(var(--bad))', good: 'rgb(var(--good))', violet: 'rgb(var(--violet))',
};
