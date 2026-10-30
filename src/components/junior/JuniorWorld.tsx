'use client';
/**
 * Junior Learning World (Classes 1–5).
 * Picture-led, large touch targets, minimal reading, audio for every instruction,
 * optional voice navigation, and stars instead of analytics. Uses only real learner state.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Mic, Play, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BadgeMedal, DestinationArt, Star, SubjectArt, Vidya } from '../art';
import { LabView } from '../labs/LabView';
import { LABS } from '../labs/registry';
import { LabArt } from '../labs/LabArt';
import { Skeleton, cx } from '../ui';
import { badges } from '@/lib/achievements';
import { recommend, type Candidate } from '@/lib/adaptive';
import { localeOf, useT } from '@/lib/i18n';
import { useLMS, useHydrated } from '@/lib/store';
import { useCourse } from '@/lib/use-course';
import { useTutor } from '@/lib/tutor-store';

const enc = encodeURIComponent;

/** Speak a short instruction in the learner's language (no-op where speech is unavailable). */
export function useSpeak() {
  const lang = useLMS(s => s.profile.language);
  return useCallback((text: string) => {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = localeOf(lang); u.rate = 0.9; speechSynthesis.speak(u); } catch { /* no audio */ }
  }, [lang]);
}

export function SpeakButton({ text, label, className }: { text: string; label?: string; className?: string }) {
  const speak = useSpeak();
  const { t } = useT();
  return (
    <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); speak(text); }} aria-label={`${label || t('jr.listen')}: ${text}`}
      className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-primary shadow-soft ring-1 ring-line transition hover:bg-primary hover:text-onprimary', className)}>
      <Volume2 size={22} aria-hidden />
    </button>
  );
}

/** Real stars: one per correct answer recorded on this device. */
export function useStars() {
  const skills = useLMS(s => s.skills);
  return useMemo(() => Object.values(skills).reduce((a, k) => a + (k.correct || 0), 0), [skills]);
}
export const chapterStars = (p?: { attempts: number; pKnown: number }) => (!p || !p.attempts ? 0 : p.pKnown >= 0.8 ? 3 : p.pKnown >= 0.5 ? 2 : 1);

function Stars({ n, size = 22, label }: { n: number; size?: number; label: string }) {
  return <span className="inline-flex gap-0.5" role="img" aria-label={label}>{[0, 1, 2].map(i => <Star key={i} size={size} filled={i < n} />)}</span>;
}

