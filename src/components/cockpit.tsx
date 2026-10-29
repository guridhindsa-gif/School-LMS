'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarClock, ClipboardCheck, Flame, FlaskConical, Play, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { Ring, cx, masteryColor } from './ui';
import type { Badge } from '@/lib/achievements';
import type { Recommendation as Rec } from '@/lib/adaptive';

export const REASON: Record<Rec['reason'], { label: string; verb: string; icon: typeof Play; tone: string }> = {
  review: { label: 'Due for revision', verb: 'Revise now', icon: RotateCcw, tone: 'bg-primary/15 text-primary' },
  weak: { label: 'Needs a little more practice', verb: 'Strengthen it', icon: Target, tone: 'bg-accent/20 text-warn' },
  continue: { label: 'Pick up where you left off', verb: 'Continue', icon: Play, tone: 'bg-teal/15 text-teal' },
  new: { label: 'Your next new chapter', verb: 'Start chapter', icon: Sparkles, tone: 'bg-teal/15 text-teal' },
};

const enc = encodeURIComponent;

/** The single most important card: what to do now. */
export function ContinueCard({ rec, subject, others, subjOf }: { rec?: Rec; subject?: string; others: Rec[]; subjOf: (id: string) => string | undefined }) {
  if (!rec) {
    return (
      <section className="panel-night grid content-center gap-3 rounded-card p-6 shadow-lift sm:p-8">
        <p className="eyebrow !text-onnight/60">Continue learning</p>
        <h2 className="text-2xl">Your syllabus has no chapters listed yet</h2>
        <p className="text-onnight/70">Open <Link href="/student/exams" className="font-semibold underline">Competitive exams</Link> to start a track, or <Link href="/student/onboarding" className="font-semibold underline">change your class</Link>.</p>
      </section>
    );
  }
  const R = REASON[rec.reason];
  return (
    <section className="panel-night relative grid gap-6 overflow-hidden rounded-card p-6 shadow-lift sm:p-8" aria-labelledby="continue-title">
      <div className="flex flex-wrap items-start gap-5">
        <div className="grid min-w-0 flex-1 gap-2">
          <p className="eyebrow !text-onnight/60">Continue learning</p>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold"><R.icon size={13} />{R.label}</span>
          <h2 id="continue-title" className="text-2xl sm:text-3xl">{rec.name}</h2>
          {subject && <p className="text-onnight/70">{subject}</p>}
        </div>
        <div className="grid justify-items-center gap-1 rounded-2xl bg-white/[.06] p-3">
          <Ring value={rec.mastery} size={74} label={rec.mastery > 0 ? undefined : 'New'} />
          <span className="text-[11px] text-onnight/60">Mastery</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/student/learn/${enc(rec.id)}`} className="btn bg-white text-night hover:bg-white/90"><Play size={16} /> {R.verb}</Link>
        <Link href={`/student/practice/${enc(rec.id)}`} className="btn border border-white/20 text-onnight hover:bg-white/10"><Target size={16} /> Adaptive practice</Link>
      </div>
      {others.length > 0 && (
        <div className="grid gap-2 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-onnight/55">Then</p>
          <ul className="grid gap-1.5 sm:grid-cols-3">
            {others.map(o => {
              const O = REASON[o.reason];
              return (
                <li key={o.id}>
                  <Link href={`/student/learn/${enc(o.id)}`} className="group grid h-full gap-0.5 rounded-xl bg-white/[.06] px-3 py-2.5 transition hover:bg-white/[.12]">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-onnight/60"><O.icon size={11} />{O.label}</span>
                    <b className="line-clamp-2 text-sm leading-snug">{o.name}</b>
                    <span className="truncate text-xs text-onnight/55">{subjOf(o.id)}</span>
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

export function MissionCard({ mission, streak, best, dueHref }: { mission: { answered: number; goal: number; done: boolean; progress: number; due: number }; streak: number; best: number; dueHref?: string }) {
  return (
    <section className="card grid content-start gap-5 p-6" aria-labelledby="mission-title">
      <div className="flex items-start justify-between gap-3">
        <div><p className="eyebrow">Today</p><h2 id="mission-title" className="h-section">Daily mission</h2></div>
        <span className={cx('pill', streak ? 'bg-accent/20 text-warn' : 'bg-surface2 text-muted')} title={`Best streak ${best} days`}><Flame size={13} />{streak} day{streak === 1 ? '' : 's'}</span>
      </div>
      <div className="flex items-center gap-4">
        <Ring value={mission.progress} size={86} stroke={9} color={mission.done ? 'rgb(var(--good))' : 'rgb(var(--primary))'} label={<span className="text-[0.8em]">{mission.answered}/{mission.goal}</span>} />
        <div className="grid gap-1">
          <b>{mission.done ? 'Mission complete!' : `Answer ${mission.goal - mission.answered} more question${mission.goal - mission.answered === 1 ? '' : 's'}`}</b>
          <p className="text-sm text-muted">{mission.done ? 'Great work. Anything more today is a bonus.' : 'Any chapter counts — practice, tests and lesson checks.'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-surface2 px-3 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/12 text-primary"><CalendarClock size={17} /></span>
        <div className="min-w-0 flex-1"><b className="block text-sm">{mission.due ? `${mission.due} chapter${mission.due === 1 ? '' : 's'} due for revision` : 'No revision due'}</b><span className="text-xs text-muted">Spaced revision stops you forgetting</span></div>
        {dueHref && <Link href={dueHref} className="btn-ghost h-9 min-h-0 px-3 text-sm">Revise</Link>}
      </div>
    </section>
  );
}

export function SubjectTile({ href, name, book, mastery, started, total }: { href: string; name: string; book?: string; mastery: number; started: number; total: number }) {
  return (
    <Link href={href} className="card card-hover group grid gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><b className="block font-display text-lg leading-tight">{name}</b>{book && <span className="line-clamp-1 text-sm text-muted">{book}</span>}</div>
        <Ring value={mastery} size={44} stroke={5} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{started ? `${started} of ${total} chapters started` : `${total} chapters`}</span>
        <ArrowRight size={14} className="transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  );
}

export function WeekChart({ days }: { days: { d: string; answered: number; correct: number; minutes: number }[] }) {
  const reduce = useReducedMotion();
  const maxA = Math.max(5, ...days.map(d => d.answered));
  const total = days.reduce((a, d) => a + d.answered, 0), right = days.reduce((a, d) => a + d.correct, 0);
  const mins = days.reduce((a, d) => a + d.minutes, 0);
  return (
    <section className="card grid min-w-0 grid-cols-1 content-start gap-4 p-6" aria-labelledby="week-title">
      <div className="flex items-end justify-between gap-3">
        <div><p className="eyebrow">Last 7 days</p><h2 id="week-title" className="h-section">Your week</h2></div>
        <div className="text-right text-sm"><b className="font-display text-2xl tabular-nums">{total}</b><span className="text-muted"> answered</span></div>
      </div>
      <div className="flex h-36 items-stretch gap-2" role="img" aria-label={`Answered per day: ${days.map(d => `${new Date(d.d).toLocaleDateString('en-IN', { weekday: 'short' })} ${d.answered}, ${d.correct} correct`).join('; ')}`}>
        {days.map((d, i) => (
          <div key={d.d} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="font-mono text-[10px] tabular-nums text-muted">{d.answered || ''}</span>
            <div className="relative min-h-0 w-full max-w-9 flex-1 overflow-hidden rounded-md bg-surface2">
              <motion.div className="absolute bottom-0 w-full rounded-md bg-primary/30" initial={reduce ? false : { height: 0 }} animate={{ height: `${(d.answered / maxA) * 100}%` }} transition={{ delay: i * 0.04, duration: 0.6 }} />
              <motion.div className="absolute bottom-0 w-full rounded-md bg-primary" initial={reduce ? false : { height: 0 }} animate={{ height: `${(d.correct / maxA) * 100}%` }} transition={{ delay: 0.1 + i * 0.04, duration: 0.6 }} />
            </div>
            <span className={cx('text-[11px]', i === days.length - 1 ? 'font-bold text-ink' : 'text-muted')}>{i === days.length - 1 ? 'Today' : new Date(d.d).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary" />Correct ({right})</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary/30" />Answered</span>
        {mins > 0 && <span className="ml-auto">{mins} min practised</span>}
      </div>
    </section>
  );
}

export function RevisionList({ items }: { items: { id: string; name: string; subject?: string; mastery: number; due: boolean; weak: string[] }[] }) {
  return (
    <section className="card grid min-w-0 grid-cols-1 content-start gap-4 p-6" aria-labelledby="rev-title">
      <div><p className="eyebrow">Keep it fresh</p><h2 id="rev-title" className="h-section">Revision and weak spots</h2></div>
      {!items.length ? (
        <p className="rounded-xl bg-surface2 px-4 py-6 text-center text-sm text-muted">Practise a chapter and Vidya will tell you here what to revise, and when.</p>
      ) : (
        <ul className="grid gap-2">
          {items.map(r => (
            <li key={r.id}>
              <Link href={`/student/practice/${enc(r.id)}`} className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-line hover:bg-surface2">
                <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: masteryColor(r.mastery) }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{r.name}</b>
                  <span className="block truncate text-xs text-muted">{r.weak.length ? `Work on: ${r.weak.slice(0, 2).join(', ')}` : r.subject}</span>
                </span>
                {r.due && <span className="pill bg-primary/12 text-primary">Due</span>}
                <span className="w-10 text-right font-mono text-xs tabular-nums text-muted">{Math.round(r.mastery * 100)}%</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function BadgeShelf({ badges, level }: { badges: Badge[]; level: { level: number; progress: number; toNext: number } }) {
  const earned = badges.filter(b => b.earned).length;
  return (
    <section className="card grid min-w-0 grid-cols-1 content-start gap-4 p-6" aria-labelledby="ach-title">
      <div className="flex items-end justify-between gap-3">
        <div><p className="eyebrow">Achievements</p><h2 id="ach-title" className="h-section">Level {level.level}</h2></div>
        <span className="text-sm text-muted">{earned}/{badges.length} badges</span>
      </div>
      <div className="grid gap-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)}>
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-teal" style={{ width: `${level.progress * 100}%` }} />
        </div>
        <span className="text-xs text-muted">{level.toNext} XP to level {level.level + 1}</span>
      </div>
      <ul className="grid grid-cols-4 gap-2">
        {badges.map(b => (
          <li key={b.id} title={`${b.title}: ${b.desc}${b.earned ? ' (earned)' : ` (${Math.round(b.progress * 100)}%)`}`}
            className={cx('grid justify-items-center gap-1 rounded-xl px-1 py-2.5 text-center', b.earned ? 'bg-accent/12' : 'bg-surface2')}>
            <span className={cx('emoji text-2xl', !b.earned && 'opacity-35 grayscale')} aria-hidden>{b.emoji}</span>
            <span className={cx('text-[11px] font-semibold leading-tight', !b.earned && 'text-muted')}>{b.title}</span>
            <span className="sr-only">{b.earned ? 'Earned' : `Not yet: ${b.desc}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const EXAM_NAMES: Record<string, string> = { jee_main: 'JEE Main', jee_adv: 'JEE Advanced', neet: 'NEET-UG', bitsat: 'BITSAT', cuet: 'CUET-UG', clat: 'CLAT', ipmat: 'IPMAT', nda: 'NDA', nata: 'NATA', uceed: 'UCEED', ioqm: 'IOQM', nse: 'NSE' };

export function ExamPrep({ tracks, chosen }: { tracks: { id: string; name: string; exams: string[] }[]; chosen: string[] }) {
  if (!tracks.length) return null;
  const list = [...tracks].sort((a, b) => Number(chosen.includes(b.id)) - Number(chosen.includes(a.id))).slice(0, 4);
  return (
    <section className="grid gap-4 rounded-card border border-line bg-gradient-to-br from-primary/[.07] via-surface to-teal/[.07] p-6" aria-labelledby="exam-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Entrance preparation</p><h2 id="exam-title" className="h-section">Competitive exams open to you</h2></div>
        <Link href="/student/exams" className="btn-ghost text-sm">All exams <ArrowRight size={15} /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map(t => (
          <div key={t.id} className="card grid content-start gap-2 p-4">
            <div className="flex items-start justify-between gap-2"><b className="leading-tight">{t.name}</b>{chosen.includes(t.id) && <span className="pill bg-primary/12 text-primary">Your track</span>}</div>
            <div className="flex flex-wrap gap-1.5">
              {t.exams.slice(0, 4).map(e => <Link key={e} href={`/student/exams/${e}`} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold hover:border-primary/50 hover:text-primary">{EXAM_NAMES[e] || e.toUpperCase()}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuickTools({ firstSubject, senior = true }: { firstSubject?: string; senior?: boolean }) {
  const items: { href: string; icon: typeof BookOpen; title: string; desc: string; tone: string }[] = [
    { href: '/student/syllabus', icon: BookOpen, title: 'Syllabus', desc: 'Every chapter, official sources', tone: 'bg-primary/12 text-primary' },
    { href: firstSubject ? `/student/diagnostic/${enc(firstSubject)}` : '/student/syllabus', icon: ClipboardCheck, title: 'Placement check', desc: 'Find your level in a subject', tone: 'bg-teal/15 text-teal' },
    { href: '/student/labs', icon: FlaskConical, title: 'Visual labs', desc: 'Simulations you can play with', tone: 'bg-accent/20 text-warn' },
    ...(senior ? [{ href: '/student/exams', icon: Trophy, title: 'Mock tests', desc: 'Timed, exam-pattern practice', tone: 'bg-violet/15 text-violet' }] : []),
    { href: '/student/tutor', icon: Sparkles, title: 'Ask Vidya', desc: 'Hints first, answers when ready', tone: 'bg-night text-onnight' },
  ];
  return (
    <nav aria-label="Learning tools" className={cx('grid grid-cols-2 gap-3 sm:grid-cols-3', senior ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
      {items.map(i => (
        <Link key={i.title} href={i.href} className="card card-hover grid content-start gap-2 p-4">
          <span className={cx('grid h-10 w-10 place-items-center rounded-ctl', i.tone)}><i.icon size={19} /></span>
          <b className="text-sm">{i.title}</b>
          <span className="text-xs text-muted">{i.desc}</span>
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
