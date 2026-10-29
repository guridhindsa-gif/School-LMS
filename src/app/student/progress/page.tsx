'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarClock, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BandPill, Bar, Card, Empty, Reveal, Ring, Skeleton } from '@/components/ui';
import { band } from '@/lib/adaptive';
import { useLMS, useHydrated } from '@/lib/store';

export default function ProgressPage() {
  const hydrated = useHydrated();
  const skills = useLMS(s => s.skills);
  const chapters = useLMS(s => s.chapters);
  const log = useLMS(s => s.log);
  const resetProgress = useLMS(s => s.resetProgress);
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
  if (!rows.length) return <Empty title="No progress yet" action={<Link href="/student" className="btn-primary">Start a chapter</Link>}>Practise any chapter and your mastery, review schedule and activity appear here.</Empty>;

  const due = rows.filter(r => r.s.nextReview <= Date.now());
  const totalA = rows.reduce((a, r) => a + r.s.attempts, 0), totalC = rows.reduce((a, r) => a + r.s.correct, 0);

  return (
    <div className="grid gap-6">
      <Reveal><p className="eyebrow">Progress</p><h1 className="text-3xl">How you are growing</h1></Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4"><Ring value={rows.reduce((a, r) => a + r.s.pKnown, 0) / rows.length} size={70} /><div><b>Average mastery</b><p className="text-sm text-muted">{rows.length} chapters</p></div></Card>
        <Card className="flex items-center gap-4"><Ring value={totalC / Math.max(1, totalA)} size={70} color="rgb(var(--sky))" /><div><b>Accuracy</b><p className="text-sm text-muted">{totalC} of {totalA} correct</p></div></Card>
        <Card className="flex items-center gap-4"><span className="grid h-[70px] w-[70px] place-items-center rounded-full bg-marigold/20 font-display text-3xl font-bold text-warn">{due.length}</span><div><b>Due for review</b><p className="text-sm text-muted">Spaced repetition</p></div></Card>
      </div>

      <Card className="grid gap-3">
        <h2 className="text-xl">Activity · last 12 weeks</h2>
        <div className="overflow-x-auto">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-1" role="img" aria-label="Questions answered per day over 12 weeks">
            {heat.map((h, i) => (
              <motion.span key={h.d} title={`${h.d}: ${h.n} answered`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.004 }}
                className="h-3.5 w-3.5 rounded-[4px]" style={{ background: h.n ? `rgb(var(--good) / ${Math.min(1, 0.25 + h.n / 20)})` : 'rgb(var(--surface-2))' }} />
            ))}
          </div>
        </div>
      </Card>

      {due.length > 0 && (
        <Card className="grid gap-3">
          <h2 className="flex items-center gap-2 text-xl"><CalendarClock size={19} /> Review today</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {due.slice(0, 8).map(r => (
              <Link key={r.id} href={`/student/practice/${encodeURIComponent(r.id)}`} className="flex items-center gap-3 rounded-xl bg-surface2/70 px-3 py-2 hover:bg-surface2">
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
                <Link href={`/student/learn/${encodeURIComponent(r.id)}`} className="grid items-center gap-2 rounded-xl px-2 py-2 hover:bg-surface2 sm:grid-cols-[1fr_160px_auto_auto]">
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
          : <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-bad">This clears mastery, streaks and history on this device.</span><button className="btn-board bg-bad text-sm" onClick={() => { resetProgress(); setConfirm(false); }}>Reset</button><button className="btn-ghost text-sm" onClick={() => setConfirm(false)}>Cancel</button></div>}
      </div>
    </div>
  );
}
