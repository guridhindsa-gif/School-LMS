'use client';
import { aiHeaders } from '@/lib/ai-settings';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Captions, CaptionsOff, FileText, Pause, Play, RefreshCw, Sparkles, Target, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { INTERACTIVE, SCENES } from './Scenes';
import { Vidya } from '../art';
import { Confetti } from '../Confetti';
import { Dots, Notice, cx } from '../ui';
import { LABS } from '../labs/registry';
import { friendlyError } from '@/lib/ai-client';
import { localeOf, useT } from '@/lib/i18n';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import { demoVisualLesson } from '@/lib/visual-fallback';
import { sanitizeLesson, type Scene, type VisualLesson as Lesson } from '@/lib/visual';
import type { LearnContext } from '@/lib/types';

interface Props { unitId: string; title: string; ctx: LearnContext; labId?: string | null; young?: boolean; onComplete?: () => void }
const SPEEDS = [0.75, 1, 1.25] as const;

/** Scene-by-scene animated, interactive lesson with narration (speed, captions, transcript) and autoplay. */
export function VisualLesson({ unitId, title, ctx, labId, young, onComplete }: Props) {
  const lang = useLMS(s => s.profile.language);
  const recordAnswer = useLMS(s => s.recordAnswer);
  const ask = useTutor(s => s.ask);
  const { t, tf } = useT();
  const key = `visual:${unitId}:${lang}`;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [offline, setOffline] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [voice, setVoice] = useState(!!young);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [captions, setCaptions] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [auto, setAuto] = useState(false);
  const [fire, setFire] = useState(0);
  const [finished, setFinished] = useState(false);
  const ctl = useRef<AbortController | null>(null);

  const withLab = useCallback((l: Lesson): Lesson => {
    if (!labId || l.scenes.some(s => s.type === 'lab')) return l;
    const info = LABS.find(x => x.id === labId);
    const sc: Scene = { type: 'lab', title: info ? tf(`lab.${info.id}.title`, info.title) : t('vl.simulation'), narration: info ? tf(`lab.${info.id}.blurb`, info.blurb) : t('vl.trySim'), lab: labId };
    const at = Math.min(3, l.scenes.length - 1);
    return { ...l, scenes: [...l.scenes.slice(0, at), sc, ...l.scenes.slice(at)] };
  }, [labId, t, tf]);

  const showOffline = useCallback(() => { setLesson(withLab(demoVisualLesson(ctx, t))); setOffline(true); setErr(''); setIdx(0); setDone(new Set()); setFinished(false); }, [ctx, t, withLab]);

  const load = useCallback(async (force = false) => {
    ctl.current?.abort();
    setErr(''); setFinished(false); setIdx(0); setDone(new Set());
    if (!force) { try { const c = localStorage.getItem(key); if (c) { setLesson(withLab(sanitizeLesson(JSON.parse(c)))); setOffline(false); return; } } catch { /* ignore */ } }
    setLoading(true); setLesson(null);
    ctl.current = new AbortController();
    try {
      const { unitId: _u, ...rest } = ctx;
      const res = await fetch('/api/ai/visual', { method: 'POST', headers: { 'Content-Type': 'application/json', ...aiHeaders() }, body: JSON.stringify({ ctx: { ...rest, language: lang } }), signal: ctl.current.signal });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw Object.assign(new Error(j.error || 'AI error'), { name: 'AIError' }); }
      const l = sanitizeLesson(await res.json());
      if (l.scenes.length < 3) throw new Error(t('vl.tooFew'));
      try { localStorage.setItem(key, JSON.stringify(l)); } catch { /* full */ }
      setLesson(withLab(l)); setOffline(false);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setErr(friendlyError(e) || (e as Error).message);
    } finally { setLoading(false); }
  }, [ctx, key, lang, withLab, t]);

  useEffect(() => { load(); return () => { ctl.current?.abort(); try { speechSynthesis.cancel(); } catch { /* */ } }; }, [load]);

  const scenes = lesson?.scenes ?? [];
  const scene = scenes[idx];

  const speakNow = useCallback((text: string, onEnd?: () => void) => {
    try {
      speechSynthesis.cancel();
      if (!text) { onEnd?.(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = localeOf(lang); u.rate = (young ? 0.88 : 0.97) * speed;
      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); onEnd?.(); };
      u.onerror = () => setSpeaking(false);
      speechSynthesis.speak(u);
    } catch { onEnd?.(); }
  }, [lang, young, speed]);

  const next = useCallback(() => setIdx(i => { if (i >= scenes.length - 1) { setFinished(true); setFire(f => f + 1); return i; } return i + 1; }), [scenes.length]);
  useEffect(() => { if (finished) onComplete?.(); }, [finished, onComplete]);

  useEffect(() => {
    if (!scene || finished) return;
    let tm: ReturnType<typeof setTimeout> | undefined;
    const after = () => { if (auto && !INTERACTIVE.has(scene.type)) tm = setTimeout(next, 1400); };
    if (voice) speakNow(scene.narration, after); else { try { speechSynthesis.cancel(); } catch { /* */ } if (auto && !INTERACTIVE.has(scene.type)) tm = setTimeout(next, 6000 / speed); }
    return () => { if (tm) clearTimeout(tm); };
  }, [idx, scene, voice, auto, finished, speakNow, next, speed]);

  const markDone = useCallback(() => setDone(s => (s.has(idx) ? s : new Set(s).add(idx))), [idx]);
  const onQuiz = useCallback((correct: boolean) => {
    if (ctx.unitId) recordAnswer({ id: ctx.unitId, name: title, subject: ctx.subject || ctx.exam || '', kind: ctx.kind }, { correct, difficulty: 'easy', topic: scene?.title });
    if (correct) setFire(f => f + 1);
  }, [ctx, recordAnswer, title, scene]);

  if (loading) return <Building />;
  if (err && !lesson) {
    return (
      <div className="grid gap-4 rounded-card border border-line bg-surface2/50 p-5 sm:p-6" role="alert">
        <div className="flex items-start gap-4">
          <Vidya size={56} mood="think" className="shrink-0" />
          <div className="grid gap-1"><b className="text-lg">{t('vl.aiDown')}</b><p className="text-muted">{t('vl.aiDownBody')}</p><p className="text-xs text-muted">{t('vl.reason', { msg: err })}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={showOffline}><FileText size={16} aria-hidden /> {t('vl.useSyllabus')}</button>
          <button className="btn-ghost" onClick={() => load(true)}><RefreshCw size={15} aria-hidden /> {t('common.tryAgain')}</button>
          <Link href="/settings" className="btn-ghost">{t('vl.checkAI')}</Link>
        </div>
      </div>
    );
  }
  if (!lesson || !scene) return null;
  const Comp = SCENES[scene.type];

  if (finished) {
    const quizzes = scenes.filter(s => s.type === 'quiz').length;
    return (
      <div className="v-scene grid justify-items-center gap-4 py-8 text-center">
        <Vidya size={96} mood="cheer" className="v-pop" />
        <h3 className="text-3xl">{t('vl.complete')}</h3>
        <p className="max-w-md text-muted">{t('vl.summary', { n: scenes.length, a: done.size, q: quizzes })}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/student/practice/${encodeURIComponent(unitId)}`} className="btn-primary"><Target size={17} aria-hidden /> {t('vl.practise')}</Link>
          <button className="btn-ghost" onClick={() => { setFinished(false); setIdx(0); }}><RefreshCw size={15} aria-hidden /> {t('vl.again')}</button>
          <button className="btn-ghost" onClick={() => ask(t('vl.quizMePrompt', { title }))}><Sparkles size={15} className="text-primary" aria-hidden /> {t('vl.quizMe')}</button>
        </div>
        <Confetti fire={fire} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {offline && <Notice tone="warn" title={t('vl.offlineTitle')}>{t('vl.offlineBody')}</Notice>}

      {/* progress */}
      <div className="flex items-center gap-1.5" role="tablist" aria-label={t('vl.scenes')}>
        {scenes.map((s, i) => (
          <button key={i} role="tab" aria-selected={i === idx} aria-label={t('vl.sceneN', { n: i + 1, title: s.title })} onClick={() => setIdx(i)}
            className={cx('h-2 flex-1 rounded-full transition', i === idx ? 'bg-primary' : done.has(i) || i < idx ? 'bg-teal' : 'bg-surface2 hover:bg-surface3')} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-night text-onnight">{idx + 1} / {scenes.length}</span>
        <span className="pill bg-teal/15 text-teal">{t(`vl.type.${scene.type}`)}</span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button className={cx('btn-ghost h-9 min-h-0 text-sm', voice && 'border-primary/50 text-primary')} aria-pressed={voice} title={t('vl.voiceTip')}
            onClick={() => setVoice(v => { if (v) { try { speechSynthesis.cancel(); } catch { /* */ } setSpeaking(false); } return !v; })}>
            {voice ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}<span>{voice ? t('vl.voiceOn') : t('vl.voiceOff')}</span>
          </button>
          <label className="sr-only" htmlFor="vl-speed">{t('vl.speed')}</label>
          <select id="vl-speed" value={speed} onChange={e => setSpeed(Number(e.target.value) as (typeof SPEEDS)[number])} title={t('vl.speed')} className="h-9 rounded-ctl border border-line bg-surface px-2 text-sm font-semibold">
            {SPEEDS.map(s => <option key={s} value={s}>{s}×</option>)}
          </select>
          <button className={cx('btn-ghost h-9 min-h-0 !px-2.5 text-sm', captions && 'border-primary/50 text-primary')} aria-pressed={captions} aria-label={t('vl.captions')} title={t('vl.captions')} onClick={() => setCaptions(c => !c)}>
            {captions ? <Captions size={16} aria-hidden /> : <CaptionsOff size={16} aria-hidden />}
          </button>
          <button className={cx('btn-ghost h-9 min-h-0 text-sm', auto && 'border-primary/50 text-primary')} aria-pressed={auto} onClick={() => setAuto(a => !a)} title={t('vl.autoTip')}>
            {auto ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}<span className="hidden sm:inline">{auto ? t('vl.pause') : t('vl.autoplay')}</span>
          </button>
          {!offline && <button className="btn-ghost h-9 min-h-0 !px-2.5 text-sm" onClick={() => load(true)} title={t('vl.regenerate')} aria-label={t('vl.regenerate')}><RefreshCw size={15} aria-hidden /></button>}
        </div>
      </div>

      <section key={idx} className="v-scene grid gap-4 rounded-card border border-line bg-surface2/40 p-4 sm:p-6" aria-labelledby="scene-title">
        <div className="grid gap-1">
          <h3 id="scene-title" className="text-2xl sm:text-3xl">{scene.title}</h3>
          {captions && scene.narration && (
            <p className={cx('max-w-3xl rounded-lg px-2 py-1 -mx-2 transition', young ? 'text-lg' : '', speaking ? 'bg-primary/10 text-ink' : 'text-muted')} aria-live={voice ? 'off' : 'polite'}>
              {speaking && <span className="sr-only">{t('vl.speakingNow')} </span>}{scene.narration}
            </p>
          )}
        </div>
        <Comp scene={scene as never} onDone={markDone} onQuiz={onQuiz} young={young} />
      </section>

      <div className="flex items-center gap-2">
        <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}><ArrowLeft size={16} aria-hidden /> {t('common.back')}</button>
        <span className="mx-auto text-center text-sm text-muted">{INTERACTIVE.has(scene.type) && !done.has(idx) ? t('vl.tryFirst') : ' '}</span>
        <button className={cx('btn-primary', (done.has(idx) || !INTERACTIVE.has(scene.type)) && 'v-glow')} onClick={next}>{idx === scenes.length - 1 ? t('vl.finish') : t('common.next')} <ArrowRight size={16} aria-hidden /></button>
      </div>

      <details className="rounded-card border border-line bg-surface [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold"><FileText size={16} aria-hidden /> {t('vl.transcript')}</summary>
        <ol className="grid gap-3 px-4 pb-4 text-sm">
          {scenes.map((s, i) => (
            <li key={i} className={cx('grid gap-0.5', i === idx && 'rounded-lg bg-primary/[.06] p-2 -mx-2')}>
              <b>{i + 1}. {s.title}</b>{s.narration && <span className="text-muted">{s.narration}</span>}
            </li>
          ))}
        </ol>
      </details>
      <Confetti fire={fire} />
    </div>
  );
}

function Building() {
  const { t } = useT();
  const tips = [t('vl.build1'), t('vl.build2'), t('vl.build3'), t('vl.build4')];
  const [k, setK] = useState(0);
  useEffect(() => { const tm = setInterval(() => setK(x => (x + 1) % 4), 1800); return () => clearInterval(tm); }, []);
  return (
    <div className="grid justify-items-center gap-4 py-12 text-center" role="status" aria-live="polite">
      <div className="relative grid h-28 w-28 place-items-center">
        <span className="absolute inset-0 rounded-full border-4 border-dashed border-primary/40 v-spin" aria-hidden />
        <Vidya size={64} mood="think" className="v-float" />
      </div>
      <b className="text-lg">{t('vl.building')}</b>
      <p key={k} className="v-up text-muted">{tips[k]}</p>
      <Dots />
      <p className="flex items-center gap-1.5 text-xs text-muted"><Sparkles size={12} aria-hidden />{t('vl.buildNote')}</p>
    </div>
  );
}
