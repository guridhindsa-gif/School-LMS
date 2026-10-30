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
import { useT } from '@/lib/i18n';


export function QuizPage({ r, mode, marking }: { r: ResolvedUnit; mode: QuizMode; marking?: [number, number] }) {
  const hydrated = useHydrated();
  const { t } = useT();
  const setContext = useTutor(s => s.setContext);
  useEffect(() => { setContext(r.ctx, r.title.slice(0, 40)); }, [r, setContext]);
  const enc = encodeURIComponent(r.unitId);
  const Icon = ICON[mode];
  return (
    <div className="grid gap-5">
      <Reveal className="grid gap-3">
        <Crumbs items={[...r.crumbs, { label: r.title, href: `/student/learn/${enc}` }]} />
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ctl bg-primary/10 text-primary" aria-hidden><Icon size={22} /></span>
          <div className="grid min-w-0 gap-1">
            <h1 className="h-page">{t(`qp.${mode}`)}</h1>
            <p className="max-w-2xl text-muted">{t(`qp.${mode}.desc`)}</p>
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
