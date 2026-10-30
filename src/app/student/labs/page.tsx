'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Check, FlaskConical, Lightbulb, Search, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { LABS, type LabInfo, type LabSubject } from '@/components/labs/registry';
import { LabArt } from '@/components/labs/LabArt';
import { LabView } from '@/components/labs/LabView';
import { Empty, PageHeader, cx } from '@/components/ui';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import { useT } from '@/lib/i18n';

const SUBJECT_ORDER: LabSubject[] = ['Maths', 'EVS', 'Physics', 'Chemistry', 'Biology', 'Geography'];
const SUBJ_KEY: Record<string, string> = { All: 'labs.all', Maths: 'labs.maths', Physics: 'labs.physics', Chemistry: 'labs.chemistry', Biology: 'labs.biology', EVS: 'labs.evs', Geography: 'labs.geography' };
const PAGE = 12;

function Labs() {
  const params = useSearchParams();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { t, tf } = useT();
  const L = (l: LabInfo, f: string) => tf(`lab.${l.id}.${f}`, f === 'title' ? l.title : f === 'blurb' ? l.blurb : f === 'concept' ? l.concept : l.tries[Number(f.slice(3))] || '');
  const meta = (l: LabInfo) => `${t(SUBJ_KEY[l.subject])} · ${t('labs.classes', { range: l.min === Math.min(l.max, 12) ? String(l.min) : `${l.min}–${Math.min(l.max, 12)}` })}${l.tag ? ` · ${l.tag}` : ''}`;
  const cls = useLMS(s => s.profile.cls);
  const myCls = cls ? Math.min(cls, 12) : null;
  const forYou = (l: LabInfo) => !!myCls && myCls >= l.min && myCls <= Math.min(l.max, 12);
  const id = params.get('lab');
  const lab = LABS.find(l => l.id === id) || LABS.find(forYou) || LABS[0];
  const { setContext, ask } = useTutor();
  const [subject, setSubject] = useState<string>('All');
  const [klass, setKlass] = useState<string>(myCls ? 'mine' : 'all');
  const [q, setQ] = useState('');
  const [more, setMore] = useState(false);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => { setContext({ kind: 'board', subject: lab.subject, unit: lab.title, topics: [lab.concept, lab.blurb] }, t('labs.ctx', { lab: L(lab, 'title') })); }, [lab, setContext, t]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setTried(new Set()), [lab.id]);
  useEffect(() => setMore(false), [subject, klass, q]);

  const subjects = useMemo(() => ['All', ...SUBJECT_ORDER.filter(s => LABS.some(l => l.subject === s))], []);
  const want = klass === 'all' ? null : klass === 'mine' ? myCls : Number(klass);
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return LABS
      .filter(l => (subject === 'All' || l.subject === subject) && (!want || (want >= l.min && want <= Math.min(l.max, 12))))
      .filter(l => !ql || [L(l, 'title'), L(l, 'concept'), L(l, 'blurb'), l.title, l.concept].some(x => x.toLowerCase().includes(ql)))
      .sort((a, b) => Number(forYou(b)) - Number(forYou(a)) || a.min - b.min);
  }, [subject, want, q, myCls]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = more ? list : list.slice(0, PAGE);
  const perClass = (c: number) => LABS.filter(l => c >= l.min && c <= Math.min(l.max, 12)).length;

  const open = (l: LabInfo) => {
    router.replace(`/student/labs?lab=${l.id}`, { scroll: false });
    requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <PageHeader eyebrow={t('labs.eyebrow')} title={t('labs.title')} desc={t('labs.library', { n: LABS.length })} />

      <section className="grid gap-4" aria-labelledby="catalogue">
        <h2 id="catalogue" className="sr-only">{t('labs.catalogue')}</h2>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">{t('labs.search')}</span>
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('labs.searchPh')} className="input h-11 pl-10" />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="shrink-0">{t('labs.class')}</span>
            <select value={klass} onChange={e => setKlass(e.target.value)} className="input h-11 w-auto min-w-[11rem]">
              {myCls && <option value="mine">{t('labs.myClass', { n: myCls, c: perClass(myCls) })}</option>}
              <option value="all">{t('labs.allClasses')} ({LABS.length})</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(c => <option key={c} value={String(c)}>{t('labs.classN', { n: c, c: perClass(c) })}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="seg flex-wrap" role="radiogroup" aria-label={t('labs.subject')}>
            {subjects.map(s => <button key={s} role="radio" aria-checked={subject === s} onClick={() => setSubject(s)}>{t(SUBJ_KEY[s])}</button>)}
          </div>
          <span className="ml-auto text-sm text-muted" aria-live="polite">{list.length === 1 ? t('labs.count1') : t('labs.count', { n: list.length })}</span>
        </div>

        {list.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map(l => {
              const on = l.id === lab.id;
              return (
                <li key={l.id}>
                  <button onClick={() => open(l)} aria-pressed={on}
                    className={cx('card card-hover group grid h-full w-full content-start gap-3 overflow-hidden p-0 text-left', on && 'border-primary ring-2 ring-primary/40')}>
                    <span className="panel-night relative grid h-28 place-items-center">
                      <LabArt id={l.id} className="h-20 w-20 transition duration-300 group-hover:scale-105" />
                      {forYou(l) && <span className="pill absolute left-3 top-3 bg-teal text-white">{t('labs.forYou')}</span>}
                      {on && <span className="pill absolute right-3 top-3 bg-primary text-onprimary"><Check size={12} aria-hidden /> {t('labs.isOpen')}</span>}
                    </span>
                    <span className="grid gap-1 px-4 pb-4">
                      <b className="font-display text-lg leading-tight">{L(l, 'title')}</b>
                      <span className="text-sm text-muted">{L(l, 'concept')}</span>
                      <span className="mt-1 text-xs font-semibold text-primary">{meta(l)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty title={t('labs.none')} icon={<FlaskConical size={24} />} action={<button className="btn-ghost" onClick={() => { setSubject('All'); setKlass('all'); setQ(''); }}>{t('labs.showAll')}</button>}>
            {t('labs.noneDesc')}
          </Empty>
        )}
        {list.length > PAGE && !more && <button className="btn-ghost justify-self-center" onClick={() => setMore(true)}>{t('labs.showMore', { n: list.length - PAGE })}</button>}
      </section>

      <motion.section ref={stageRef} key={lab.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]" aria-labelledby="lab-title">
        <div className="card grid min-w-0 gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className="panel-night grid h-14 w-14 shrink-0 place-items-center rounded-ctl"><LabArt id={lab.id} className="h-10 w-10" /></span>
            <div className="grid min-w-0 flex-1 gap-1">
              <p className="eyebrow">{meta(lab)}</p>
              <h2 id="lab-title" className="h-section">{L(lab, 'title')}</h2>
              <p className="text-muted">{L(lab, 'blurb')}</p>
            </div>
          </div>
          <LabView id={lab.id} />
        </div>

        <aside className="grid content-start gap-4">
          <div className="card grid gap-3 p-5">
            <h3 className="flex items-center gap-2 text-lg"><Lightbulb size={18} className="text-accent" aria-hidden /> {t('labs.tryThis')}</h3>
            <p className="text-sm text-muted">{t('labs.tryHint')}</p>
            <ul className="grid gap-2">
              {lab.tries.map((_, i) => {
                const done = tried.has(i);
                return (
                  <li key={i}>
                    <button aria-pressed={done} onClick={() => setTried(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                      className={cx('flex w-full items-start gap-3 rounded-ctl border px-3 py-2.5 text-left text-sm transition', done ? 'border-good/40 bg-good/10' : 'border-line bg-surface hover:border-primary/40')}>
                      <span className={cx('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border', done ? 'border-good bg-good text-white' : 'border-line')}>{done && <Check size={12} aria-hidden />}</span>
                      <span className={cx(done && 'text-muted line-through decoration-good/60')}>{L(lab, `try${i}`)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {tried.size === lab.tries.length && <p className="rounded-ctl bg-good/10 px-3 py-2 text-sm font-semibold text-good" role="status">{t('labs.allDone')}</p>}
          </div>
          <div className="card grid gap-3 p-5">
            <h3 className="text-lg">{t('labs.stuck')}</h3>
            <button className="btn-primary" onClick={() => ask(t('labs.askQ', { lab: L(lab, 'title'), concept: L(lab, 'concept') }))}>
              <Sparkles size={16} aria-hidden /> {t('labs.askVidya')}
            </button>
            <button className="btn-ghost" onClick={() => ask(t('labs.explainQ', { lab: L(lab, 'title'), concept: L(lab, 'concept') }))}>{t('labs.explain')}</button>
          </div>
        </aside>
      </motion.section>
    </div>
  );
}

export default function LabsPage() {
  return <Suspense><Labs /></Suspense>;
}
