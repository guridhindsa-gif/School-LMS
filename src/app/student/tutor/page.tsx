'use client';
import { useEffect } from 'react';
import { TutorChat } from '@/components/TutorChat';
import { Reveal } from '@/components/ui';
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
    <div className="grid gap-4">
      <Reveal>
        <p className="eyebrow">AI tutor</p>
        <h1 className="text-3xl">Vidya, your study partner</h1>
        <p className="max-w-2xl text-muted">Guides you with questions and hints instead of handing over answers. Switch to <b>Explain</b> for a full explanation, or <b>Check my work</b> to find the first mistake in your working.</p>
      </Reveal>
      <section className="card p-4 sm:p-5"><TutorChat /></section>
    </div>
  );
}
