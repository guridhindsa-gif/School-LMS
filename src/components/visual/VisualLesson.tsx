'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Pause, Play, RefreshCw, Sparkles, Target, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { INTERACTIVE, SCENES } from './Scenes';
import { Confetti } from '../Confetti';
import { Dots, cx } from '../ui';
import { LABS } from '../labs/registry';
import { friendlyError } from '@/lib/ai-client';
import { useLMS } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import { demoVisualLesson } from '@/lib/visual-fallback';
import { sanitizeLesson, type Scene, type VisualLesson as Lesson } from '@/lib/visual';
import type { LearnContext } from '@/lib/types';

const TYPE_LABEL: Record<Scene['type'], string> = {
  intro: 'Picture intro', concept_map: 'Idea map', steps: 'Animated process', cycle: 'Cycle', compare: 'Compare', sort: 'Sorting game',
  hotspot: 'Labelled picture', formula: 'Formula explorer', timeline: 'Timeline', flashcards: 'Flip cards', order: 'Put in order', quiz: 'Quick check', lab: 'Simulation',
};

interface Props { unitId: string; title: string; ctx: LearnContext; labId?: string | null; young?: boolean }

/** Scene-by-scene animated, interactive lesson with optional voice narration and autoplay. */
export function VisualLesson({ unitId, title, ctx, labId, young }: Props) {
  const lang = useLMS(s => s.profile.language);
  const recordAnswer = useLMS(s => s.recordAnswer);
  const ask = useTutor(s => s.ask);
  const key = `visual:${unitId}:${lang}`;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [demo, setDemo] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [voice, setVoice] = useState(!!young);
  const [auto, setAuto] = useState(false);
  const [fire, setFire] = useState(0);
  const [finished, setFinished] = useState(false);
  const ctl = useRef<AbortController | null>(null);

  const withLab = useCallback((l: Lesson): Lesson => {
    if (!labId || l.scenes.some(s => s.type === 'lab')) return l;
    const info = LABS.find(x => x.id === labId);
    const sc: Scene = { type: 'lab', title: info?.title || 'Simulation', narration: info?.blurb || 'Try the simulation.', lab: labId };
    const at = Math.min(3, l.scenes.length - 1);
    return { ...l, scenes: [...l.scenes.slice(0, at), sc, ...l.scenes.slice(at)] };
  }, [labId]);

  const load = useCallback(async (force = false) => {
    ctl.current?.abort();
    setErr(''); setFinished(false); setIdx(0); setDone(new Set());
    if (!force) { try { const c = localStorage.getItem(key); if (c) { setLesson(withLab(sanitizeLesson(JSON.parse(c)))); setDemo(false); return; } } catch { /* ignore */ } }
    setLoading(true); setLesson(null);
    ctl.current = new AbortController();
    try {
      const { unitId: _u, ...rest } = ctx;
      const res = await fetch('/api/ai/visual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ctx: { ...rest, language: lang } }), signal: ctl.current.signal });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw Object.assign(new Error(j.error || 'AI error'), { name: 'AIError' }); }
      const l = sanitizeLesson(await res.json());
      if (l.scenes.length < 3) throw new Error('Too few scenes');
      try { localStorage.setItem(key, JSON.stringify(l)); } catch { /* full */ }
      setLesson(withLab(l)); setDemo(false);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setErr(friendlyError(e) || (e as Error).message);
    } finally { setLoading(false); }
  }, [ctx, key, lang, withLab]);

  useEffect(() => { load(); return () => { ctl.current?.abort(); try { speechSynthesis.cancel(); } catch { /* */ } }; }, [load]);

  const scenes = lesson?.scenes ?? [];
  const scene = scenes[idx];

  // narration
  const speakNow = useCallback((text: string, onEnd?: () => void) => {
    try {
      speechSynthesis.cancel();
      if (!text) { onEnd?.(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN'; u.rate = young ? 0.88 : 0.97;
      u.onend = () => onEnd?.();
      speechSynthesis.speak(u);
    } catch { onEnd?.(); }
  }, [lang, young]);

  const next = useCallback(() => setIdx(i => { if (i >= scenes.length - 1) { setFinished(true); setFire(f => f + 1); return i; } return i + 1; }), [scenes.length]);

  useEffect(() => {
    if (!scene || finished) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const after = () => { if (auto && !INTERACTIVE.has(scene.type)) t = setTimeout(next, 1400); };
    if (voice) speakNow(scene.narration, after); else if (auto && !INTERACTIVE.has(scene.type)) t = setTimeout(next, 6000);
    return () => { if (t) clearTimeout(t); };
  }, [idx, scene, voice, auto, finished, speakNow, next]);

  const markDone = useCallback(() => setDone(s => (s.has(idx) ? s : new Set(s).add(idx))), [idx]);
  const onQuiz = useCallback((correct: boolean) => {
    if (ctx.unitId) recordAnswer({ id: ctx.unitId, name: title, subject: ctx.subject || ctx.exam || '', kind: ctx.kind }, { correct, difficulty: 'easy', topic: scene?.title });
    if (correct) setFire(f => f + 1);
  }, [ctx, recordAnswer, title, scene]);

  if (loading) return <Building />;
  if (err && !lesson) {
    return (
      <div className="grid gap-3 rounded-2xl bg-bad/10 p-5" role="alert">
        <b className="text-bad">Could not build the visual lesson: {err}</b>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => load(true)}><RefreshCw size={15} /> Try again</button>
          <button className="btn-ghost" onClick={() => { setLesson(withLab(demoVisualLesson(ctx))); setDemo(true); setErr(''); }}>Show the offline demo lesson</button>
          <Link href="/settings" className="btn-ghost">Check AI settings</Link>
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
        <span className="emoji v-pop text-7xl">🏆</span>
        <h3 className="text-3xl">Lesson complete!</h3>
        <p className="max-w-md text-muted">You worked through {scenes.length} scenes{done.size ? ` and finished ${done.size} activities` : ''}{quizzes ? `, including ${quizzes} quick check${quizzes > 1 ? 's' : ''}` : ''}.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/student/practice/${encodeURIComponent(unitId)}`} className="btn-primary"><Target size={17} /> Practise at your level</Link>
          <button className="btn-ghost" onClick={() => { setFinished(false); setIdx(0); }}><RefreshCw size={15} /> Watch again</button>
          <button className="btn-ghost" onClick={() => ask(`I just finished the visual lesson on ${title}. Ask me 3 questions to check I really understood it.`)}><Sparkles size={15} className="text-marigold" /> Quiz me with the tutor</button>
        </div>
        <Confetti fire={fire} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* progress */}
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Scenes">
        {scenes.map((s, i) => (
          <button key={i} role="tab" aria-selected={i === idx} aria-label={`Scene ${i + 1}: ${s.title}`} onClick={() => setIdx(i)}
            className={cx('h-2 flex-1 rounded-full transition', i === idx ? 'bg-marigold' : done.has(i) || i < idx ? 'bg-board/70 dark:bg-chalk/60' : 'bg-surface2 hover:bg-line')} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-board text-chalk">{idx + 1} / {scenes.length}</span>
        <span className="pill bg-marigold/20 text-warn">{TYPE_LABEL[scene.type]}</span>
        {demo && <span className="pill bg-surface2 text-muted">Offline demo</span>}
        <div className="ml-auto flex gap-1.5">
          <button className={cx('btn-ghost h-9 text-sm', voice && 'border-board')} aria-pressed={voice} onClick={() => { setVoice(v => { if (v) try { speechSynthesis.cancel(); } catch { /* */ } return !v; }); }} title="Read each scene aloud">
            {voice ? <Volume2 size={15} /> : <VolumeX size={15} />}<span className="hidden sm:inline">{voice ? 'Voice on' : 'Voice off'}</span>
          </button>
          <button className={cx('btn-ghost h-9 text-sm', auto && 'border-board')} aria-pressed={auto} onClick={() => setAuto(a => !a)} title="Play through scenes like a video; stops at activities">
            {auto ? <Pause size={15} /> : <Play size={15} />}<span className="hidden sm:inline">{auto ? 'Pause' : 'Autoplay'}</span>
          </button>
          <button className="btn-ghost h-9 text-sm" onClick={() => load(true)} title="Make a new version"><RefreshCw size={15} /></button>
        </div>
      </div>

      <section key={idx} className="v-scene grid gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-6">
        <div className="grid gap-1">
          <h3 className="text-2xl sm:text-3xl">{scene.title}</h3>
          {scene.narration && <p className={cx('max-w-3xl text-muted', young && 'text-lg')}>{scene.narration}</p>}
        </div>
        <Comp scene={scene as never} onDone={markDone} onQuiz={onQuiz} young={young} />
      </section>

      <div className="flex items-center gap-2">
        <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}><ArrowLeft size={16} /> Back</button>
        <span className="mx-auto text-center text-sm text-muted">{INTERACTIVE.has(scene.type) && !done.has(idx) ? 'Try the activity, then continue' : ' '}</span>
        <button className={cx('btn-primary', (done.has(idx) || !INTERACTIVE.has(scene.type)) && 'v-glow')} onClick={next}>{idx === scenes.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} /></button>
      </div>
      <Confetti fire={fire} />
    </div>
  );
}

function Building() {
  const tips = ['Drawing the pictures…', 'Animating the process…', 'Setting up the activities…', 'Writing the narration…'];
  const [k, setK] = useState(0);
  useEffect(() => { const t = setInterval(() => setK(x => (x + 1) % tips.length), 1800); return () => clearInterval(t); }, [tips.length]);
  return (
    <div className="grid justify-items-center gap-4 py-12 text-center">
      <div className="relative grid h-28 w-28 place-items-center">
        <span className="absolute inset-0 rounded-full border-4 border-dashed border-marigold/60 v-spin" />
        <span className="emoji v-float text-5xl">🎨</span>
      </div>
      <b className="text-lg">Building your visual lesson</b>
      <p key={k} className="v-up text-muted">{tips[k]}</p>
      <Dots />
    </div>
  );
}
