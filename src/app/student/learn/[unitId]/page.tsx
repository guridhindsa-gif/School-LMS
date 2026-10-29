import { notFound } from 'next/navigation';
import { resolveUnit } from '@/lib/context';
import { LearnView } from './LearnView';

export default function LearnPage({ params }: { params: { unitId: string } }) {
  const r = resolveUnit(decodeURIComponent(params.unitId));
  if (!r) notFound();
  return <LearnView r={r} />;
}

export function generateMetadata({ params }: { params: { unitId: string } }) {
  const r = resolveUnit(decodeURIComponent(params.unitId));
  return { title: r ? r.title : 'Lesson' };
}
