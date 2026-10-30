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
import { useT } from '@/lib/i18n';

export function ExamView({ exam }: { exam: Exam }) {
  const [sec, setSec] = useState(0);
  const { t } = useT();
  const skills = useLMS(s => s.skills);
  const setContext = useTutor(s => s.setContext);
  const sb = exam.subjects[sec];
  useEffect(() => { setContext({ kind: 'exam', exam: exam.name, examId: exam.id, subject: sb?.name }, exam.name); }, [exam, sb, setContext]);

  return (
    <div className="grid gap-6">
      <Reveal>
        <Crumbs items={[{ label: t('exams.eyebrow'), href: '/student/exams' }, { label: exam.name }]} />
        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="grid min-w-0 flex-1 gap-1.5">
            <h1 className="text-3xl">{exam.name}</h1>
            <p className="text-muted">{[exam.by, exam.year].filter(Boolean).join(' · ')}</p>
            <div className="flex flex-wrap items-center gap-2">
              {exam.verified ? <span className="pill bg-good/15 text-good">{t('exams.officialSyl')}</span> : <span className="pill bg-accent/20 text-warn">{t('exams.blocked')}</span>}
              {exam.source && <a href={exam.source} target="_blank" rel="noopener noreferrer" className="tag !text-primary hover:underline">{t('subj.source', { host: host(exam.source) })} <ExternalLink size={11} className="ml-1" aria-hidden /><span className="sr-only"> ({t('subj.newTab')})</span></a>}
              <span className="tag">{exam.marking[1] ? t('exams.markingNeg', { p: exam.marking[0], n: exam.marking[1] }) : t('exams.marking', { p: exam.marking[0] })}</span>
            </div>
          </div>
          <Link href={`/student/mock/${exam.id}`} className="btn-primary"><Timer size={17} aria-hidden /> {t('exams.mock')}</Link>
        </div>
      </Reveal>

      {(exam.pattern.length > 0 || exam.eligibility) && (
        <Reveal delay={0.05}>
          <section className="card overflow-hidden p-0" aria-label={t('exams.pattern')}>
            {exam.pattern.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {exam.pattern.map(([k, v]) => (
                      <tr key={k} className="border-b border-line last:border-0"><th scope="row" className="w-40 bg-surface2/60 px-4 py-2.5 text-left align-top font-semibold sm:w-56">{k}</th><td className="px-4 py-2.5">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {exam.eligibility && <p className="border-t border-line px-4 py-3 text-sm"><b>{t('exams.eligibility')}</b> <span lang="en">{exam.eligibility}</span></p>}
            {exam.note && <p className="border-t border-line px-4 py-3 text-sm text-muted">{exam.note}</p>}
          </section>
        </Reveal>
      )}

      {exam.subjects.length > 1 && (
        <div className="flex gap-1 overflow-x-auto rounded-ctl bg-surface2 p-1" role="tablist" aria-label={t('exams.sectionsLabel')}>
          {exam.subjects.map((s, i) => (
            <button key={s.name} role="tab" aria-selected={i === sec} onClick={() => setSec(i)} className={cx('relative shrink-0 rounded-[calc(var(--r-ctl)-.25rem)] px-4 py-1.5 text-sm font-semibold transition', i === sec ? 'text-ink' : 'text-muted hover:text-ink')}>
              {i === sec && <motion.span layoutId="exam-sec" className="absolute inset-0 rounded-[calc(var(--r-ctl)-.25rem)] bg-surface shadow-soft" />}
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
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ctl bg-primary/10 font-mono text-sm font-semibold text-primary">{String(i + 1).padStart(2, '0')}</span>
              <div className="grid min-w-0 flex-1 gap-1">
                <b>{u.name}</b>
                <div className="flex flex-wrap items-center gap-2">
                  {u.cls && <span className="tag">{t('shell.class', { n: u.cls })}</span>}<BandPill band={band(sk)} />
                </div>
                {u.topics.length > 0 && <p className="line-clamp-2 text-sm text-muted">{u.topics.join(' · ')}</p>}
              </div>
              <div className="flex gap-2">
                <Link href={`/student/learn/${encodeURIComponent(u.id)}`} className="btn-primary text-sm" aria-label={t('subj.learnA', { name: u.name })}><Play size={15} aria-hidden /> {t('subj.learn')}</Link>
                <Link href={`/student/practice/${encodeURIComponent(u.id)}`} className="btn-ghost text-sm" aria-label={t('subj.practiseA', { name: u.name })}><Target size={15} aria-hidden /> {t('subj.practise')}</Link>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
