'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, MessageSquareText, SendHorizonal, Sparkles, Square, Trash2, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Markdown } from './Markdown';
import { Dots, cx } from './ui';
import { friendlyError, streamText } from '@/lib/ai-client';
import { ctxKey, useTutor, type TutorMsg } from '@/lib/tutor-store';
import { useLMS } from '@/lib/store';

type Mode = 'socratic' | 'explain' | 'check';
const MODES: { id: Mode; label: string; icon: typeof Lightbulb; tip: string }[] = [
  { id: 'socratic', label: 'Guide me', icon: Lightbulb, tip: 'Hints and questions, not answers' },
  { id: 'explain', label: 'Explain', icon: MessageSquareText, tip: 'A clear explanation with an example' },
  { id: 'check', label: 'Check my work', icon: CheckCheck, tip: 'Paste your working; find the first mistake' },
];

/** The AI tutor conversation. Used in the drawer and on the full Tutor page. */
export function TutorChat({ compact = false }: { compact?: boolean }) {
  const { ctx, ctxLabel, threads, setThread, draft, setDraft } = useTutor();
  const language = useLMS(s => s.profile.language);
  const skills = useLMS(s => s.skills);
  const key = ctxKey(ctx);
  const msgs = threads[key] || [];
  const [mode, setMode] = useState<Mode>('socratic');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ctl = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, busy]);
  useEffect(() => () => ctl.current?.abort(), []);

  async function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content || busy) return;
    setErr(''); setDraft('');
    const next: TutorMsg[] = [...msgs, { role: 'user', content }];
    setThread(key, [...next, { role: 'assistant', content: '' }]);
    setBusy(true);
    ctl.current = new AbortController();
    // enrich context with the learner model (mastery + weak topics) for this chapter if known
    const unitId = ctx?.unitId;
    const sk = unitId ? skills[unitId] : undefined;
    const enriched = ctx ? { ...ctx, language, mastery: sk?.pKnown, weakTopics: sk?.weakTopics } : { kind: 'board' as const, language };
    try {
      await streamText('/api/ai/chat', { messages: next, ctx: ctx ? stripCtx(enriched) : null, mode },
        full => setThread(key, [...next, { role: 'assistant', content: full }]), ctl.current.signal);
    } catch (e) {
      const m = friendlyError(e);
      setThread(key, next);
      if (m) setErr(m);
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  }

  const starters = ctx?.unit
    ? [`Explain "${short(ctx.unit)}" simply`, 'Give me a practice question', 'What are common mistakes here?', 'Make a 5-point revision summary']
    : ['How do I plan my study week?', 'Explain photosynthesis simply', 'Help me with quadratic equations', 'Tips for board exams'];

  return (
    <div className={cx('flex min-h-0 flex-col', compact ? 'h-full' : 'h-[calc(100dvh-11rem)] min-h-[420px]')}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <span className="pill bg-board/10 text-board dark:text-chalk"><Sparkles size={13} /> {ctxLabel}</span>
        <div className="ml-auto flex gap-1 rounded-xl bg-surface2 p-1" role="radiogroup" aria-label="Tutor mode">
          {MODES.map(m => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} title={m.tip} onClick={() => setMode(m.id)}
              className={cx('flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition', mode === m.id ? 'bg-surface shadow-soft text-ink' : 'text-muted hover:text-ink')}>
              <m.icon size={13} />{m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4" aria-live="polite">
        {!msgs.length && (
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Avatar />
              <div className="rounded-2xl rounded-tl-sm bg-surface2 px-4 py-3">
                <p className="font-semibold">Namaste! I'm Vidya, your AI tutor.</p>
                <p className="text-muted">I'll guide you with hints so you learn it yourself. Ask anything{ctx?.unit ? ` about ${short(ctx.unit)}` : ''}.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {starters.map(s => <button key={s} onClick={() => send(s)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-board hover:bg-surface2">{s}</button>)}
            </div>
          </div>
        )}
        <div className="grid gap-4">
          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
                {m.role === 'assistant' ? <Avatar /> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-marigold/25 text-sm font-bold">You</span>}
                <div className={cx('max-w-[85%] min-w-0 rounded-2xl px-4 py-3', m.role === 'user' ? 'rounded-tr-sm bg-board text-chalk' : 'rounded-tl-sm bg-surface2')}>
                  {m.role === 'assistant'
                    ? (m.content ? <Markdown text={m.content} className="prose-lms text-[0.97rem]" /> : <span className="flex items-center gap-2 text-muted"><Dots /> Thinking…</span>)
                    : <p className="whitespace-pre-wrap">{m.content}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {err && <p role="alert" className="mt-3 rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{err}</p>}
        <div ref={end} />
      </div>

      <form className="flex items-end gap-2 border-t border-line pt-3" onSubmit={e => { e.preventDefault(); send(); }}>
        <button type="button" className="btn-ghost h-11 w-11 shrink-0 !px-0" title="Clear conversation" aria-label="Clear conversation" onClick={() => setThread(key, [])}><Trash2 size={17} /></button>
        <textarea ref={input} id="tutor-input" value={draft} onChange={e => setDraft(e.target.value)} rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={mode === 'check' ? 'Paste your working or answer…' : 'Ask your tutor…'}
          className="input max-h-40 min-h-11 flex-1 resize-none" aria-label="Message to tutor" />
        {busy
          ? <button type="button" className="btn-ghost h-11 w-11 shrink-0 !px-0" aria-label="Stop" onClick={() => ctl.current?.abort()}><Square size={16} /></button>
          : <button type="submit" className="btn-primary h-11 w-11 shrink-0 !px-0" aria-label="Send" disabled={!draft.trim()}><SendHorizonal size={17} /></button>}
      </form>
    </div>
  );
}

function Avatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-board text-chalk shadow-soft" aria-hidden>
      <Sparkles size={15} />
    </span>
  );
}
const short = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '').slice(0, 60);

function stripCtx<T extends object>(c: T) {
  // only send fields the API accepts
  const { kind, board, cls, subject, unit, topics, exam, examId, units, mastery, weakTopics, language } = c as Record<string, unknown>;
  return Object.fromEntries(Object.entries({ kind, board, cls, subject, unit, topics, exam, examId, units, mastery, weakTopics, language }).filter(([, v]) => v !== undefined && v !== null));
}
