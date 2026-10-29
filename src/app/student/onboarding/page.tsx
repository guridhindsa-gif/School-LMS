'use client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cx } from '@/components/ui';
import { useLMS } from '@/lib/store';
import type { Board, Stream } from '@/lib/types';

const STAGES: [string, string, number[]][] = [
  ['Foundational', 'Play-based, picture-first', [1, 2]],
  ['Preparatory', 'Reading, numbers, discovery', [3, 4, 5]],
  ['Middle', 'Subjects and experiments', [6, 7, 8]],
  ['Secondary', 'Board exam years', [9, 10]],
  ['Senior secondary', 'Streams and entrances', [11, 12]],
];
const BOARDS: [Board, string, string][] = [
  ['CBSE', 'Central Board of Secondary Education', 'NCERT books, NCF-SE 2023 · two Class 10 board exams'],
  ['CISCE', 'ICSE (9–10) · ISC (11–12)', 'Council for the Indian School Certificate Examinations · school-chosen books in 1–8'],
];
const STREAMS: { id: Stream; label: string; core: string; leads: string }[] = [
  { id: 'PCM', label: 'Science · PCM', core: 'Physics, Chemistry, Maths', leads: 'JEE, BITSAT, NDA, state CETs' },
  { id: 'PCB', label: 'Science · PCB', core: 'Physics, Chemistry, Biology', leads: 'NEET-UG' },
  { id: 'COM', label: 'Commerce', core: 'Accountancy, Business Studies, Economics', leads: 'CUET, CA Foundation, IPMAT, CLAT' },
  { id: 'HUM', label: 'Humanities', core: 'History, Political Science, Geography…', leads: 'CUET, CLAT, design entrances' },
];

