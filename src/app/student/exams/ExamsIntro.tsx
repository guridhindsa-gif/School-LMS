'use client';
import { useEffect } from 'react';
import { PageHeader } from '@/components/ui';
import { useTutor } from '@/lib/tutor-store';
import { useT } from '@/lib/i18n';

export function ExamsIntro() {
  const setContext = useTutor(s => s.setContext);
  const { t } = useT();
  useEffect(() => { setContext({ kind: 'exam', exam: 'Indian entrance exams (JEE, NEET, CUET, CLAT, NDA, Olympiads)' }, 'Exam guidance'); }, [setContext]);
  return (
    <PageHeader eyebrow={t('exams.eyebrow')} title={t('exams.title')} desc={t('exams.desc')} />
  );
}
