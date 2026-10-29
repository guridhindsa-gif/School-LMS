'use client';
import Link from 'next/link';
import { FileText, Save, Send, Sparkles, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { Dots, Notice, cx } from '@/components/ui';
import { friendlyError, streamText } from '@/lib/ai-client';
import { LOCAL_NOTE, uid, useSchool, type ReviewState } from '@/lib/school-store';
import { ReviewSteps } from './ReviewSteps';

export interface Seed { key: number; topic: string; cls: number; subject: string }

/** AI drafts a lesson (streamed); the teacher reviews and moves it Draft → In review → Approved. */
export function LessonBuilder({ seed }: { seed: Seed }) {
  const [cls, setCls] = useState(seed.cls);
  const [subject, setSubject] = useState(seed.subject);
  const [topic, setTopic] = useState(seed.topic);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [touched, setTouched] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const ctl = useRef<AbortController | null>(null);
  const saveLesson = useSchool(s => s.saveLesson);
  const setLessonState = useSchool(s => s.setLessonState);
  const saved = useSchool(s => s.lessons.find(l => l.id === savedId));

  useEffect(() => { setCls(seed.cls); setSubject(seed.subject); setTopic(seed.topic); }, [seed]);
  useEffect(() => () => ctl.current?.abort(), []);

  const topicErr = touched && topic.trim().length < 3 ? 'Enter a topic of at least 3 characters.' : '';
  const subjErr = touched && !subject.trim() ? 'Enter the subject.' : '';

  async function go() {
    setTouched(true);
    if (topic.trim().length < 3 || !subject.trim()) return;
    setErr(''); setText(''); setSavedId(null); setBusy(true);
    ctl.current = new AbortController();
    try {
      await streamText('/api/ai/lesson', { ctx: { kind: 'board', board: 'CBSE', cls, subject: subject.trim(), unit: topic.trim(), topics: [] } }, setText, ctl.current.signal);
    } catch (e) { const m = friendlyError(e); if (m) setErr(m); } finally { setBusy(false); }
  }

  function save(state: ReviewState) {
    const id = savedId || uid();
    if (!saved) saveLesson({ id, cls, subject: subject.trim(), topic: topic.trim(), text, state, savedAt: Date.now() });
    else setLessonState(id, state);
    setSavedId(id);
  }

  return (
    <section className="card grid content-start gap-4 p-5 sm:p-6" aria-labelledby="lb-title">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-ctl bg-teal/12 text-teal"><FileText size={19} /></span>
        <div><h2 id="lb-title" className="h-section">AI lesson builder</h2><p className="text-sm text-muted">The AI drafts. You review and approve before anyone sees it.</p></div>
      </div>
      <form className="grid gap-3" onSubmit={e => { e.preventDefault(); go(); }} noValidate>
        <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
          <label className="grid gap-1 text-sm font-semibold">Class
            <select className="input" value={cls} onChange={e => setCls(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">Subject
            <input className="input" value={subject} onChange={e => setSubject(e.target.value)} aria-invalid={!!subjErr} aria-describedby={subjErr ? 'lb-subj-err' : undefined} />
            {subjErr && <span id="lb-subj-err" className="text-xs font-semibold text-bad">{subjErr}</span>}
          </label>
        </div>
        <label className="grid gap-1 text-sm font-semibold">Topic
          <input className="input" value={topic} onChange={e => setTopic(e.target.value)} aria-invalid={!!topicErr} aria-describedby={topicErr ? 'lb-topic-err' : undefined} />
          {topicErr && <span id="lb-topic-err" className="text-xs font-semibold text-bad">{topicErr}</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {busy
            ? <button type="button" className="btn-ghost" onClick={() => ctl.current?.abort()}><Square size={15} /> Stop</button>
            : <button type="submit" className="btn-primary"><Sparkles size={16} /> {text ? 'Draft again' : 'Draft lesson'}</button>}
        </div>
      </form>

      {err && <Notice tone="error" title="The AI could not draft this lesson">{err} Check <Link href="/settings" className="underline">Settings &amp; AI</Link>.</Notice>}
      {busy && !text && <p className="flex items-center gap-2 text-muted"><Dots /> Drafting…</p>}

      {text && (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ReviewSteps state={saved?.state ?? 'draft'} />
            {busy && <span className="flex items-center gap-2 text-xs text-muted"><Dots /> Still writing</span>}
          </div>
          <div className={cx('max-h-[460px] overflow-y-auto rounded-ctl border border-line bg-surface2/40 p-4', busy && 'opacity-90')}><Markdown text={text} /></div>
          {!busy && (
            <div className="flex flex-wrap gap-2">
              {!saved && <button className="btn-ghost" onClick={() => save('draft')}><Save size={16} /> Save draft</button>}
              {saved?.state !== 'review' && saved?.state !== 'approved' && <button className="btn-soft" onClick={() => save('review')}><Send size={16} /> Send for review</button>}
              {saved?.state !== 'approved' && <button className="btn-board" onClick={() => save('approved')}>Approve lesson</button>}
              {saved?.state === 'approved' && <button className="btn-ghost" onClick={() => save('review')}>Move back to review</button>}
            </div>
          )}
          {saved && <Notice tone="success" title={saved.state === 'approved' ? 'Approved and saved' : saved.state === 'review' ? 'Saved for review' : 'Draft saved'}>{LOCAL_NOTE}</Notice>}
        </div>
      )}
    </section>
  );
}
