import { notFound } from 'next/navigation';
import { resolveUnit } from '@/lib/context';
import { QuizPage } from '@/components/QuizPage';

export const metadata = { title: 'Adaptive practice' };

export default function PracticePage({ params }: { params: { unitId: string } }) {
  const r = resolveUnit(decodeURIComponent(params.unitId));
  if (!r) notFound();
  return <QuizPage r={r} mode="adaptive" />;
}
