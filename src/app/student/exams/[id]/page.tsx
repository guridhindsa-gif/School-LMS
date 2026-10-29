import { notFound } from 'next/navigation';
import { getExam } from '@/lib/syllabus';
import { ExamView } from './ExamView';

export default function ExamPage({ params }: { params: { id: string } }) {
  const e = getExam(params.id);
  if (!e) notFound();
  return <ExamView exam={e} />;
}

export function generateMetadata({ params }: { params: { id: string } }) {
  return { title: getExam(params.id)?.name ?? 'Exam' };
}
