'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Plus, Trophy } from 'lucide-react';
import { Bar, Empty, Notice, PageHeader, Reveal, Skeleton, VerifiedPill, cx } from '@/components/ui';
import { useLMS, useHydrated } from '@/lib/store';
import { useCourse } from '@/lib/use-course';

export default function SyllabusPage() {
  const hydrated = useHydrated();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const setProfile = useLMS(s => s.setProfile);
  const { data, error } = useCourse(profile, true);

  if (!hydrated) return <Skeleton lines={8} />;
  if (!profile.board) return <Empty title="Choose your board and class first" icon={<BookOpen size={24} />} action={<Link href="/student/onboarding" className="btn-primary">Get started</Link>}>Your syllabus is built from your board, class and stream.</Empty>;

  const mastery = (units?: { id: string }[]) => (units?.length ? units.reduce((a, u) => a + (skills[u.id]?.attempts ? skills[u.id].pKnown : 0), 0) / units.length : 0);
  const toggle = (id: string) => setProfile({ tracks: profile.tracks.includes(id) ? profile.tracks.filter(t => t !== id) : [...profile.tracks, id] });

  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="Your path" title="My syllabus"
        desc={<span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {[profile.board, profile.cls === 13 ? 'Repeater batch' : `Class ${profile.cls}`, profile.stream].filter(Boolean).map((x, i) => (
            <span key={i} className="flex items-center gap-2">{i > 0 && <span className="text-muted" aria-hidden>›</span>}<span className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{x}</span></span>
          ))}
        </span>}
        actions={<Link href="/student/onboarding" className="btn-ghost text-sm">Change board or class</Link>} />

      {error && <Notice tone="error" title="Could not load your syllabus">{error}</Notice>}
      {!data && !error && <Skeleton lines={6} />}

      {data?.groups.map((g, gi) => (
        <Reveal key={g.group} delay={gi * 0.05}>
          <section className="grid gap-3">
            <h2 className="eyebrow !text-xs">{g.group}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.subjects.map(s => (
                <Link key={s.id} href={`/student/subject/${encodeURIComponent(s.id)}`} className="card card-hover group grid gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <b className="font-display text-lg leading-tight group-hover:text-primary">{s.name}</b>
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
              <h2 className="h-section flex items-center gap-2"><Trophy size={20} className="text-accent" /> Competitive tracks for your class</h2>
              <p className="text-muted">Add the ones you are preparing for. They share questions with your board chapters.</p>
            </div>
            {!data.tracks.length && <Notice>No competitive tracks start at this class. They open from Class 9 onwards.</Notice>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.tracks.map(t => {
                const on = profile.tracks.includes(t.id);
                const first = t.exams[0];
                return (
                  <div key={t.id} className={cx('card grid gap-2 p-4', on && 'border-primary ring-2 ring-primary/30')}>
                    <b className="font-display text-lg leading-tight">{t.name}</b>
                    <span className="text-sm text-muted">{t.by} · shares questions with {t.shares}</span>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <button className={on ? 'btn-soft text-sm' : 'btn-primary text-sm'} aria-pressed={on} onClick={() => toggle(t.id)}>{on ? <><Check size={15} /> Added</> : <><Plus size={15} /> Add</>}</button>
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
