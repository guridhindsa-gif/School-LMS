import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listExams } from '@/lib/syllabus';
import { ExamsIntro } from './ExamsIntro';

export const metadata = { title: 'Competitive exams' };

const GROUPS: [string, string[]][] = [
  ['Engineering & medical', ['jee_main', 'jee_adv', 'neet', 'bitsat']],
  ['University, law, management & defence', ['cuet', 'clat', 'ipmat', 'nda']],
  ['Design & architecture', ['nata', 'uceed']],
  ['Olympiads', ['ioqm', 'nse']],
];

export default function ExamsPage() {
  const exams = listExams();
  const by = Object.fromEntries(exams.map(e => [e.id, e]));
  return (
    <div className="grid gap-8">
      <ExamsIntro />
      {GROUPS.map(([g, ids]) => (
        <section key={g} className="grid gap-3">
          <h2 className="text-lg text-muted">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ids.filter(id => by[id]).map(id => {
              const e = by[id];
              const units = e.subjects.reduce((a, s) => a + s.units.length, 0);
              return (
                <Link key={id} href={`/student/exams/${id}`} className="card group grid gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-2">
                    <b className="font-display text-lg leading-tight">{e.name}</b>
                    {e.verified ? <span className="pill bg-good/15 text-good">Official</span> : <span className="pill bg-marigold/20 text-warn">Verify</span>}
                  </div>
                  <span className="text-sm text-muted">{[e.by, e.year].filter(Boolean).join(' · ')}</span>
                  <span className="text-sm">{e.subjects.length} {e.subjects.length === 1 ? 'section' : 'sections'} · {units} units</span>
                  <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-board dark:text-marigold">Open syllabus <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
