'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, BookOpenText, Check, ChevronDown, Clapperboard, ClipboardCheck, FlaskConical, ListChecks, PencilLine, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { isJunior } from '@/components/AppShell';
import { Star, Vidya } from '@/components/art';
import { VisualLesson } from '@/components/visual/VisualLesson';
import { Crumbs } from '@/components/Crumbs';
import { TutorChat } from '@/components/TutorChat';
import { Reveal, Ring, cx } from '@/components/ui';
import { LabView } from '@/components/labs/LabView';
import { labFor, labsFor } from '@/components/labs/registry';
import { band } from '@/lib/adaptive';
import { useT } from '@/lib/i18n';
import { useLMS, useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { ResolvedUnit } from '@/lib/context';
import { NotesPanel } from './NotesPanel';

type Tab = 'visual' | 'notes' | 'lab' | 'topics';
type StageState = 'done' | 'active' | 'todo';
const PASS = 60; // chapter-test score (%) that completes "Assess"

const clean = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '');

/** The lesson studio: chapter header, Learn → Explore → Practise → Assess → Review path, workspace and Vidya. */
export function LearnView({ r }: { r: ResolvedUnit }) {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const { t, tf, lang, locale } = useT();
  const cls = useLMS(s => s.profile.cls);
  const sk = useLMS(s => s.skills[r.unitId]);
  const step = useLMS(s => s.steps[r.unitId]);
  const markStep = useLMS(s => s.markStep);
  const setContext = useTutor(s => s.setContext);
  const ask = useTutor(s => s.ask);
  const junior = hydrated && isJunior(cls ?? r.cls);
  const best = labFor(r.title, r.cls);
  const chapterLabs = best ? [best, ...labsFor(r.title, r.cls).filter(l => l.id !== best.id)].slice(0, 4) : [];
  const [labId, setLabId] = useState<string | null>(null);
  const lab = chapterLabs.find(l => l.id === labId) || best;
  const [tab, setTab] = useState<Tab>('visual');
  const enc = encodeURIComponent(r.unitId);
  const title = clean(r.title);

  useEffect(() => { setContext(r.ctx, title.length > 40 ? title.slice(0, 40) + '…' : title); }, [r, title, setContext]);
  useEffect(() => { if (tab === 'lab' || tab === 'notes') markStep(r.unitId, 'explore'); }, [tab, r.unitId, markStep]);
  const onLessonComplete = useCallback(() => markStep(r.unitId, 'learn'), [r.unitId, markStep]);

  const attempts = sk?.attempts ?? 0;
  const mastery = sk?.pKnown ?? 0;
  const assessed = (step?.assessScore ?? -1) >= PASS;
  const review = sk?.nextReview && attempts ? new Date(sk.nextReview).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : null;
  const st = (done: boolean, ready: boolean): StageState => (done ? 'done' : ready ? 'active' : 'todo');
  const stages: { id: string; label: string; sub: string; icon: typeof Clapperboard; state: StageState; act?: () => void; href?: string }[] = [
    { id: 'learn', label: t('ls.learn'), sub: step?.learn ? t('ls.learnDone') : t('ls.learnSub'), icon: Clapperboard, state: st(!!step?.learn, true), act: () => setTab('visual') },
    { id: 'explore', label: t('ls.explore'), sub: lab ? tf(`lab.${lab.id}.title`, lab.title) : t('ls.exploreSub'), icon: lab ? FlaskConical : BookOpenText, state: st(!!step?.explore, !!step?.learn), act: () => setTab(lab ? 'lab' : 'notes') },
    { id: 'practise', label: t('ls.practise'), sub: attempts ? t('ls.answered', { n: attempts }) : t('ls.practiseSub'), icon: Target, state: st(mastery >= 0.5 && attempts >= 5, true), href: `/student/practice/${enc}` },
    { id: 'assess', label: t('ls.assess'), sub: step?.assessScore !== undefined ? t('ls.best', { n: step.assessScore }) : t('ls.assessSub'), icon: ClipboardCheck, state: st(assessed, attempts > 0), href: `/student/test/${enc}` },
    { id: 'review', label: t('ls.review'), sub: review ? t('ls.nextReview', { date: review }) : t('ls.reviewSub'), icon: BarChart3, state: st(assessed && !!review, attempts > 0), href: '/student/progress' },
  ];

  const tabs: { id: Tab; label: string; icon: typeof BookOpenText; show: boolean }[] = [
    { id: 'visual', label: t('ls.tabPicture'), icon: Clapperboard, show: true },
    { id: 'notes', label: t('ls.tabNotes'), icon: BookOpenText, show: !junior },
    { id: 'lab', label: lab ? tf(`lab.${lab.id}.title`, lab.title) : t('ls.tabLab'), icon: FlaskConical, show: !!lab },
    { id: 'topics', label: r.topics.length ? t('ls.tabTopicsN', { n: r.topics.length }) : t('ls.tabTopics'), icon: ListChecks, show: !junior },
  ];
  const objectives = r.topics.slice(0, 6).map(clean);
  const stars = !attempts ? 0 : mastery >= 0.8 ? 3 : mastery >= 0.5 ? 2 : 1;
  const bandLabel = t(`mastery.${band(sk)}`);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Chapter header — mastery is shown once, here */}
      <Reveal className="grid gap-4">
        <Crumbs items={r.crumbs} />
        <div className="flex flex-wrap items-start gap-5">
          {hydrated && !junior && (
            <div className="hidden justify-items-center gap-1 sm:grid">
              <Ring value={mastery} size={72} label={attempts ? undefined : t('common.new')} />
              <span className="text-xs font-semibold text-muted">{bandLabel}</span>
            </div>
          )}
          <div className="grid min-w-0 flex-1 gap-2">
            <span className="pill w-fit bg-primary/10 text-primary">{r.ctx.subject}{r.marks != null ? ` · ${t('ls.marks', { n: r.marks })}` : ''}</span>
            <h1 className={junior ? 'text-4xl sm:text-5xl' : 'h-page'}>{title}</h1>
            {junior
              ? <span className="inline-flex gap-1" role="img" aria-label={t('jr.lessonStars', { n: stars })}>{[0, 1, 2].map(i => <Star key={i} size={28} filled={i < stars} />)}</span>
              : sk?.weakTopics?.length ? <p className="text-sm text-muted">{t('ls.weak')} <b className="text-ink">{sk.weakTopics.slice(0, 3).join(', ')}</b></p> : null}
          </div>
          {!junior && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/student/practice/${enc}`} className="btn-primary"><Target size={17} aria-hidden /> {t('home.adaptive')}</Link>
              <Link href={`/student/test/${enc}`} className="btn-ghost"><PencilLine size={17} aria-hidden /> {t('ls.test')}</Link>
            </div>
          )}
        </div>
      </Reveal>

      {/* Learning path (persisted per chapter) */}
      <nav aria-label={t('ls.path')} className={cx('grid gap-2', junior ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5')}>
        {(junior ? stages.slice(0, 4) : stages).map((s, i) => {
          const inner = (
            <>
              <span className={cx('grid shrink-0 place-items-center rounded-full border-2 transition', junior ? 'h-12 w-12' : 'h-9 w-9',
                s.state === 'done' ? 'border-good bg-good text-white' : s.state === 'active' ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted')}>
                {s.state === 'done' ? <Check size={junior ? 22 : 16} strokeWidth={3} aria-hidden /> : <s.icon size={junior ? 22 : 16} aria-hidden />}
              </span>
              <span className="min-w-0 text-left">
                <span className={cx('flex items-center gap-1.5 font-bold', junior ? 'text-lg' : 'text-sm')}><span className="font-mono text-[11px] text-muted">{i + 1}</span>{s.label}</span>
                {!junior && <span className="block truncate text-xs text-muted">{s.sub}</span>}
              </span>
              <span className="sr-only">{s.state === 'done' ? t('ls.stateDone') : s.state === 'active' ? t('ls.stateNext') : t('ls.stateLater')}</span>
            </>
          );
          const c = cx('flex items-center gap-3 rounded-card border bg-surface px-3 py-3 transition hover:border-primary/40', s.state === 'active' ? 'border-primary/40 shadow-soft' : 'border-line', junior && 'min-h-[4.5rem]');
          return s.href
            ? <Link key={s.id} href={s.href} className={c}>{inner}</Link>
            : <button key={s.id} onClick={s.act} className={c} aria-current={(s.id === 'learn' && tab === 'visual') || (s.id === 'explore' && (tab === 'lab' || tab === 'notes')) ? 'step' : undefined}>{inner}</button>;
        })}
      </nav>

      <div className={cx('grid items-start gap-6', !junior && 'xl:grid-cols-[minmax(0,1fr)_400px]')}>
        <div className="grid min-w-0 grid-cols-1 gap-6">
          {/* Objectives (official sub-topics) */}
          {!junior && objectives.length > 0 && (
            <details className="group card p-0 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal/15 text-teal"><ListChecks size={16} aria-hidden /></span>
                <b className="flex-1">{t('ls.objectives', { n: objectives.length })}</b>
                <ChevronDown size={18} className="text-muted transition group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="grid gap-x-6 gap-y-2 px-5 pb-5 sm:grid-cols-2">
                {objectives.map((o, i) => {
                  const weak = sk?.weakTopics?.some(w => o.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(o.toLowerCase().slice(0, 18)));
                  return (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', weak ? 'bg-accent' : 'bg-teal')} aria-hidden />
                      <span>{o}{weak && <span className="ml-1.5 pill bg-accent/20 text-warn">{t('ls.focus')}</span>}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}

          {/* Workspace */}
          <section className="card min-w-0 p-0" aria-label={t('ls.workspace')}>
            <div className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-2" role="tablist" aria-label={t('ls.views')}>
              {tabs.filter(x => x.show).map(x => (
                <button key={x.id} id={`tab-${x.id}`} role="tab" aria-selected={tab === x.id} aria-controls="lesson-panel" onClick={() => setTab(x.id)}
                  className={cx('relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-2 font-semibold transition', junior ? 'text-base' : 'text-sm', tab === x.id ? 'text-ink' : 'text-muted hover:text-ink')}>
                  <x.icon size={16} aria-hidden />{x.label}
                  {tab === x.id && <motion.span layoutId="learn-tab" transition={reduce ? { duration: 0 } : undefined} className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-primary" />}
                </button>
              ))}
            </div>
            <div id="lesson-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="p-4 sm:p-7">
              {tab === 'visual' && hydrated && <VisualLesson unitId={r.unitId} title={title} ctx={r.ctx} labId={lab?.id} young={junior} onComplete={onLessonComplete} />}
              {tab === 'notes' && <NotesPanel unitId={r.unitId} ctx={r.ctx} topics={r.topics} lang={lang} hasLab={!!lab} onLab={() => setTab('lab')} active />}
              {tab === 'lab' && lab && (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-xl">{tf(`lab.${lab.id}.title`, lab.title)}</h2><p className="text-sm text-muted">{tf(`lab.${lab.id}.blurb`, lab.blurb)}</p></div>
                    <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => ask(t('ls.labPrompt', { lab: tf(`lab.${lab.id}.title`, lab.title), title }))}><Sparkles size={15} className="text-primary" aria-hidden /> {t('ls.askLab')}</button>
                  </div>
                  {chapterLabs.length > 1 && (
                    <div className="seg w-fit flex-wrap" role="radiogroup" aria-label={t('ls.moreLabs')}>
                      {chapterLabs.map(l => <button key={l.id} role="radio" aria-checked={l.id === lab.id} onClick={() => setLabId(l.id)}>{tf(`lab.${l.id}.title`, l.title)}</button>)}
                    </div>
                  )}
                  <LabView key={lab.id} id={lab.id} />
                </div>
              )}
              {tab === 'topics' && (
                r.topics.length ? (
                  <div className="grid gap-3">
                    <p className="text-sm text-muted">{t('ls.topicsNote')}</p>
                    <ol className="grid gap-2">
                      {r.topics.map((x, i) => <li key={i} className="flex gap-3 rounded-xl bg-surface2/70 px-4 py-2.5"><span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, '0')}</span><span>{x}</span></li>)}
                    </ol>
                  </div>
                ) : <p className="text-muted">{t('ls.noTopics')}</p>
              )}
            </div>
          </section>

          {/* Next step */}
          <section className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-onprimary"><Target size={20} aria-hidden /></span>
            <div className="min-w-0 flex-1"><b className="block">{assessed ? t('ls.nextReviewTitle') : mastery >= 0.8 ? t('ls.nextTest') : attempts ? t('ls.nextKeep') : t('ls.nextStart')}</b><span className="text-sm text-muted">{t('ls.nextHint')}</span></div>
            <Link href={assessed ? '/student/progress' : mastery >= 0.8 ? `/student/test/${enc}` : `/student/practice/${enc}`} className="btn-primary">{assessed ? t('ls.review') : mastery >= 0.8 ? t('ls.test') : t('ls.startPractice')}</Link>
          </section>

          {/* Vidya on screens without the side panel */}
          <section className={cx('card grid gap-3 p-5', !junior && 'xl:hidden')} aria-label={t('shell.askVidya')}>
            <div className="flex items-center gap-3"><Vidya size={44} /><div><b>{t('ls.stuck')}</b><p className="text-xs text-muted">{t('ls.stuckSub')}</p></div></div>
            <div className="flex flex-wrap gap-2">
              {[t('ls.q1', { title: title.slice(0, 40) }), t('ls.q2'), t('ls.q3')].map(q => (
                <button key={q} onClick={() => ask(q)} className={cx('rounded-full border border-line px-3 py-1.5 text-left hover:border-primary/40 hover:bg-surface2', junior ? 'text-base' : 'text-sm')}>{q}</button>
              ))}
            </div>
          </section>
        </div>

        {!junior && (
          <aside className="card sticky top-20 hidden h-[calc(100dvh-7rem)] min-h-[540px] p-4 xl:block" aria-label={t('nav.tutor')}>
            <TutorChat compact />
          </aside>
        )}
      </div>
    </div>
  );
}
