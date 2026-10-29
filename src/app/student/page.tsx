'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { BadgeShelf, ContinueCard, ExamPrep, MissionCard, QuickTools, RevisionList, SectionTitle, SubjectTile, WeekChart } from '@/components/cockpit';
import { Notice, Reveal, Skeleton } from '@/components/ui';
import { badges, dailyMission, level } from '@/lib/achievements';
import { recommend, type Candidate } from '@/lib/adaptive';
import { useLMS, useHydrated } from '@/lib/store';
import { useCourse } from '@/lib/use-course';
import { useTutor } from '@/lib/tutor-store';

export default function StudentHome() {
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const chapters = useLMS(s => s.chapters);
  const log = useLMS(s => s.log);
  const streak = useLMS(s => s.streak);
  const xp = useLMS(s => s.xp);
  const { data, error } = useCourse(profile, true);
  const setContext = useTutor(s => s.setContext);

  useEffect(() => { if (hydrated && !profile.board) router.replace('/student/onboarding'); }, [hydrated, profile.board, router]);
  useEffect(() => { setContext(profile.board ? { kind: 'board', board: profile.board, cls: profile.cls } : null, 'General help'); }, [profile.board, profile.cls, setContext]);

  const subjects = useMemo(() => data?.groups.flatMap(g => g.subjects) ?? [], [data]);
  const cands = useMemo(() => {
    let order = 0;
    // interleave subjects so "new" suggestions are not all from one subject
    const lists = subjects.filter(s => s.units?.length).map(s => s.units!.map(u => ({ id: u.id, name: u.name, subject: s.name })));
    const out: (Candidate & { subject: string })[] = [];
    const max = Math.max(0, ...lists.map(l => l.length));
    for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push({ ...l[i], order: order++ });
    return out;
  }, [subjects]);
  const recs = useMemo(() => recommend(cands, skills, Date.now(), 4), [cands, skills]);
  const subjOf = (id: string) => cands.find(c => c.id === id)?.subject || chapters[id]?.subject;

  const snap = { xp, streak, skills, chapters, log };
  const mission = dailyMission(snap);
  const lv = level(xp);
  const earned = badges(snap);
  const now = Date.now();
  const revision = Object.entries(skills)
    .filter(([, s]) => s.attempts > 0)
    .map(([id, s]) => ({ id, name: chapters[id]?.name || id, subject: chapters[id]?.subject, mastery: s.pKnown, due: s.nextReview <= now, weak: s.weakTopics || [] }))
    .filter(r => r.due || r.mastery < 0.6 || r.weak.length)
    .sort((a, b) => Number(b.due) - Number(a.due) || a.mastery - b.mastery)
    .slice(0, 5);
  const firstDue = revision.find(r => r.due);
  const days = lastDays(7).map(d => ({ d, ...(log.find(l => l.day === d) || { answered: 0, correct: 0, minutes: 0 }) }));

  if (!hydrated || !profile.board) return <Skeleton lines={8} />;

  return (
    <div className="grid grid-cols-1 gap-8">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1.5">
          <p className="eyebrow">{profile.board} · {profile.cls === 13 ? 'Repeater batch' : `Class ${profile.cls}`}{profile.stream ? ` · ${profile.stream}` : ''}</p>
          <h1 className="h-page">{greeting()}, {profile.name || 'there'}</h1>
          <p className="text-muted">{mission.done ? 'Today’s mission is done — explore, or get ahead.' : recs[0] ? 'Here is the best next step for you today.' : 'Pick a chapter to begin.'}</p>
        </div>
        <Link href="/student/onboarding" className="btn-ghost text-sm">Change class or board</Link>
      </Reveal>

      {error && <Notice tone="error" title="Your syllabus did not load" action={<button className="btn-ghost text-sm" onClick={() => location.reload()}>Try again</button>}>Check your connection. Your saved progress is safe on this device.</Notice>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Reveal delay={0.05}>
          {!data && !error ? <div className="skeleton h-72 rounded-card" aria-label="Loading your plan" />
            : <ContinueCard rec={recs[0]} subject={recs[0] && subjOf(recs[0].id)} others={recs.slice(1, 4)} subjOf={subjOf} />}
        </Reveal>
        <Reveal delay={0.1}>
          <MissionCard mission={mission} streak={streak.current} best={streak.best} dueHref={firstDue ? `/student/practice/${encodeURIComponent(firstDue.id)}` : undefined} />
        </Reveal>
      </div>

      <Reveal delay={0.12}><QuickTools firstSubject={subjects[0]?.id} senior={(profile.cls ?? 9) >= 9} /></Reveal>

      <section className="grid grid-cols-1 gap-4">
        <SectionTitle title="Your subjects" href="/student/syllabus" link="Full syllabus" />
        {!data ? <Skeleton lines={3} /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 9).map(s => {
              const units = s.units || [];
              const started = units.filter(u => skills[u.id]?.attempts).length;
              const mastery = units.length ? units.reduce((a, u) => a + (skills[u.id]?.attempts ? skills[u.id].pKnown : 0), 0) / units.length : 0;
              return <SubjectTile key={s.id} href={`/student/subject/${encodeURIComponent(s.id)}`} name={s.name} book={s.book} mastery={mastery} started={started} total={s.unitCount} />;
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <RevisionList items={revision} />
        <WeekChart days={days} />
        <BadgeShelf badges={earned} level={lv} />
      </div>

      {data && <ExamPrep tracks={data.tracks} chosen={profile.tracks} />}

      <p className="text-center text-xs text-muted">Your progress is saved in this browser on this device.</p>
    </div>
  );
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}
