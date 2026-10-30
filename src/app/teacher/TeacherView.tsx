'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Target, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { DemoGate, useDemo } from '@/components/RoleShell';
import { Bar, PageHeader, Reveal, SampleBadge, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { AssignmentMaker } from './AssignmentMaker';
import { LessonBuilder, type Seed } from './LessonBuilder';
import { SavedWork } from './SavedWork';

/* Demo figures — shown only after the user opts into demo data, always under a demo banner. */
const DAY = [
  { t: '08:40', cls: 8, sec: '8-B', topic: 'teacher.demo.refraction', room: ['teacher.demo.room', 204] },
  { t: '10:15', cls: 10, sec: '10-A', topic: 'teacher.demo.carbon', room: ['teacher.demo.lab', 2] },
  { t: '12:30', cls: 8, sec: '8-C', topic: 'teacher.demo.refraction', room: ['teacher.demo.room', 207] },
] as const;
const SUPPORT = [
  { who: 'Ishaan M.', sec: '8-B', why: 'teacher.demo.why1', tone: 'bg-bad/12 text-bad', tag: 'teacher.tag.atRisk', act: 'teacher.demo.act1', cls: 8 },
  { who: 'Sana K.', sec: '8-B', why: 'teacher.demo.why2', tone: 'bg-accent/20 text-warn', tag: 'teacher.tag.struggling', act: 'teacher.demo.act2', cls: 8 },
  { who: 'teacher.demo.six', sec: '8-B', why: 'teacher.demo.why3', tone: 'bg-primary/12 text-primary', tag: 'teacher.tag.misconception', act: 'teacher.demo.act3', cls: 8 },
];
const MASTERY: [string, number][] = [['teacher.demo.t1', 0.82], ['teacher.demo.t2', 0.58], ['teacher.demo.t3', 0.34], ['teacher.demo.t4', 0.21]];
const CLUSTERS = [
  { label: 'teacher.cl.c1', ex: 'teacher.cl.e1', n: 17, color: 'rgb(var(--good))' },
  { label: 'teacher.cl.c2', ex: 'teacher.cl.e2', n: 9, color: 'rgb(var(--accent))' },
  { label: 'teacher.cl.c3', ex: 'teacher.cl.e3', n: 6, color: 'rgb(var(--bad))' },
];
const COVERAGE: [string, number, number][] = [['8-B', 0.62, 0.66], ['8-C', 0.55, 0.66], ['10-A', 0.71, 0.7]];

export function TeacherView() {
  const { t } = useT();
  const demo = useDemo();
  const reduce = useReducedMotion();
  const [lessonSeed, setLessonSeed] = useState<Seed>({ key: 0, topic: '', cls: 8, subject: '' });
  const [assignSeed, setAssignSeed] = useState<Seed>({ key: 0, topic: '', cls: 8, subject: '' });
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  const next = DAY[0];
  const sci = t('teacher.demo.science');

  return (
    <>
      <PageHeader eyebrow={demo ? t('teacher.eyebrowDemo') : t('roles.teacher')} title={t('teacher.title')} desc={t('teacher.desc')}
        actions={demo ? <SampleBadge>{t('teacher.sampleClass')}</SampleBadge> : undefined} />

      <DemoGate role="teacher">
        {/* 1. Priorities: next class + who needs support */}
        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <section className="panel-night grid h-full content-start gap-4 rounded-card p-6 shadow-lift" aria-labelledby="next-title">
              <p className="font-mono text-xs uppercase tracking-widest text-onnight/60">{t('teacher.nextClass')}</p>
              <div>
                <h2 id="next-title" className="text-3xl">{next.sec} · {t(next.topic)}</h2>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-onnight/75"><span className="flex items-center gap-1.5"><Clock size={15} aria-hidden />{next.t}</span><span className="flex items-center gap-1.5"><MapPin size={15} aria-hidden />{t(next.room[0], { n: next.room[1] })}</span></p>
              </div>
              <button className="btn-accent justify-self-start" onClick={() => { setLessonSeed({ key: Date.now(), topic: t(next.topic), cls: next.cls, subject: sci }); jump('studio'); }}><Wand2 size={16} /> {t('teacher.prepare')}</button>
              <ol className="mt-2 grid gap-2 border-t border-white/10 pt-4 text-sm" aria-label={t('teacher.restOfToday')}>
                {DAY.slice(1).map(d => (
                  <li key={d.t} className="flex items-center gap-3"><span className="font-mono text-onnight/60">{d.t}</span><span className="font-semibold">{d.sec} · {t(d.topic)}</span><span className="ml-auto text-onnight/60">{t(d.room[0], { n: d.room[1] })}</span></li>
                ))}
              </ol>
            </section>
          </Reveal>
          <Reveal delay={0.05}>
            <section className="card grid h-full content-start gap-3 p-5 sm:p-6" aria-labelledby="support-title">
              <div className="flex items-center justify-between gap-2"><h2 id="support-title" className="h-section">{t('teacher.support')}</h2><span className="pill bg-bad/12 text-bad">{SUPPORT.length}</span></div>
              <ul className="grid gap-2">
                {SUPPORT.map(s => (
                  <li key={s.who + s.tag} className="grid gap-2 rounded-ctl border border-line p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><b>{s.who.startsWith('teacher.') ? t(s.who) : s.who}</b><span className="text-sm text-muted">{s.sec}</span><span className={cx('pill', s.tone)}>{t(s.tag)}</span></div>
                      <p className="text-sm text-muted">{t(s.why)}</p>
                    </div>
                    <button className="btn-ghost min-h-9 justify-self-start px-3 py-1.5 text-sm" onClick={() => { setAssignSeed({ key: Date.now(), topic: t(s.act), cls: s.cls, subject: sci }); jump('assign'); }}>
                      <Target size={14} /> {t('teacher.makeSet')} <ArrowRight size={14} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        </div>

        {/* 2. Class overview */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <section className="card grid content-start gap-3 p-5" aria-labelledby="mastery-title">
            <div><p className="eyebrow">8-B · {t('teacher.demo.light')}</p><h2 id="mastery-title" className="text-lg">{t('teacher.mastery')}</h2></div>
            {MASTERY.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[1fr_88px_38px] items-center gap-2 text-sm"><span>{t(k)}</span><Bar value={v} /><span className="text-right font-mono tabular-nums">{Math.round(v * 100)}%</span></div>
            ))}
            <p className="text-xs text-muted">{t('teacher.masteryNote')}</p>
          </section>
          <section className="card grid content-start gap-3 p-5" aria-labelledby="cov-title">
            <div><p className="eyebrow">{sci}</p><h2 id="cov-title" className="text-lg">{t('teacher.coverage')}</h2></div>
            {COVERAGE.map(([sec, done, plan]) => {
              const v = { sec, done: Math.round(done * 100), plan: Math.round(plan * 100) };
              return (
                <div key={sec} className="grid gap-1 text-sm">
                  <div className="flex justify-between gap-2"><b>{sec}</b><span className={cx('font-semibold', done + 0.02 < plan ? 'text-warn' : 'text-good')}>{t('teacher.coverageRow', v)}</span></div>
                  <div className="relative h-2 rounded-full bg-surface2" role="img" aria-label={t('teacher.coverageAria', v)}>
                    <i className="absolute inset-y-0 left-0 rounded-full bg-teal" style={{ width: `${done * 100}%` }} />
                    <i className="absolute -top-1 h-4 w-0.5 rounded bg-ink" style={{ left: `${plan * 100}%` }} aria-hidden />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted">{t('teacher.coverageNote')}</p>
          </section>
          <section className="card grid content-start gap-3 p-5 md:col-span-2 xl:col-span-1" aria-labelledby="cl-title">
            <div><p className="eyebrow">{t('teacher.cl.eyebrow', { n: 32 })}</p><h2 id="cl-title" className="text-lg">{t('teacher.cl.q')}</h2></div>
            {CLUSTERS.map((c, i) => (
              <motion.div key={c.label} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="grid gap-1">
                <div className="flex justify-between gap-2 text-sm"><b>{t(c.label)}</b><span className="font-mono">{c.n}</span></div>
                <Bar value={c.n / 32} color={c.color} />
                <span className="text-xs text-muted">{t(c.ex)}</span>
              </motion.div>
            ))}
            <p className="rounded-ctl border-l-4 border-teal bg-teal/10 px-3 py-2 text-sm"><b>{t('teacher.cl.suggestedLabel')}</b> {t('teacher.cl.suggested')}</p>
          </section>
        </div>
      </DemoGate>

      {/* 3. AI studio — works without the school data service (calls the school's AI model) */}
      <div id="studio" className="grid scroll-mt-28 gap-1">
        <p className="eyebrow">{t('teacher.studio')}</p>
        <h2 className="h-section">{t('teacher.studioTitle')}</h2>
        <p className="text-sm text-muted">{t('teacher.studioNote')}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <LessonBuilder seed={lessonSeed} />
        <div id="assign" className="scroll-mt-28"><AssignmentMaker seed={assignSeed} /></div>
      </div>
      <SavedWork />
    </>
  );
}
