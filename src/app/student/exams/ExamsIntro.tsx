'use client';
import { useEffect } from 'react';
import { PageHeader } from '@/components/ui';
import { useTutor } from '@/lib/tutor-store';

export function ExamsIntro() {
  const setContext = useTutor(s => s.setContext);
  useEffect(() => { setContext({ kind: 'exam', exam: 'Indian entrance exams (JEE, NEET, CUET, CLAT, NDA, Olympiads)' }, 'Exam guidance'); }, [setContext]);
  return (
    <PageHeader eyebrow="Competitive exams" title="Every entrance and Olympiad on the track map"
      desc="Syllabus and pattern from each exam body's official site. Learn any unit with Vidya, practise adaptively, or take a full-pattern mock with real marking." />
  );
}
