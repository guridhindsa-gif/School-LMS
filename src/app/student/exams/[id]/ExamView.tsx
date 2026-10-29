'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Play, Target, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Crumbs } from '@/components/Crumbs';
import { BandPill, Reveal, cx, host } from '@/components/ui';
import { band } from '@/lib/adaptive';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { Exam } from '@/lib/types';

export function ExamView({ exam }: { exam: Exam }) {
  const [sec, setSec] = useState(0);
  const skills = useLMS(s => s.skills);
  const setContext = useTutor(s => s.setContext);
  const sb = exam.subjects[sec];
  useEffect(() => { setContext({ kind: 'exam', exam: exam.name, examId: exam.id, subject: sb?.name }, exam.name); }, [exam, sb, setContext]);

  return (
    <div className="grid gap-6">
      <Reveal>
        <Crumbs items={[{ label: 'Competitive exams', href: '/student/exams' }, { label: exam.name }]} />
        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="grid min-w-0 flex-1 gap-1.5">
            <h1 className="text-3xl">{exam.name}</h1>
            <p className="text-muted">{[exam.by, exam.year].filter(Boolean).join(' · ')}</p>
            <div className="flex flex-wrap items-center gap-2">
              {exam.verified ? <span className="pill bg-good/15 text-good">Official syllabus</span> : <span className="pill bg-marigold/20 text-warn">Official site blocked automated reading · verify</span>}
              {exam.source && <a href={exam.source} target="_blank" rel="noopener noreferrer" className="tag !text-sky hover:underline">Source: {host(exam.source)} <ExternalLink size={11} className="ml-1" /></a>}
              <span className="tag">Marking +{exam.marking[0]}{exam.marking[1] ? ` / −${exam.marking[1]}` : ''}</span>
            </div>
          </div>
          <Link href={`/student/mock/${exam.id}`} className="btn-primary"><Timer size={17} /> Start mock test</Link>
        </div>
      </Reveal>

      {(exam.pattern.length > 0 || exam.eligibility) && (
        <Reveal delay={0.05}>
          <section className="card overflow-hidden p-0">
            {exam.pattern.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {exam.pattern.map(([k, v]) => (
                      <tr key={k} className="border-b border-line last:border-0"><th className="w-56 whitespace-nowrap bg-surface2/60 px-4 py-2.5 text-left font-semibold">{k}</th><td className="px-4 py-2.5">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {exam.eligibility && <p className="border-t border-line px-4 py-3 text-sm"><b>Eligibility:</b> {exam.eligibility}</p>}
            {exam.note && <p className="border-t border-line px-4 py-3 text-sm text-muted">{exam.note}</p>}
          </section>
        </Reveal>
      )}

      {exam.subjects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Subjects">
          {exam.subjects.map((s, i) => (
            <button key={s.name} role="tab" aria-selected={i === sec} onClick={() => setSec(i)} className={cx('relative shrink-0 rounded-full px-4 py-1.5 font-semibold', i === sec ? 'text-chalk' : 'bg-surface text-ink hover:bg-surface2')}>
              {i === sec && <motion.span layoutId="exam-sec" className="absolute inset-0 rounded-full bg-board" />}
              <span className="relative">{s.name} · {s.units.length}</span>
            </button>
          ))}
        </div>
      )}

      <ol className="grid gap-3">
        {sb?.units.map((u, i) => {
          const sk = skills[u.id];
          return (
            <motion.li key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="card flex flex-wrap items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface2 font-mono text-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
              <div className="grid min-w-0 flex-1 gap-1">
                <b>{u.name}</b>
                <div className="flex flex-wrap items-center gap-2">
                  {u.cls && <span className="tag">Class {u.cls}</span>}<BandPill band={band(sk)} />
                </div>
                {u.topics.length > 0 && <p className="line-clamp-2 text-sm text-muted">{u.topics.join(' · ')}</p>}
              </div>
              <div className="flex gap-2">
                <Link href={`/student/learn/${encodeURIComponent(u.id)}`} className="btn-board text-sm"><Play size={15} /> Learn</Link>
                <Link href={`/student/practice/${encodeURIComponent(u.id)}`} className="btn-ghost text-sm"><Target size={15} /> Practice</Link>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
