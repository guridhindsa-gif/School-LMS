import { notFound } from 'next/navigation';
import { getSubject } from '@/lib/syllabus';
import { SubjectView } from './SubjectView';

export default function SubjectPage({ params }: { params: { id: string } }) {
  const subject = getSubject(decodeURIComponent(params.id));
  if (!subject) notFound();
  return <SubjectView subject={subject} />;
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const s = getSubject(decodeURIComponent(params.id));
  return { title: s ? `${s.name} · Class ${s.cls}` : 'Subject' };
}
