'use client';
import Link from 'next/link';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowRight, BookOpen, CalendarClock, CalendarDays, Check, CheckCircle2, ClipboardCheck,
  FileText, Moon, Pencil, RotateCcw, Search, Target, Timer, Trash2, Zap,
} from 'lucide-react';
import { Bar, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { addDays, behind, buildPlan, daysBetween, localToday, type PlanDay, type PlanResult, type PlanTask, type PlanUnit, type TaskKind } from '@/lib/prep-plan';
import { useHydrated, useLMS, type PrepPlan } from '@/lib/store';

export interface PlannerSubject { id: string; name: string; units: PlanUnit[]; defaultOn: boolean }

const KIND_ICON: Record<TaskKind, typeof BookOpen> = {
  learn: BookOpen, practice: Target, review: Zap, revise: RotateCcw, mock: Timer, paper: FileText, analysis: Search, eve: Moon,
};
const KIND_TONE: Record<TaskKind, string> = {
  learn: 'bg-primary/10 text-primary', practice: 'bg-teal/15 text-teal', review: 'bg-accent/15 text-warn', revise: 'bg-violet/15 text-violet',
  mock: 'bg-night text-onnight', paper: 'bg-night text-onnight', analysis: 'bg-surface2 text-ink', eve: 'bg-surface2 text-ink',
};
const HOURS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10];

/** Build the schedule for a saved plan (deterministic: same plan in, same days out). */
export function planResult(p: PrepPlan): PlanResult {
  return buildPlan({ units: p.units, startDate: p.startDate, examDate: p.examDate, hoursPerDay: p.hoursPerDay, weeklyMock: p.weeklyMock, mastery: p.mastery, fullTest: p.kind === 'board' ? 'paper' : 'mock' });
}

export function taskHref(task: PlanTask, plan: Pick<PrepPlan, 'id' | 'kind'>) {
  if (task.kind === 'mock') return plan.kind === 'exam' ? `/student/mock/${plan.id}` : undefined;
  if (task.kind === 'analysis') return '/student/progress';
  if (!task.unitId) return undefined;
  return task.kind === 'learn' ? `/student/learn/${encodeURIComponent(task.unitId)}` : `/student/practice/${encodeURIComponent(task.unitId)}`;
}

