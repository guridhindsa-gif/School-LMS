'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarClock, ClipboardCheck, Flame, FlaskConical, Play, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyArt, SubjectArt } from './art';
import { Bar, Ring, cx, masteryColor } from './ui';
import type { Recommendation as Rec } from '@/lib/adaptive';
import { useT } from '@/lib/i18n';

export const REASON: Record<Rec['reason'], { icon: typeof Play }> = {
  review: { icon: RotateCcw }, weak: { icon: Target }, continue: { icon: Play }, new: { icon: Sparkles },
};

const enc = encodeURIComponent;
const clean = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '');

/** The single most important card: what to do now. */
export function ContinueCard({ rec, subject, others, subjOf }: { rec?: Rec; subject?: string; others: Rec[]; subjOf: (id: string) => string | undefined }) {
  const { t } = useT();
  if (!rec) {
    return (
      <section className="panel-night grid content-center gap-3 rounded-card p-6 shadow-lift sm:p-8">
        <p className="text-sm font-semibold text-onnight/70">{t('home.continue')}</p>
        <h2 className="text-2xl">{t('home.noChapters')}</h2>
        <p className="text-onnight/75">{t('home.noChaptersHint')}</p>
        <div className="flex flex-wrap gap-2"><Link href="/student/exams" className="btn bg-white text-night hover:bg-white/90">{t('nav.exams')}</Link><Link href="/student/onboarding" className="btn border border-white/25 text-onnight hover:bg-white/10">{t('home.changeClass')}</Link></div>
      </section>
    );
  }
  const R = REASON[rec.reason];
  return (
    <section className="panel-night relative grid gap-6 overflow-hidden rounded-card p-6 shadow-lift sm:p-8" aria-labelledby="continue-title">
      <div className="flex flex-wrap items-start gap-5">
        <div className="grid min-w-0 flex-1 gap-2">
          <p className="text-sm font-semibold text-onnight/70">{t('home.continue')}</p>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold"><R.icon size={13} aria-hidden />{t(`reason.${rec.reason}`)}</span>
          <h2 id="continue-title" className="text-2xl sm:text-3xl">{clean(rec.name)}</h2>
          {subject && <p className="text-onnight/75">{subject}</p>}
        </div>
        <div className="grid justify-items-center gap-1 rounded-2xl bg-white/[.06] p-3">
          <Ring value={rec.mastery} size={74} label={rec.mastery > 0 ? undefined : t('common.new')} />
          <span className="text-[11px] text-onnight/70">{t('mastery.label')}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/student/learn/${enc(rec.id)}`} className="btn bg-white text-night hover:bg-white/90"><Play size={16} aria-hidden /> {t(`verb.${rec.reason}`)}</Link>
        <Link href={`/student/practice/${enc(rec.id)}`} className="btn border border-white/25 text-onnight hover:bg-white/10"><Target size={16} aria-hidden /> {t('home.adaptive')}</Link>
      </div>
      {others.length > 0 && (
        <div className="grid gap-2 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold text-onnight/65">{t('home.then')}</p>
          <ul className="grid gap-1.5 sm:grid-cols-3">
            {others.map(o => {
              const O = REASON[o.reason];
              return (
                <li key={o.id}>
                  <Link href={`/student/learn/${enc(o.id)}`} className="group grid h-full gap-0.5 rounded-xl bg-white/[.06] px-3 py-2.5 transition hover:bg-white/[.12]">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-onnight/70"><O.icon size={11} aria-hidden />{t(`reason.${o.reason}`)}</span>
                    <b className="line-clamp-2 text-sm leading-snug">{clean(o.name)}</b>
                    <span className="truncate text-xs text-onnight/65">{subjOf(o.id)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

export function MissionCard({ mission, streak, best, dueHref, level }: { mission: { answered: number; goal: number; done: boolean; progress: number; due: number }; streak: number; best: number; dueHref?: string; level: { level: number; progress: number; toNext: number; badges: number; total: number } }) {
  const { t } = useT();
  const left = mission.goal - mission.answered;
  return (
    <section className="card grid content-start gap-5 p-6" aria-labelledby="mission-title">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-semibold text-muted">{t('home.today')}</p><h2 id="mission-title" className="h-section">{t('home.mission')}</h2></div>
        <span className={cx('pill', streak ? 'bg-accent/20 text-warn' : 'bg-surface2 text-muted')} title={t('home.bestStreak', { n: best })}><Flame size={13} aria-hidden />{t('home.days', { n: streak })}</span>
      </div>
      <div className="flex items-center gap-4">
        <Ring value={mission.progress} size={86} stroke={9} color={mission.done ? 'rgb(var(--good))' : 'rgb(var(--primary))'} label={<span className="text-[0.8em]">{mission.answered}/{mission.goal}</span>} />
        <div className="grid gap-1">
          <b>{mission.done ? t('home.missionDone') : t(left === 1 ? 'home.answerOne' : 'home.answerMore', { n: left })}</b>
          <p className="text-sm text-muted">{mission.done ? t('home.missionBonus') : t('home.missionHint')}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-surface2 px-3 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/12 text-primary"><CalendarClock size={17} aria-hidden /></span>
        <div className="min-w-0 flex-1"><b className="block text-sm">{mission.due ? t('home.due', { n: mission.due }) : t('home.noDue')}</b><span className="text-xs text-muted">{t('home.dueHint')}</span></div>
        {dueHref && <Link href={dueHref} className="btn-ghost h-9 min-h-0 px-3 text-sm">{t('home.revise')}</Link>}
      </div>
      <Link href="/student/progress" className="group flex items-center gap-3 border-t border-line pt-4 text-sm">
        <span className="font-semibold">{t('shell.level', { n: level.level })}</span>
        <Bar value={level.progress} color="rgb(var(--primary))" className="flex-1" />
        <span className="text-muted">{t('home.badges', { n: level.badges, total: level.total })}</span>
        <ArrowRight size={15} className="text-muted transition group-hover:translate-x-1" aria-hidden />
      </Link>
    </section>
  );
}

/** Subjects the learner has started, as tiles; the rest collapse into one compact group. */
export function SubjectsSection({ subjects }: { subjects: { id: string; name: string; book?: string; total: number; started: number; mastery: number }[] }) {
  const { t } = useT();
  const started = subjects.filter(s => s.started > 0);
  const rest = subjects.filter(s => !s.started);
  return (
    <section className="grid grid-cols-1 gap-4" aria-labelledby="subjects-title">
      <div className="flex items-end justify-between gap-3">
        <h2 id="subjects-title" className="h-section">{t('home.subjects')}</h2>
        <Link href="/student/syllabus" className="text-sm font-semibold text-primary hover:underline">{t('home.fullSyllabus')} →</Link>
      </div>
      {started.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {started.map(s => (
            <Link key={s.id} href={`/student/subject/${enc(s.id)}`} className="card card-hover group flex items-center gap-4 p-4">
              <SubjectArt name={s.name} size={52} className="shrink-0" />
              <div className="grid min-w-0 flex-1 gap-1.5">
                <div className="flex items-baseline justify-between gap-2"><b className="truncate font-display text-lg leading-tight">{s.name}</b><span className="text-sm font-semibold tabular-nums text-ink">{Math.round(s.mastery * 100)}%</span></div>
                <Bar value={s.mastery} />
                <span className="text-xs text-muted">{t('home.startedOf', { s: s.started, n: s.total })}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-surface/60 px-5 py-4 text-sm text-muted">{t('home.noneStarted')}</p>
      )}
      {rest.length > 0 && (
        <details className="group rounded-card border border-line bg-surface [&_summary::-webkit-details-marker]:hidden" open={!started.length}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 font-semibold">
            {t('home.notStarted', { n: rest.length })}
            <ArrowRight size={16} className="text-muted transition group-open:rotate-90" aria-hidden />
          </summary>
          <ul className="flex flex-wrap gap-2 px-5 pb-4">
            {rest.map(s => (
              <li key={s.id}><Link href={`/student/subject/${enc(s.id)}`} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                <SubjectArt name={s.name} size={26} />{s.name}<span className="font-normal text-muted">· {t('common.chapters', { n: s.total })}</span></Link></li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export function WeekChart({ days }: { days: { d: string; answered: number; correct: number; minutes: number }[] }) {
  const reduce = useReducedMotion();
  const { t, locale } = useT();
  const maxA = Math.max(5, ...days.map(d => d.answered));
  const total = days.reduce((a, d) => a + d.answered, 0), right = days.reduce((a, d) => a + d.correct, 0);
  const mins = days.reduce((a, d) => a + d.minutes, 0);
  const wd = (d: string) => new Date(d).toLocaleDateString(locale, { weekday: 'short' });
  return (
    <section className="card grid min-w-0 grid-cols-1 content-start gap-4 p-6" aria-labelledby="week-title">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-sm font-semibold text-muted">{t('home.last7')}</p><h2 id="week-title" className="h-section">{t('home.week')}</h2></div>
        {total > 0 && <div className="text-right text-sm"><b className="font-display text-2xl tabular-nums">{total}</b><span className="text-muted"> {t('home.answered')}</span></div>}
      </div>
      {total === 0 ? (
        <div className="grid justify-items-center gap-2 py-2 text-center"><EmptyArt kind="activity" size={96} /><p className="max-w-xs text-sm text-muted">{t('home.weekEmpty')}</p></div>
      ) : (
        <>
          <div className="flex h-36 items-stretch gap-2" role="img" aria-label={t('home.weekAria', { list: days.map(d => `${wd(d.d)} ${d.answered}/${d.correct}`).join('; ') })}>
            {days.map((d, i) => (
              <div key={d.d} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] tabular-nums text-muted">{d.answered || ''}</span>
                <div className="relative min-h-0 w-full max-w-9 flex-1 overflow-hidden rounded-md bg-surface2">
                  <motion.div className="absolute bottom-0 w-full rounded-md bg-primary/30" initial={reduce ? false : { height: 0 }} animate={{ height: `${(d.answered / maxA) * 100}%` }} transition={{ delay: i * 0.04, duration: 0.6 }} />
                  <motion.div className="absolute bottom-0 w-full rounded-md bg-primary" initial={reduce ? false : { height: 0 }} animate={{ height: `${(d.correct / maxA) * 100}%` }} transition={{ delay: 0.1 + i * 0.04, duration: 0.6 }} />
                </div>
                <span className={cx('text-[11px]', i === days.length - 1 ? 'font-bold text-ink' : 'text-muted')}>{i === days.length - 1 ? t('home.todayShort') : wd(d.d)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary" />{t('home.correctN', { n: right })}</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary/30" />{t('home.answeredLegend')}</span>
            {mins > 0 && <span className="ml-auto">{t('home.minutes', { n: mins })}</span>}
          </div>
        </>
      )}
    </section>
  );
}

export function RevisionList({ items }: { items: { id: string; name: string; subject?: string; mastery: number; due: boolean; weak: string[] }[] }) {
  const { t } = useT();
  return (
    <section className="card grid min-w-0 grid-cols-1 content-start gap-4 p-6" aria-labelledby="rev-title">
      <div><p className="text-sm font-semibold text-muted">{t('home.keepFresh')}</p><h2 id="rev-title" className="h-section">{t('home.revision')}</h2></div>
      {!items.length ? (
        <div className="grid justify-items-center gap-2 py-2 text-center"><EmptyArt kind="progress" size={96} /><p className="max-w-xs text-sm text-muted">{t('home.revisionEmpty')}</p></div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {items.map(r => (
            <li key={r.id}>
              <Link href={`/student/practice/${enc(r.id)}`} className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-line hover:bg-surface2">
                <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: masteryColor(r.mastery) }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{clean(r.name)}</b>
                  <span className="block truncate text-xs text-muted">{r.weak.length ? t('home.workOn', { list: r.weak.slice(0, 2).join(', ') }) : r.subject}</span>
                </span>
                {r.due && <span className="pill bg-primary/12 text-primary">{t('home.dueTag')}</span>}
                <span className="w-10 text-right font-mono text-xs tabular-nums text-muted">{Math.round(r.mastery * 100)}%</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const EXAM_NAMES: Record<string, string> = { jee_main: 'JEE Main', jee_adv: 'JEE Advanced', neet: 'NEET-UG', bitsat: 'BITSAT', cuet: 'CUET-UG', clat: 'CLAT', ipmat: 'IPMAT', nda: 'NDA', nata: 'NATA', uceed: 'UCEED', ioqm: 'IOQM', nse: 'NSE' };

export function ExamPrep({ tracks, chosen }: { tracks: { id: string; name: string; exams: string[] }[]; chosen: string[] }) {
  const { t } = useT();
  if (!tracks.length) return null;
  const list = [...tracks].sort((a, b) => Number(chosen.includes(b.id)) - Number(chosen.includes(a.id))).slice(0, 4);
  return (
    <section className="grid gap-4 rounded-card border border-line bg-surface p-6" aria-labelledby="exam-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold text-muted">{t('home.entrance')}</p><h2 id="exam-title" className="h-section">{t('home.examsOpen')}</h2></div>
        <Link href="/student/exams" className="btn-ghost text-sm">{t('home.allExams')} <ArrowRight size={15} aria-hidden /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map(tr => (
          <div key={tr.id} className="grid content-start gap-2 rounded-xl bg-surface2/70 p-4">
            <div className="flex items-start justify-between gap-2"><b className="leading-tight">{tr.name}</b>{chosen.includes(tr.id) && <span className="pill bg-primary/12 text-primary">{t('home.yourTrack')}</span>}</div>
            <div className="flex flex-wrap gap-1.5">
              {tr.exams.slice(0, 4).map(e => <Link key={e} href={`/student/exams/${e}`} className="inline-flex min-h-6 items-center rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold hover:border-primary/50 hover:text-primary">{EXAM_NAMES[e] || e.toUpperCase()}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuickTools({ firstSubject, senior = true }: { firstSubject?: string; senior?: boolean }) {
  const { t } = useT();
  const items: { href: string; icon: typeof BookOpen; title: string; desc: string; tone: string }[] = [
    { href: '/student/syllabus', icon: BookOpen, title: t('nav.syllabusShort'), desc: t('tools.syllabus'), tone: 'bg-primary/12 text-primary' },
    { href: firstSubject ? `/student/diagnostic/${enc(firstSubject)}` : '/student/syllabus', icon: ClipboardCheck, title: t('tools.placement'), desc: t('tools.placementDesc'), tone: 'bg-teal/15 text-teal' },
    { href: '/student/labs', icon: FlaskConical, title: t('nav.labs'), desc: t('tools.labs'), tone: 'bg-accent/20 text-warn' },
    ...(senior ? [{ href: '/student/exams', icon: Trophy, title: t('tools.mock'), desc: t('tools.mockDesc'), tone: 'bg-violet/15 text-violet' }] : []),
  ];
  return (
    <nav aria-label={t('tools.label')} className={cx('grid grid-cols-2 gap-3', senior ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
      {items.map(i => (
        <Link key={i.title} href={i.href} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 transition hover:border-primary/40 hover:shadow-soft">
          <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-ctl', i.tone)}><i.icon size={19} aria-hidden /></span>
          <span className="min-w-0"><b className="block text-sm">{i.title}</b><span className="block truncate text-xs text-muted">{i.desc}</span></span>
        </Link>
      ))}
    </nav>
  );
}

export function SectionTitle({ title, href, link }: { title: ReactNode; href?: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="h-section">{title}</h2>
      {href && <Link href={href} className="text-sm font-semibold text-primary hover:underline">{link} →</Link>}
    </div>
  );
}
