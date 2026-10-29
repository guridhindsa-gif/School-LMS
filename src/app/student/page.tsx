'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, CalendarClock, Flame, FlaskConical, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Bar, Card, Reveal, Ring, Skeleton, cx } from '@/components/ui';
import { recommend, type Candidate } from '@/lib/adaptive';
import { useLMS, useHydrated } from '@/lib/store';
import { useCourse } from '@/lib/use-course';
import { useTutor } from '@/lib/tutor-store';

const REASON = {
  review: { label: 'Due for review', icon: RotateCcw, cls: 'bg-sky/15 text-sky' },
  weak: { label: 'Needs practice', icon: Target, cls: 'bg-bad/15 text-bad' },
  continue: { label: 'Keep going', icon: ArrowRight, cls: 'bg-marigold/20 text-warn' },
  new: { label: 'Start next', icon: Sparkles, cls: 'bg-good/15 text-good' },
};

export default function StudentHome() {
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const log = useLMS(s => s.log);
  const streak = useLMS(s => s.streak);
  const { data } = useCourse(profile, true);
  const setContext = useTutor(s => s.setContext);

  useEffect(() => { if (hydrated && !profile.board) router.replace('/student/onboarding'); }, [hydrated, profile.board, router]);
  useEffect(() => { setContext(profile.board ? { kind: 'board', board: profile.board, cls: profile.cls } : null, 'General help'); }, [profile.board, profile.cls, setContext]);

  const subjects = useMemo(() => data?.groups.flatMap(g => g.subjects) ?? [], [data]);
  const cands: Candidate[] = useMemo(() => {
    let order = 0;
    // interleave subjects so "new" suggestions are not all from one subject
    const lists = subjects.filter(s => s.units?.length).map(s => s.units!.map(u => ({ id: u.id, name: `${u.name}`, subject: s.name })));
    const out: (Candidate & { subject: string })[] = [];
    const max = Math.max(0, ...lists.map(l => l.length));
    for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push({ ...l[i], order: order++ });
    return out;
  }, [subjects]);
  const recs = useMemo(() => recommend(cands, skills, Date.now(), 4), [cands, skills]);
  const subjOf = (id: string) => (cands as (Candidate & { subject?: string })[]).find(c => c.id === id)?.subject;

  const subjMastery = (s: { units?: { id: string }[] }) => {
    const u = s.units || [];
    if (!u.length) return 0;
    return u.reduce((a, x) => a + (skills[x.id]?.attempts ? skills[x.id].pKnown : 0), 0) / u.length;
  };
  const touched = Object.values(skills).filter(s => s.attempts);
  const overall = touched.length ? touched.reduce((a, s) => a + s.pKnown, 0) / touched.length : 0;
  const dueCount = touched.filter(s => s.nextReview <= Date.now()).length;
  const days = lastDays(7).map(d => ({ d, ...(log.find(l => l.day === d) || { answered: 0, correct: 0, minutes: 0 }) }));
  const maxA = Math.max(5, ...days.map(d => d.answered));

  if (!hydrated || !profile.board) return <Skeleton lines={8} />;

  return (
    <div className="grid gap-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{profile.board} · {profile.cls === 13 ? 'Repeater batch' : `Class ${profile.cls}`}{profile.stream ? ` · ${profile.stream}` : ''}</p>
            <h1 className="text-3xl sm:text-4xl">{greeting()}, {profile.name || 'there'}</h1>
          </div>
          <Link href="/student/onboarding" className="btn-ghost text-sm">Change class or board</Link>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Brain, label: 'Average mastery', value: <Ring value={overall} size={58} />, sub: `${touched.length} chapters started` },
          { icon: Flame, label: 'Daily streak', value: <b className="font-display text-4xl">{streak.current}</b>, sub: `Best ${streak.best} days` },
          { icon: CalendarClock, label: 'Reviews due', value: <b className="font-display text-4xl">{dueCount}</b>, sub: 'Spaced revision keeps it fresh' },
          { icon: Trophy, label: 'Answered this week', value: <b className="font-display text-4xl">{days.reduce((a, d) => a + d.answered, 0)}</b>, sub: `${days.reduce((a, d) => a + d.correct, 0)} correct` },
        ].map((k, i) => (
          <Reveal key={k.label} delay={0.05 * i}>
            <Card className="flex h-full items-center gap-4">
              <div className="grid flex-1 gap-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-muted"><k.icon size={15} />{k.label}</span>
                <span className="text-xs text-muted">{k.sub}</span>
              </div>
              {k.value}
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal delay={0.1}>
          <section className="chalkboard grid gap-4 rounded-2xl p-6 shadow-lift">
            <div className="flex items-center justify-between gap-3">
              <div><p className="font-mono text-xs uppercase tracking-widest text-chalk/70">Adaptive plan</p><h2 className="text-2xl">Up next for you</h2></div>
              <Sparkles className="text-marigold" />
            </div>
            {!data && <div className="grid gap-2">{[0, 1, 2].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />)}</div>}
            {data && !recs.length && <p className="text-chalk/80">Your syllabus has no chapters yet. Open <Link href="/student/exams" className="underline">Competitive exams</Link> to start a track.</p>}
            <ul className="grid gap-2">
              {recs.map((r, i) => {
                const R = REASON[r.reason];
                return (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                    <Link href={`/student/learn/${encodeURIComponent(r.id)}`} className="group flex items-center gap-3 rounded-xl bg-white/[.07] p-3 transition hover:bg-white/[.13]">
                      <span className={cx('pill', R.cls)}><R.icon size={12} />{R.label}</span>
                      <span className="min-w-0 flex-1"><b className="block truncate">{r.name}</b><span className="text-sm text-chalk/70">{subjOf(r.id)}</span></span>
                      {r.mastery > 0 && <span className="font-mono text-sm text-chalk/80">{Math.round(r.mastery * 100)}%</span>}
                      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="grid h-full gap-4">
            <div><p className="eyebrow">Last 7 days</p><h2 className="text-xl">Questions answered</h2></div>
            <div className="flex h-36 items-end gap-2" role="img" aria-label={`Questions answered per day: ${days.map(d => d.answered).join(', ')}`}>
              {days.map((d, i) => (
                <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-muted tabular-nums">{d.answered || ''}</span>
                  <div className="relative w-full flex-1">
                    <motion.div className="absolute bottom-0 w-full rounded-t-md bg-board/25" initial={{ height: 0 }} animate={{ height: `${(d.answered / maxA) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6 }} />
                    <motion.div className="absolute bottom-0 w-full rounded-t-md bg-good" initial={{ height: 0 }} animate={{ height: `${(d.correct / maxA) * 100}%` }} transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }} />
                  </div>
                  <span className="text-[11px] text-muted">{new Date(d.d).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
            <p className="flex gap-4 text-xs text-muted"><span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-good" />Correct</span><span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-board/25" />Answered</span></p>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <section className="grid gap-3">
          <div className="flex items-end justify-between"><h2 className="text-2xl">Your subjects</h2><Link href="/student/syllabus" className="text-sm font-semibold text-sky">Full syllabus →</Link></div>
          {!data ? <Skeleton lines={3} /> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.slice(0, 9).map(s => (
                <Link key={s.id} href={`/student/subject/${encodeURIComponent(s.id)}`} className="card grid gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-2"><b className="font-display text-lg leading-tight">{s.name}</b><span className="tag">{s.unitCount}</span></div>
                  {s.book && <span className="text-sm text-muted">{s.book}</span>}
                  <Bar value={subjMastery(s)} className="mt-auto" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/student/tutor" icon={Sparkles} title="Ask the AI tutor" desc="Hints first, answers when you're ready." />
        <QuickLink href="/student/labs" icon={FlaskConical} title="Visual labs" desc="Refraction, projectiles, waves, circuits…" />
        <QuickLink href="/student/exams" icon={Trophy} title="Competitive exams" desc={data?.tracks.length ? `${data.tracks.length} tracks for your class` : 'JEE, NEET, CUET, CLAT and more'} />
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, desc }: { href: string; icon: typeof Sparkles; title: string; desc: string }) {
  return (
    <Link href={href} className="card group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-marigold/20 text-warn"><Icon size={20} /></span>
      <span className="min-w-0 flex-1"><b className="block">{title}</b><span className="text-sm text-muted">{desc}</span></span>
      <ArrowRight size={17} className="text-muted transition group-hover:translate-x-1" />
    </Link>
  );
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}