export function useFmt() {
  const { t, locale } = useT();
  return {
    day: (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }),
    long: (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    short: (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
    mins: (m: number) => (m >= 60 ? (m % 60 ? t('prep.fmtHM', { h: Math.floor(m / 60), m: m % 60 }) : t('prep.fmtH', { h: m / 60 })) : t('prep.fmtM', { m })),
  };
}

export function TaskLabel({ task }: { task: PlanTask }) {
  const { t } = useT();
  return <>{t(`prep.k.${task.kind}`, { unit: task.unitName ?? '', subject: task.subject ?? '' })}</>;
}

export function TaskRow({ task, plan, done, onToggle, compact }: { task: PlanTask; plan: PrepPlan; done: boolean; onToggle?: () => void; compact?: boolean }) {
  const { t } = useT();
  const f = useFmt();
  const Icon = KIND_ICON[task.kind];
  const href = taskHref(task, plan);
  return (
    <li className={cx('flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5', done && 'opacity-70')}>
      {onToggle && (
        <button role="checkbox" aria-checked={done} onClick={onToggle}
          aria-label={t('prep.markDone', { task: t(`prep.k.${task.kind}`, { unit: task.unitName ?? '', subject: task.subject ?? '' }) })}
          className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition', done ? 'border-good bg-good text-white' : 'border-line hover:border-primary')}>
          {done && <Check size={15} aria-hidden />}
        </button>
      )}
      <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg', KIND_TONE[task.kind])} aria-hidden><Icon size={15} /></span>
      <span className="grid min-w-0 flex-1">
        <span className={cx('break-words font-semibold leading-snug', done && 'line-through decoration-muted')}><TaskLabel task={task} /></span>
        <span className="text-xs text-muted">{[!compact && task.subject && task.kind !== 'paper' ? task.subject : '', f.mins(task.minutes)].filter(Boolean).join(' · ')}</span>
      </span>
      {href && !compact && <Link href={href} className="btn-ghost h-9 min-h-0 shrink-0 px-3 text-sm">{t('common.open')}<span className="sr-only">: {t(`prep.k.${task.kind}`, { unit: task.unitName ?? '', subject: task.subject ?? '' })}</span></Link>}
    </li>
  );
}

/** Planner for one target exam: a settings form until a plan exists, then the schedule. */
export function PrepPlanner({ planId, kind, title, subjects, officialDates, examYear }: {
  planId: string; kind: 'exam' | 'board'; title: string; subjects: PlannerSubject[]; officialDates?: string; examYear?: string | null;
}) {
  const hydrated = useHydrated();
  const plan = useLMS(s => s.plans[planId]);
  const [editing, setEditing] = useState(false);
  if (!hydrated) return <div className="skeleton h-40 rounded-card" />;
  if (!plan || editing) return <PlanForm planId={planId} kind={kind} title={title} subjects={subjects} officialDates={officialDates} examYear={examYear} existing={plan} onDone={() => setEditing(false)} />;
  return <PlanView plan={plan} title={title} onEdit={() => setEditing(true)} />;
}

function PlanForm({ planId, kind, title, subjects, officialDates, examYear, existing, onDone }: {
  planId: string; kind: 'exam' | 'board'; title: string; subjects: PlannerSubject[]; officialDates?: string; examYear?: string | null; existing?: PrepPlan; onDone: () => void;
}) {
  const { t } = useT();
  const savePlan = useLMS(s => s.savePlan);
  const skills = useLMS(s => s.skills);
  const today = localToday();
  const [date, setDate] = useState(existing?.examDate ?? '');
  const [hours, setHours] = useState(existing?.hoursPerDay ?? 3);
  const [mock, setMock] = useState(existing?.weeklyMock ?? true);
  const [chosen, setChosen] = useState<string[]>(existing?.subjects ?? subjects.filter(s => s.defaultOn).map(s => s.id));
  const [errs, setErrs] = useState<{ date?: string; subjects?: string }>({});
  const dateRef = useRef<HTMLInputElement>(null);
  const id = `pf-${planId.replace(/[^a-z0-9]/gi, '')}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errs = {};
    if (!date) next.date = t('prep.errDate');
    else if (date <= today) next.date = t('prep.errFuture');
    else if (daysBetween(today, date) > 1100) next.date = t('prep.errFar');
    if (subjects.length > 1 && !chosen.length) next.subjects = t('prep.errSubjects');
    setErrs(next);
    if (next.date) { dateRef.current?.focus(); return; }
    if (next.subjects) return;
    const picked = subjects.filter(s => subjects.length === 1 || chosen.includes(s.id));
    const units = picked.flatMap(s => s.units.map(u => ({ ...u, subject: s.name })));
    const mastery = Object.fromEntries(units.filter(u => skills[u.id]?.attempts).map(u => [u.id, +skills[u.id].pKnown.toFixed(3)]));
    savePlan({
      id: planId, kind, title, units, examDate: date, startDate: today, hoursPerDay: hours, weeklyMock: mock,
      subjects: picked.map(s => s.id), mastery, createdAt: Date.now(), done: existing && existing.startDate === today ? existing.done : [],
    });
    onDone();
  }

  const subjName = (sid: string) => subjects.find(s => s.id === sid)?.name ?? sid;
  return (
    <form onSubmit={submit} noValidate className="card grid gap-5 p-5 sm:p-6" aria-labelledby={`${id}-h`}>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ctl bg-primary/10 text-primary" aria-hidden><CalendarClock size={22} /></span>
        <div className="grid min-w-0 gap-1">
          <h2 id={`${id}-h`} className="h-section">{existing ? t('prep.editTitle') : t('prep.formTitle', { exam: title })}</h2>
          <p className="text-muted">{t('prep.formDesc')}</p>
        </div>
      </div>

      {Object.keys(errs).length > 0 && (
        <div role="alert" className="rounded-ctl border border-bad/40 bg-bad/10 px-4 py-3 text-sm">
          <b>{t('prep.errSummary')}</b>
          <ul className="ml-5 list-disc">{errs.date && <li>{errs.date}</li>}{errs.subjects && <li>{errs.subjects}</li>}</ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-1.5">
          <label htmlFor={`${id}-date`} className="font-semibold">{t('prep.examDate')}</label>
          <input ref={dateRef} id={`${id}-date`} type="date" className="input" value={date} min={addDays(today, 1)} max={addDays(today, 1100)}
            onChange={e => setDate(e.target.value)} aria-invalid={errs.date ? 'true' : undefined} aria-describedby={`${id}-date-hint${errs.date ? ` ${id}-date-err` : ''}`} />
          {errs.date && <p id={`${id}-date-err`} className="text-sm text-bad">{errs.date}</p>}
          <p id={`${id}-date-hint`} className="text-sm text-muted">
            {officialDates ? <>{t('prep.officialDates')} <span lang="en">{officialDates}</span></> : kind === 'board' ? t('prep.boardDateHint') : examYear ? t('prep.yearHint', { y: examYear }) : t('prep.dateHint')}
          </p>
        </div>
        <div className="grid content-start gap-1.5">
          <label htmlFor={`${id}-hrs`} className="font-semibold">{t('prep.hours')}</label>
          <select id={`${id}-hrs`} className="input" value={hours} onChange={e => setHours(+e.target.value)} aria-describedby={`${id}-hrs-hint`}>
            {HOURS.map(h => <option key={h} value={h}>{t('prep.hoursN', { h })}</option>)}
          </select>
          <p id={`${id}-hrs-hint`} className="text-sm text-muted">{t('prep.hoursHint')}</p>
        </div>
      </div>

      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[rgb(var(--primary))]" checked={mock} onChange={e => setMock(e.target.checked)} />
        <span><b>{kind === 'board' ? t('prep.weeklyPaper') : t('prep.weeklyMock')}</b><span className="block text-sm text-muted">{t('prep.weeklyHint')}</span></span>
      </label>

      {subjects.length > 1 && (
        <fieldset className="grid gap-2" aria-describedby={errs.subjects ? `${id}-subj-err` : undefined}>
          <legend className="mb-1 font-semibold">{kind === 'board' ? t('prep.subjectsBoard') : t('prep.subjectsExam')}</legend>
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => {
              const on = chosen.includes(s.id);
              return (
                <label key={s.id} className={cx('inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition', on ? 'border-primary bg-primary/10 text-ink' : 'border-line bg-surface text-muted hover:border-primary/50')}>
                  <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--primary))]" checked={on} onChange={() => setChosen(c => (on ? c.filter(x => x !== s.id) : [...c, s.id]))} />
                  {s.name} <span className="font-normal text-muted">· {s.units.length}</span>
                </label>
              );
            })}
          </div>
          {errs.subjects && <p id={`${id}-subj-err`} className="text-sm text-bad">{errs.subjects}</p>}
          {chosen.length > 0 && <p className="text-xs text-muted">{t('prep.chosen', { list: chosen.map(subjName).join(', ') })}</p>}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="btn-primary"><CalendarDays size={17} aria-hidden /> {existing ? t('prep.update') : t('prep.create')}</button>
        {existing && <button type="button" className="btn-ghost" onClick={onDone}>{t('common.cancel')}</button>}
        <span className="text-xs text-muted">{t('prep.localNote')}</span>
      </div>
    </form>
  );
}

function PlanView({ plan, title, onEdit }: { plan: PrepPlan; title: string; onEdit: () => void }) {
  const { t } = useT();
  const f = useFmt();
  const toggleTask = useLMS(s => s.toggleTask);
  const savePlan = useLMS(s => s.savePlan);
  const removePlan = useLMS(s => s.removePlan);
  const skills = useLMS(s => s.skills);
  const [confirmDel, setConfirmDel] = useState(false);
  const today = localToday();
  const r = useMemo(() => planResult(plan), [plan]);
  const done = useMemo(() => new Set(plan.done), [plan.done]);
  const left = daysBetween(today, plan.examDate);
  const late = behind(r, done, today);
  const allTasks = r.days.flatMap(d => d.tasks);
  const doneCount = allTasks.filter(x => done.has(x.key)).length;
  const todayDay = r.days.find(d => d.date === today) ?? (today < plan.startDate ? r.days[0] : undefined);
  const upcoming = r.days.filter(d => d.date > (todayDay?.date ?? today)).slice(0, 6);
  const elapsed = Math.min(1, Math.max(0, daysBetween(plan.startDate, today) / Math.max(1, r.totalDays)));
  const buildShare = r.totalDays ? r.buildDays / r.totalDays : 0;
  const id = `pv-${plan.id.replace(/[^a-z0-9]/gi, '')}`;

  const replan = () => {
    const mastery = Object.fromEntries(plan.units.filter(u => skills[u.id]?.attempts).map(u => [u.id, +skills[u.id].pKnown.toFixed(3)]));
    savePlan({ ...plan, startDate: today, mastery, createdAt: Date.now(), done: [] });
  };

  if (left <= 0) {
    return (
      <section className="card grid gap-3 p-5 sm:p-6" aria-labelledby={`${id}-h`}>
        <h2 id={`${id}-h`} className="h-section">{t('prep.title', { exam: title })}</h2>
        <p className="text-muted">{left === 0 ? t('prep.examToday') : t('prep.examPassed', { date: f.long(plan.examDate) })}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onEdit}><CalendarDays size={16} aria-hidden /> {t('prep.newDate')}</button>
          <button className="btn-ghost" onClick={() => removePlan(plan.id)}><Trash2 size={16} aria-hidden /> {t('prep.delete')}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-5 rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6" aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ctl bg-primary/10 text-primary" aria-hidden><CalendarClock size={22} /></span>
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="text-sm font-semibold text-muted">{t('prep.eyebrow')}</p>
          <h2 id={`${id}-h`} className="h-section">{t('prep.title', { exam: title })}</h2>
          <p className="text-sm text-muted">{t('prep.examOn', { date: f.long(plan.examDate) })} · {t('prep.hoursN', { h: plan.hoursPerDay })}</p>
        </div>
        <div className="grid justify-items-end text-right">
          <span className="font-display text-4xl font-bold leading-none text-primary">{left}</span>
          <span className="text-sm text-muted">{left === 1 ? t('prep.dayLeft') : t('prep.daysLeft')}</span>
        </div>
      </div>

      <StatusLine r={r} late={late} onReplan={replan} />

      <div className="grid gap-2" role="img" aria-label={t('prep.phaseAria', { build: r.buildDays, final: r.totalDays - r.buildDays, until: f.long(addDays(r.finalStart, -1)) })}>
        <div className="relative flex h-3 overflow-hidden rounded-full bg-surface2">
          <span className="h-full bg-primary/70" style={{ width: `${buildShare * 100}%` }} />
          <span className="h-full bg-accent/80" style={{ width: `${(1 - buildShare) * 100}%` }} />
          <span className="absolute top-0 h-full w-0.5 bg-ink" style={{ left: `${elapsed * 100}%` }} />
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
          {r.buildDays > 0 && <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary/70 align-middle" />{t('prep.phaseBuild', { date: f.short(addDays(r.finalStart, -1)) })}</span>}
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent/80 align-middle" />{t('prep.phaseFinal', { date: f.short(r.finalStart) })}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat k={t('prep.statUnits')} v={r.unitsTotal} />
        <Stat k={t('prep.statHours')} v={t('prep.hShort', { h: r.plannedHours })} />
        <Stat k={plan.kind === 'board' ? t('prep.statPapers') : t('prep.statMocks')} v={r.mocks} />
        <Stat k={t('prep.statDone')} v={`${doneCount}/${allTasks.length}`} extra={<Bar value={allTasks.length ? doneCount / allTasks.length : 0} className="mt-1.5" />} />
      </dl>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            {todayDay?.date === today ? t('prep.today') : t('prep.firstDay')} <span className="text-sm font-normal text-muted">· {todayDay ? f.day(todayDay.date) : ''}</span>
            {todayDay && <PhaseTag phase={todayDay.phase} />}
          </h3>
          {todayDay?.tasks.length ? (
            <ul className="grid gap-2">{todayDay.tasks.map(x => <TaskRow key={x.key} task={x} plan={plan} done={done.has(x.key)} onToggle={() => toggleTask(plan.id, x.key)} />)}</ul>
          ) : <p className="text-muted">{t('prep.restDay')}</p>}
          {todayDay && todayDay.tasks.length > 0 && todayDay.tasks.every(x => done.has(x.key)) && (
            <p className="flex items-center gap-2 font-semibold text-good" role="status"><CheckCircle2 size={18} aria-hidden /> {t('prep.dayDone')}</p>
          )}
        </div>
        <div className="grid content-start gap-2">
          <h3 className="text-lg font-semibold">{t('prep.comingUp')}</h3>
          <ul className="grid gap-1.5">{upcoming.map(d => <DayLine key={d.date} day={d} done={done} />)}</ul>
        </div>
      </div>

      <details className="group rounded-ctl border border-line">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-semibold"><CalendarDays size={17} aria-hidden /> {t('prep.fullSchedule')} <span className="text-sm font-normal text-muted">· {t('prep.weeksN', { n: Math.ceil(r.days.length / 7) })}</span></summary>
        <div className="grid gap-4 border-t border-line p-4">
          {weeks(r.days).map((w, i) => (
            <section key={w[0].date} className="grid gap-1.5" aria-label={t('prep.weekN', { n: i + 1 })}>
              <h4 className="flex flex-wrap items-center gap-2 text-sm font-semibold">{t('prep.weekN', { n: i + 1 })} <span className="font-normal text-muted">{f.short(w[0].date)} – {f.short(w[w.length - 1].date)}</span><PhaseTag phase={w[w.length - 1].phase} /></h4>
              <ul className="grid gap-1">{w.map(d => <DayLine key={d.date} day={d} done={done} isToday={d.date === today} />)}</ul>
            </section>
          ))}
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <button className="btn-ghost text-sm" onClick={replan}><RotateCcw size={15} aria-hidden /> {t('prep.replan')}</button>
        <button className="btn-ghost text-sm" onClick={onEdit}><Pencil size={15} aria-hidden /> {t('prep.edit')}</button>
        {confirmDel
          ? <button className="btn-soft text-sm text-bad" onClick={() => removePlan(plan.id)} autoFocus><Trash2 size={15} aria-hidden /> {t('prep.deleteSure')}</button>
          : <button className="btn-soft text-sm" onClick={() => setConfirmDel(true)}><Trash2 size={15} aria-hidden /> {t('prep.delete')}</button>}
        <span className="ml-auto text-xs text-muted">{t('prep.localNote')}</span>
      </div>
    </section>
  );
}

function StatusLine({ r, late, onReplan }: { r: PlanResult; late: number; onReplan: () => void }) {
  const { t } = useT();
  if (late > 0) return (
    <div className="flex flex-wrap items-center gap-3 rounded-ctl bg-accent/15 px-4 py-3 text-sm" role="status">
      <AlertTriangle size={17} className="text-warn" aria-hidden /><span className="flex-1"><b>{t('prep.behind', { n: late })}</b> {t('prep.behindHint')}</span>
      <button className="btn-ghost h-9 min-h-0 text-sm" onClick={onReplan}><RotateCcw size={15} aria-hidden /> {t('prep.replan')}</button>
    </div>
  );
  if (r.status === 'tight' || r.status === 'short') return (
    <div className="flex items-start gap-3 rounded-ctl bg-accent/15 px-4 py-3 text-sm" role="status">
      <AlertTriangle size={17} className="mt-0.5 shrink-0 text-warn" aria-hidden />
      <span><b>{r.status === 'short' ? t('prep.short') : t('prep.tight')}</b> {t('prep.tightHint', { need: r.neededHours, have: r.availableHours })}{r.suggestHours ? ` ${t('prep.suggest', { h: r.suggestHours })}` : ''}</span>
    </div>
  );
  return <p className="flex items-center gap-2 text-sm font-semibold text-good" role="status"><ClipboardCheck size={17} aria-hidden /> {t('prep.onTrack')}</p>;
}

function Stat({ k, v, extra }: { k: string; v: ReactNode; extra?: ReactNode }) {
  return <div className="rounded-xl bg-surface2/70 px-4 py-3"><dt className="text-xs text-muted">{k}</dt><dd className="font-display text-xl font-bold">{v}</dd>{extra}</div>;
}

function PhaseTag({ phase }: { phase: 'build' | 'final' }) {
  const { t } = useT();
  return <span className={cx('pill', phase === 'build' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-warn')}>{phase === 'build' ? t('prep.tagBuild') : t('prep.tagFinal')}</span>;
}

function DayLine({ day, done, isToday }: { day: PlanDay; done: Set<string>; isToday?: boolean }) {
  const { t } = useT();
  const f = useFmt();
  const mins = day.tasks.reduce((a, x) => a + x.minutes, 0);
  const all = day.tasks.length > 0 && day.tasks.every(x => done.has(x.key));
  const summary = day.tasks.map(x => (x.kind === 'mock' || x.kind === 'paper' || x.kind === 'analysis' || x.kind === 'eve') ? t(`prep.k.${x.kind}`, { unit: '', subject: x.subject ?? '' }) : `${t(`prep.s.${x.kind}`)}: ${x.unitName}`);
  return (
    <li className={cx('grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-baseline gap-3 rounded-lg px-2 py-1.5 text-sm', isToday && 'bg-primary/5 ring-1 ring-primary/30')}>
      <span className="font-semibold">{f.day(day.date)}</span>
      <span className="min-w-0 text-muted"><span className="line-clamp-2">{summary.join(' · ')}</span></span>
      <span className="flex items-center gap-1 font-mono text-xs text-muted">{all && <Check size={13} className="text-good" aria-label={t('prep.doneAria')} />}{f.mins(mins)}</span>
    </li>
  );
}

function weeks(days: PlanDay[]) {
  const out: PlanDay[][] = [];
  for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
  return out;
}

/** `board:<board>:<class>[:<stream>]` → "CBSE Class 12 board exams" (Classes 10 and 12) or "Class 11 final exams". */
export function boardPlanId(board: string, cls: number, stream?: string | null) { return ['board', board, cls, stream].filter(Boolean).join(':'); }
export function useBoardTitle() {
  const { t } = useT();
  return (id: string) => {
    const [, board, cls] = id.split(':');
    return cls === '10' || cls === '12' ? t('prep.boardTitle', { board, n: cls }) : t('prep.schoolTitle', { board, n: cls });
  };
}

/** Dashboard card: today's sessions for the nearest target exam. */
export function TodayPrep() {
  const { t } = useT();
  const boardTitle = useBoardTitle();
  const f = useFmt();
  const plans = useLMS(s => s.plans);
  const toggleTask = useLMS(s => s.toggleTask);
  const today = localToday();
  const next = Object.values(plans).filter(p => p.examDate > today).sort((a, b) => a.examDate.localeCompare(b.examDate))[0];
  const r = useMemo(() => (next ? planResult(next) : null), [next]);
  if (!next || !r) return null;
  const done = new Set(next.done);
  const day = r.days.find(d => d.date === today) ?? (today < next.startDate ? r.days[0] : undefined);
  const late = behind(r, done, today);
  const title = next.kind === 'board' ? boardTitle(next.id) : next.title;
  const href = next.kind === 'board' ? '/student/syllabus#prep' : `/student/exams/${next.id}#prep`;
  const others = Object.values(plans).filter(p => p.id !== next.id && p.examDate > today).length;
  return (
    <section className="grid gap-4 rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="today-prep">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="text-sm font-semibold text-muted">{t('prep.dashEyebrow')}</p>
          <h2 id="today-prep" className="h-section">{t('prep.dashTitle', { exam: title, n: daysBetween(today, next.examDate) })}</h2>
          {late > 0 ? <p className="text-sm font-semibold text-warn">{t('prep.behind', { n: late })}</p>
            : <p className="text-sm text-muted">{day ? t('prep.dashSub', { mins: f.mins(day.tasks.reduce((a, x) => a + x.minutes, 0)) }) : t('prep.restDay')}</p>}
        </div>
        <Link href={href} className="btn-ghost text-sm">{t('prep.openPlan')} <ArrowRight size={15} aria-hidden /></Link>
      </div>
      {day && day.tasks.length > 0 && <ul className="grid gap-2 md:grid-cols-2">{day.tasks.map(x => <TaskRow key={x.key} task={x} plan={next} done={done.has(x.key)} onToggle={() => toggleTask(next.id, x.key)} />)}</ul>}
      {others > 0 && <p className="text-xs text-muted">{t('prep.otherPlans', { n: others })}</p>}
    </section>
  );
}
