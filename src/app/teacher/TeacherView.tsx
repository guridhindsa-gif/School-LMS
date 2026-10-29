'use client';
import { motion } from 'framer-motion';
import { Check, ClipboardList, FileText, Send, Sparkles, Square, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { Bar, Card, Dots, Reveal, cx } from '@/components/ui';
import { friendlyError, getQuestions, streamText } from '@/lib/ai-client';
import type { Question } from '@/lib/types';

const CLUSTERS = [
  { label: 'Refraction at the water surface', n: 17, tone: 'good', ex: '“Light bends when it goes from water to air.”' },
  { label: 'Water magnifies the pencil', n: 9, tone: 'warn', ex: '“Water makes things bigger.”' },
  { label: 'The pencil really bends', n: 6, tone: 'bad', ex: '“Water pushes it so it bends.”' },
];

export function TeacherView() {
  return (
    <>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Teacher · Science, Classes 8 and 10</p><h1 className="text-3xl">Today</h1></div>
          <span className="pill bg-surface2 text-muted">Sample class data</span>
        </div>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="grid content-start gap-3">
          <p className="eyebrow">Timetable</p>
          {[['08:40', '8-B · Light: refraction', 'Room 204'], ['10:15', '10-A · Carbon compounds', 'Lab 2'], ['12:30', '8-C · Light: refraction', 'Room 207']].map(([t, c, r]) => (
            <div key={t} className="flex items-center gap-3 border-t border-line pt-3 first:border-0 first:pt-0"><span className="font-mono text-sm">{t}</span><div><b>{c}</b><p className="text-sm text-muted">{r}</p></div></div>
          ))}
        </Card>
        <Card className="grid content-start gap-3">
          <p className="eyebrow">Needs attention</p>
          {[['Ishaan M. · 8-B', '3 practice sets missed', 'bg-bad/15 text-bad', 'At risk'], ['Sana K. · 8-B', 'Angle questions 2/9', 'bg-marigold/20 text-warn', 'Struggling'], ['24 answers to grade', '10-A long answers', 'bg-sky/15 text-sky', 'To review']].map(([a, b, c, d]) => (
            <div key={a} className="flex items-center gap-3 border-t border-line pt-3 first:border-0 first:pt-0"><div className="flex-1"><b>{a}</b><p className="text-sm text-muted">{b}</p></div><span className={cx('pill', c)}>{d}</span></div>
          ))}
        </Card>
        <Card className="grid content-start gap-3">
          <p className="eyebrow">Mastery · 8-B · Light</p>
          {[['Laws of reflection', 0.82], ['Refraction', 0.58], ['Snell’s law', 0.34], ['Total internal reflection', 0.21]].map(([t, v]) => (
            <div key={t as string} className="grid grid-cols-[1fr_90px_40px] items-center gap-2 text-sm"><span>{t}</span><Bar value={v as number} /><span className="text-right font-mono">{Math.round((v as number) * 100)}%</span></div>
          ))}
          <p className="text-xs text-muted">From the class's adaptive practice (BKT mastery).</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <LessonBuilder />
        <Card className="grid content-start gap-4">
          <div><p className="eyebrow">Answer clustering · 8-B · 32 answers</p><h2 className="text-xl">“Why does a pencil look bent in water?”</h2></div>
          {CLUSTERS.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="grid gap-1">
              <div className="flex justify-between gap-2"><b>{c.label}</b><span className="font-mono">{c.n}</span></div>
              <Bar value={c.n / 32} color={`rgb(var(--${c.tone === 'good' ? 'good' : c.tone === 'warn' ? 'marigold' : 'bad'}))`} />
              <span className="text-sm text-muted">{c.ex}</span>
            </motion.div>
          ))}
          <div className="rounded-xl border-l-4 border-marigold bg-marigold/10 px-4 py-3 text-sm"><b>Suggested next step:</b> 6 students think the pencil really bends. Reteach with the pin experiment, then assign the misconception set.</div>
        </Card>
      </div>
      <QuestionMaker />
    </>
  );
}

