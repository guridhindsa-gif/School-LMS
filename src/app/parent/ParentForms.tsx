'use client';
import { Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { Notice, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { LOCAL_NOTE_KEY, uid, useSchool, useSchoolHydrated, type Frequency } from '@/lib/school-store';

const CURIO = ['rarely', 'sometimes', 'often'] as const;
const FREQ: Frequency[] = ['urgent', 'daily', 'weekly'];

/** Parent input for the Holistic Progress Card and message preferences (saved on this device). */
export function ParentForms({ child }: { child: string }) {
  const { t } = useT();
  const hydrated = useSchoolHydrated();
  const { parentNotes, addParentNote, parentPrefs, setParentPrefs } = useSchool();
  const [curio, setCurio] = useState('');
  const [note, setNote] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const curioRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const who = child || t('parent.form.yourChild');

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!curio) x.curio = t('parent.form.errCurio');
    if (note.trim().length < 10) x.note = t('parent.form.errShort');
    else if (note.length > 400) x.note = t('parent.form.errLong');
    setErrs(x); setSaved(false);
    if (x.curio) { (curioRef.current?.querySelector('button') as HTMLElement | null)?.focus(); return; }
    if (x.note) { noteRef.current?.focus(); return; }
    addParentNote({ id: uid(), child: child || '', curiosity: curio, note: note.trim(), savedAt: Date.now() });
    setSaved(true); setNote(''); setCurio('');
  }

  const n = Object.keys(errs).length;
  return (
    <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
      <form className="card grid content-start gap-4 p-5 sm:p-6" onSubmit={submit} noValidate aria-labelledby="pf-title">
        <div><p className="eyebrow">{t('parent.form.eyebrow')}</p><h2 id="pf-title" className="text-lg">{t('parent.form.q', { child: who })}</h2></div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">{t('parent.form.howOften')}</legend>
          <div ref={curioRef} className="seg w-fit flex-wrap" role="radiogroup" aria-label={t('parent.form.howOften')} aria-invalid={!!errs.curio} aria-describedby={errs.curio ? 'pf-curio-err' : undefined}>
            {CURIO.map(o => <button type="button" key={o} role="radio" aria-checked={curio === o} onClick={() => setCurio(o)}>{t(`parent.form.${o}`)}</button>)}
          </div>
          {errs.curio && <span id="pf-curio-err" className="text-xs font-semibold text-bad">{errs.curio}</span>}
        </fieldset>
        <label className="grid gap-1 text-sm font-semibold">{t('parent.form.noticed')}
          <textarea ref={noteRef} className="input min-h-24" value={note} onChange={e => setNote(e.target.value)} placeholder={t('parent.form.placeholder')} aria-invalid={!!errs.note} aria-describedby="pf-note-help" maxLength={500} />
          <span id="pf-note-help" className={cx('text-xs', errs.note ? 'font-semibold text-bad' : 'font-normal text-muted')}>{errs.note || `${note.length}/400`}</span>
        </label>
        {n > 0 && <p role="alert" className="text-sm font-semibold text-bad">{t('roles.errSummary', { n })}</p>}
        <button type="submit" className="btn-primary justify-self-start"><Save size={16} aria-hidden /> {t('parent.form.save')}</button>
        {saved && <Notice tone="success" title={t('parent.form.saved')}>{t(LOCAL_NOTE_KEY)}</Notice>}
        {hydrated && parentNotes.length > 0 && (
          <div className="grid gap-2 border-t border-line pt-3">
            <p className="eyebrow">{t('parent.form.savedCount', { n: parentNotes.length })}</p>
            {parentNotes.slice(0, 3).map(p => <p key={p.id} className="text-sm"><span className="tag mr-2">{CURIO.includes(p.curiosity as typeof CURIO[number]) ? t(`parent.form.${p.curiosity}`) : p.curiosity}</span>{p.note}</p>)}
          </div>
        )}
      </form>

      <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="pp-title">
        <p className="eyebrow">{t('parent.prefs')}</p>
        <h2 id="pp-title" className="text-lg">{t('parent.prefs.q')}</h2>
        <div className="seg flex-wrap" role="radiogroup" aria-label={t('parent.prefs.q')}>
          {FREQ.map(o => <button key={o} role="radio" aria-checked={hydrated && parentPrefs.frequency === o} onClick={() => setParentPrefs({ frequency: o })}>{t(`parent.freq.${o}`)}</button>)}
        </div>
        <p className="text-sm text-muted">{t('parent.prefs.note')}</p>
      </section>
    </div>
  );
}
