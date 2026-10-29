import Link from 'next/link';
import { ArrowRight, Atom, Compass, GraduationCap, Medal } from 'lucide-react';
import { listExams } from '@/lib/syllabus';
import { ExamsIntro } from './ExamsIntro';

export const metadata = { title: 'Competitive exams' };

const GROUPS: [string, string[], typeof Atom][] = [
  ['Engineering & medical', ['jee_main', 'jee_adv', 'neet', 'bitsat'], Atom],
  ['University, law, management & defence', ['cuet', 'clat', 'ipmat', 'nda'], GraduationCap],
  ['Design & architecture', ['nata', 'uceed'], Compass],
  ['Olympiads', ['ioqm', 'nse'], Medal],
];

export default function ExamsPage() {
  const exams = listExams();
  const by = Object.fromEntries(exams.map(e => [e.id, e]));
  return (
    <div className="grid gap-8">
      <ExamsIntro />
      {GROUPS.map(([g, ids, Icon]) => (
        <section key={g} className="grid gap-3" aria-label={g}>
          <h2 className="flex items-center gap-2 text-lg"><span className="grid h-8 w-8 place-items-center rounded-ctl bg-primary/10 text-primary"><Icon size={16} /></span>{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ids.filter(id => by[id]).map(id => {
              const e = by[id];
              const units = e.subjects.reduce((a, s) => a + s.units.length, 0);
              return (
                <Link key={id} href={`/student/exams/${id}`} className="card card-hover group grid gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <b className="font-display text-lg leading-tight">{e.name}</b>
                    {e.verified ? <span className="pill bg-good/15 text-good">Official</span> : <span className="pill bg-accent/20 text-warn">Verify</span>}
                  </div>
                  <span className="text-sm text-muted">{[e.by, e.year].filter(Boolean).join(' · ')}</span>
                  <span className="text-sm">{e.subjects.length} {e.subjects.length === 1 ? 'section' : 'sections'} · {units} units</span>
                  <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-semibold text-primary">Open syllabus <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
