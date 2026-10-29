'use client';
import { useEffect } from 'react';
import { TutorChat } from '@/components/TutorChat';
import { Lightbulb, MessageSquareText, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

export default function TutorPage() {
  const profile = useLMS(s => s.profile);
  const setContext = useTutor(s => s.setContext);
  const ctx = useTutor(s => s.ctx);
  useEffect(() => {
    // keep a chapter context if the student arrived from a lesson; otherwise use their class
    if (!ctx?.unit && profile.board) setContext({ kind: 'board', board: profile.board, cls: profile.cls }, `${profile.board} · ${profile.cls === 13 ? 'Repeater' : `Class ${profile.cls}`}`);
  }, [profile.board, profile.cls]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="AI tutor" title="Vidya, your study partner" desc="Guides you with questions and hints instead of handing over answers. Answers come from your school's AI model and can be wrong, so check them against your textbook." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="card min-w-0 p-4 sm:p-5" aria-label="Conversation with Vidya"><TutorChat /></section>
        <aside className="hidden content-start gap-3 xl:grid" aria-label="Tutor modes">
          {[
            [Lightbulb, 'Guide me', 'Hints and questions that lead you to the answer yourself.', 'text-accent bg-accent/15'],
            [MessageSquareText, 'Explain', 'A clear explanation with a worked example.', 'text-primary bg-primary/10'],
            [CheckCheck, 'Check my work', 'Paste your working; Vidya finds the first mistake.', 'text-teal bg-teal/12'],
          ].map(([Icon, t, d, c]) => {
            const I = Icon as typeof Lightbulb;
            return (
              <div key={t as string} className="card flex gap-3 p-4">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-ctl ${c}`}><I size={17} /></span>
                <div><b className="block">{t as string}</b><span className="text-sm text-muted">{d as string}</span></div>
              </div>
            );
          })}
          <p className="px-1 text-xs text-muted">Pick a mode above the chat. Conversations last for this visit only.</p>
        </aside>
      </div>
    </div>
  );
}
