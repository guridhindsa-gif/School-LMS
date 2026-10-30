'use client';
import Link from 'next/link';
import { Check, ClipboardList, RotateCcw, Save, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { Dots, Notice, cx } from '@/components/ui';
import { friendlyError, getQuestions } from '@/lib/ai-client';
import { useT } from '@/lib/i18n';
import { LOCAL_NOTE_KEY, uid, useSchool } from '@/lib/school-store';
import type { Question } from '@/lib/types';
import type { Seed } from './LessonBuilder';

type Verdict = 'pending' | 'keep' | 'remove';
type Diff = 'easy' | 'medium' | 'hard' | 'mixed';
const todayISO = () => new Date().toISOString().slice(0, 10);

/** Generate questions with AI, approve or remove each one, then save the assignment (on this device). */
export function AssignmentMaker({ seed }: { seed: Seed }) {
  const { t, locale } = useT();
  const [topic, setTopic] = useState(seed.topic);
  const [cls, setCls] = useState(seed.cls);
  const [subject, setSubject] = useState(seed.subject);
  const [diff, setDiff] = useState<Diff>('mixed');
  const [qs, setQs] = useState<Question[]>([]);
  const [verdict, setVerdict] = useState<Record<string, Verdict>>({});
  const [section, setSection] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [savedNote, setSavedNote] = useState('');
  const saveAssignment = useSchool(s => s.saveAssignment);
  const refs = { topic: useRef<HTMLInputElement>(null), subject: useRef<HTMLInputElement>(null), section: useRef<HTMLInputElement>(null), due: useRef<HTMLInputElement>(null), questions: useRef<HTMLParagraphElement>(null) };

  useEffect(() => { if (!seed.key) return; setTopic(seed.topic); setCls(seed.cls); setSubject(seed.subject); setFormErr({}); }, [seed]);

  const focusFirst = (e: Record<string, string>) => {
    const k = (['subject', 'topic', 'questions', 'section', 'due'] as const).find(x => e[x]);
    if (k) setTimeout(() => refs[k].current?.focus(), 0);
  };

  async function go() {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = t('teacher.err.subject');
    if (topic.trim().length < 3) e.topic = t('teacher.err.topic');
    setFormErr(e);
    if (Object.keys(e).length) { focusFirst(e); return; }
    setErr(''); setBusy(true); setSavedNote('');
    try {
      const out = await getQuestions({ kind: 'board', board: 'CBSE', cls, subject: subject.trim(), unit: topic.trim() }, { n: 5, difficulty: diff, purpose: 'test' });
      setQs(out); setVerdict(Object.fromEntries(out.map(q => [q.id, 'pending' as Verdict])));
    } catch (x) { const m = friendlyError(x); if (m) setErr(m); } finally { setBusy(false); }
  }

  const kept = qs.filter(q => verdict[q.id] === 'keep');
  const pending = qs.filter(q => verdict[q.id] === 'pending').length;

  function save() {
    const e: Record<string, string> = {};
    if (!kept.length) e.questions = t('teacher.am.errKeep');
    if (pending) e.questions = t('teacher.am.errPending', { n: pending });
    if (!section.trim()) e.section = t('teacher.am.errSection');
    else if (section.trim().length > 12) e.section = t('teacher.am.errSectionLong');
    if (!due) e.due = t('teacher.am.errDue');
    else if (due < todayISO()) e.due = t('teacher.am.errPast');
    setFormErr(e);
    if (Object.keys(e).length) { focusFirst(e); return; }
    saveAssignment({ id: uid(), cls, section: section.trim(), topic: topic.trim(), due, questions: kept, savedAt: Date.now() });
    setSavedNote(t('teacher.am.savedNote', { n: kept.length, sec: section.trim(), date: new Date(due).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) }));
    setQs([]); setVerdict({}); setSection(''); setDue('');
  }

  const errCount = Object.keys(formErr).length;
  const fe = (k: string) => ({ 'aria-invalid': !!formErr[k], 'aria-describedby': formErr[k] ? `am-${k}-err` : undefined });
  const errMsg = (k: string) => formErr[k] ? <span id={`am-${k}-err`} className="text-xs font-semibold text-bad">{formErr[k]}</span> : null;

  return (
    <section className="card grid content-start gap-4 p-5 sm:p-6" aria-labelledby="am-title">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-ctl bg-primary/12 text-primary"><ClipboardList size={19} aria-hidden /></span>
        <div><h2 id="am-title" className="h-section">{t('teacher.am.title')}</h2><p className="text-sm text-muted">{t('teacher.am.desc')}</p></div>
      </div>
      <form className="grid gap-3 sm:grid-cols-[1fr_88px_130px] sm:items-start" onSubmit={e => { e.preventDefault(); go(); }} noValidate>
        <label className="grid gap-1 text-sm font-semibold sm:col-span-3">{t('teacher.f.subject')}
          <input ref={refs.subject} className="input" placeholder={t('teacher.f.subjectPh')} value={subject} onChange={e => setSubject(e.target.value)} {...fe('subject')} />
          {errMsg('subject')}
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t('teacher.f.topic')}
          <input ref={refs.topic} className="input" placeholder={t('teacher.f.topicPh')} value={topic} onChange={e => setTopic(e.target.value)} {...fe('topic')} />
          {errMsg('topic')}
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t('teacher.f.class')}
          <select className="input" value={cls} onChange={e => setCls(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t('teacher.am.difficulty')}
          <select className="input" value={diff} onChange={e => setDiff(e.target.value as Diff)}>{(['mixed', 'easy', 'medium', 'hard'] as const).map(d => <option key={d} value={d}>{t(`teacher.diff.${d}`)}</option>)}</select>
        </label>
        <button type="submit" className="btn-primary sm:col-span-3 sm:justify-self-start" disabled={busy}>{busy ? <><Dots /> {t('teacher.am.generating')}</> : <><Sparkles size={16} /> {t('teacher.am.generate')}</>}</button>
      </form>

      {errCount > 0 && <p role="alert" className="text-sm font-semibold text-bad">{t('roles.errSummary', { n: errCount })}</p>}
      {err && <Notice tone="error" title={t('teacher.am.err')}>{err} {t('roles.checkSettings')} <Link href="/settings" className="underline">{t('nav.settings')}</Link></Notice>}
      {savedNote && <Notice tone="success" title={t('teacher.am.saved')}>{savedNote} {t(LOCAL_NOTE_KEY)}</Notice>}

      {qs.length > 0 && (
        <>
          <p className="text-sm text-muted" aria-live="polite">{t('teacher.am.counts', { kept: kept.length, pending, removed: qs.length - kept.length - pending })}</p>
          <ol className="grid gap-3">
            {qs.map((q, i) => {
              const v = verdict[q.id];
              return (
                <li key={q.id} className={cx('grid gap-2 rounded-ctl border p-4 transition', v === 'keep' ? 'border-good/50 bg-good/[.05]' : v === 'remove' ? 'border-line opacity-55' : 'border-line')}>
                  <div className="flex gap-2"><b className="font-mono text-muted">{i + 1}.</b><Markdown text={q.q} className={cx('prose-lms !max-w-none font-semibold', v === 'remove' && 'line-through')} /></div>
                  <ul className="grid gap-1 pl-6 text-sm sm:grid-cols-2">{q.options.map((o, k) => <li key={k} className={k === q.answer ? 'font-semibold text-good' : ''}>{'ABCD'[k]}. {o}{k === q.answer && <span className="sr-only"> {t('teacher.am.correct')}</span>}</li>)}</ul>
                  <div className="flex flex-wrap items-center gap-2 pl-6">
                    <span className="tag">{t(`teacher.diff.${q.difficulty}`)}</span><span className="tag">{q.topic}</span>
                    <div className="ml-auto flex gap-1.5">
                      {v === 'pending' ? (
                        <>
                          <button className="btn-soft min-h-8 px-3 py-1 text-sm" onClick={() => setVerdict(s => ({ ...s, [q.id]: 'keep' }))} aria-label={t('teacher.am.approveQ', { n: i + 1 })}><Check size={14} aria-hidden /> {t('teacher.am.approve')}</button>
                          <button className="btn-ghost min-h-8 px-3 py-1 text-sm" onClick={() => setVerdict(s => ({ ...s, [q.id]: 'remove' }))} aria-label={t('teacher.am.removeQ', { n: i + 1 })}><X size={14} aria-hidden /> {t('teacher.am.remove')}</button>
                        </>
                      ) : (
                        <button className="btn-ghost min-h-8 px-3 py-1 text-sm" onClick={() => setVerdict(s => ({ ...s, [q.id]: 'pending' }))}><RotateCcw size={14} aria-hidden /> {t(v === 'keep' ? 'teacher.am.undoKeep' : 'teacher.am.undoRemove')}</button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="grid gap-3 rounded-ctl bg-surface2/60 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <label className="grid gap-1 text-sm font-semibold">{t('teacher.am.section')}
              <input ref={refs.section} className="input" placeholder={t('teacher.am.sectionPh')} value={section} onChange={e => setSection(e.target.value)} maxLength={20} {...fe('section')} />
              {errMsg('section')}
            </label>
            <label className="grid gap-1 text-sm font-semibold">{t('teacher.am.due')}
              <input ref={refs.due} type="date" className="input" min={todayISO()} value={due} onChange={e => setDue(e.target.value)} {...fe('due')} />
              {errMsg('due')}
            </label>
            <button className="btn-board sm:mt-6" onClick={save}><Save size={16} /> {t('teacher.am.save')}</button>
            {formErr.questions && <p ref={refs.questions} tabIndex={-1} id="am-questions-err" className="text-sm font-semibold text-bad outline-none sm:col-span-3">{formErr.questions}</p>}
          </div>
        </>
      )}
    </section>
  );
}
