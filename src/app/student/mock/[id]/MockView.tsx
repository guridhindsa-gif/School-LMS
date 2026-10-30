'use client';
import { useEffect } from 'react';
import { Crumbs } from '@/components/Crumbs';
import { QuizRunner } from '@/components/QuizRunner';
import { Reveal, Skeleton } from '@/components/ui';
import { useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import { useT } from '@/lib/i18n';

export function MockView({ exam, units }: { exam: { id: string; name: string; marking: [number, number]; sections: string[] }; units: { id: string; name: string; subject: string }[] }) {
  const hydrated = useHydrated();
  const { t } = useT();
  const setContext = useTutor(s => s.setContext);
  const ctx = { kind: 'exam' as const, exam: exam.name, examId: exam.id, units: units.map(u => u.name).slice(0, 50) };
  useEffect(() => { setContext(ctx, t('qp.mockCtx', { exam: exam.name })); }, [exam.name]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5">
      <Reveal>
        <Crumbs items={[{ label: t('exams.eyebrow'), href: '/student/exams' }, { label: exam.name, href: `/student/exams/${exam.id}` }, { label: t('qp.mock') }]} />
        <h1 className="h-page mt-3">{t('qp.mockTitle', { exam: exam.name })}</h1>
        <p className="mt-1 max-w-2xl text-muted">{t('qp.mockDesc', { sections: exam.sections.join(', '), marking: `+${exam.marking[0]}${exam.marking[1] ? ` / −${exam.marking[1]}` : ''}` })}</p>
      </Reveal>
      {hydrated ? <QuizRunner mode="mock" ctx={ctx} units={units} marking={exam.marking} doneHref={`/student/exams/${exam.id}`} /> : <Skeleton lines={6} />}
    </div>
  );
}
