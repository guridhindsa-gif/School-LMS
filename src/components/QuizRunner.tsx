'use client';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Clock, Gauge, Lightbulb, RotateCcw, Sparkles, Trophy, XCircle, CheckCircle2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti } from './Confetti';
import { Markdown } from './Markdown';
import { Bar, Dots, Ring, cx } from './ui';
import { nextDifficulty, newSkill } from '@/lib/adaptive';
import { friendlyError, getQuestions } from '@/lib/ai-client';
import { useLMS, type ChapterRef } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { Difficulty, LearnContext, Question } from '@/lib/types';

export type QuizMode = 'adaptive' | 'test' | 'diagnostic' | 'mock';

interface Props {
  mode: QuizMode;
  ctx: LearnContext;
  /** chapter being practised (adaptive/test) */
  chapter?: ChapterRef;
  /** units for diagnostic / mock topic mapping */
  units?: { id: string; name: string; subject?: string }[];
  marking?: [number, number];
  total?: number;
  secondsPerQ?: number;
  doneHref: string;
}

interface Answered { q: Question; choice: number | null; correct: boolean; hint: boolean; ms: number; unitId?: string }

const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_CLS: Record<Difficulty, string> = { easy: 'bg-good/15 text-good', medium: 'bg-primary/12 text-primary', hard: 'bg-violet/15 text-violet' };

