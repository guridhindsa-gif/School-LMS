'use client';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Play, Target, PencilLine, FlaskConical, Stethoscope } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BandPill, Bar, Notice, Reveal, Ring, VerifiedPill, cx, host } from '@/components/ui';
import { Crumbs } from '@/components/Crumbs';
import { band } from '@/lib/adaptive';
import { labFor } from '@/components/labs/registry';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { Subject } from '@/lib/types';
import { useT } from '@/lib/i18n';

export function SubjectView({ subject }: { subject: Subject }) {
  const skills = useLMS(s => s.skills);
  const { t } = useT();
  const setContext = useTutor(s => s.setContext);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    setContext({ kind: 'board', board: subject.board, cls: subject.cls, subject: subject.name, units: subject.units.map(u => u.name) }, subject.name);
  }, [subject, setContext]);

  const avg = subject.units.length ? subject.units.reduce((a, u) => a + (skills[u.id]?.attempts ? skills[u.id].pKnown : 0), 0) / subject.units.length : 0;
  const marks = [subject.theory != null && t('subj.theory', { n: subject.theory }), subject.practical != null && t(subject.cls >= 11 ? 'subj.practical' : 'subj.internal', { n: subject.practical })].filter(Boolean).join(' · ');

  return (
    <div className="grid gap-6">
      <Reveal>
        <Crumbs items={[{ label: t('syl.title'), href: '/student/syllabus' }, { label: subject.name }]} />
        <div className="card mt-3 flex flex-wrap items-center gap-5 p-6">
          <div className="grid justify-items-center gap-1"><Ring value={avg} size={84} stroke={9} /><span className="text-xs text-muted">{t('subj.mastery')}</span></div>
          <div className="grid min-w-0 flex-1 gap-1.5">
            <p className="eyebrow">{subject.board} · {t('shell.class', { n: subject.cls })}</p>
            <h1 className="text-3xl">{subject.name}</h1>
            {subject.book && <p className="text-muted">{t('subj.textbook', { book: subject.book })}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <VerifiedPill v={subject.verified} />
              {subject.session && <span className="tag">{subject.session}</span>}
              {marks && <span className="tag">{marks}</span>}
              {subject.src && <a className="tag !text-primary hover:underline" href={subject.src} target="_blank" rel="noopener noreferrer">{t('subj.source', { host: host(subject.src) })} <ExternalLink size={11} className="ml-1" aria-hidden /><span className="sr-only"> ({t('subj.newTab')})</span></a>}
            </div>
            {subject.note && <p className="text-sm text-muted">{subject.note}</p>}
          </div>
          {subject.units.length > 0 && (
            <Link href={`/student/diagnostic/${encodeURIComponent(subject.id)}`} className="btn-primary"><Stethoscope size={17} aria-hidden /> {t('subj.findLevel')}</Link>
          )}
        </div>
      </Reveal>

      {!subject.units.length && (
        <Notice tone="warn" title={t('subj.noUnits')}>{t('subj.noUnitsDesc')}{subject.src ? <> <a href={subject.src} target="_blank" rel="noopener noreferrer" className="underline">{t('subj.viewSource')}<span className="sr-only"> ({t('subj.newTab')})</span></a></> : null}</Notice>
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
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ctl bg-primary/10 font-mono text-sm font-semibold text-primary">{String(i + 1).padStart(2, '0')}</span>
                  <div className="grid min-w-0 flex-1 gap-1">
                    <b className="leading-snug">{u.name}</b>
                    {u.theme && <span className="text-xs text-muted">{u.theme}</span>}
                    <div className="flex flex-wrap items-center gap-2">
                      {u.marks != null && <span className="tag !bg-night !text-onnight">{t('subj.marks', { n: u.marks })}</span>}
                      <BandPill band={b} />
                      {sk?.attempts ? <span className="text-xs text-muted">{t('subj.correctOf', { c: sk.correct, a: sk.attempts })}</span> : null}
                    </div>
                    {sk?.attempts ? <Bar value={sk.pKnown} className="max-w-xs" /> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/student/learn/${encodeURIComponent(u.id)}`} className="btn-primary text-sm" aria-label={t('subj.learnA', { name: u.name })}><Play size={15} aria-hidden /> {t('subj.learn')}</Link>
                    <Link href={`/student/practice/${encodeURIComponent(u.id)}`} className="btn-ghost text-sm" aria-label={t('subj.practiseA', { name: u.name })}><Target size={15} aria-hidden /> {t('subj.practise')}</Link>
                    <Link href={`/student/test/${encodeURIComponent(u.id)}`} className="btn-ghost text-sm" aria-label={t('subj.testA', { name: u.name })}><PencilLine size={15} aria-hidden /> {t('subj.test')}</Link>
                    {lab && <Link href={`/student/labs?lab=${lab.id}`} className="btn-ghost text-sm" title={t(`lab.${lab.id}.title`)} aria-label={t('subj.labA', { lab: t(`lab.${lab.id}.title`) })}><FlaskConical size={15} aria-hidden /> {t('subj.lab')}</Link>}
                    {u.topics.length > 0 && (
                      <button className="btn-icon" aria-expanded={isOpen} aria-label={t(isOpen ? 'subj.hideTopics' : 'subj.showTopics', { name: u.name })} onClick={() => setOpen(isOpen ? null : u.id)}>
                        <ChevronDown size={17} className={cx('transition', isOpen && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <ul className="grid gap-1.5 border-t border-line bg-surface2/50 px-6 py-4 text-sm sm:grid-cols-2">
                        {u.topics.map(tp => <li key={tp} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />{tp}</li>)}
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
