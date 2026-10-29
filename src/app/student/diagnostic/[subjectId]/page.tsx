import { notFound } from 'next/navigation';
import { getSubject } from '@/lib/syllabus';
import { DiagnosticView } from './DiagnosticView';

export const metadata = { title: 'Find my level' };

export default function DiagnosticPage({ params }: { params: { subjectId: string } }) {
  const s = getSubject(decodeURIComponent(params.subjectId));
  if (!s || !s.units.length) notFound();
  return (
    <DiagnosticView
      subject={{ id: s.id, name: s.name, board: s.board, cls: s.cls }}
      units={s.units.map(u => ({ id: u.id, name: u.name }))}
    />
  );
}
