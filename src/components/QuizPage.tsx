'use client';
import { useEffect } from 'react';
import { Crumbs } from './Crumbs';
import { QuizRunner, type QuizMode } from './QuizRunner';
import { Reveal, Skeleton } from './ui';
import { Gauge, PencilLine, Stethoscope, Timer } from 'lucide-react';

const ICON = { adaptive: Gauge, test: PencilLine, diagnostic: Stethoscope, mock: Timer };
import { useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { ResolvedUnit } from '@/lib/context';

const TITLES: Record<QuizMode, [string, string]> = {
  adaptive: ['Adaptive practice', 'Questions get harder or easier based on your answers. Use hints when stuck — they count a little less.'],
  test: ['Chapter test', '10 questions, timed. You will see answers and explanations after you submit.'],
  diagnostic: ['Find my level', 'A short mixed test across the subject that sets your starting point for each chapter.'],
  mock: ['Mock test', 'Full exam-style questions with the real marking scheme.'],
};

export function QuizPage({ r, mode, marking }: { r: ResolvedUnit; mode: QuizMode; marking?: [number, number] }) {
  const hydrated = useHydrated();
  const setContext = useTutor(s => s.setContext);
  useEffect(() => { setContext(r.ctx, r.title.slice(0, 40)); }, [r, setContext]);
  const enc = encodeURIComponent(r.unitId);
  const Icon = ICON[mode];
  return (
    <div className="grid gap-5">
      <Reveal className="grid gap-3">
        <Crumbs items={[...r.crumbs, { label: r.title, href: `/student/learn/${enc}` }]} />
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ctl bg-primary/10 text-primary"><Icon size={22} /></span>
          <div className="grid min-w-0 gap-1">
            <h1 className="h-page">{TITLES[mode][0]}</h1>
            <p className="max-w-2xl text-muted">{TITLES[mode][1]}</p>
          </div>
        </div>
      </Reveal>
      {hydrated ? (
        <QuizRunner mode={mode} ctx={r.ctx} marking={marking}
          chapter={{ id: r.unitId, name: r.title, subject: r.ctx.subject || r.ctx.exam || '', kind: r.ctx.kind }}
          doneHref={`/student/learn/${enc}`} />
      ) : <Skeleton lines={6} />}
    </div>
  );
}
