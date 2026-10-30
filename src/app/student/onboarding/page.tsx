'use client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { useLMS } from '@/lib/store';
import type { Board, Stream } from '@/lib/types';

const STAGES: [string, number[]][] = [['found', [1, 2]], ['prep', [3, 4, 5]], ['middle', [6, 7, 8]], ['sec', [9, 10]], ['senior', [11, 12]]];
const BOARDS: [Board, string][] = [['CBSE', 'cbse'], ['CISCE', 'cisce']];
// labels/core are translation keys; `leads` is either a key or a literal list of exam names
const STREAMS: { id: Stream; key: string; leads: string }[] = [
  { id: 'PCM', key: 'pcm', leads: 'onb.s.pcm.leads' },
  { id: 'PCB', key: 'pcb', leads: 'NEET-UG' },
  { id: 'COM', key: 'com', leads: 'CUET, CA Foundation, IPMAT, CLAT' },
  { id: 'HUM', key: 'hum', leads: 'onb.s.hum.leads' },
];

export default function Onboarding() {
  const router = useRouter();
  const { t } = useT();
  const nameRef = useRef<HTMLInputElement>(null);
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
  const steps = [t('onb.step.name'), t('onb.step.board'), t('onb.step.class'), ...(needsStream ? [cls === 13 ? t('onb.step.batch') : t('onb.step.stream')] : [])];
  const cName = (c: number) => (c === 13 ? t('shell.repeater') : t('shell.class', { n: c }));

  function submitName() {
    const n = name.trim();
    const err = !n ? 'onb.err.empty' : n.length > 30 ? 'onb.err.long' : !/\p{L}/u.test(n) ? 'onb.err.letter' : '';
    if (err) { setNameErr(err); nameRef.current?.focus(); return; }
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
          <div><p className="font-mono text-xs uppercase tracking-widest text-onnight/70">{t('onb.setUp')}</p><p className="font-display text-xl font-bold">{t('onb.path')}</p></div>
        </div>
        <ol className="grid gap-3" aria-label={t('onb.stepOf', { n: step + 1, total: steps.length })}>
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3" aria-current={i === step ? 'step' : undefined}>
              <span className={cx('grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition', i < step ? 'bg-teal text-white' : i === step ? 'bg-accent text-[#2b1b02]' : 'bg-white/10 text-onnight/60')}>{i < step ? <Check size={14} /> : i + 1}</span>
              <span className={cx('text-sm font-semibold', i === step ? 'text-onnight' : 'text-onnight/60')}>{s}</span>
            </li>
          ))}
        </ol>
        <dl className="grid gap-2 border-t border-white/10 pt-4 text-sm">
          {[[t('onb.sum.name'), name.trim() || '—'], [t('onb.step.board'), board || '—'], [t('onb.step.class'), cls ? cName(cls) : '—'], ...(needsStream ? [[t('onb.step.stream'), stream || '—']] : [])].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><dt className="text-onnight/60">{k}</dt><dd className="truncate font-semibold">{v}</dd></div>
          ))}
        </dl>
      </aside>

      <AnimatePresence mode="wait">
        <motion.section key={step} className="card grid content-start gap-6 p-6 sm:p-8" {...motionProps} aria-labelledby="ob-title">
          {step === 0 && (
            <form className="grid gap-5" onSubmit={e => { e.preventDefault(); submitName(); }} noValidate>
              <h1 id="ob-title" className="h-page">{t('onb.welcome')}</h1>
              <div className="grid gap-1.5">
                <label htmlFor="ob-name" className="text-sm font-semibold">{t('onb.firstName')}</label>
                <input ref={nameRef} id="ob-name" className="input h-12 text-lg" placeholder={t('onb.namePh')} value={name} autoComplete="given-name" maxLength={40}
                  onChange={e => { setName(e.target.value); if (nameErr) setNameErr(''); }} aria-invalid={!!nameErr} aria-describedby={nameErr ? 'ob-name-err' : 'ob-name-help'} autoFocus />
                {nameErr ? <p id="ob-name-err" className="text-sm font-semibold text-bad" role="alert">{t(nameErr)}</p>
                  : <p id="ob-name-help" className="text-sm text-muted">{t('onb.nameHelp')}</p>}
              </div>
              <button type="submit" className="btn-primary justify-self-start">{t('common.next')} <ArrowRight size={17} /></button>
            </form>
          )}
          {step === 1 && (
            <>
              <h1 id="ob-title" className="h-page">{t('onb.chooseBoard')}</h1>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="ob-title">
                {BOARDS.map(([b, k]) => (
                  <button key={b} role="radio" aria-checked={board === b} onClick={() => { setBoard(b); setStep(2); }} className={choice(board === b)}>
                    <span className="flex items-center justify-between gap-2"><span className="font-display text-3xl font-bold">{b}</span>{board === b && <Check className="text-primary" />}</span>
                    <span className="font-semibold">{t(`onb.${k}.sub`)}</span>
                    <span className="text-sm text-muted">{t(`onb.${k}.desc`)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1 id="ob-title" className="h-page">{t('onb.whichClass')}</h1>
              <div className="grid gap-4">
                {STAGES.map(([g, cs]) => (
                  <div key={g} className="grid gap-2 sm:grid-cols-[minmax(170px,auto)_1fr] sm:items-center" role="group" aria-label={t(`onb.stage.${g}`)}>
                    <span><b className="block">{t(`onb.stage.${g}`)}</b><span className="text-xs text-muted">{t(`onb.stage.${g}.hint`)}</span></span>
                    <div className="flex flex-wrap gap-2">
                      {cs.map(c => (
                        <button key={c} aria-pressed={cls === c} aria-label={t('shell.class', { n: c })}
                          onClick={() => { setCls(c); if (c >= 11) setStep(3); else save(c, null); }}
                          className={cx('h-14 w-16 rounded-ctl border border-line bg-surface font-display text-2xl font-bold transition hover:border-primary hover:text-primary', cls === c && 'border-primary bg-primary text-onprimary hover:text-onprimary')}>{c}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="grid gap-2 sm:grid-cols-[minmax(170px,auto)_1fr] sm:items-center">
                  <span><b className="block">{t('onb.after12')}</b><span className="text-xs text-muted">{t('onb.after12.hint')}</span></span>
                  <button aria-pressed={cls === 13} onClick={() => { setCls(13); setStep(3); }} className={cx('justify-self-start rounded-ctl border border-line bg-surface px-4 py-3 font-semibold transition hover:border-primary', cls === 13 && 'border-primary bg-primary text-onprimary')}>{t('onb.repeater')}</button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h1 id="ob-title" className="h-page">{cls === 13 ? t('onb.chooseBatch') : t('onb.chooseStream')}</h1>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="ob-title">
                {STREAMS.filter(s => cls !== 13 || s.id === 'PCM' || s.id === 'PCB').map(s => (
                  <button key={s.id} role="radio" aria-checked={stream === s.id} onClick={() => { setStream(s.id); save(cls ?? 11, s.id); }} className={choice(stream === s.id)}>
                    <span className="font-display text-xl font-bold">{t(`onb.s.${s.key}`)}</span>
                    <span className="text-muted">{t(`onb.s.${s.key}.core`)}</span>
                    <span className="text-sm font-semibold text-primary">{t('onb.leadsTo', { exams: s.leads.startsWith('onb.') ? t(s.leads) : s.leads })}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step > 0 && <button className="btn-soft justify-self-start" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {t('common.back')}</button>}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
