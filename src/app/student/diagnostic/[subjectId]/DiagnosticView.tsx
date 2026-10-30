'use client';
import { useEffect } from 'react';
import { Crumbs } from '@/components/Crumbs';
import { QuizRunner } from '@/components/QuizRunner';
import { Reveal, Skeleton } from '@/components/ui';
import { useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import { useT } from '@/lib/i18n';

export function DiagnosticView({ subject, units }: { subject: { id: string; name: string; board: string; cls: number }; units: { id: string; name: string }[] }) {
  const hydrated = useHydrated();
  const { t } = useT();
  const setContext = useTutor(s => s.setContext);
  const ctx = { kind: 'board' as const, board: subject.board, cls: subject.cls, subject: subject.name };
  useEffect(() => { setContext({ ...ctx, units: units.map(u => u.name) }, subject.name); }, [subject.name]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5">
      <Reveal>
        <Crumbs items={[{ label: `${subject.board} · ${t('shell.class', { n: subject.cls })}`, href: '/student/syllabus' }, { label: subject.name, href: `/student/subject/${encodeURIComponent(subject.id)}` }]} />
        <h1 className="h-page mt-3">{t('qp.diagTitle', { subject: subject.name })}</h1>
        <p className="mt-1 max-w-2xl text-muted">{t('qp.diagDesc')}</p>
      </Reveal>
      {hydrated ? <QuizRunner mode="diagnostic" ctx={ctx} units={units} doneHref={`/student/subject/${encodeURIComponent(subject.id)}`} /> : <Skeleton lines={6} />}
    </div>
  );
}
