'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Plus, Trophy } from 'lucide-react';
import { Bar, Empty, Notice, PageHeader, Reveal, Skeleton, VerifiedPill, cx } from '@/components/ui';
import { useLMS, useHydrated } from '@/lib/store';
import { useCourse } from '@/lib/use-course';
import { useT } from '@/lib/i18n';

export default function SyllabusPage() {
  const hydrated = useHydrated();
  const { t } = useT();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const setProfile = useLMS(s => s.setProfile);
  const { data, error } = useCourse(profile, true);

  if (!hydrated) return <Skeleton lines={8} />;
  if (!profile.board) return <Empty title={t('syl.first')} icon={<BookOpen size={24} />} action={<Link href="/student/onboarding" className="btn-primary">{t('syl.getStarted')}</Link>}>{t('syl.firstDesc')}</Empty>;

  const mastery = (units?: { id: string }[]) => (units?.length ? units.reduce((a, u) => a + (skills[u.id]?.attempts ? skills[u.id].pKnown : 0), 0) / units.length : 0);
  const toggle = (id: string) => setProfile({ tracks: profile.tracks.includes(id) ? profile.tracks.filter(x => x !== id) : [...profile.tracks, id] });

  return (
    <div className="grid gap-8">
      <PageHeader eyebrow={t('syl.eyebrow')} title={t('syl.title')}
        desc={<span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {[profile.board, profile.cls === 13 ? t('shell.repeater') : t('shell.class', { n: profile.cls ?? '' }), profile.stream].filter(Boolean).map((x, i) => (
            <span key={i} className="flex items-center gap-2">{i > 0 && <span className="text-muted" aria-hidden>›</span>}<span className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{x}</span></span>
          ))}
        </span>}
        actions={<Link href="/student/onboarding" className="btn-ghost text-sm">{t('syl.change')}</Link>} />

      {error && <Notice tone="error" title={t('syl.loadErr')} action={<button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => location.reload()}>{t('common.tryAgain')}</button>}>{t('syl.loadErrDesc')}</Notice>}
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
                    <span className="tag">{s.unitCount === 1 ? t('syl.unit1') : t('syl.units', { n: s.unitCount })}</span>
                  </div>
                  {s.book && <span className="text-sm text-muted">{s.book}</span>}
                  <div className="flex flex-wrap items-center gap-2"><VerifiedPill v={s.verified} />{s.session && <span className="tag">{s.session}</span>}</div>
                  <span role="img" aria-label={`${t('syl.mastery', { name: s.name })}: ${Math.round(mastery(s.units) * 100)}%`}><Bar value={mastery(s.units)} className="mt-1" /></span>
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
              <h2 className="h-section flex items-center gap-2"><Trophy size={20} className="text-accent" aria-hidden /> {t('syl.tracks')}</h2>
              <p className="text-muted">{t('syl.tracksDesc')}</p>
            </div>
            {!data.tracks.length && <Notice>{t('syl.noTracks')}</Notice>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.tracks.map(tr => {
                const on = profile.tracks.includes(tr.id);
                const first = tr.exams[0];
                return (
                  <div key={tr.id} className={cx('card grid gap-2 p-4', on && 'border-primary ring-2 ring-primary/30')}>
                    <b className="font-display text-lg leading-tight">{tr.name}</b>
                    <span className="text-sm text-muted">{t('syl.shares', { by: tr.by, shares: tr.shares })}</span>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <button className={on ? 'btn-soft text-sm' : 'btn-primary text-sm'} aria-pressed={on} aria-label={t('syl.addTrack', { name: tr.name })} onClick={() => toggle(tr.id)}>{on ? <><Check size={15} aria-hidden /> {t('syl.added')}</> : <><Plus size={15} aria-hidden /> {t('syl.add')}</>}</button>
                      {first && <Link href={`/student/exams/${first}`} className="btn-ghost text-sm">{t('common.open')} <ArrowRight size={15} aria-hidden /></Link>}
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
