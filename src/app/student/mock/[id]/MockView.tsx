'use client';
import { useEffect } from 'react';
import { Crumbs } from '@/components/Crumbs';
import { QuizRunner } from '@/components/QuizRunner';
import { Reveal, Skeleton } from '@/components/ui';
import { useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

export function MockView({ exam, units }: { exam: { id: string; name: string; marking: [number, number]; sections: string[] }; units: { id: string; name: string; subject: string }[] }) {
  const hydrated = useHydrated();
  const setContext = useTutor(s => s.setContext);
  const ctx = { kind: 'exam' as const, exam: exam.name, examId: exam.id, units: units.map(u => u.name).slice(0, 50) };
  useEffect(() => { setContext(ctx, `${exam.name} mock`); }, [exam.name]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5">
      <Reveal>
        <Crumbs items={[{ label: 'Competitive exams', href: '/student/exams' }, { label: exam.name, href: `/student/exams/${exam.id}` }, { label: 'Mock test' }]} />
        <h1 className="mt-2 text-3xl">{exam.name} · mock test</h1>
        <p className="text-muted">15 questions across {exam.sections.join(', ')}. Marking +{exam.marking[0]}{exam.marking[1] ? ` / −${exam.marking[1]}` : ''}. Units you get wrong feed your adaptive plan.</p>
      </Reveal>
      {hydrated ? <QuizRunner mode="mock" ctx={ctx} units={units} marking={exam.marking} doneHref={`/student/exams/${exam.id}`} /> : <Skeleton lines={6} />}
    </div>
  );
}
