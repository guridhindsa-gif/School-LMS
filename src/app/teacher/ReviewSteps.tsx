'use client';
import { Check } from 'lucide-react';
import { cx } from '@/components/ui';
import type { ReviewState } from '@/lib/school-store';

const STEPS: { id: ReviewState; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'In review' },
  { id: 'approved', label: 'Approved' },
];

/** Draft → In review → Approved, shown as a compact stepper. */
export function ReviewSteps({ state }: { state: ReviewState }) {
  const at = STEPS.findIndex(s => s.id === state);
  return (
    <ol className="flex items-center gap-1 text-xs font-semibold" aria-label={`Review status: ${STEPS[at].label}`}>
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex items-center gap-1">
          <span className={cx('flex items-center gap-1 rounded-full px-2 py-0.5',
            i < at && 'bg-good/15 text-good', i === at && (s.id === 'approved' ? 'bg-good text-white' : 'bg-primary text-onprimary'), i > at && 'bg-surface2 text-muted')}
            aria-current={i === at ? 'step' : undefined}>
            {i < at || (s.id === 'approved' && i === at) ? <Check size={11} aria-hidden /> : null}{s.label}
          </span>
          {i < STEPS.length - 1 && <span className={cx('h-px w-3', i < at ? 'bg-good' : 'bg-line')} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
