'use client';
import { Flag, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Notice, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { LOCAL_NOTE_KEY, uid, useSchool, useSchoolHydrated } from '@/lib/school-store';
import type { CatalogRow } from './AdminView';

/** Stored values stay stable English ids; labels are translated. */
const REASONS = ['units', 'source', 'session', 'wording', 'other'] as const;

/** Flag a catalogue subject for review with a validated note. Saved on this device. */
export function FlagPanel({ rows, subject, onPick }: { rows: CatalogRow[]; subject: CatalogRow | null; onPick: (r: CatalogRow | null) => void }) {
  const { t } = useT();
  const hydrated = useSchoolHydrated();
  const { flags, addFlag, removeFlag } = useSchool();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [ok, setOk] = useState('');
  const refs = { subject: useRef<HTMLSelectElement>(null), reason: useRef<HTMLSelectElement>(null), note: useRef<HTMLTextAreaElement>(null) };
  const reasonLabel = (r: string) => ((REASONS as readonly string[]).includes(r) ? t(`admin.reason.${r}`) : r);
  const subjName = (r: CatalogRow) => `${r.board} · ${t('shell.class', { n: r.cls })} · ${r.name}`;

  useEffect(() => { setErrs({}); setOk(''); }, [subject?.id]);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!subject) x.subject = t('admin.err.subject');
    if (!reason) x.reason = t('admin.err.reason');
    if (note.trim().length < 10) x.note = t('admin.err.note');
    if (subject && reason && hydrated && flags.some(f => f.subjectId === subject.id && f.reason === reason)) x.reason = t('admin.err.dup');
    setErrs(x); setOk('');
    const first = (['subject', 'reason', 'note'] as const).find(k => x[k]);
    if (first) { refs[first].current?.focus(); return; }
    if (!subject) return;
    addFlag({ id: uid(), subjectId: subject.id, subjectName: subjName(subject), reason, note: note.trim(), savedAt: Date.now() });
    setOk(t('admin.flaggedOk', { s: subject.name, r: reasonLabel(reason) }));
    setNote(''); setReason('');
  }

  const n = Object.keys(errs).length;
  const a11y = (k: string) => ({ 'aria-invalid': !!errs[k], 'aria-describedby': errs[k] ? `fl-${k}-err` : undefined });
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <form className="card grid content-start gap-3 p-5 sm:p-6" onSubmit={submit} noValidate aria-labelledby="flag-title">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-ctl bg-accent/15 text-warn"><Flag size={18} aria-hidden /></span>
          <div><h2 id="flag-title" className="text-lg">{t('admin.flagTitle')}</h2><p className="text-sm text-muted">{t('admin.flagDesc')}</p></div>
        </div>
        {n > 0 && <p role="alert" className="rounded-ctl border border-bad/30 bg-bad/10 px-3 py-2 text-sm font-semibold text-bad">{t('roles.errSummary', { n })}</p>}
        <label className="grid gap-1 text-sm font-semibold">{t('admin.th.subject')}
          <select ref={refs.subject} className="input" value={subject?.id || ''} onChange={e => onPick(rows.find(r => r.id === e.target.value) || null)} {...a11y('subject')}>
            <option value="">{t('admin.chooseSubject')}</option>
            {rows.map(r => <option key={r.id} value={r.id}>{subjName(r)}</option>)}
          </select>
          {errs.subject && <span id="fl-subject-err" className="text-xs font-semibold text-bad">{errs.subject}</span>}
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t('admin.reason')}
          <select ref={refs.reason} className="input" value={reason} onChange={e => setReason(e.target.value)} {...a11y('reason')}>
            <option value="">{t('admin.chooseReason')}</option>{REASONS.map(r => <option key={r} value={r}>{reasonLabel(r)}</option>)}
          </select>
          {errs.reason && <span id="fl-reason-err" className="text-xs font-semibold text-bad">{errs.reason}</span>}
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t('admin.note')}
          <textarea ref={refs.note} className="input min-h-20" value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder={t('admin.notePh')}
            aria-invalid={!!errs.note} aria-describedby="fl-note-err" />
          <span id="fl-note-err" className={cx('text-xs', errs.note ? 'font-semibold text-bad' : 'font-normal text-muted')}>{errs.note || `${note.length}/500`}</span>
        </label>
        <button type="submit" className="btn-primary justify-self-start"><Flag size={15} aria-hidden /> {t('admin.saveFlag')}</button>
        {ok && <Notice tone="success" title={ok}>{t(LOCAL_NOTE_KEY)}</Notice>}
      </form>

      <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="flags-title">
        <h2 id="flags-title" className="text-lg">{t('admin.queue')} <span className="text-muted">· {hydrated ? flags.length : 0}</span></h2>
        {!hydrated || !flags.length ? (
          <p className="rounded-ctl bg-surface2/60 px-4 py-5 text-sm text-muted">{t('admin.queueEmpty')}</p>
        ) : (
          <ul className="grid max-h-[360px] gap-2 overflow-y-auto">
            {flags.map(f => (
              <li key={f.id} className="flex items-start gap-2 rounded-ctl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <b className="block text-sm">{f.subjectName}</b>
                  <span className="pill mt-1 bg-accent/15 text-warn">{reasonLabel(f.reason)}</span>
                  <p className="mt-1 text-sm text-muted">{f.note}</p>
                </div>
                <button className="btn-icon h-8 w-8" onClick={() => removeFlag(f.id)} aria-label={t('admin.resolveAria', { s: f.subjectName })} title={t('admin.resolve')}><Trash2 size={14} aria-hidden /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