/* ---------------------------------------------------------------- Home */
export function JuniorHome() {
  const { t } = useT();
  const hydrated = useHydrated();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const { data, error } = useCourse(profile, true);
  const stars = useStars();
  const speak = useSpeak();
  const setOpen = useTutor(s => s.setOpen);
  const reduce = useReducedMotion();

  const cands = useMemo(() => {
    let o = 0;
    const subs = data?.groups.flatMap(g => g.subjects) ?? [];
    const lists = subs.filter(s => s.units?.length).map(s => s.units!.map(u => ({ id: u.id, name: u.name, subject: s.name })));
    const out: (Candidate & { subject: string })[] = [];
    const max = Math.max(0, ...lists.map(l => l.length));
    for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push({ ...l[i], order: o++ });
    return out;
  }, [data]);
  const rec = useMemo(() => recommend(cands, skills, Date.now(), 1)[0], [cands, skills]);
  const recSubject = rec ? cands.find(c => c.id === rec.id)?.subject : undefined;
  const hello = t('jr.hello', { name: profile.name || '' }), prompt = t('jr.prompt');

  const dests = [
    { kind: 'learn' as const, href: '/student/junior/learn', title: t('jr.learn'), desc: t('jr.learnDesc'), tone: 'from-primary/15' },
    { kind: 'play' as const, href: '/student/junior/play', title: t('jr.play'), desc: t('jr.playDesc'), tone: 'from-teal/15' },
    { kind: 'stars' as const, href: '/student/junior/stars', title: t('jr.stars'), desc: t('jr.starsCount', { n: stars }), tone: 'from-accent/20' },
    { kind: 'vidya' as const, href: '', title: t('shell.askVidya'), desc: t('jr.vidyaDesc'), tone: 'from-violet/15' },
  ];

  if (!hydrated) return <Skeleton lines={6} />;
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7">
      {/* Vidya greets */}
      <section className="flex items-center gap-4 sm:gap-6" aria-labelledby="jr-hello">
        <motion.div initial={reduce ? false : { scale: 0.8, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="shrink-0">
          <Vidya size={96} mood="cheer" />
        </motion.div>
        <div className="relative min-w-0 flex-1 rounded-[1.75rem] rounded-bl-md bg-surface p-5 shadow-soft ring-1 ring-line">
          <h1 id="jr-hello" className="text-3xl sm:text-4xl">{hello}</h1>
          <p className="mt-1 text-xl text-muted">{prompt}</p>
          <div className="absolute -right-2 -top-3"><SpeakButton text={`${hello} ${prompt}`} /></div>
        </div>
      </section>

      {/* Today's lesson */}
      {error ? <p role="alert" className="rounded-card bg-bad/10 p-5 text-lg">{t('jr.loadError')}</p> : !data ? (
        <div className="skeleton h-40 rounded-card" aria-label={t('jr.loading')} />
      ) : rec ? (
        <Link href={`/student/learn/${enc(rec.id)}`} className="group panel-night flex items-center gap-5 rounded-card p-5 shadow-lift sm:p-6">
          <SubjectArt name={recSubject || ''} size={88} className="shrink-0 rounded-2xl" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold uppercase tracking-wider text-onnight/70">{t('jr.today')}</span>
            <span className="mt-1 block font-display text-2xl font-bold leading-tight sm:text-3xl">{cleanName(rec.name)}</span>
            <span className="mt-2 block"><Stars n={chapterStars(skills[rec.id])} label={t('jr.lessonStars', { n: chapterStars(skills[rec.id]) })} /></span>
          </span>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent text-[#2b1b02] shadow-lift transition group-hover:scale-105"><Play size={30} fill="currentColor" aria-hidden /><span className="sr-only">{skills[rec.id]?.attempts ? t('jr.continue') : t('jr.start')}</span></span>
        </Link>
      ) : null}

      {/* Four destinations */}
      <nav aria-label={t('nav.main')} className="grid grid-cols-2 gap-4">
        {dests.map((d, i) => {
          const inner = (
            <>
              <DestinationArt kind={d.kind} size="100%" className="mx-auto max-h-36 w-full" />
              <span className="grid gap-0.5 text-center">
                <span className="font-display text-2xl font-bold leading-tight">{d.title}</span>
                <span className="text-base text-muted">{d.desc}</span>
              </span>
            </>
          );
          const cls = cx('relative grid min-h-[13rem] content-between gap-3 rounded-card border-2 border-line bg-gradient-to-b to-surface p-4 text-left transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift focus-visible:-translate-y-1 sm:p-5', d.tone);
          return (
            <motion.div key={d.kind} initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="relative">
              {d.href ? <Link href={d.href} className={cls}>{inner}</Link> : <button onClick={() => setOpen(true)} aria-haspopup="dialog" className={cx(cls, 'w-full')}>{inner}</button>}
              <SpeakButton text={`${d.title}. ${d.desc}`} className="absolute right-3 top-3 !h-11 !w-11" />
            </motion.div>
          );
        })}
      </nav>

      <VoiceNav onVidya={() => setOpen(true)} speak={speak} />
    </div>
  );
}

/** Optional voice navigation: say "Learn", "Play", "Stars" or "Vidya" (where the browser supports it). */
function VoiceNav({ onVidya, speak }: { onVidya: () => void; speak: (s: string) => void }) {
  const { t, lang } = useT();
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'listening' | 'miss'>('idle');
  const [supported, setSupported] = useState(false);
  const rec = useRef<{ stop: () => void } | null>(null);
  useEffect(() => { const w = window as unknown as Record<string, unknown>; setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition)); }, []);
  useEffect(() => () => rec.current?.stop(), []);
  if (!supported) return null;
  const words: [RegExp, () => void][] = [
    [/learn|सीख|ਸਿੱਖ|lesson|पाठ|ਪਾਠ/i, () => router.push('/student/junior/learn')],
    [/play|game|खेल|ਖੇਡ/i, () => router.push('/student/junior/play')],
    [/star|सितार|ਤਾਰ/i, () => router.push('/student/junior/stars')],
    [/vidya|विद्या|ਵਿੱਦਿਆ|help|मदद|ਮਦਦ/i, onVidya],
  ];
  function listen() {
    const w = window as unknown as Record<string, new () => { lang: string; interimResults: boolean; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void }>;
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    const r = new R(); rec.current = r;
    r.lang = localeOf(lang); r.interimResults = false;
    r.onresult = e => {
      const said = e.results[0][0].transcript;
      const hit = words.find(([re]) => re.test(said));
      if (hit) { setState('idle'); hit[1](); } else { setState('miss'); speak(t('jr.didntCatch')); }
    };
    r.onerror = () => setState('miss');
    r.onend = () => setState(s => (s === 'listening' ? 'idle' : s));
    setState('listening'); r.start();
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button onClick={state === 'listening' ? () => rec.current?.stop() : listen} aria-pressed={state === 'listening'}
        className={cx('flex min-h-14 items-center gap-3 rounded-full px-6 text-lg font-bold shadow-soft transition', state === 'listening' ? 'bg-bad text-white' : 'bg-surface ring-1 ring-line hover:ring-primary')}>
        <Mic size={22} aria-hidden />{t('jr.sayIt')}
      </button>
      <p className="text-muted" aria-live="polite">{state === 'listening' ? t('jr.listening') : state === 'miss' ? t('jr.didntCatch') : ''}</p>
    </div>
  );
}

