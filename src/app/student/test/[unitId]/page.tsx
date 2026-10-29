import { notFound } from 'next/navigation';
import { resolveUnit } from '@/lib/context';
import { QuizPage } from '@/components/QuizPage';
import { getExam } from '@/lib/syllabus';

export const metadata = { title: 'Chapter test' };

export default function TestPage({ params }: { params: { unitId: string } }) {
  const r = resolveUnit(decodeURIComponent(params.unitId));
  if (!r) notFound();
  const marking = r.examId ? getExam(r.examId)?.marking : undefined;
  return <QuizPage r={r} mode="test" marking={marking} />;
}
