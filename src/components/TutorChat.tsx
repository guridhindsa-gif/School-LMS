'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, MessageSquareText, SendHorizonal, Sparkles, Square, Trash2, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Markdown } from './Markdown';
import { Dots, cx } from './ui';
import { friendlyError, streamText } from '@/lib/ai-client';
import { ctxKey, useTutor, type TutorMsg } from '@/lib/tutor-store';
import { useLMS } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { Vidya } from './art';

type Mode = 'socratic' | 'explain' | 'check';
const MODES: { id: Mode; icon: typeof Lightbulb }[] = [
  { id: 'socratic', icon: Lightbulb }, { id: 'explain', icon: MessageSquareText }, { id: 'check', icon: CheckCheck },
];

/** The AI tutor conversation. Used in the drawer and on the full Tutor page. */
export function TutorChat({ compact = false }: { compact?: boolean }) {
  const { ctx, ctxLabel, threads, setThread, draft, setDraft } = useTutor();
  const language = useLMS(s => s.profile.language);
  const { t } = useT();
  const skills = useLMS(s => s.skills);
  const key = ctxKey(ctx);
  const msgs = threads[key] || [];
  const [mode, setMode] = useState<Mode>('socratic');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [lastAsk, setLastAsk] = useState('');
  const ctl = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, busy]);
  useEffect(() => () => ctl.current?.abort(), []);

  async function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content || busy) return;
    setErr(''); setDraft(''); setLastAsk(content);
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
      // Stopped by the student: keep what was streamed. Failed: drop the unanswered question so "Try again" does not duplicate it.
      if (m) { setThread(key, msgs); setErr(m); }
      else { const cur = useTutor.getState().threads[key] || []; if (!cur[cur.length - 1]?.content) setThread(key, next); }
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  }

  const starters = ctx?.unit
    ? [t('tc.s1', { unit: short(ctx.unit) }), t('tc.s2'), t('tc.s3'), t('tc.s4')]
    : [t('tc.g1'), t('tc.g2'), t('tc.g3'), t('tc.g4')];

  return (
    <div className={cx('flex min-h-0 flex-col', compact ? 'h-full' : 'h-[calc(100dvh-11rem)] min-h-[420px]')}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <span className="pill max-w-full truncate bg-primary/10 text-primary" title={t('tc.helping', { label: ctxLabel })}><Sparkles size={13} /> {ctxLabel}</span>
        <div className="seg ml-auto" role="radiogroup" aria-label={t('tc.mode')}>
          {MODES.map(m => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} title={t(`tc.tip.${m.id}`)} onClick={() => setMode(m.id)}
              className="!flex items-center gap-1 !px-2.5 !py-1 !text-xs">
              <m.icon size={13} aria-hidden />{t(`tc.mode.${m.id}`)}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{busy ? t('tc.writing') : ''}</p>
      <p className="pt-2 text-xs text-muted">{t(`tc.tip.${mode}`)}</p>
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {!msgs.length && (
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Avatar />
              <div className="rounded-2xl rounded-tl-sm bg-surface2 px-4 py-3">
                <p className="font-semibold">{t('tc.hello')}</p>
                <p className="text-muted">{ctx?.unit ? t('tc.introUnit', { unit: short(ctx.unit) }) : t('tc.intro')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {starters.map(s => <button key={s} onClick={() => send(s)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-sm transition hover:border-primary/40 hover:bg-surface2">{s}</button>)}
            </div>
          </div>
        )}
        <div className="grid gap-4">
          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
                {m.role === 'assistant' ? <Avatar /> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/25 text-[11px] font-bold">{t('tc.you')}</span>}
                <div className={cx('max-w-[85%] min-w-0 rounded-2xl px-4 py-3', m.role === 'user' ? 'rounded-tr-sm bg-primary text-onprimary' : 'rounded-tl-sm bg-surface2')}>
                  {m.role === 'assistant'
                    ? (m.content ? <Markdown text={m.content} className="prose-lms text-[0.97rem]" /> : <span className="flex items-center gap-2 text-muted"><Dots /> Thinking…</span>)
                    : <p className="whitespace-pre-wrap">{m.content}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {err && (
          <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-bad/30 bg-bad/10 px-3 py-2 text-sm">
            <span className="flex-1 text-bad">{err}</span>
            {lastAsk && <button className="btn-ghost h-8 min-h-0 px-3 text-xs" onClick={() => send(lastAsk)}>{t('common.tryAgain')}</button>}
          </div>
        )}
        <div ref={end} />
      </div>

      <form className="flex items-end gap-2 border-t border-line pt-3" onSubmit={e => { e.preventDefault(); send(); }}>
        <button type="button" className="btn-ghost h-11 w-11 shrink-0 !px-0" title={t('tc.clear')} aria-label={t('tc.clear')} onClick={() => setThread(key, [])}><Trash2 size={17} /></button>
        <textarea ref={input} id="tutor-input" value={draft} onChange={e => setDraft(e.target.value)} rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={mode === 'check' ? t('tc.phCheck') : t('tc.ph')}
          className="input max-h-40 min-h-11 flex-1 resize-none" aria-label={t('tc.message')} />
        {busy
          ? <button type="button" className="btn-ghost h-11 w-11 shrink-0 !px-0" aria-label={t('common.stop')} onClick={() => ctl.current?.abort()}><Square size={16} /></button>
          : <button type="submit" className="btn-primary h-11 w-11 shrink-0 !px-0" aria-label={t('tc.send')} disabled={!draft.trim()}><SendHorizonal size={17} /></button>}
      </form>
    </div>
  );
}

function Avatar() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 ring-1 ring-line" aria-hidden>
      <Vidya size={28} />
    </span>
  );
}
const short = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '').slice(0, 60);

function stripCtx<T extends object>(c: T) {
  // only send fields the API accepts
  const { kind, board, cls, subject, unit, topics, exam, examId, units, mastery, weakTopics, language } = c as Record<string, unknown>;
  return Object.fromEntries(Object.entries({ kind, board, cls, subject, unit, topics, exam, examId, units, mastery, weakTopics, language }).filter(([, v]) => v !== undefined && v !== null));
}
