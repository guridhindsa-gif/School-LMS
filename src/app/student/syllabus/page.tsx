'use client';
import Link from 'next/link';
import { ArrowRight, Plus, Check } from 'lucide-react';
import { Bar, Empty, Reveal, Skeleton, VerifiedPill, cx } from '@/components/ui';
import { useLMS, useHydrated } from '@/lib/store';
import { useCourse } from '@/lib/use-course';

export default function SyllabusPage() {
  const hydrated = useHydrated();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const setProfile = useLMS(s => s.setProfile);
  const { data, error } = useCourse(profile, true);

  if (!hydrated) return <Skeleton lines={8} />;
  if (!profile.board) return <Empty title="Choose your board and class first" action={<Link href="/student/onboarding" className="btn-primary">Get started</Link>} />;

  const mastery = (units?: { id: string }[]) => (units?.length ? units.reduce((a, u) => a + (skills[u.id]?.attempts ? skills[u.id].pKnown : 0), 0) / units.length : 0);
  const toggle = (id: string) => setProfile({ tracks: profile.tracks.includes(id) ? profile.tracks.filter(t => t !== id) : [...profile.tracks, id] });

  return (
    <div className="grid gap-8">
      <Reveal>
        <p className="eyebrow">Your path</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 font-semibold">
          {[profile.board, profile.cls === 13 ? 'Repeater batch' : `Class ${profile.cls}`, profile.stream].filter(Boolean).map((x, i) => (
            <span key={i} className="flex items-center gap-2">{i > 0 && <span className="text-muted">›</span>}<span className="rounded-full bg-surface2 px-3 py-1">{x}</span></span>
          ))}
          <Link href="/student/onboarding" className="text-sm text-sky">Change</Link>
        </div>
        <h1 className="mt-3 text-3xl">My syllabus</h1>
      </Reveal>

      {error && <p className="rounded-xl bg-bad/10 p-3 text-bad">{error}</p>}
      {!data && !error && <Skeleton lines={6} />}

      {data?.groups.map((g, gi) => (
        <Reveal key={g.group} delay={gi * 0.05}>
          <section className="grid gap-3">
            <h2 className="text-lg text-muted">{g.group}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.subjects.map(s => (
                <Link key={s.id} href={`/student/subject/${encodeURIComponent(s.id)}`} className="card group grid gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-2">
                    <b className="font-display text-lg leading-tight">{s.name}</b>
                    <span className="tag">{s.unitCount} {s.unitCount === 1 ? 'unit' : 'units'}</span>
                  </div>
                  {s.book && <span className="text-sm text-muted">{s.book}</span>}
                  <div className="flex flex-wrap items-center gap-2"><VerifiedPill v={s.verified} />{s.session && <span className="tag">{s.session}</span>}</div>
                  <Bar value={mastery(s.units)} className="mt-1" />
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      ))}

      {data && (
        <Reveal delay={0.1}>
          <section className="grid gap-3">
            <div>
              <h2 className="text-2xl">Competitive tracks for your class</h2>
              <p className="text-muted">Add the ones you are preparing for. They share questions with your board chapters.</p>
            </div>
            {!data.tracks.length && <p className="text-muted">No competitive tracks start at this class.</p>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.tracks.map(t => {
                const on = profile.tracks.includes(t.id);
                const first = t.exams[0];
                return (
                  <div key={t.id} className={cx('card grid gap-2 p-4', on && 'ring-2 ring-marigold')}>
                    <b className="font-display text-lg leading-tight">{t.name}</b>
                    <span className="text-sm text-muted">{t.by} · shares questions with {t.shares}</span>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <button className={on ? 'btn-soft text-sm' : 'btn-primary text-sm'} onClick={() => toggle(t.id)}>{on ? <><Check size={15} /> Added</> : <><Plus size={15} /> Add</>}</button>
                      {first && <Link href={`/student/exams/${first}`} className="btn-ghost text-sm">Open <ArrowRight size={15} /></Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
