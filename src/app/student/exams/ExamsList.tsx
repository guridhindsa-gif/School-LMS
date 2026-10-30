'use client';
import Link from 'next/link';
import { ArrowRight, Atom, Compass, GraduationCap, Medal } from 'lucide-react';
import { useT } from '@/lib/i18n';

export interface ExamCard { id: string; name: string; meta: string; verified: boolean; sections: number; units: number }

const GROUPS: [string, string[], typeof Atom][] = [
  ['exams.g.eng', ['jee_main', 'jee_adv', 'neet', 'bitsat'], Atom],
  ['exams.g.uni', ['cuet', 'clat', 'ipmat', 'nda'], GraduationCap],
  ['exams.g.design', ['nata', 'uceed'], Compass],
  ['exams.g.olymp', ['ioqm', 'nse'], Medal],
];

/** Exam catalogue grouped by purpose (client so headings follow the interface language). */
export function ExamsList({ exams }: { exams: ExamCard[] }) {
  const { t } = useT();
  const by = Object.fromEntries(exams.map(e => [e.id, e]));
  return (
    <>
      {GROUPS.map(([g, ids, Icon]) => (
        <section key={g} className="grid gap-3" aria-labelledby={`eg-${g}`}>
          <h2 id={`eg-${g}`} className="flex items-center gap-2 text-lg"><span className="grid h-8 w-8 place-items-center rounded-ctl bg-primary/10 text-primary" aria-hidden><Icon size={16} /></span>{t(g)}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ids.filter(id => by[id]).map(id => {
              const e = by[id];
              return (
                <Link key={id} href={`/student/exams/${id}`} className="card card-hover group grid gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <b className="font-display text-lg leading-tight">{e.name}</b>
                    {e.verified ? <span className="pill bg-good/15 text-good">{t('exams.official')}</span> : <span className="pill bg-accent/20 text-warn">{t('exams.verify')}</span>}
                  </div>
                  <span className="text-sm text-muted">{e.meta}</span>
                  <span className="text-sm">{e.sections === 1 ? t('exams.section1', { u: e.units }) : t('exams.sections', { s: e.sections, u: e.units })}</span>
                  <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-semibold text-primary">{t('exams.open')} <ArrowRight size={15} aria-hidden className="transition group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
