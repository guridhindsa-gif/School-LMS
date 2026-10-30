'use client';
import { Check } from 'lucide-react';
import { cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import type { ReviewState } from '@/lib/school-store';

const STEPS: ReviewState[] = ['draft', 'review', 'approved'];

/** Draft → In review → Approved, shown as a compact stepper. */
export function ReviewSteps({ state }: { state: ReviewState }) {
  const { t } = useT();
  const at = STEPS.indexOf(state);
  return (
    <ol className="flex flex-wrap items-center gap-1 text-xs font-semibold" aria-label={t('teacher.step.aria', { s: t(`teacher.step.${state}`) })}>
      {STEPS.map((id, i) => (
        <li key={id} className="flex items-center gap-1">
          <span className={cx('flex items-center gap-1 rounded-full px-2 py-0.5',
            i < at && 'bg-good/15 text-good', i === at && (id === 'approved' ? 'bg-good text-white' : 'bg-primary text-onprimary'), i > at && 'bg-surface2 text-muted')}
            aria-current={i === at ? 'step' : undefined}>
            {i < at || (id === 'approved' && i === at) ? <Check size={11} aria-hidden /> : null}{t(`teacher.step.${id}`)}
          </span>
          {i < STEPS.length - 1 && <span className={cx('h-px w-3', i < at ? 'bg-good' : 'bg-line')} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
