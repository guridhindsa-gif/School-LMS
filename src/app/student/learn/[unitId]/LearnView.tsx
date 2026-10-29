'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpenText, Check, ChevronDown, Clapperboard, ClipboardCheck, FlaskConical, ListChecks, PencilLine, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { VisualLesson } from '@/components/visual/VisualLesson';
import { Crumbs } from '@/components/Crumbs';
import { TutorChat } from '@/components/TutorChat';
import { BandPill, Reveal, Ring, cx } from '@/components/ui';
import { LabView } from '@/components/labs/LabView';
import { labFor } from '@/components/labs/registry';
import { band } from '@/lib/adaptive';
import { useLMS, useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { ResolvedUnit } from '@/lib/context';
import { NotesPanel } from './NotesPanel';

type Tab = 'visual' | 'notes' | 'lab' | 'topics';
type StageState = 'done' | 'active' | 'todo';

const clean = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '');
const doneKey = (id: string) => `lesson-done:${id}`;

/** The lesson studio: chapter header, Learn → Explore → Practise → Check path, workspace and Vidya. */
export function LearnView({ r }: { r: ResolvedUnit }) {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const lang = useLMS(s => s.profile.language);
  const sk = useLMS(s => s.skills[r.unitId]);
  const setContext = useTutor(s => s.setContext);
  const ask = useTutor(s => s.ask);
  const lab = labFor(r.title, r.cls);
  const [tab, setTab] = useState<Tab>('visual');
  const [notesSeen, setNotesSeen] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);
  const [labSeen, setLabSeen] = useState(false);
  const enc = encodeURIComponent(r.unitId);
  const title = clean(r.title);

  useEffect(() => { setContext(r.ctx, title.length > 40 ? title.slice(0, 40) + '…' : title); }, [r, title, setContext]);
  useEffect(() => { try { setLessonDone(!!localStorage.getItem(doneKey(r.unitId))); } catch { /* */ } }, [r.unitId]);
  useEffect(() => { if (tab === 'notes') setNotesSeen(true); if (tab === 'lab') setLabSeen(true); }, [tab]);
  const onLessonComplete = useCallback(() => { setLessonDone(true); try { localStorage.setItem(doneKey(r.unitId), '1'); } catch { /* */ } }, [r.unitId]);

  const b = band(sk);
  const practised = (sk?.attempts ?? 0) > 0;
  const strong = (sk?.pKnown ?? 0) >= 0.8;
  const stages: { id: string; label: string; sub: string; icon: typeof Clapperboard; state: StageState; act: () => void; href?: string }[] = [
    { id: 'learn', label: 'Learn', sub: lessonDone ? 'Picture lesson watched' : 'Picture lesson', icon: Clapperboard, state: lessonDone ? 'done' : 'active', act: () => setTab('visual') },
    { id: 'explore', label: 'Explore', sub: lab ? lab.title : 'Notes and worked examples', icon: lab ? FlaskConical : BookOpenText, state: (lab ? labSeen : notesSeen) ? 'done' : lessonDone ? 'active' : 'todo', act: () => setTab(lab ? 'lab' : 'notes') },
    { id: 'practise', label: 'Practise', sub: practised ? `${sk!.attempts} answered · ${Math.round((sk!.pKnown) * 100)}% mastery` : 'Questions at your level', icon: Target, state: strong ? 'done' : practised ? 'active' : 'todo', act: () => {}, href: `/student/practice/${enc}` },
    { id: 'check', label: 'Check', sub: strong ? 'Ready for the chapter test' : 'Chapter test', icon: ClipboardCheck, state: strong ? 'active' : 'todo', act: () => {}, href: `/student/test/${enc}` },
  ];

  const tabs: { id: Tab; label: string; icon: typeof BookOpenText; show: boolean }[] = [
    { id: 'visual', label: 'Picture lesson', icon: Clapperboard, show: true },
    { id: 'notes', label: 'Notes', icon: BookOpenText, show: true },
    { id: 'lab', label: lab ? lab.title : 'Lab', icon: FlaskConical, show: !!lab },
    { id: 'topics', label: `Topics${r.topics.length ? ` (${r.topics.length})` : ''}`, icon: ListChecks, show: true },
  ];
  const objectives = r.topics.slice(0, 6).map(clean);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Chapter header */}
      <Reveal className="grid gap-4">
        <Crumbs items={r.crumbs} />
        <div className="flex flex-wrap items-start gap-5">
          {hydrated && <div className="hidden sm:block"><Ring value={sk?.pKnown ?? 0} size={72} label={practised ? undefined : 'New'} /></div>}
          <div className="grid min-w-0 flex-1 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill bg-primary/10 text-primary">{r.ctx.subject}</span>
              {hydrated && <BandPill band={b} />}
              {r.marks != null && <span className="pill bg-surface2 text-muted">{r.marks} marks</span>}
            </div>
            <h1 className="h-page">{title}</h1>
            {sk?.weakTopics?.length ? <p className="text-sm text-muted">Vidya noticed you could strengthen: <b className="text-ink">{sk.weakTopics.slice(0, 3).join(', ')}</b></p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/student/practice/${enc}`} className="btn-primary"><Target size={17} /> Adaptive practice</Link>
            <Link href={`/student/test/${enc}`} className="btn-ghost"><PencilLine size={17} /> Chapter test</Link>
          </div>
        </div>
      </Reveal>

      {/* Learning path */}
      <nav aria-label="Learning path" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stages.map((s, i) => {
          const inner = (
            <>
              <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition',
                s.state === 'done' ? 'border-good bg-good text-white' : s.state === 'active' ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted')}>
                {s.state === 'done' ? <Check size={16} strokeWidth={3} /> : <s.icon size={16} />}
              </span>
              <span className="min-w-0 text-left">
                <span className="flex items-center gap-1.5 text-sm font-bold"><span className="font-mono text-[11px] text-muted">{i + 1}</span>{s.label}</span>
                <span className="block truncate text-xs text-muted">{s.sub}</span>
              </span>
            </>
          );
          const cls = cx('flex items-center gap-3 rounded-card border bg-surface px-3 py-3 transition hover:border-primary/40',
            s.state === 'active' ? 'border-primary/40 shadow-soft' : 'border-line');
          return s.href
            ? <Link key={s.id} href={s.href} className={cls}>{inner}<span className="sr-only">{s.state === 'done' ? ' (done)' : ''}</span></Link>
            : <button key={s.id} onClick={s.act} className={cls} aria-current={(s.id === 'learn' && tab === 'visual') || (s.id === 'explore' && (tab === 'lab' || tab === 'notes')) ? 'step' : undefined}>{inner}<span className="sr-only">{s.state === 'done' ? ' (done)' : ''}</span></button>;
        })}
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="grid min-w-0 grid-cols-1 gap-6">
          {/* Objectives */}
          {objectives.length > 0 && (
            <details className="group card p-0 [&_summary::-webkit-details-marker]:hidden" open>
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal/15 text-teal"><ListChecks size={16} /></span>
                <b className="flex-1">In this chapter you will learn</b>
                <ChevronDown size={18} className="text-muted transition group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="grid gap-x-6 gap-y-2 px-5 pb-5 sm:grid-cols-2">
                {objectives.map((o, i) => {
                  const weak = sk?.weakTopics?.some(w => o.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(o.toLowerCase().slice(0, 18)));
                  return (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', weak ? 'bg-accent' : 'bg-teal')} aria-hidden />
                      <span>{o}{weak && <span className="ml-1.5 pill bg-accent/20 text-warn">Focus</span>}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}

          {/* Workspace */}
          <section className="card min-w-0 p-0" aria-label="Lesson workspace">
            <div className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-2" role="tablist" aria-label="Lesson views">
              {tabs.filter(t => t.show).map(t => (
                <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={tab === t.id} aria-controls="lesson-panel" onClick={() => setTab(t.id)}
                  className={cx('relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-2 text-sm font-semibold transition', tab === t.id ? 'text-ink' : 'text-muted hover:text-ink')}>
                  <t.icon size={16} />{t.label}
                  {tab === t.id && <motion.span layoutId="learn-tab" transition={reduce ? { duration: 0 } : undefined} className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-primary" />}
                </button>
              ))}
            </div>
            <div id="lesson-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="p-4 sm:p-7">
              {tab === 'visual' && hydrated && <VisualLesson unitId={r.unitId} title={title} ctx={r.ctx} labId={lab?.id} young={(r.cls ?? 9) <= 5} onComplete={onLessonComplete} />}
              {tab === 'notes' && <NotesPanel unitId={r.unitId} ctx={r.ctx} lang={lang} hasLab={!!lab} onLab={() => setTab('lab')} active />}
              {tab === 'lab' && lab && (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-xl">{lab.title}</h2><p className="text-sm text-muted">{lab.blurb}</p></div>
                    <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => ask(`I'm using the "${lab.title}" lab for ${title}. Ask me one question about what I see.`)}><Sparkles size={15} className="text-primary" /> Ask Vidya about this lab</button>
                  </div>
                  <LabView id={lab.id} />
                </div>
              )}
              {tab === 'topics' && (
                r.topics.length ? (
                  <div className="grid gap-3">
                    <p className="text-sm text-muted">Sub-topics exactly as listed in the official syllabus.</p>
                    <ol className="grid gap-2">
                      {r.topics.map((t, i) => (
                        <li key={i} className="flex gap-3 rounded-xl bg-surface2/70 px-4 py-2.5"><span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, '0')}</span><span>{t}</span></li>
                      ))}
                    </ol>
                  </div>
                ) : <p className="text-muted">The official syllabus lists this unit without separate sub-topics.</p>
              )}
            </div>
          </section>

          {/* Next step */}
          <section className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-gradient-to-r from-primary/[.07] to-teal/[.07] p-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-onprimary"><Target size={20} /></span>
            <div className="min-w-0 flex-1"><b className="block">{strong ? 'You look ready — take the chapter test' : practised ? 'Keep practising at your level' : 'Ready to try some questions?'}</b><span className="text-sm text-muted">Questions adapt to you: easier when you’re stuck, harder as you improve.</span></div>
            <Link href={strong ? `/student/test/${enc}` : `/student/practice/${enc}`} className="btn-primary">{strong ? 'Chapter test' : 'Start practice'}</Link>
          </section>

          {/* Vidya on smaller screens */}
          <section className="card grid gap-3 p-5 xl:hidden" aria-label="Ask Vidya">
            <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-onprimary"><Sparkles size={16} /></span><div><b>Stuck? Ask Vidya</b><p className="text-xs text-muted">Your tutor already knows this chapter.</p></div></div>
            <div className="flex flex-wrap gap-2">
              {[`Explain "${title.slice(0, 40)}" simply`, 'Show me a worked example', 'What mistakes do students make here?'].map(q => (
                <button key={q} onClick={() => ask(q)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-surface2">{q}</button>
              ))}
            </div>
          </section>
        </div>

        <aside className="card sticky top-20 hidden h-[calc(100dvh-7rem)] min-h-[540px] p-4 xl:block" aria-label="Vidya, AI tutor">
          <TutorChat compact />
        </aside>
      </div>
    </div>
  );
}
