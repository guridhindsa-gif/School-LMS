'use client';
import { useEffect } from 'react';
import { Reveal } from '@/components/ui';
import { useTutor } from '@/lib/tutor-store';

export function ExamsIntro() {
  const setContext = useTutor(s => s.setContext);
  useEffect(() => { setContext({ kind: 'exam', exam: 'Indian entrance exams (JEE, NEET, CUET, CLAT, NDA, Olympiads)' }, 'Exam guidance'); }, [setContext]);
  return (
    <Reveal>
      <p className="eyebrow">Competitive exams</p>
      <h1 className="text-3xl">Every entrance and Olympiad on the track map</h1>
      <p className="max-w-2xl text-muted">Syllabus and pattern from each exam body's official site. Learn any unit with the AI tutor, practise adaptively, or take a full-pattern mock with real marking.</p>
    </Reveal>
  );
}