function LessonBuilder() {
  const [cls, setCls] = useState(8);
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState('Refraction of light through a glass slab');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [approved, setApproved] = useState(false);
  const ctl = useRef<AbortController | null>(null);
  async function go() {
    setErr(''); setText(''); setApproved(false); setBusy(true);
    ctl.current = new AbortController();
    try {
      await streamText('/api/ai/lesson', { ctx: { kind: 'board', board: 'CBSE', cls, subject, unit: topic, topics: [] } }, setText, ctl.current.signal);
    } catch (e) { const m = friendlyError(e); if (m) setErr(m); } finally { setBusy(false); }
  }
  return (
    <Card className="grid content-start gap-4">
      <div className="flex items-center gap-2"><FileText size={19} className="text-marigold" /><h2 className="text-xl">AI lesson builder</h2></div>
      <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
        <label className="grid gap-1 text-sm font-semibold">Class<select className="input" value={cls} onChange={e => setCls(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-semibold">Subject<input className="input" value={subject} onChange={e => setSubject(e.target.value)} /></label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">Topic<input className="input" value={topic} onChange={e => setTopic(e.target.value)} /></label>
      <div className="flex flex-wrap gap-2">
        {busy ? <button className="btn-ghost" onClick={() => ctl.current?.abort()}><Square size={15} /> Stop</button>
          : <button className="btn-primary" onClick={go} disabled={!topic.trim()}><Sparkles size={16} /> Draft lesson</button>}
        {text && !busy && <button className={approved ? 'btn-soft' : 'btn-board'} onClick={() => setApproved(true)}>{approved ? <><Check size={16} /> Approved for 8-B</> : 'Approve & schedule'}</button>}
      </div>
      <p className="text-xs text-muted">The AI drafts; you review and approve before students see it.</p>
      {err && <p className="rounded-xl bg-bad/10 p-3 text-sm text-bad">{err}</p>}
      {busy && !text && <p className="flex items-center gap-2 text-muted"><Dots /> Drafting…</p>}
      {text && <div className="max-h-[480px] overflow-y-auto rounded-xl border border-line p-4"><Markdown text={text} /></div>}
    </Card>
  );
}

function QuestionMaker() {
  const [topic, setTopic] = useState('Snell’s law');
  const [cls, setCls] = useState(10);
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [qs, setQs] = useState<Question[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  async function go() {
    setErr(''); setBusy(true); setSent(false);
    try { setQs(await getQuestions({ kind: 'board', board: 'CBSE', cls, subject: 'Science', unit: topic }, { n: 5, difficulty: diff, purpose: 'test' })); }
    catch (e) { const m = friendlyError(e); if (m) setErr(m); } finally { setBusy(false); }
  }
  return (
    <Card className="grid gap-4">
      <div className="flex items-center gap-2"><ClipboardList size={19} className="text-marigold" /><h2 className="text-xl">Make an assignment</h2></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_90px_160px_auto] sm:items-end">
        <label className="grid gap-1 text-sm font-semibold">Topic<input className="input" value={topic} onChange={e => setTopic(e.target.value)} /></label>
        <label className="grid gap-1 text-sm font-semibold">Class<select className="input" value={cls} onChange={e => setCls(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-semibold">Difficulty<select className="input" value={diff} onChange={e => setDiff(e.target.value as typeof diff)}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <button className="btn-primary" onClick={go} disabled={busy || !topic.trim()}>{busy ? <Dots /> : <><Sparkles size={16} /> Generate 5</>}</button>
      </div>
      {err && <p className="rounded-xl bg-bad/10 p-3 text-sm text-bad">{err}</p>}
      {qs.length > 0 && (
        <>
          <ol className="grid gap-3">
            {qs.map((q, i) => (
              <li key={q.id} className="rounded-xl border border-line p-4">
                <div className="flex gap-2"><b className="font-mono text-muted">{i + 1}.</b><Markdown text={q.q} className="prose-lms !max-w-none font-semibold" /></div>
                <ul className="mt-2 grid gap-1 pl-6 text-sm sm:grid-cols-2">{q.options.map((o, k) => <li key={k} className={k === q.answer ? 'font-semibold text-good' : ''}>{'ABCD'[k]}. {o}</li>)}</ul>
                <p className="mt-2 pl-6 text-xs text-muted">{q.difficulty} · {q.topic}</p>
              </li>
            ))}
          </ol>
          <button className={sent ? 'btn-soft justify-self-start' : 'btn-board justify-self-start'} onClick={() => setSent(true)}>{sent ? <><Check size={16} /> Assigned to 10-A · due Friday</> : <><Send size={16} /><Users size={16} /> Assign to 10-A</>}</button>
        </>
      )}
    </Card>
  );
}