export default function Onboarding() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const setProfile = useLMS(s => s.setProfile);
  const existing = useLMS(s => s.profile);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing.name);
  const [nameErr, setNameErr] = useState('');
  const [board, setBoard] = useState<Board | null>(existing.board);
  const [cls, setCls] = useState<number | null>(existing.cls);
  const [stream, setStream] = useState<Stream | null>(existing.stream);
  const needsStream = (cls ?? 0) >= 11;
  const steps = ['Your name', 'Board', 'Class', ...(needsStream ? [cls === 13 ? 'Batch' : 'Stream'] : [])];

  function submitName() {
    const n = name.trim();
    if (!n) { setNameErr('Please type your first name so we know what to call you.'); return; }
    if (n.length > 30) { setNameErr('Please keep your name under 30 characters.'); return; }
    if (!/\p{L}/u.test(n)) { setNameErr('A name needs at least one letter.'); return; }
    setNameErr(''); setStep(1);
  }
  function save(c: number, st: Stream | null) {
    if (!board) { setStep(1); return; }
    setProfile({ name: name.trim(), board, cls: c, stream: c >= 11 ? st : null, tracks: [] });
    router.push('/student');
  }
  const motionProps = reduce ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25 } };
  const choice = (on: boolean) => cx('card card-hover grid gap-1 p-5 text-left', on && 'border-primary ring-2 ring-primary/30');

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
      {/* Summary + steps */}
      <aside className="panel-night grid content-start gap-6 rounded-card p-6 shadow-lift lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-ctl bg-white/10"><GraduationCap size={20} /></span>
          <div><p className="font-mono text-xs uppercase tracking-widest text-onnight/70">Set up</p><p className="font-display text-xl font-bold">Your learning path</p></div>
        </div>
        <ol className="grid gap-3" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3" aria-current={i === step ? 'step' : undefined}>
              <span className={cx('grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition', i < step ? 'bg-teal text-white' : i === step ? 'bg-accent text-[#2b1b02]' : 'bg-white/10 text-onnight/60')}>{i < step ? <Check size={14} /> : i + 1}</span>
              <span className={cx('text-sm font-semibold', i === step ? 'text-onnight' : 'text-onnight/60')}>{s}</span>
            </li>
          ))}
        </ol>
        <dl className="grid gap-2 border-t border-white/10 pt-4 text-sm">
          {[['Name', name.trim() || '—'], ['Board', board || '—'], ['Class', cls ? (cls === 13 ? 'Repeater batch' : `Class ${cls}`) : '—'], ...(needsStream ? [['Stream', stream || '—']] : [])].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><dt className="text-onnight/60">{k}</dt><dd className="truncate font-semibold">{v}</dd></div>
          ))}
        </dl>
      </aside>

      <AnimatePresence mode="wait">
        <motion.section key={step} className="card grid content-start gap-6 p-6 sm:p-8" {...motionProps} aria-labelledby="ob-title">
          {step === 0 && (
            <form className="grid gap-5" onSubmit={e => { e.preventDefault(); submitName(); }} noValidate>
              <h1 id="ob-title" className="h-page">Welcome! What should we call you?</h1>
              <div className="grid gap-1.5">
                <label htmlFor="ob-name" className="text-sm font-semibold">First name</label>
                <input id="ob-name" className="input h-12 text-lg" placeholder="e.g. Harpreet" value={name} autoComplete="given-name" maxLength={40}
                  onChange={e => { setName(e.target.value); if (nameErr) setNameErr(''); }} aria-invalid={!!nameErr} aria-describedby={nameErr ? 'ob-name-err' : 'ob-name-help'} autoFocus />
                {nameErr ? <p id="ob-name-err" className="text-sm font-semibold text-bad" role="alert">{nameErr}</p>
                  : <p id="ob-name-help" className="text-sm text-muted">Used for greetings only. It stays in this browser.</p>}
              </div>
              <button type="submit" className="btn-primary justify-self-start">Next <ArrowRight size={17} /></button>
            </form>
          )}
          {step === 1 && (
            <>
              <h1 id="ob-title" className="h-page">Choose your board</h1>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="ob-title">
                {BOARDS.map(([b, sub, d]) => (
                  <button key={b} role="radio" aria-checked={board === b} onClick={() => { setBoard(b); setStep(2); }} className={choice(board === b)}>
                    <span className="flex items-center justify-between gap-2"><span className="font-display text-3xl font-bold">{b}</span>{board === b && <Check className="text-primary" />}</span>
                    <span className="font-semibold">{sub}</span>
                    <span className="text-sm text-muted">{d}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1 id="ob-title" className="h-page">Which class are you in?</h1>
              <div className="grid gap-4">
                {STAGES.map(([g, hint, cs]) => (
                  <div key={g} className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center" role="group" aria-label={g}>
                    <span><b className="block">{g}</b><span className="text-xs text-muted">{hint}</span></span>
                    <div className="flex flex-wrap gap-2">
                      {cs.map(c => (
                        <button key={c} aria-pressed={cls === c} aria-label={`Class ${c}`}
                          onClick={() => { setCls(c); if (c >= 11) setStep(3); else save(c, null); }}
                          className={cx('h-14 w-16 rounded-ctl border border-line bg-surface font-display text-2xl font-bold transition hover:border-primary hover:text-primary', cls === c && 'border-primary bg-primary text-onprimary hover:text-onprimary')}>{c}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                  <span><b className="block">After Class 12</b><span className="text-xs text-muted">Full-time entrance prep</span></span>
                  <button aria-pressed={cls === 13} onClick={() => { setCls(13); setStep(3); }} className={cx('justify-self-start rounded-ctl border border-line bg-surface px-4 py-3 font-semibold transition hover:border-primary', cls === 13 && 'border-primary bg-primary text-onprimary')}>Repeater JEE / NEET batch</button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h1 id="ob-title" className="h-page">{cls === 13 ? 'Choose your entrance batch' : 'Choose your stream'}</h1>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="ob-title">
                {STREAMS.filter(s => cls !== 13 || s.id === 'PCM' || s.id === 'PCB').map(s => (
                  <button key={s.id} role="radio" aria-checked={stream === s.id} onClick={() => { setStream(s.id); save(cls ?? 11, s.id); }} className={choice(stream === s.id)}>
                    <span className="font-display text-xl font-bold">{s.label}</span>
                    <span className="text-muted">{s.core}</span>
                    <span className="text-sm font-semibold text-primary">Leads to: {s.leads}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step > 0 && <button className="btn-soft justify-self-start" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