const cleanName = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '');

function JuniorHeader({ title, back = '/student', art }: { title: string; back?: string; art?: React.ReactNode }) {
  const { t } = useT();
  return (
    <header className="flex items-center gap-4">
      <Link href={back} className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-surface shadow-soft ring-1 ring-line hover:ring-primary" aria-label={t('common.back')}><ArrowLeft size={26} /></Link>
      {art}
      <h1 className="min-w-0 flex-1 text-3xl sm:text-4xl">{title}</h1>
      <SpeakButton text={title} />
    </header>
  );
}

/* ---------------------------------------------------------------- Learn */
export function JuniorLearn() {
  const { t } = useT();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const { data, error } = useCourse(profile, true);
  const [subject, setSubject] = useState<string | null>(null);
  const subs = useMemo(() => data?.groups.flatMap(g => g.subjects).filter(s => s.units?.length) ?? [], [data]);
  const cur = subs.find(s => s.id === subject);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6">
      <JuniorHeader title={cur ? cur.name : t('jr.chooseSubject')} back={cur ? '/student/junior/learn' : '/student'} art={<DestinationArt kind="learn" size={56} />} />
      {cur && <button onClick={() => setSubject(null)} className="btn-soft w-fit text-base"><ArrowLeft size={18} /> {t('jr.allSubjects')}</button>}
      {error && <p role="alert" className="rounded-card bg-bad/10 p-5 text-lg">{t('jr.loadError')}</p>}
      {!data && !error && <Skeleton lines={5} />}
      {data && !cur && (
        subs.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {subs.map(s => {
              const st = (s.units || []).reduce((a, u) => a + chapterStars(skills[u.id]), 0);
              return (
                <li key={s.id}>
                  <button onClick={() => setSubject(s.id)} className="grid h-full w-full justify-items-center gap-3 rounded-card border-2 border-line bg-surface p-5 text-center transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift">
                    <SubjectArt name={s.name} size={96} />
                    <span className="font-display text-2xl font-bold leading-tight">{s.name}</span>
                    <span className="flex items-center gap-1.5 text-muted"><Star size={18} />{t('jr.starsCount', { n: st })}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-lg text-muted">{t('jr.noLessons')}</p>
      )}
      {cur && (
        <>
          <p className="text-xl text-muted">{t('jr.chooseLesson')}</p>
          <ol className="grid gap-3 sm:grid-cols-2">
            {cur.units!.map((u, i) => {
              const n = chapterStars(skills[u.id]);
              return (
                <li key={u.id}>
                  <Link href={`/student/learn/${enc(u.id)}`} className="flex min-h-[5.5rem] items-center gap-4 rounded-card border-2 border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">{i + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block font-display text-xl font-bold leading-tight">{cleanName(u.name)}</span><Stars n={n} size={18} label={t('jr.lessonStars', { n })} /></span>
                    <Play size={26} className="shrink-0 text-primary" fill="currentColor" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Play & Explore */
export function JuniorPlay() {
  const { t, tf } = useT();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const [lab, setLab] = useState<string | null>(null);
  const cls = profile.cls ?? 3;
  // labs designed for this child's class (± 1), never senior labs
  const labs = LABS.filter(l => l.min <= 5 && l.min <= cls + 1 && l.max >= cls - 1);
  // a quiz game from a chapter they have started, else their first chapter
  const { data } = useCourse(profile, true);
  const started = Object.keys(skills).find(id => skills[id].attempts);
  const firstUnit = data?.groups.flatMap(g => g.subjects).find(s => s.units?.length)?.units?.[0]?.id;
  const quizId = started || firstUnit;
  const cur = LABS.find(l => l.id === lab);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6">
      <JuniorHeader title={cur ? tf(`lab.${cur.id}.title`, cur.title) : t('jr.play')} back="/student" art={<DestinationArt kind="play" size={56} />} />
      {cur ? (
        <section className="grid gap-4">
          <button onClick={() => setLab(null)} className="btn-soft w-fit text-base"><ArrowLeft size={18} /> {t('jr.backToPlay')}</button>
          <div className="card p-4 sm:p-6"><LabView id={cur.id} /></div>
        </section>
      ) : (
        <>
          <h2 className="text-2xl">{t('jr.games')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizId && (
              <Link href={`/student/practice/${enc(quizId)}`} className="flex items-center gap-4 rounded-card border-2 border-line bg-gradient-to-br from-accent/20 to-surface p-5 transition hover:-translate-y-1 hover:shadow-lift">
                <DestinationArt kind="stars" size={88} />
                <span><span className="block font-display text-2xl font-bold">{t('jr.quizGame')}</span><span className="text-lg text-muted">{t('jr.quizGameDesc')}</span></span>
              </Link>
            )}
            {labs.map(l => (
              <button key={l.id} onClick={() => setLab(l.id)} className="flex items-center gap-4 rounded-card border-2 border-line bg-gradient-to-br from-teal/15 to-surface p-5 text-left transition hover:-translate-y-1 hover:shadow-lift">
                <span className="panel-night grid h-[88px] w-[88px] shrink-0 place-items-center rounded-2xl"><LabArt id={l.id} className="h-16 w-16" /></span>
                <span><span className="block font-display text-2xl font-bold">{tf(`lab.${l.id}.title`, l.title)}</span><span className="text-lg text-muted">{tf(`lab.${l.id}.blurb`, l.blurb)}</span></span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- My Stars */
export function JuniorStars() {
  const { t } = useT();
  const profile = useLMS(s => s.profile);
  const skills = useLMS(s => s.skills);
  const chapters = useLMS(s => s.chapters);
  const streak = useLMS(s => s.streak);
  const xp = useLMS(s => s.xp);
  const log = useLMS(s => s.log);
  const stars = useStars();
  const earned = badges({ xp, streak, skills, chapters, log });
  const bySubject = useMemo(() => {
    const m: Record<string, number> = {};
    Object.entries(skills).forEach(([id, k]) => { if (k.correct) { const s = chapters[id]?.subject || '—'; m[s] = (m[s] || 0) + k.correct; } });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [skills, chapters]);
  const said = stars ? t('jr.starsYou', { n: stars }) : t('jr.starsNone');

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7">
      <JuniorHeader title={t('jr.stars')} art={<DestinationArt kind="stars" size={56} />} />
      <section className="panel-night flex flex-wrap items-center gap-5 rounded-card p-6 shadow-lift" aria-live="polite">
        <span className="relative grid h-28 w-28 shrink-0 place-items-center"><Star size={112} /><span className="absolute font-display text-3xl font-extrabold text-[#2b1b02]">{stars}</span></span>
        <div className="min-w-0 flex-1"><p className="font-display text-3xl font-bold">{said}</p><p className="mt-1 text-lg text-onnight/75">{t('jr.starRule')}</p></div>
        <SpeakButton text={`${said} ${t('jr.starRule')}`} className="!bg-white/10 !text-onnight !ring-white/20" />
      </section>

      <section className="grid gap-3" aria-labelledby="jr-stickers">
        <h2 id="jr-stickers" className="text-2xl">{t('jr.stickers')}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {earned.map(b => (
            <li key={b.id} className={cx('grid justify-items-center gap-2 rounded-card border-2 p-4 text-center', b.earned ? 'border-accent/50 bg-accent/10' : 'border-line bg-surface')}>
              <BadgeMedal id={b.id} earned={b.earned} size={64} />
              <b className={cx('text-base leading-tight', !b.earned && 'text-muted')}>{t(`badge.${b.id}.title`)}</b>
              <span className="text-sm text-muted">{b.earned ? t('badge.earned') : t(`badge.${b.id}.desc`)}</span>
            </li>
          ))}
        </ul>
      </section>

      {bySubject.length > 0 && (
        <section className="grid gap-3" aria-labelledby="jr-bysub">
          <h2 id="jr-bysub" className="text-2xl">{t('jr.bySubject')}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {bySubject.map(([s, n]) => (
              <li key={s} className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
                <SubjectArt name={s} size={56} />
                <b className="min-w-0 flex-1 text-lg">{s}</b>
                <span className="flex items-center gap-1 font-display text-2xl font-bold"><Star size={26} />{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!stars && <Link href="/student/junior/learn" className="btn-primary w-fit px-6 py-3 text-lg">{t('jr.start')}</Link>}
    </div>
  );
}
