'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Target, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Bar, PageHeader, Reveal, SampleBadge, cx } from '@/components/ui';
import { AssignmentMaker } from './AssignmentMaker';
import { LessonBuilder, type Seed } from './LessonBuilder';
import { SavedWork } from './SavedWork';

const DAY = [
  { t: '08:40', cls: 8, sec: '8-B', topic: 'Light: refraction', room: 'Room 204' },
  { t: '10:15', cls: 10, sec: '10-A', topic: 'Carbon compounds', room: 'Lab 2' },
  { t: '12:30', cls: 8, sec: '8-C', topic: 'Light: refraction', room: 'Room 207' },
];
const SUPPORT = [
  { who: 'Ishaan M.', sec: '8-B', why: 'Missed 3 practice sets this week', tone: 'bg-bad/12 text-bad', tag: 'At risk', act: 'Refraction basics', cls: 8 },
  { who: 'Sana K.', sec: '8-B', why: 'Angle of refraction questions: 2 of 9 right', tone: 'bg-accent/20 text-warn', tag: 'Struggling', act: 'Angle of incidence and refraction', cls: 8 },
  { who: '6 students', sec: '8-B', why: 'Believe the pencil in water really bends', tone: 'bg-primary/12 text-primary', tag: 'Misconception', act: 'Apparent bending of a pencil in water', cls: 8 },
];
const MASTERY: [string, number][] = [['Laws of reflection', 0.82], ['Refraction', 0.58], ['Snell’s law', 0.34], ['Total internal reflection', 0.21]];
const CLUSTERS = [
  { label: 'Refraction at the water surface', n: 17, color: 'rgb(var(--good))', ex: '“Light bends when it goes from water to air.”' },
  { label: 'Water magnifies the pencil', n: 9, color: 'rgb(var(--accent))', ex: '“Water makes things bigger.”' },
  { label: 'The pencil really bends', n: 6, color: 'rgb(var(--bad))', ex: '“Water pushes it so it bends.”' },
];
const COVERAGE: [string, number, number][] = [['8-B', 0.62, 0.66], ['8-C', 0.55, 0.66], ['10-A', 0.71, 0.7]];

