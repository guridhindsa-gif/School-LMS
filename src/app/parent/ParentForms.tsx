'use client';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Notice, cx } from '@/components/ui';
import { LOCAL_NOTE, uid, useSchool, useSchoolHydrated } from '@/lib/school-store';

const CURIO = ['Rarely', 'Sometimes', 'Often'];
const FREQ = ['Only urgent', 'Daily summary', 'Weekly digest'];

/** Parent input for the Holistic Progress Card and message preferences (saved locally). */
export function ParentForms() {
  const hydrated = useSchoolHydrated();
  const { parentNotes, addParentNote, parentPrefs, setParentPrefs } = useSchool();
  const [curio, setCurio] = useState('');
  const [note, setNote] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!curio) x.curio = 'Choose how often you see this.';
    if (note.trim().length < 10) x.note = 'Write at least a short sentence (10 characters or more).';
    else if (note.length > 400) x.note = 'Keep it under 400 characters.';
    setErrs(x); setSaved(false);
    if (Object.keys(x).length) return;
    addParentNote({ id: uid(), child: 'Aarav S.', curiosity: curio, note: note.trim(), savedAt: Date.now() });
    setSaved(true); setNote(''); setCurio('');
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
      <form className="card grid content-start gap-4 p-5 sm:p-6" onSubmit={submit} noValidate aria-labelledby="pf-title">
        <div><p className="eyebrow">Your input for the progress card</p><h2 id="pf-title" className="text-lg">At home, Aarav shows curiosity about how things work.</h2></div>
        <fieldset className="grid gap-2">
          <legend className="sr-only">How often</legend>
          <div className="seg w-fit" role="radiogroup" aria-label="How often" aria-describedby={errs.curio ? 'pf-curio-err' : undefined}>
            {CURIO.map(o => <button type="button" key={o} role="radio" aria-checked={curio === o} onClick={() => setCurio(o)}>{o}</button>)}
          </div>
          {errs.curio && <span id="pf-curio-err" className="text-xs font-semibold text-bad">{errs.curio}</span>}
        </fieldset>
        <label className="grid gap-1 text-sm font-semibold">One thing you noticed
          <textarea className="input min-h-24" value={note} onChange={e => setNote(e.target.value)} placeholder="For example: he fixed the table fan with his grandfather." aria-invalid={!!errs.note} aria-describedby="pf-note-help" maxLength={500} />
          <span id="pf-note-help" className={cx('text-xs', errs.note ? 'font-semibold text-bad' : 'font-normal text-muted')}>{errs.note || `${note.length}/400`}</span>
        </label>
        <button type="submit" className="btn-primary justify-self-start"><Save size={16} /> Save for the class teacher</button>
        {saved && <Notice tone="success" title="Saved">{LOCAL_NOTE}</Notice>}
        {hydrated && parentNotes.length > 0 && (
          <div className="grid gap-2 border-t border-line pt-3">
            <p className="eyebrow">Saved on this device · {parentNotes.length}</p>
            {parentNotes.slice(0, 3).map(n => <p key={n.id} className="text-sm"><span className="tag mr-2">{n.curiosity}</span>{n.note}</p>)}
          </div>
        )}
      </form>

      <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="pp-title">
        <p className="eyebrow">Preferences</p>
        <h2 id="pp-title" className="text-lg">How often should the school message you?</h2>
        <div className="seg flex-wrap" role="radiogroup" aria-label="Message frequency">
          {FREQ.map(o => <button key={o} role="radio" aria-checked={hydrated && parentPrefs.frequency === o} onClick={() => setParentPrefs({ frequency: o })}>{o}</button>)}
        </div>
        <p className="text-sm text-muted">Absences and safety alerts always come at once. Your choice and language are saved on this device.</p>
      </section>
    </div>
  );
}
