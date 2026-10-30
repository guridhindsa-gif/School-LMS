import { listExams } from '@/lib/syllabus';
import { ExamsIntro } from './ExamsIntro';
import { ExamsList, type ExamCard } from './ExamsList';

export const metadata = { title: 'Competitive exams' };

export default function ExamsPage() {
  const exams: ExamCard[] = listExams().map(e => ({
    id: e.id, name: e.name, meta: [e.by, e.year].filter(Boolean).join(' · '), verified: !!e.verified,
    sections: e.subjects.length, units: e.subjects.reduce((a, s) => a + s.units.length, 0),
  }));
  return (
    <div className="grid gap-8">
      <ExamsIntro />
      <ExamsList exams={exams} />
    </div>
  );
}