export function TeacherView() {
  const reduce = useReducedMotion();
  const [lessonSeed, setLessonSeed] = useState<Seed>({ key: 0, topic: 'Refraction of light through a glass slab', cls: 8, subject: 'Science' });
  const [assignSeed, setAssignSeed] = useState<Seed>({ key: 0, topic: 'Snell’s law', cls: 10, subject: 'Science' });
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  const next = DAY[0];

  return (
    <>
      <PageHeader eyebrow="Teacher · Science · Classes 8 and 10" title="Today’s priorities" desc="What needs you first, then your classes, then the AI studio."
        actions={<SampleBadge>Sample class data</SampleBadge>} />

      {/* 1. Priorities: next class + who needs support */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <section className="panel-night grid h-full content-start gap-4 rounded-card p-6 shadow-lift" aria-labelledby="next-title">
            <p className="font-mono text-xs uppercase tracking-widest text-onnight/60">Next class</p>
            <div>
              <h2 id="next-title" className="text-3xl">{next.sec} · {next.topic}</h2>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-onnight/75"><span className="flex items-center gap-1.5"><Clock size={15} />{next.t}</span><span className="flex items-center gap-1.5"><MapPin size={15} />{next.room}</span></p>
            </div>
            <button className="btn-accent justify-self-start" onClick={() => { setLessonSeed({ key: Date.now(), topic: next.topic, cls: next.cls, subject: 'Science' }); jump('studio'); }}><Wand2 size={16} /> Prepare this lesson with AI</button>
            <ol className="mt-2 grid gap-2 border-t border-white/10 pt-4 text-sm" aria-label="Rest of today">
              {DAY.slice(1).map(d => (
                <li key={d.t} className="flex items-center gap-3"><span className="font-mono text-onnight/60">{d.t}</span><span className="font-semibold">{d.sec} · {d.topic}</span><span className="ml-auto text-onnight/60">{d.room}</span></li>
              ))}
            </ol>
          </section>
        </Reveal>
        <Reveal delay={0.05}>
          <section className="card grid h-full content-start gap-3 p-5 sm:p-6" aria-labelledby="support-title">
            <div className="flex items-center justify-between gap-2"><h2 id="support-title" className="h-section">Students who need support</h2><span className="pill bg-bad/12 text-bad">{SUPPORT.length}</span></div>
            <ul className="grid gap-2">
              {SUPPORT.map(s => (
                <li key={s.who + s.tag} className="grid gap-2 rounded-ctl border border-line p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><b>{s.who}</b><span className="text-sm text-muted">{s.sec}</span><span className={cx('pill', s.tone)}>{s.tag}</span></div>
                    <p className="text-sm text-muted">{s.why}</p>
                  </div>
                  <button className="btn-ghost min-h-9 justify-self-start px-3 py-1.5 text-sm" onClick={() => { setAssignSeed({ key: Date.now(), topic: s.act, cls: s.cls, subject: 'Science' }); jump('assign'); }}>
                    <Target size={14} /> Make a practice set <ArrowRight size={14} />
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
          <div><p className="eyebrow">8-B · Light</p><h2 id="mastery-title" className="text-lg">Topic mastery</h2></div>
          {MASTERY.map(([t, v]) => (
            <div key={t} className="grid grid-cols-[1fr_88px_38px] items-center gap-2 text-sm"><span>{t}</span><Bar value={v} /><span className="text-right font-mono tabular-nums">{Math.round(v * 100)}%</span></div>
          ))}
          <p className="text-xs text-muted">Estimated from adaptive practice (BKT mastery).</p>
        </section>
        <section className="card grid content-start gap-3 p-5" aria-labelledby="cov-title">
          <div><p className="eyebrow">Science</p><h2 id="cov-title" className="text-lg">Syllabus coverage vs plan</h2></div>
          {COVERAGE.map(([sec, done, plan]) => (
            <div key={sec} className="grid gap-1 text-sm">
              <div className="flex justify-between"><b>{sec}</b><span className={cx('font-semibold', done + 0.02 < plan ? 'text-warn' : 'text-good')}>{Math.round(done * 100)}% · plan {Math.round(plan * 100)}%</span></div>
              <div className="relative h-2 rounded-full bg-surface2" role="img" aria-label={`${sec}: ${Math.round(done * 100)}% covered, plan ${Math.round(plan * 100)}%`}>
                <i className="absolute inset-y-0 left-0 rounded-full bg-teal" style={{ width: `${done * 100}%` }} />
                <i className="absolute -top-1 h-4 w-0.5 rounded bg-ink" style={{ left: `${plan * 100}%` }} aria-hidden />
              </div>
            </div>
          ))}
          <p className="text-xs text-muted">The dark tick marks where the plan expects you to be.</p>
        </section>
        <section className="card grid content-start gap-3 p-5 md:col-span-2 xl:col-span-1" aria-labelledby="cl-title">
          <div><p className="eyebrow">Answer clustering · 8-B · 32 answers</p><h2 id="cl-title" className="text-lg">“Why does a pencil look bent in water?”</h2></div>
          {CLUSTERS.map((c, i) => (
            <motion.div key={c.label} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="grid gap-1">
              <div className="flex justify-between gap-2 text-sm"><b>{c.label}</b><span className="font-mono">{c.n}</span></div>
              <Bar value={c.n / 32} color={c.color} />
              <span className="text-xs text-muted">{c.ex}</span>
            </motion.div>
          ))}
          <p className="rounded-ctl border-l-4 border-teal bg-teal/10 px-3 py-2 text-sm"><b>Suggested:</b> reteach with the pin experiment, then assign a misconception set.</p>
        </section>
      </div>

      {/* 3. AI studio */}
      <div id="studio" className="grid scroll-mt-28 gap-1">
        <p className="eyebrow">AI studio</p>
        <h2 className="h-section">Create, review, approve</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <LessonBuilder seed={lessonSeed} />
        <div id="assign" className="scroll-mt-28"><AssignmentMaker seed={assignSeed} /></div>
      </div>
      <SavedWork />
    </>
  );
}
