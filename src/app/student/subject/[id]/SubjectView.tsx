'use client';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Play, Target, PencilLine, FlaskConical, Stethoscope } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BandPill, Bar, Reveal, Ring, VerifiedPill, cx, host } from '@/components/ui';
import { band } from '@/lib/adaptive';
import { labFor } from '@/components/labs/registry';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { Subject } from '@/lib/types';

export function SubjectView({ subject }: { subject: Subject }) {
  const skills = useLMS(s => s.skills);
  const setContext = useTutor(s => s.setContext);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    setContext({ kind: 'board', board: subject.board, cls: subject.cls, subject: subject.name, units: subject.units.map(u => u.name) }, subject.name);
  }, [subject, setContext]);

  const avg = subject.units.length ? subject.units.reduce((a, u) => a + (skills[u.id]?.attempts ? skills[u.id].pKnown : 0), 0) / subject.units.length : 0;
  const marks = [subject.theory != null && `Theory ${subject.theory}`, subject.practical != null && `${subject.cls >= 11 ? 'Practical / project' : 'Internal'} ${subject.practical}`].filter(Boolean).join(' · ');

  return (
    <div className="grid gap-6">
      <Reveal>
        <div className="card flex flex-wrap items-center gap-5 p-6">
          <Ring value={avg} size={84} stroke={9} />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <p className="eyebrow">{subject.board} · Class {subject.cls}</p>
            <h1 className="text-3xl">{subject.name}</h1>
            {subject.book && <p className="text-muted">Textbook: {subject.book}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <VerifiedPill v={subject.verified} />
              {subject.session && <span className="tag">{subject.session}</span>}
              {marks && <span className="tag">{marks}</span>}
              {subject.src && <a className="tag !text-sky hover:underline" href={subject.src} target="_blank" rel="noopener noreferrer">Source: {host(subject.src)} <ExternalLink size={11} className="ml-1" /></a>}
            </div>
            {subject.note && <p className="text-sm text-muted">{subject.note}</p>}
          </div>
          {subject.units.length > 0 && (
            <Link href={`/student/diagnostic/${encodeURIComponent(subject.id)}`} className="btn-primary"><Stethoscope size={17} /> Find my level</Link>
          )}
        </div>
      </Reveal>

      {!subject.units.length && (
        <p className="rounded-2xl border border-dashed border-warn/60 p-5 text-warn">The official PDF for this subject could not be read automatically{subject.src ? <> (<a href={subject.src} target="_blank" rel="noopener noreferrer" className="underline">source</a>)</> : null}. Units appear once the content team loads them.</p>
      )}

      <ol className="grid gap-3">
        {subject.units.map((u, i) => {
          const sk = skills[u.id];
          const b = band(sk);
          const lab = labFor(u.name, subject.cls);
          const isOpen = open === u.id;
          return (
            <Reveal key={u.id} delay={Math.min(i * 0.03, 0.3)}>
              <li className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface2 font-mono text-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <div className="grid min-w-0 flex-1 gap-1">
                    <b className="leading-snug">{u.name}</b>
                    {u.theme && <span className="text-xs text-muted">{u.theme}</span>}
                    <div className="flex flex-wrap items-center gap-2">
                      {u.marks != null && <span className="tag !bg-ink !text-bg">{u.marks} marks</span>}
                      <BandPill band={b} />
                      {sk?.attempts ? <span className="text-xs text-muted">{sk.correct}/{sk.attempts} correct</span> : null}
                    </div>
                    {sk?.attempts ? <Bar value={sk.pKnown} className="max-w-xs" /> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/student/learn/${encodeURIComponent(u.id)}`} className="btn-board text-sm"><Play size={15} /> Learn</Link>
                    <Link href={`/student/practice/${encodeURIComponent(u.id)}`} className="btn-ghost text-sm"><Target size={15} /> Practice</Link>
                    <Link href={`/student/test/${encodeURIComponent(u.id)}`} className="btn-ghost text-sm"><PencilLine size={15} /> Test</Link>
                    {lab && <Link href={`/student/labs?lab=${lab.id}`} className="btn-ghost text-sm" title={lab.title}><FlaskConical size={15} /> Lab</Link>}
                    {u.topics.length > 0 && (
                      <button className="btn-soft h-9 w-9 !px-0" aria-expanded={isOpen} aria-label={`${isOpen ? 'Hide' : 'Show'} sub-topics`} onClick={() => setOpen(isOpen ? null : u.id)}>
                        <ChevronDown size={17} className={cx('transition', isOpen && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <ul className="grid gap-1.5 border-t border-line bg-surface2/50 px-6 py-4 text-sm sm:grid-cols-2">
                        {u.topics.map(t => <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold" />{t}</li>)}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
