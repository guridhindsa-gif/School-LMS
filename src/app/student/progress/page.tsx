'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarClock, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BandPill, Bar, Card, PageHeader, Reveal, Ring, Skeleton, cx } from '@/components/ui';
import { badges, level } from '@/lib/achievements';
import { band } from '@/lib/adaptive';
import { useLMS, useHydrated } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { BadgeMedal, EmptyArt } from '@/components/art';

export default function ProgressPage() {
  const hydrated = useHydrated();
  const { t, locale } = useT();
  const steps = useLMS(s => s.steps);
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
    rows.forEach(r => { const k = r.ch?.subject || ''; (m[k] ||= []).push(r); });
    return Object.entries(m).map(([k, list]) => ({ subject: k, list, avg: list.reduce((a, r) => a + r.s.pKnown, 0) / list.length })).sort((a, b) => a.avg - b.avg);
  }, [rows]);
  const heat = useMemo(() => {
    const days = Array.from({ length: 84 }, (_, i) => new Date(Date.now() - (83 - i) * 86_400_000).toISOString().slice(0, 10));
    return days.map(d => ({ d, n: log.find(l => l.day === d)?.answered || 0 }));
  }, [log]);

  if (!hydrated) return <Skeleton lines={8} />;
  if (!rows.length) return (
    <div className="grid gap-6">
      <PageHeader eyebrow={t('prog.eyebrow')} title={t('prog.title')} />
      <div className="grid justify-items-center gap-2 rounded-card border border-dashed border-line bg-surface/60 p-10 text-center">
        <EmptyArt kind="progress" />
        <h2 className="text-xl">{t('prog.none')}</h2>
        <p className="max-w-md text-muted">{t('prog.noneDesc')}</p>
        <Link href="/student" className="btn-primary mt-2">{t('prog.start')}</Link>
      </div>
    </div>
  );

  const due = rows.filter(r => r.s.nextReview <= Date.now());
  const totalA = rows.reduce((a, r) => a + r.s.attempts, 0), totalC = rows.reduce((a, r) => a + r.s.correct, 0);
  const lv = level(xp);
  const bs = badges({ xp, streak, skills, chapters, log });
  const earned = bs.filter(b => b.earned).length;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow={t('prog.eyebrow')} title={t('prog.title')} desc={t('prog.desc')} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <section className="panel-night grid h-full gap-4 rounded-card p-6 shadow-lift" aria-labelledby="lvl">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 font-display text-3xl font-bold" aria-hidden>{lv.level}</span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs uppercase tracking-widest text-onnight/70">{t('prog.yourLevel')}</p>
                <h2 id="lvl" className="text-2xl">{t('shell.level', { n: lv.level })}</h2>
                <p className="text-sm text-onnight/75">{t('prog.xpLine', { xp, n: lv.toNext, next: lv.level + 1 })}</p>
              </div>
              <Sparkles className="text-accent" aria-hidden />
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={t('prog.toNextLevel')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)}>
              <div className="h-full rounded-full bg-accent" style={{ width: `${lv.progress * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[[t('prog.streak'), t('prog.dShort', { n: streak.current })], [t('prog.bestStreak'), t('prog.dShort', { n: streak.best })], [t('prog.badges'), `${earned}/${bs.length}`]].map(([k, v]) => (
                <div key={k} className="rounded-ctl bg-white/[.07] px-2 py-2"><p className="text-xs text-onnight/65">{k}</p><p className="font-display text-xl font-bold">{v}</p></div>
              ))}
            </div>
          </section>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="flex items-center gap-4"><Ring value={rows.reduce((a, r) => a + r.s.pKnown, 0) / rows.length} size={64} /><div><b>{t('prog.avg')}</b><p className="text-sm text-muted">{t('prog.started', { n: rows.length })}</p></div></Card>
          <Card className="flex items-center gap-4"><Ring value={totalC / Math.max(1, totalA)} size={64} color="rgb(var(--teal))" /><div><b>{t('prog.accuracy')}</b><p className="text-sm text-muted">{t('prog.correctOf', { c: totalC, a: totalA })}</p></div></Card>
          <Card className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 font-display text-3xl font-bold text-warn">{due.length}</span><div><b>{t('prog.dueReview')}</b><p className="text-sm text-muted">{t('prog.spaced')}</p></div></Card>
        </div>
      </div>

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2"><h2 className="flex items-center gap-2 text-xl"><Trophy size={19} className="text-accent" aria-hidden /> {t('prog.badges')}</h2><span className="text-sm text-muted">{t('prog.earnedBy')}</span></div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {bs.map(b => (
            <li key={b.id} className={cx('grid content-start gap-1.5 rounded-ctl border p-3', b.earned ? 'border-accent/40 bg-accent/10' : 'border-line bg-surface2/50')}>
              <BadgeMedal id={b.id} earned={b.earned} size={44} />
              <b className="text-sm">{t(`badge.${b.id}.title`)}</b>
              <span className="text-xs text-muted">{t(`badge.${b.id}.desc`)}</span>
              {!b.earned && <span className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface3" role="progressbar" aria-label={t('prog.badgeProgress', { name: t(`badge.${b.id}.title`) })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(b.progress * 100)}><i className="block h-full rounded-full bg-primary" style={{ width: `${b.progress * 100}%` }} /></span>}
              <span className="sr-only">{b.earned ? t('badge.earned') : t('badge.notYet', { desc: t(`badge.${b.id}.desc`) })}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="grid gap-3">
        <h2 className="text-xl">{t('prog.activity')}</h2>
        <div className="overflow-x-auto">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-1" role="img" aria-label={t('prog.activityAria', { n: heat.reduce((a, h) => a + h.n, 0) })}>
            {heat.map((h, i) => (
              <motion.span key={h.d} title={t('prog.dayAnswered', { d: new Date(h.d).toLocaleDateString(locale, { day: 'numeric', month: 'short' }), n: h.n })} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.004 }}
                className="h-3.5 w-3.5 rounded-[4px]" style={{ background: h.n ? `rgb(var(--teal) / ${Math.min(1, 0.25 + h.n / 20)})` : 'rgb(var(--surface-2))' }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted" aria-hidden>{t('prog.less')}{[0, 0.35, 0.6, 1].map(o => <i key={o} className="h-3 w-3 rounded-[3px]" style={{ background: o ? `rgb(var(--teal) / ${o})` : 'rgb(var(--surface-2))' }} />)}{t('prog.more')}</div>
      </Card>

      {due.length > 0 && (
        <Card className="grid gap-3">
          <h2 className="flex items-center gap-2 text-xl"><CalendarClock size={19} aria-hidden /> {t('prog.reviewToday')}</h2>
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
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl">{g.subject || t('prog.other')}</h2><Ring value={g.avg} size={46} stroke={5} /></div>
          <ul className="grid gap-2">
            {g.list.map(r => (
              <li key={r.id}>
                <Link href={`/student/learn/${encodeURIComponent(r.id)}`} className="grid items-center gap-2 rounded-ctl px-2 py-2 hover:bg-surface2 sm:grid-cols-[minmax(0,1fr)_140px_auto_minmax(0,auto)]">
                  <span className="truncate font-semibold">{r.ch?.name || r.id}</span>
                  <Bar value={r.s.pKnown} />
                  <BandPill band={band(r.s)} />
                  <span className="text-xs text-muted">{steps[r.id]?.assessScore != null ? `${t('prog.testScore', { n: steps[r.id]!.assessScore! })} · ` : ''}{t('prog.reviewOn', { date: new Date(r.s.nextReview).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <div>
        {!confirm ? <button className="btn-ghost text-sm" onClick={() => setConfirm(true)}><RotateCcw size={15} aria-hidden /> {t('prog.reset')}</button>
          : <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-bad" role="alert">{t('prog.resetWarn')}</span><button className="btn bg-bad text-sm text-white hover:brightness-110" onClick={() => { resetProgress(); setConfirm(false); }}>{t('prog.resetBtn')}</button><button className="btn-ghost text-sm" onClick={() => setConfirm(false)}>{t('common.cancel')}</button></div>}
      </div>
    </div>
  );
}