export function QuizRunner({ mode, ctx, chapter, units = [], marking = [1, 0], total, secondsPerQ, doneHref }: Props) {
  const N = total ?? (mode === 'adaptive' ? 8 : mode === 'test' ? 10 : mode === 'diagnostic' ? Math.min(12, Math.max(6, units.length)) : 15);
  const live = mode === 'adaptive';
  const lang = useLMS(s => s.profile.language);
  const recordAnswer = useLMS(s => s.recordAnswer);
  const endSession = useLMS(s => s.endSession);
  const seen = useLMS(s => (chapter ? s.seen[chapter.id] : undefined));
  const startSkill = useLMS(s => (chapter ? s.skills[chapter.id] : undefined));
  const ask = useTutor(s => s.ask);

  const [queue, setQueueState] = useState<Question[]>([]);
  const queueRef = useRef<Question[]>([]);
  const setQueue = (fn: (q: Question[]) => Question[]) => { queueRef.current = fn(queueRef.current); setQueueState(queueRef.current); };
  const [done, setDone] = useState<Answered[]>([]);
  const [idx, setIdx] = useState(0);                       // current question (both modes)
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hint, setHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [finished, setFinished] = useState(false);
  const [fire, setFire] = useState(0);
  const [answers, setAnswersState] = useState<Record<number, number>>({}); // timed modes
  const answersRef = useRef<Record<number, number>>({});
  const setAnswers = (fn: (a: Record<number, number>) => Record<number, number>) => { answersRef.current = fn(answersRef.current); setAnswersState(answersRef.current); };
  const finishedRef = useRef(false);
  const [left, setLeft] = useState((secondsPerQ ?? (mode === 'mock' ? 120 : 75)) * N);
  const ability = useRef(startSkill?.ability ?? 0);
  const startMastery = useRef(startSkill?.pKnown ?? newSkill().pKnown);
  const qStart = useRef(Date.now());
  const t0 = useRef(Date.now());
  const fetching = useRef(false);
  const ctl = useRef<AbortController | null>(null);
  const [masteryNow, setMasteryNow] = useState(startMastery.current);
  const [targetDiff, setTargetDiff] = useState<Difficulty>(nextDifficulty(ability.current));

  const baseCtx = useMemo(() => {
    const { unitId: _u, ...rest } = ctx;
    return { ...rest, language: lang, mastery: startSkill?.pKnown, weakTopics: startSkill?.weakTopics?.slice(0, 6) };
  }, [ctx, lang, startSkill]);

  const fetchBatch = useCallback(async (n: number, difficulty: Difficulty | 'mixed', append: boolean) => {
    if (fetching.current) return;
    fetching.current = true; setErr('');
    if (!append) setLoading(true);
    ctl.current = new AbortController();
    try {
      const purpose = mode === 'adaptive' ? 'practice' : mode === 'diagnostic' ? 'diagnostic' : mode;
      const avoid = [...(seen || []), ...done.map(d => d.q.q)].slice(-20);
      const ctxForQ = mode === 'diagnostic' ? { ...baseCtx, units: units.map(u => u.name).slice(0, 40) } : baseCtx;
      const qs = await getQuestions(ctxForQ, { n, difficulty, purpose, avoid }, ctl.current.signal);
      setQueue(q => (append ? [...q, ...qs] : qs));
    } catch (e) {
      const m = friendlyError(e); if (m) setErr(m);
    } finally { fetching.current = false; setLoading(false); }
  }, [mode, baseCtx, units, seen, done]);

  // initial load
  useEffect(() => {
    if (live) fetchBatch(3, nextDifficulty(ability.current), false);
    else fetchBatch(N, 'mixed', false);
    return () => ctl.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // timer for timed modes
  useEffect(() => {
    if (live || finished || loading || !queue.length) return;
    const t = setInterval(() => setLeft(l => { if (l <= 1) { clearInterval(t); submitAll(); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, finished, loading, queue.length]);

  const unitFor = (q: Question) => {
    if (chapter) return chapter.id;
    const t = (q.topic || '').toLowerCase();
    const u = units.find(u => t && (u.name.toLowerCase().includes(t) || t.includes(u.name.toLowerCase().replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '').slice(0, 24))));
    return u?.id;
  };

  /* ---------- adaptive (live feedback) ---------- */
  const current = queue[idx];

  function check() {
    if (choice === null || !current) return;
    const correct = choice === current.answer;
    setRevealed(true);
    if (correct) setFire(f => f + 1);
    // a hint lowers the evidence: treat it as one level easier
    const eff: Difficulty = hint ? (current.difficulty === 'hard' ? 'medium' : 'easy') : current.difficulty;
    const ms = Date.now() - qStart.current;
    if (chapter) {
      const s = recordAnswer(chapter, { correct, difficulty: eff, topic: current.topic, stem: current.q.slice(0, 120) });
      ability.current = s.ability; setMasteryNow(s.pKnown);
      setTargetDiff(nextDifficulty(s.ability));
    }
    setDone(d => [...d, { q: current, choice, correct, hint, ms, unitId: chapter?.id }]);
  }

  function next() {
    setChoice(null); setRevealed(false); setHint(false); qStart.current = Date.now();
    const answered = done.length;
    if (answered >= N) { finish(); return; }
    setIdx(answered);
    // keep one question ahead: prefetch at the newly targeted difficulty
    if (queue.length - answered <= 1) fetchBatch(Math.min(3, N - answered), nextDifficulty(ability.current), true);
  }

  /* ---------- timed modes ---------- */
  function submitAll() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const ans = answersRef.current;
    const res: Answered[] = queueRef.current.map((q, i) => ({ q, choice: ans[i] ?? null, correct: ans[i] === q.answer, hint: false, ms: 0, unitId: unitFor(q) }));
    res.forEach(a => {
      const uid = a.unitId;
      if (!uid || a.choice === null) return;
      const name = chapter?.name || units.find(u => u.id === uid)?.name || uid;
      recordAnswer({ id: uid, name, subject: ctx.subject || ctx.exam || '', kind: ctx.kind }, { correct: a.correct, difficulty: a.q.difficulty, topic: a.q.topic, stem: a.q.q.slice(0, 120) });
    });
    setDone(res);
    setFinished(true);
    const acc = res.filter(r => r.correct).length / Math.max(1, res.length);
    const touched = new Set(res.map(r => r.unitId).filter(Boolean) as string[]);
    touched.forEach(id => endSession(id, acc, Math.round((Date.now() - t0.current) / 60000 / Math.max(1, touched.size))));
    if (acc >= 0.8) setFire(f => f + 1);
  }

  function finish() {
    setFinished(true);
    const acc = done.filter(d => d.correct).length / Math.max(1, done.length);
    if (chapter) endSession(chapter.id, acc, Math.round((Date.now() - t0.current) / 60000));
    if (acc >= 0.8) setFire(f => f + 1);
  }

  /* ---------- render ---------- */
  if (err && !queue.length) {
    return (
      <div role="alert" className="card grid gap-3 border-bad/40 p-6">
        <h2 className="text-xl text-bad">Could not create questions</h2>
        <p>{err}</p>
        <p className="text-sm text-muted">No questions were shown and nothing was recorded. Your progress is unchanged.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => fetchBatch(live ? 3 : N, live ? targetDiff : 'mixed', false)}><RotateCcw size={16} /> Try again</button>
          <Link href="/settings" className="btn-ghost">Check AI settings</Link>
        </div>
      </div>
    );
  }
  if (loading && !queue.length) {
    return (
      <div className="card grid justify-items-center gap-4 p-10 text-center" role="status" aria-live="polite">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}><Sparkles className="text-primary" size={34} /></motion.div>
        <p className="font-semibold">{live ? `Picking ${DIFF_LABEL[targetDiff].toLowerCase()} questions for your level…` : `Setting ${N} questions…`}</p>
        <p className="text-sm text-muted">Your tutor writes fresh questions each time, matched to the official syllabus.</p>
        <Dots />
      </div>
    );
  }

  if (finished) return <Summary />;

  if (live) {
    const q = current;
    if (!q) return <div className="card grid justify-items-center gap-3 p-10"><Dots /><p className="text-muted">Choosing your next question…</p>{err && <p className="text-bad">{err}</p>}</div>;
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted">Question {idx + 1} of {N}</span>
            <Bar value={done.length / N} className="flex-1" color="rgb(var(--primary))" />
          </div>
          <QuestionCard q={q} choice={choice} setChoice={setChoice} revealed={revealed} hint={hint} />
          <div className="flex flex-wrap gap-2">
            {!revealed && <button className="btn-primary" disabled={choice === null} onClick={check}>Check answer</button>}
            {!revealed && !hint && <button className="btn-ghost" onClick={() => setHint(true)}><Lightbulb size={16} /> Hint</button>}
            {revealed && <button className="btn-primary" onClick={next} autoFocus>{done.length >= N ? 'See results' : 'Next question'} <ArrowRight size={16} /></button>}
            {revealed && !done[done.length - 1]?.correct && (
              <button className="btn-ghost" onClick={() => ask(`I got this wrong:\n\n${q.q}\n\nI chose "${q.options[choice ?? 0]}". The answer is "${q.options[q.answer]}". Help me understand why, step by step.`)}>
                <Sparkles size={16} className="text-primary" /> Explain with tutor</button>
            )}
          </div>
        </div>
        <aside className="card grid content-start gap-4 p-5">
          <p className="eyebrow">Live mastery</p>
          <div className="flex items-center gap-4"><Ring value={masteryNow} size={76} stroke={8} /><div className="text-sm text-muted">Updates after every answer (Bayesian knowledge tracing).</div></div>
          <div className="grid gap-1">
            <span className="flex items-center gap-1.5 text-sm font-semibold"><Gauge size={15} /> Next difficulty</span>
            <AnimatePresence mode="wait"><motion.span key={targetDiff} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className={cx('pill w-fit', DIFF_CLS[targetDiff])}>{DIFF_LABEL[targetDiff]}</motion.span></AnimatePresence>
            <span className="text-xs text-muted">Chosen so you get about 7 in 10 right — hard enough to learn, easy enough to keep going.</span>
          </div>
          <div className="flex gap-1" role="img" aria-label={`${done.filter(d => d.correct).length} correct out of ${done.length} answered`}>{Array.from({ length: N }, (_, i) => <span key={i} className={cx('h-2 flex-1 rounded-full', i < done.length ? (done[i].correct ? 'bg-good' : 'bg-accent') : 'bg-surface2')} />)}</div>
        </aside>
        <Confetti fire={fire} />
      </div>
    );
  }

  // timed: test / diagnostic / mock
  const q = queue[idx];
  const answeredCount = Object.keys(answers).length;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted">Question {idx + 1} of {queue.length}</span>
          <span role="timer" aria-label={`Time left ${fmt(left)}`} className={cx('pill ml-auto', left < 60 ? 'bg-bad/15 text-bad' : 'bg-surface2 text-ink')}><Clock size={13} aria-hidden /> {fmt(left)}</span>
          {marking[1] > 0 && <span className="pill bg-surface2 text-muted">+{marking[0]} / −{marking[1]}</span>}
        </div>
        {q && <QuestionCard q={q} choice={answers[idx] ?? null} setChoice={c => setAnswers(a => ({ ...a, [idx]: c! }))} revealed={false} hint={false} />}
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>Previous</button>
          {idx < queue.length - 1 ? <button className="btn-primary" onClick={() => setIdx(i => i + 1)}>Save &amp; next <ArrowRight size={16} /></button> : null}
          <button className="btn-soft" onClick={() => setAnswers(a => { const n = { ...a }; delete n[idx]; return n; })}>Clear</button>
          <ConfirmSubmit unanswered={queue.length - answeredCount} onSubmit={submitAll} />
        </div>
      </div>
      <aside className="card grid content-start gap-3 p-5">
        <p className="eyebrow">Question palette</p>
        <div className="grid grid-cols-5 gap-2" role="group" aria-label="Jump to question">
          {queue.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Question ${i + 1}${answers[i] !== undefined ? ', answered' : ''}`} aria-current={i === idx ? 'step' : undefined}
              className={cx('h-10 rounded-lg border font-bold', answers[i] !== undefined ? 'border-good bg-good text-white' : 'border-line bg-surface', i === idx && 'ring-2 ring-primary ring-offset-2 ring-offset-surface')}>{i + 1}</button>
          ))}
        </div>
        <p className="text-sm text-muted">{answeredCount} answered · {queue.length - answeredCount} left</p>
      </aside>
      <Confetti fire={fire} />
    </div>
  );

  function Summary() {
    const right = done.filter(d => d.correct).length, wrong = done.filter(d => d.choice !== null && !d.correct).length, skip = done.length - right - wrong;
    const score = +(right * marking[0] - wrong * marking[1]).toFixed(2), max = done.length * marking[0];
    const weak = Object.entries(done.filter(d => !d.correct).reduce<Record<string, number>>((m, d) => { const k = d.q.topic || 'General'; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
    const after = chapter ? useLMS.getState().skills[chapter.id] : undefined;
    const perUnit = mode === 'diagnostic' ? units.map(u => ({ u, list: done.filter(d => d.unitId === u.id) })).filter(x => x.list.length) : [];
    return (
      <div className="grid gap-5">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-night grid gap-5 rounded-card p-6 shadow-lift" aria-label="Result summary">
          <div className="flex flex-wrap items-center gap-5">
            <Trophy className="text-accent" size={36} aria-hidden />
            <div className="flex-1"><p className="font-mono text-xs uppercase tracking-widest text-onnight/70">{mode === 'diagnostic' ? 'Your starting level' : mode === 'adaptive' ? 'Practice complete' : 'Result'}</p>
              <h2 className="text-3xl">{score} / {max}</h2></div>
            {chapter && after && <div className="flex items-center gap-3"><Ring value={after.pKnown} size={74} color="rgb(var(--accent))" /><div className="text-sm text-onnight/80">Mastery<br />{Math.round(startMastery.current * 100)}% → <b className="text-onnight">{Math.round(after.pKnown * 100)}%</b></div></div>}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Correct', right], ['Wrong', wrong], ['Skipped', skip], ['Accuracy', `${Math.round((right / Math.max(1, done.length)) * 100)}%`]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/[.08] px-4 py-3"><p className="text-xs text-onnight/70">{k}</p><p className="font-display text-2xl font-bold">{v}</p></div>
            ))}
          </div>
          {after && <p className="flex items-center gap-2 text-onnight/85"><CalendarClock size={16} /> Next review: <b>{new Date(after.nextReview).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</b> (spaced repetition)</p>}
        </motion.section>

        {perUnit.length > 0 && (
          <section className="card grid gap-3 p-5">
            <h3 className="text-xl">Where to start</h3>
            {perUnit.map(({ u, list }) => {
              const acc = list.filter(d => d.correct).length / list.length;
              return (
                <Link key={u.id} href={`/student/learn/${encodeURIComponent(u.id)}`} className="grid grid-cols-[minmax(0,1fr)_80px_auto] items-center gap-3 rounded-ctl px-2 py-1.5 hover:bg-surface2 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
                  <span className="truncate font-semibold">{u.name}</span><Bar value={acc} /><span className="text-sm text-muted">{acc >= 0.7 ? 'Strong' : acc >= 0.4 ? 'Revise' : 'Start here'}</span>
                </Link>
              );
            })}
          </section>
        )}

        {weak.length > 0 && (
          <section className="card grid gap-2 p-5">
            <h3 className="text-xl">Revise next</h3>
            <div className="flex flex-wrap gap-2">{weak.slice(0, 8).map(([t, n]) => <span key={t} className="pill bg-accent/15 text-warn">{t} · {n} missed</span>)}</div>
          </section>
        )}

        <section className="grid gap-3">
          <h3 className="text-xl">Review answers</h3>
          {done.map((d, i) => (
            <details key={i} className="card p-4" open={!d.correct && i < 3}>
              <summary className="flex cursor-pointer items-start gap-3">
                {d.correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-good" size={19} /> : <XCircle className="mt-0.5 shrink-0 text-bad" size={19} />}
                <span className="min-w-0 flex-1"><Markdown text={d.q.q} className="prose-lms !max-w-none" /></span>
                <span className={cx('pill', DIFF_CLS[d.q.difficulty])}>{DIFF_LABEL[d.q.difficulty]}</span>
              </summary>
              <div className="mt-3 grid gap-2 pl-8 text-sm">
                {d.choice !== null && !d.correct && <p className="text-bad">Your answer: {d.q.options[d.choice]}{d.q.whyWrong?.[d.choice] ? ` — ${d.q.whyWrong[d.choice]}` : ''}</p>}
                {d.choice === null && <p className="text-muted">Not answered</p>}
                <p className="text-good">Correct: {d.q.options[d.q.answer]}</p>
                <Markdown text={d.q.explanation} className="prose-lms !max-w-none text-muted" />
              </div>
            </details>
          ))}
        </section>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => location.reload()}><RotateCcw size={16} /> New set</button>
          <Link href={doneHref} className="btn-ghost">Back to chapter</Link>
          {weak.length > 0 && <button className="btn-ghost" onClick={() => ask(`I just did a ${mode} on ${ctx.unit || ctx.subject || ctx.exam}. I struggled with: ${weak.map(w => w[0]).slice(0, 4).join(', ')}. Can you help me fix these one at a time?`)}><Sparkles size={16} className="text-primary" /> Fix my weak spots with the tutor</button>}
        </div>
        <Confetti fire={fire} />
      </div>
    );
  }
}

function QuestionCard({ q, choice, setChoice, revealed, hint }: { q: Question; choice: number | null; setChoice: (c: number | null) => void; revealed: boolean; hint: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.article key={q.id + q.q.slice(0, 20)} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }} className="card grid gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cx('pill', DIFF_CLS[q.difficulty])}>{DIFF_LABEL[q.difficulty]}</span>
          {q.topic && <span className="tag">{q.topic}</span>}
        </div>
        <Markdown text={q.q} className="prose-lms !max-w-none text-lg font-semibold" />
        <div className="grid gap-2" role="radiogroup" aria-label="Answer options">
          {q.options.map((o, i) => {
            const isAns = revealed && i === q.answer, isWrong = revealed && i === choice && i !== q.answer;
            return (
              <motion.button key={i} role="radio" aria-checked={choice === i} disabled={revealed} onClick={() => setChoice(i)}
                whileTap={revealed ? undefined : { scale: 0.99 }}
                animate={isWrong ? { x: [0, -6, 6, -3, 0] } : isAns ? { scale: [1, 1.02, 1] } : {}}
                className={cx('flex items-baseline gap-3 rounded-xl border px-4 py-3 text-left transition',
                  isAns ? 'border-good bg-good/10' : isWrong ? 'border-bad bg-bad/10' : choice === i ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-line bg-surface hover:border-primary/50')}>
                <b className="font-mono text-muted">{'ABCDEF'[i]}</b>
                <span className="min-w-0 flex-1"><Markdown text={o} className="opt-md" /></span>
                {isAns && <CheckCircle2 size={18} className="text-good" />}{isWrong && <XCircle size={18} className="text-bad" />}
              </motion.button>
            );
          })}
        </div>
        {hint && !revealed && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-ctl border-l-4 border-accent bg-accent/10 px-4 py-3" role="note"><b className="flex items-center gap-1"><Lightbulb size={15} /> Hint</b><Markdown text={q.hint} className="prose-lms !max-w-none" /></motion.div>}
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} role="status" className={cx('rounded-ctl border-l-4 px-4 py-3', choice === q.answer ? 'border-good bg-good/10' : 'border-bad bg-bad/10')}>
            <b>{choice === q.answer ? 'Correct!' : 'Not quite.'}</b>
            {choice !== null && choice !== q.answer && q.whyWrong?.[choice] && <p className="text-sm">Why “{q.options[choice]}” is wrong: {q.whyWrong[choice]}</p>}
            <Markdown text={q.explanation} className="prose-lms !max-w-none" />
          </motion.div>
        )}
      </motion.article>
    </AnimatePresence>
  );
}

function ConfirmSubmit({ unanswered, onSubmit }: { unanswered: number; onSubmit: () => void }) {
  const [sure, setSure] = useState(false);
  if (!sure && unanswered > 0) return <button className="btn-board ml-auto" onClick={() => setSure(true)}>Submit test</button>;
  return <button className={cx('ml-auto', unanswered > 0 ? 'btn-accent' : 'btn-board')} onClick={onSubmit}>{unanswered > 0 ? `${unanswered} unanswered · submit anyway` : 'Submit test'}</button>;
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
