'use client';
import Link from 'next/link';
import { FileText, Save, Send, Sparkles, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { Dots, Notice, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { friendlyError, streamText } from '@/lib/ai-client';
import { LOCAL_NOTE_KEY, uid, useSchool, type ReviewState } from '@/lib/school-store';
import { ReviewSteps } from './ReviewSteps';

export interface Seed { key: number; topic: string; cls: number; subject: string }

/** AI drafts a lesson (streamed); the teacher reviews and moves it Draft → In review → Approved. */
export function LessonBuilder({ seed }: { seed: Seed }) {
  const { t } = useT();
  const topicRef = useRef<HTMLInputElement>(null);
  const subjRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => { if (!seed.key) return; setCls(seed.cls); setSubject(seed.subject); setTopic(seed.topic); setTouched(false); }, [seed]);
  useEffect(() => () => ctl.current?.abort(), []);

  const topicErr = touched && topic.trim().length < 3 ? t('teacher.err.topic') : '';
  const subjErr = touched && !subject.trim() ? t('teacher.err.subject') : '';
  const errCount = (topicErr ? 1 : 0) + (subjErr ? 1 : 0);

  async function go() {
    setTouched(true);
    if (!subject.trim()) { subjRef.current?.focus(); return; }
    if (topic.trim().length < 3) { topicRef.current?.focus(); return; }
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
        <div><h2 id="lb-title" className="h-section">{t('teacher.lb.title')}</h2><p className="text-sm text-muted">{t('teacher.lb.desc')}</p></div>
      </div>
      <form className="grid gap-3" onSubmit={e => { e.preventDefault(); go(); }} noValidate>
        <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
          <label className="grid gap-1 text-sm font-semibold">{t('teacher.f.class')}
            <select className="input" value={cls} onChange={e => setCls(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">{t('teacher.f.subject')}
            <input ref={subjRef} className="input" placeholder={t('teacher.f.subjectPh')} value={subject} onChange={e => setSubject(e.target.value)} aria-invalid={!!subjErr} aria-describedby={subjErr ? 'lb-subj-err' : undefined} />
            {subjErr && <span id="lb-subj-err" className="text-xs font-semibold text-bad">{subjErr}</span>}
          </label>
        </div>
        <label className="grid gap-1 text-sm font-semibold">{t('teacher.f.topic')}
          <input ref={topicRef} className="input" placeholder={t('teacher.f.topicPh')} value={topic} onChange={e => setTopic(e.target.value)} aria-invalid={!!topicErr} aria-describedby={topicErr ? 'lb-topic-err' : undefined} />
          {topicErr && <span id="lb-topic-err" className="text-xs font-semibold text-bad">{topicErr}</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {busy
            ? <button type="button" className="btn-ghost" onClick={() => ctl.current?.abort()}><Square size={15} /> {t('common.stop')}</button>
            : <button type="submit" className="btn-primary"><Sparkles size={16} /> {text ? t('teacher.lb.again') : t('teacher.lb.draft')}</button>}
        </div>
        {errCount > 0 && <p role="alert" className="text-sm font-semibold text-bad">{t('roles.errSummary', { n: errCount })}</p>}
      </form>

      {err && <Notice tone="error" title={t('teacher.lb.err')}>{err} {t('roles.checkSettings')} <Link href="/settings" className="underline">{t('nav.settings')}</Link></Notice>}
      {busy && !text && <p className="flex items-center gap-2 text-muted"><Dots /> {t('teacher.lb.drafting')}</p>}

      {text && (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ReviewSteps state={saved?.state ?? 'draft'} />
            {busy && <span className="flex items-center gap-2 text-xs text-muted"><Dots /> {t('teacher.lb.writing')}</span>}
          </div>
          <div className={cx('max-h-[460px] overflow-y-auto rounded-ctl border border-line bg-surface2/40 p-4', busy && 'opacity-90')}><Markdown text={text} /></div>
          {!busy && (
            <div className="flex flex-wrap gap-2">
              {!saved && <button className="btn-ghost" onClick={() => save('draft')}><Save size={16} /> {t('teacher.lb.saveDraft')}</button>}
              {saved?.state !== 'review' && saved?.state !== 'approved' && <button className="btn-soft" onClick={() => save('review')}><Send size={16} /> {t('teacher.lb.sendReview')}</button>}
              {saved?.state !== 'approved' && <button className="btn-board" onClick={() => save('approved')}>{t('teacher.lb.approve')}</button>}
              {saved?.state === 'approved' && <button className="btn-ghost" onClick={() => save('review')}>{t('teacher.lb.backReview')}</button>}
            </div>
          )}
          {saved && <Notice tone="success" title={t(`teacher.lb.saved.${saved.state}`)}>{t(LOCAL_NOTE_KEY)}</Notice>}
        </div>
      )}
    </section>
  );
}
