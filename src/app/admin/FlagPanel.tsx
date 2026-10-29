'use client';
import { Flag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Notice, cx } from '@/components/ui';
import { LOCAL_NOTE, uid, useSchool, useSchoolHydrated } from '@/lib/school-store';
import type { CatalogRow } from './AdminView';

const REASONS = ['Units missing or incomplete', 'Source link broken or outdated', 'Session year needs updating', 'Topic wording differs from official PDF', 'Other'];

/** Flag a catalogue subject for review with a validated note. Saved on this device. */
export function FlagPanel({ rows, subject, onPick }: { rows: CatalogRow[]; subject: CatalogRow | null; onPick: (r: CatalogRow | null) => void }) {
  const hydrated = useSchoolHydrated();
  const { flags, addFlag, removeFlag } = useSchool();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [ok, setOk] = useState('');

  useEffect(() => { setErrs({}); setOk(''); }, [subject?.id]);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!subject) x.subject = 'Choose a subject — use the Flag button in the table, or pick one here.';
    if (!reason) x.reason = 'Choose a reason.';
    if (note.trim().length < 10) x.note = 'Describe the problem in at least 10 characters so a reviewer can act on it.';
    if (subject && reason && hydrated && flags.some(f => f.subjectId === subject.id && f.reason === reason)) x.reason = 'This subject is already flagged for this reason.';
    setErrs(x); setOk('');
    if (Object.keys(x).length || !subject) return;
    addFlag({ id: uid(), subjectId: subject.id, subjectName: `${subject.board} · Class ${subject.cls} · ${subject.name}`, reason, note: note.trim(), savedAt: Date.now() });
    setOk(`${subject.name} flagged: ${reason}.`);
    setNote(''); setReason('');
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <form className="card grid content-start gap-3 p-5 sm:p-6" onSubmit={submit} noValidate aria-labelledby="flag-title">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-ctl bg-accent/15 text-warn"><Flag size={18} /></span>
          <div><h2 id="flag-title" className="text-lg">Flag for review</h2><p className="text-sm text-muted">Record a problem with a subject so it can be checked against the official source.</p></div>
        </div>
        <label className="grid gap-1 text-sm font-semibold">Subject
          <select className="input" value={subject?.id || ''} onChange={e => onPick(rows.find(r => r.id === e.target.value) || null)} aria-invalid={!!errs.subject}>
            <option value="">Choose a subject…</option>
            {rows.map(r => <option key={r.id} value={r.id}>{r.board} · Class {r.cls} · {r.name}</option>)}
          </select>
          {errs.subject && <span className="text-xs font-semibold text-bad">{errs.subject}</span>}
        </label>
        <label className="grid gap-1 text-sm font-semibold">Reason
          <select className="input" value={reason} onChange={e => setReason(e.target.value)} aria-invalid={!!errs.reason}>
            <option value="">Choose a reason…</option>{REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
          {errs.reason && <span className="text-xs font-semibold text-bad">{errs.reason}</span>}
        </label>
        <label className="grid gap-1 text-sm font-semibold">Note for the reviewer
          <textarea className="input min-h-20" value={note} onChange={e => setNote(e.target.value)} maxLength={500} aria-invalid={!!errs.note} placeholder="For example: Unit 3 topics do not match the 2025–26 PDF." />
          <span className={cx('text-xs', errs.note ? 'font-semibold text-bad' : 'font-normal text-muted')}>{errs.note || `${note.length}/500`}</span>
        </label>
        <button type="submit" className="btn-primary justify-self-start"><Flag size={15} /> Save flag</button>
        {ok && <Notice tone="success" title={ok}>{LOCAL_NOTE}</Notice>}
      </form>

      <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="flags-title">
        <h2 id="flags-title" className="text-lg">Review queue <span className="text-muted">· {hydrated ? flags.length : 0}</span></h2>
        {!hydrated || !flags.length ? (
          <p className="text-sm text-muted">No subjects flagged yet. Flags you save appear here for follow-up.</p>
        ) : (
          <ul className="grid max-h-[360px] gap-2 overflow-y-auto">
            {flags.map(f => (
              <li key={f.id} className="flex items-start gap-2 rounded-ctl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <b className="block text-sm">{f.subjectName}</b>
                  <span className="pill mt-1 bg-accent/15 text-warn">{f.reason}</span>
                  <p className="mt-1 text-sm text-muted">{f.note}</p>
                </div>
                <button className="btn-icon h-8 w-8" onClick={() => removeFlag(f.id)} aria-label={`Resolve flag on ${f.subjectName}`} title="Mark resolved"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
