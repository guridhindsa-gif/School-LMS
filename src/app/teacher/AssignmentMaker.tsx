'use client';
import Link from 'next/link';
import { Check, ClipboardList, RotateCcw, Save, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { Dots, Notice, cx } from '@/components/ui';
import { friendlyError, getQuestions } from '@/lib/ai-client';
import { LOCAL_NOTE, uid, useSchool } from '@/lib/school-store';
import type { Question } from '@/lib/types';
import type { Seed } from './LessonBuilder';

type Verdict = 'pending' | 'keep' | 'remove';
const SECTIONS = ['8-B', '8-C', '10-A'];
const todayISO = () => new Date().toISOString().slice(0, 10);

/** Generate questions with AI, approve or remove each one, then save the assignment. */
export function AssignmentMaker({ seed }: { seed: Seed }) {
  const [topic, setTopic] = useState(seed.topic);
  const [cls, setCls] = useState(seed.cls);
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [qs, setQs] = useState<Question[]>([]);
  const [verdict, setVerdict] = useState<Record<string, Verdict>>({});
  const [section, setSection] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [savedNote, setSavedNote] = useState('');
  const saveAssignment = useSchool(s => s.saveAssignment);

  useEffect(() => { setTopic(seed.topic); setCls(seed.cls); }, [seed]);

  async function go() {
    if (topic.trim().length < 3) { setFormErr({ topic: 'Enter a topic of at least 3 characters.' }); return; }
    setFormErr({}); setErr(''); setBusy(true); setSavedNote('');
    try {
      const out = await getQuestions({ kind: 'board', board: 'CBSE', cls, subject: 'Science', unit: topic.trim() }, { n: 5, difficulty: diff, purpose: 'test' });
      setQs(out); setVerdict(Object.fromEntries(out.map(q => [q.id, 'pending' as Verdict])));
    } catch (e) { const m = friendlyError(e); if (m) setErr(m); } finally { setBusy(false); }
  }

  const kept = qs.filter(q => verdict[q.id] === 'keep');
  const pending = qs.filter(q => verdict[q.id] === 'pending').length;

  function save() {
    const e: Record<string, string> = {};
    if (!kept.length) e.questions = 'Approve at least one question.';
    if (pending) e.questions = `Approve or remove the ${pending} question${pending > 1 ? 's' : ''} still waiting for review.`;
    if (!section) e.section = 'Choose a class section.';
    if (!due) e.due = 'Choose a due date.';
    else if (due < todayISO()) e.due = 'The due date cannot be in the past.';
    setFormErr(e);
    if (Object.keys(e).length) return;
    saveAssignment({ id: uid(), cls, section, topic: topic.trim(), due, questions: kept, savedAt: Date.now() });
    setSavedNote(`${kept.length} question${kept.length > 1 ? 's' : ''} for ${section}, due ${new Date(due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`);
    setQs([]); setVerdict({});
  }

  return (
    <section className="card grid content-start gap-4 p-5 sm:p-6" aria-labelledby="am-title">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-ctl bg-primary/12 text-primary"><ClipboardList size={19} /></span>
        <div><h2 id="am-title" className="h-section">Assignment maker</h2><p className="text-sm text-muted">Generate five questions, keep the good ones, then set a due date.</p></div>
      </div>
      <form className="grid gap-3 sm:grid-cols-[1fr_88px_130px] sm:items-start" onSubmit={e => { e.preventDefault(); go(); }} noValidate>
        <label className="grid gap-1 text-sm font-semibold">Topic
          <input className="input" value={topic} onChange={e => setTopic(e.target.value)} aria-invalid={!!formErr.topic} aria-describedby={formErr.topic ? 'am-topic-err' : undefined} />
          {formErr.topic && <span id="am-topic-err" className="text-xs font-semibold text-bad">{formErr.topic}</span>}
        </label>
        <label className="grid gap-1 text-sm font-semibold">Class
          <select className="input" value={cls} onChange={e => setCls(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Difficulty
          <select className="input" value={diff} onChange={e => setDiff(e.target.value as typeof diff)}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
        </label>
        <button type="submit" className="btn-primary sm:col-span-3 sm:justify-self-start" disabled={busy}>{busy ? <><Dots /> Generating</> : <><Sparkles size={16} /> Generate 5 questions</>}</button>
      </form>

      {err && <Notice tone="error" title="The AI could not make questions">{err} Check <Link href="/settings" className="underline">Settings &amp; AI</Link>.</Notice>}
      {savedNote && <Notice tone="success" title="Assignment saved">{savedNote} {LOCAL_NOTE}</Notice>}

      {qs.length > 0 && (
        <>
          <p className="text-sm text-muted" aria-live="polite">{kept.length} kept · {pending} waiting for review · {qs.length - kept.length - pending} removed</p>
          <ol className="grid gap-3">
            {qs.map((q, i) => {
              const v = verdict[q.id];
              return (
                <li key={q.id} className={cx('grid gap-2 rounded-ctl border p-4 transition', v === 'keep' ? 'border-good/50 bg-good/[.05]' : v === 'remove' ? 'border-line opacity-55' : 'border-line')}>
                  <div className="flex gap-2"><b className="font-mono text-muted">{i + 1}.</b><Markdown text={q.q} className={cx('prose-lms !max-w-none font-semibold', v === 'remove' && 'line-through')} /></div>
                  <ul className="grid gap-1 pl-6 text-sm sm:grid-cols-2">{q.options.map((o, k) => <li key={k} className={k === q.answer ? 'font-semibold text-good' : ''}>{'ABCD'[k]}. {o}{k === q.answer && <span className="sr-only"> (correct answer)</span>}</li>)}</ul>
                  <div className="flex flex-wrap items-center gap-2 pl-6">
                    <span className="tag">{q.difficulty}</span><span className="tag">{q.topic}</span>
                    <div className="ml-auto flex gap-1.5">
                      {v === 'pending' ? (
                        <>
                          <button className="btn-soft min-h-8 px-3 py-1 text-sm" onClick={() => setVerdict(s => ({ ...s, [q.id]: 'keep' }))}><Check size={14} /> Approve</button>
                          <button className="btn-ghost min-h-8 px-3 py-1 text-sm" onClick={() => setVerdict(s => ({ ...s, [q.id]: 'remove' }))}><X size={14} /> Remove</button>
                        </>
                      ) : (
                        <button className="btn-ghost min-h-8 px-3 py-1 text-sm" onClick={() => setVerdict(s => ({ ...s, [q.id]: 'pending' }))}><RotateCcw size={14} /> Undo {v === 'keep' ? 'approval' : 'removal'}</button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="grid gap-3 rounded-ctl bg-surface2/60 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <label className="grid gap-1 text-sm font-semibold">Section
              <select className="input" value={section} onChange={e => setSection(e.target.value)} aria-invalid={!!formErr.section}>
                <option value="">Choose…</option>{SECTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              {formErr.section && <span className="text-xs font-semibold text-bad">{formErr.section}</span>}
            </label>
            <label className="grid gap-1 text-sm font-semibold">Due date
              <input type="date" className="input" min={todayISO()} value={due} onChange={e => setDue(e.target.value)} aria-invalid={!!formErr.due} />
              {formErr.due && <span className="text-xs font-semibold text-bad">{formErr.due}</span>}
            </label>
            <button className="btn-board sm:mt-6" onClick={save}><Save size={16} /> Save assignment</button>
            {formErr.questions && <p role="alert" className="text-sm font-semibold text-bad sm:col-span-3">{formErr.questions}</p>}
          </div>
        </>
      )}
    </section>
  );
}
