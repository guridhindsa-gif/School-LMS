'use client';
import { useEffect } from 'react';
import { Crumbs } from '@/components/Crumbs';
import { QuizRunner } from '@/components/QuizRunner';
import { Reveal, Skeleton } from '@/components/ui';
import { useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

export function DiagnosticView({ subject, units }: { subject: { id: string; name: string; board: string; cls: number }; units: { id: string; name: string }[] }) {
  const hydrated = useHydrated();
  const setContext = useTutor(s => s.setContext);
  const ctx = { kind: 'board' as const, board: subject.board, cls: subject.cls, subject: subject.name };
  useEffect(() => { setContext({ ...ctx, units: units.map(u => u.name) }, subject.name); }, [subject.name]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5">
      <Reveal>
        <Crumbs items={[{ label: `${subject.board} · Class ${subject.cls}`, href: '/student/syllabus' }, { label: subject.name, href: `/student/subject/${encodeURIComponent(subject.id)}` }]} />
        <h1 className="h-page mt-3">Find my level · {subject.name}</h1>
        <p className="mt-1 max-w-2xl text-muted">A short mixed test across all chapters. Your answers set a starting mastery for each chapter, so the plan on your home page fits you from day one.</p>
      </Reveal>
      {hydrated ? <QuizRunner mode="diagnostic" ctx={ctx} units={units} doneHref={`/student/subject/${encodeURIComponent(subject.id)}`} /> : <Skeleton lines={6} />}
    </div>
  );
}
