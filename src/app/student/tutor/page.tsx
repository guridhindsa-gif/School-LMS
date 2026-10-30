'use client';
import { useEffect } from 'react';
import { TutorChat } from '@/components/TutorChat';
import { Lightbulb, MessageSquareText, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import { useT } from '@/lib/i18n';

export default function TutorPage() {
  const profile = useLMS(s => s.profile);
  const { t } = useT();
  const setContext = useTutor(s => s.setContext);
  const ctx = useTutor(s => s.ctx);
  useEffect(() => {
    // keep a chapter context if the student arrived from a lesson; otherwise use their class
    if (!ctx?.unit && profile.board) setContext({ kind: 'board', board: profile.board, cls: profile.cls }, `${profile.board} · ${profile.cls === 13 ? t('shell.repeater') : t('shell.class', { n: profile.cls ?? '' })}`);
  }, [profile.board, profile.cls]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5">
      <PageHeader eyebrow={t('tp.eyebrow')} title={t('tp.title')} desc={t('tp.desc')} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="card min-w-0 p-4 sm:p-5" aria-label={t('tp.conversation')}><TutorChat /></section>
        <aside className="hidden content-start gap-3 xl:grid" aria-label={t('tp.modes')}>
          {[
            [Lightbulb, 'tp.guide', 'tp.guideDesc', 'text-warn bg-accent/15'],
            [MessageSquareText, 'tp.explain', 'tp.explainDesc', 'text-primary bg-primary/10'],
            [CheckCheck, 'tp.check', 'tp.checkDesc', 'text-teal bg-teal/12'],
          ].map(([Icon, k, d, c]) => {
            const I = Icon as typeof Lightbulb;
            return (
              <div key={k as string} className="card flex gap-3 p-4">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-ctl ${c}`} aria-hidden><I size={17} /></span>
                <div><b className="block">{t(k as string)}</b><span className="text-sm text-muted">{t(d as string)}</span></div>
              </div>
            );
          })}
          <p className="px-1 text-xs text-muted">{t('tp.note')}</p>
        </aside>
      </div>
    </div>
  );
}
