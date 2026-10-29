import { notFound } from 'next/navigation';
import { getExam } from '@/lib/syllabus';
import { MockView } from './MockView';

export const metadata = { title: 'Mock test' };

export default function MockPage({ params }: { params: { id: string } }) {
  const e = getExam(params.id);
  if (!e) notFound();
  const units = e.subjects.flatMap(s => s.units.map(u => ({ id: u.id, name: u.name, subject: s.name })));
  return <MockView exam={{ id: e.id, name: e.name, marking: e.marking, sections: e.subjects.map(s => s.name) }} units={units} />;
}
