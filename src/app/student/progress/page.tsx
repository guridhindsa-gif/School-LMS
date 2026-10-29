'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, CalendarClock, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BandPill, Bar, Card, Empty, PageHeader, Reveal, Ring, Skeleton, cx } from '@/components/ui';
import { badges, level } from '@/lib/achievements';
import { band } from '@/lib/adaptive';
import { useLMS, useHydrated } from '@/lib/store';

export default function ProgressPage() {
  const hydrated = useHydrated();
  const skills = useLMS(s => s.skills);
  const chapters = useLMS(s => s.chapters);
  const log = useLMS(s => s.log);
  const resetProgress = useLMS(s => s.resetProgress);
  const xp = useLMS(s => s.xp);
  const streak = useLMS(s => s.streak);
  const [confirm, setConfirm] = useState(false);

  const rows = useMemo(() => Object.entries(skills).filter(([, s]) => s.attempts).map(([id, s]) => ({ id, s, ch: chapters[id] })).sort((a, b) => a.s.nextReview - b.s.nextReview), [skills, chapters]);
  const bySubject = useMemo(() => {
    const m: Record<string, typeof rows> = {};
    rows.forEach(r => { const k = r.ch?.subject || 'Other'; (m[k] ||= []).push(r); });
    return Object.entries(m).map(([k, list]) => ({ subject: k, list, avg: list.reduce((a, r) => a + r.s.pKnown, 0) / list.length })).sort((a, b) => a.avg - b.avg);
  }, [rows]);
  const heat = useMemo(() => {
    const days = Array.from({ length: 84 }, (_, i) => new Date(Date.now() - (83 - i) * 86_400_000).toISOString().slice(0, 10));
    return days.map(d => ({ d, n: log.find(l => l.day === d)?.answered || 0 }));
  }, [log]);

  if (!hydrated) return <Skeleton lines={8} />;
  if (!rows.length) return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Progress" title="How you are growing" />
      <Empty title="No progress yet" icon={<BarChart3 size={24} />} action={<Link href="/student" className="btn-primary">Start a chapter</Link>}>Practise any chapter and your mastery, revision schedule, badges and activity appear here. Progress is saved in this browser.</Empty>
    </div>
  );

  const due = rows.filter(r => r.s.nextReview <= Date.now());
  const totalA = rows.reduce((a, r) => a + r.s.attempts, 0), totalC = rows.reduce((a, r) => a + r.s.correct, 0);
  const lv = level(xp);
  const bs = badges({ xp, streak, skills, chapters, log });
  const earned = bs.filter(b => b.earned).length;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Progress" title="How you are growing" desc="Everything here comes from your own practice on this device." />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <section className="panel-night grid h-full gap-4 rounded-card p-6 shadow-lift" aria-labelledby="lvl">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 font-display text-3xl font-bold" aria-hidden>{lv.level}</span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs uppercase tracking-widest text-onnight/70">Your level</p>
                <h2 id="lvl" className="text-2xl">Level {lv.level}</h2>
                <p className="text-sm text-onnight/75">{xp} XP · {lv.toNext} XP to level {lv.level + 1}</p>
              </div>
              <Sparkles className="text-accent" aria-hidden />
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)}>
              <div className="h-full rounded-full bg-accent" style={{ width: `${lv.progress * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Streak', `${streak.current} d`], ['Best streak', `${streak.best} d`], ['Badges', `${earned}/${bs.length}`]].map(([k, v]) => (
                <div key={k} className="rounded-ctl bg-white/[.07] px-2 py-2"><p className="text-xs text-onnight/65">{k}</p><p className="font-display text-xl font-bold">{v}</p></div>
              ))}
            </div>
          </section>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="flex items-center gap-4"><Ring value={rows.reduce((a, r) => a + r.s.pKnown, 0) / rows.length} size={64} /><div><b>Average mastery</b><p className="text-sm text-muted">{rows.length} chapters started</p></div></Card>
          <Card className="flex items-center gap-4"><Ring value={totalC / Math.max(1, totalA)} size={64} color="rgb(var(--teal))" /><div><b>Accuracy</b><p className="text-sm text-muted">{totalC} of {totalA} correct</p></div></Card>
          <Card className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 font-display text-3xl font-bold text-warn">{due.length}</span><div><b>Due for review</b><p className="text-sm text-muted">Spaced revision</p></div></Card>
        </div>
      </div>

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2"><h2 className="flex items-center gap-2 text-xl"><Trophy size={19} className="text-accent" /> Badges</h2><span className="text-sm text-muted">Earned by what you actually do</span></div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {bs.map(b => (
            <li key={b.id} className={cx('grid content-start gap-1.5 rounded-ctl border p-3', b.earned ? 'border-accent/40 bg-accent/10' : 'border-line bg-surface2/50')}>
              <span className={cx('emoji text-3xl', !b.earned && 'opacity-35 grayscale')} aria-hidden>{b.emoji}</span>
              <b className="text-sm">{b.title}</b>
              <span className="text-xs text-muted">{b.desc}</span>
              {!b.earned && <span className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface3" role="progressbar" aria-label={`${b.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(b.progress * 100)}><i className="block h-full rounded-full bg-primary" style={{ width: `${b.progress * 100}%` }} /></span>}
              <span className="sr-only">{b.earned ? 'Earned' : 'Not yet earned'}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-xl">Activity · last 12 weeks</h2>
        <div className="overflow-x-auto">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-1" role="img" aria-label="Questions answered per day over 12 weeks">
            {heat.map((h, i) => (
              <motion.span key={h.d} title={`${h.d}: ${h.n} answered`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.004 }}
                className="h-3.5 w-3.5 rounded-[4px]" style={{ background: h.n ? `rgb(var(--teal) / ${Math.min(1, 0.25 + h.n / 20)})` : 'rgb(var(--surface-2))' }} />
            ))}
          </div>
        </div>
      </Card>

      {due.length > 0 && (
        <Card className="grid gap-3">
          <h2 className="flex items-center gap-2 text-xl"><CalendarClock size={19} /> Review today</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {due.slice(0, 8).map(r => (
              <Link key={r.id} href={`/student/practice/${encodeURIComponent(r.id)}`} className="flex items-center gap-3 rounded-ctl border border-line bg-surface2/50 px-3 py-2 hover:border-primary/40">
                <span className="min-w-0 flex-1 truncate font-semibold">{r.ch?.name || r.id}</span><span className="text-sm text-muted">{Math.round(r.s.pKnown * 100)}%</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {bySubject.map(g => (
        <Card key={g.subject} className="grid gap-3">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl">{g.subject}</h2><Ring value={g.avg} size={46} stroke={5} /></div>
          <ul className="grid gap-2">
            {g.list.map(r => (
              <li key={r.id}>
                <Link href={`/student/learn/${encodeURIComponent(r.id)}`} className="grid items-center gap-2 rounded-ctl px-2 py-2 hover:bg-surface2 sm:grid-cols-[minmax(0,1fr)_160px_auto_auto]">
                  <span className="truncate font-semibold">{r.ch?.name || r.id}</span>
                  <Bar value={r.s.pKnown} />
                  <BandPill band={band(r.s)} />
                  <span className="text-xs text-muted">Review {new Date(r.s.nextReview).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <div>
        {!confirm ? <button className="btn-ghost text-sm" onClick={() => setConfirm(true)}><RotateCcw size={15} /> Reset my progress</button>
          : <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-bad" role="alert">This clears mastery, streaks and history on this device. It cannot be undone.</span><button className="btn bg-bad text-sm text-white hover:brightness-110" onClick={() => { resetProgress(); setConfirm(false); }}>Reset</button><button className="btn-ghost text-sm" onClick={() => setConfirm(false)}>Cancel</button></div>}
      </div>
    </div>
  );
}
