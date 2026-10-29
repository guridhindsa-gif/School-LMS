'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Check, FlaskConical, Lightbulb, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { LABS, type LabInfo } from '@/components/labs/registry';
import { LabArt } from '@/components/labs/LabArt';
import { LabView } from '@/components/labs/LabView';
import { Empty, PageHeader, cx } from '@/components/ui';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

const SUBJECTS = ['All', 'Maths', 'Physics'] as const;
const STAGES: { id: string; label: string; min: number; max: number }[] = [
  { id: 'all', label: 'All classes', min: 1, max: 13 },
  { id: 'primary', label: '1–5', min: 1, max: 5 },
  { id: 'middle', label: '6–8', min: 6, max: 8 },
  { id: 'senior', label: '9–12', min: 9, max: 13 },
];

function Labs() {
  const params = useSearchParams();
  const router = useRouter();
  const reduce = useReducedMotion();
  const cls = useLMS(s => s.profile.cls);
  const id = params.get('lab') || 'refraction';
  const lab = LABS.find(l => l.id === id) || LABS[2];
  const { setContext, ask } = useTutor();
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>('All');
  const [stage, setStage] = useState('all');
  const [tried, setTried] = useState<Set<number>>(new Set());
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => { setContext({ kind: 'board', subject: lab.subject, unit: lab.title, topics: [lab.concept, lab.blurb] }, `Lab: ${lab.title}`); }, [lab, setContext]);
  useEffect(() => setTried(new Set()), [lab.id]);

  const st = STAGES.find(s => s.id === stage)!;
  const list = useMemo(() => LABS.filter(l => (subject === 'All' || l.subject === subject) && l.max >= st.min && l.min <= st.max), [subject, st]);
  const forYou = (l: LabInfo) => !!cls && cls >= l.min && cls <= l.max;

  const open = (l: LabInfo) => {
    router.replace(`/student/labs?lab=${l.id}`, { scroll: false });
    requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  };

  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="Visual labs" title="See it move" desc="Interactive simulations linked to your chapters. Change a value, predict what will happen, then watch the idea respond." />

      <section className="grid gap-4" aria-labelledby="catalogue">
        <h2 id="catalogue" className="sr-only">Lab catalogue</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="seg" role="radiogroup" aria-label="Subject">
            {SUBJECTS.map(s => <button key={s} role="radio" aria-checked={subject === s} onClick={() => setSubject(s)}>{s}</button>)}
          </div>
          <div className="seg" role="radiogroup" aria-label="Class range">
            {STAGES.map(s => <button key={s.id} role="radio" aria-checked={stage === s.id} onClick={() => setStage(s.id)}>{s.label}</button>)}
          </div>
          <span className="ml-auto text-sm text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'lab' : 'labs'}</span>
        </div>

        {list.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {list.map(l => {
              const on = l.id === lab.id;
              return (
                <li key={l.id}>
                  <button onClick={() => open(l)} aria-pressed={on}
                    className={cx('card card-hover group grid h-full w-full content-start gap-3 overflow-hidden p-0 text-left', on && 'border-primary ring-2 ring-primary/40')}>
                    <span className="panel-night relative grid h-28 place-items-center">
                      <LabArt id={l.id} className="h-20 w-20 transition duration-300 group-hover:scale-105" />
                      {forYou(l) && <span className="pill absolute left-3 top-3 bg-teal text-white">For your class</span>}
                      {on && <span className="pill absolute right-3 top-3 bg-primary text-onprimary"><Check size={12} /> Open</span>}
                    </span>
                    <span className="grid gap-1 px-4 pb-4">
                      <b className="font-display text-lg leading-tight">{l.title}</b>
                      <span className="text-sm text-muted">{l.concept}</span>
                      <span className="mt-1 text-xs font-semibold text-primary">{l.subject} · {l.classes}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty title="No labs for this filter yet" icon={<FlaskConical size={24} />} action={<button className="btn-ghost" onClick={() => { setSubject('All'); setStage('all'); }}>Show all labs</button>}>
            Try another subject or class range.
          </Empty>
        )}
      </section>

      <motion.section ref={stageRef} key={lab.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]" aria-labelledby="lab-title">
        <div className="card grid min-w-0 gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className="panel-night grid h-14 w-14 shrink-0 place-items-center rounded-ctl"><LabArt id={lab.id} className="h-10 w-10" /></span>
            <div className="grid min-w-0 flex-1 gap-1">
              <p className="eyebrow">{lab.subject} · {lab.classes}</p>
              <h2 id="lab-title" className="h-section">{lab.title}</h2>
              <p className="text-muted">{lab.blurb}</p>
            </div>
          </div>
          <LabView id={lab.id} />
        </div>

        <aside className="grid content-start gap-4">
          <div className="card grid gap-3 p-5">
            <h3 className="flex items-center gap-2 text-lg"><Lightbulb size={18} className="text-accent" /> Try this</h3>
            <p className="text-sm text-muted">Predict first, then test. Tick each one off.</p>
            <ul className="grid gap-2">
              {lab.tries.map((t, i) => {
                const done = tried.has(i);
                return (
                  <li key={t}>
                    <button aria-pressed={done} onClick={() => setTried(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                      className={cx('flex w-full items-start gap-3 rounded-ctl border px-3 py-2.5 text-left text-sm transition', done ? 'border-good/40 bg-good/10' : 'border-line bg-surface hover:border-primary/40')}>
                      <span className={cx('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border', done ? 'border-good bg-good text-white' : 'border-line')}>{done && <Check size={12} />}</span>
                      <span className={cx(done && 'text-muted line-through decoration-good/60')}>{t}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {tried.size === lab.tries.length && <p className="rounded-ctl bg-good/10 px-3 py-2 text-sm font-semibold text-good" role="status">All challenges explored. Ask Vidya to test you on it.</p>}
          </div>
          <div className="card grid gap-3 p-5">
            <h3 className="text-lg">Stuck or curious?</h3>
            <button className="btn-primary" onClick={() => ask(`I'm using the "${lab.title}" lab about ${lab.concept}. Give me one question to test my understanding, and a hint if I need it.`)}>
              <Sparkles size={16} /> Ask Vidya about this lab
            </button>
            <button className="btn-ghost" onClick={() => ask(`Explain the idea behind the "${lab.title}" lab (${lab.concept}) simply, with one everyday example.`)}>Explain the idea</button>
          </div>
        </aside>
      </motion.section>
    </div>
  );
}

export default function LabsPage() {
  return <Suspense><Labs /></Suspense>;
}
