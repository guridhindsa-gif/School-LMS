'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cx } from '@/components/ui';
import { useLMS } from '@/lib/store';
import type { Board, Stream } from '@/lib/types';

const STAGES: [string, number[]][] = [['Foundational', [1, 2]], ['Preparatory', [3, 4, 5]], ['Middle', [6, 7, 8]], ['Secondary', [9, 10]], ['Senior secondary', [11, 12]]];
const STREAMS: { id: Stream; label: string; core: string; leads: string }[] = [
  { id: 'PCM', label: 'Science · PCM', core: 'Physics, Chemistry, Maths', leads: 'JEE, BITSAT, NDA, state CETs' },
  { id: 'PCB', label: 'Science · PCB', core: 'Physics, Chemistry, Biology', leads: 'NEET-UG' },
  { id: 'COM', label: 'Commerce', core: 'Accountancy, Business Studies, Economics', leads: 'CUET, CA Foundation, IPMAT, CLAT' },
  { id: 'HUM', label: 'Humanities', core: 'History, Political Science, Geography…', leads: 'CUET, CLAT, design entrances' },
];

export default function Onboarding() {
  const router = useRouter();
  const setProfile = useLMS(s => s.setProfile);
  const existing = useLMS(s => s.profile);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing.name);
  const [board, setBoard] = useState<Board | null>(existing.board);
  const [cls, setCls] = useState<number | null>(existing.cls);
  const [stream, setStream] = useState<Stream | null>(existing.stream);
  const needsStream = (cls ?? 0) >= 11;
  const steps = ['Your name', 'Board', 'Class', ...(needsStream ? ['Stream'] : [])];

  function finish(st = stream) {
    setProfile({ name: name.trim(), board, cls, stream: (cls ?? 0) >= 11 ? st : null, tracks: [] });
    router.push('/student');
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={cx('grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition', i < step ? 'bg-good text-white' : i === step ? 'bg-marigold text-[#2b1b02]' : 'bg-surface2 text-muted')}>{i < step ? <Check size={14} /> : i + 1}</span>
            <span className={cx('hidden text-sm font-semibold sm:block', i === step ? 'text-ink' : 'text-muted')}>{s}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={step} className="card grid gap-5 p-6" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
          {step === 0 && (
            <>
              <h1 className="text-3xl">Welcome! What should we call you?</h1>
              <input id="ob-name" className="input h-12 text-lg" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && setStep(1)} autoFocus />
              <button className="btn-primary justify-self-start" onClick={() => setStep(1)}>Next <ArrowRight size={17} /></button>
            </>
          )}
          {step === 1 && (
            <>
              <h1 className="text-3xl">Choose your board</h1>
              <div className="grid gap-3 sm:grid-cols-2">
                {([['CBSE', 'NCERT books, NCF-SE 2023 · two Class 10 board exams'], ['CISCE', 'ICSE (9–10) · ISC (11–12) · school-chosen books in 1–8']] as const).map(([b, d]) => (
                  <button key={b} onClick={() => { setBoard(b); setStep(2); }} className={cx('card grid gap-1 p-5 text-left transition hover:-translate-y-0.5 hover:border-board', board === b && 'ring-2 ring-board')}>
                    <span className="font-display text-2xl font-bold">{b}</span><span className="text-muted">{d}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-3xl">Which class are you in?</h1>
              <div className="grid gap-4">
                {STAGES.map(([g, cs]) => (
                  <div key={g} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
                    <span className="font-semibold text-muted">{g}</span>
                    <div className="flex flex-wrap gap-2">
                      {cs.map(c => (
                        <button key={c} onClick={() => { setCls(c); if (c >= 11) setStep(3); else { setCls(c); setTimeout(() => finishWith(c), 0); } }}
                          className={cx('h-14 w-16 rounded-xl border border-line bg-surface font-display text-2xl font-bold transition hover:border-board hover:bg-surface2', cls === c && 'ring-2 ring-board')}>{c}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
                  <span className="font-semibold text-muted">After Class 12</span>
                  <button onClick={() => { setCls(13); setStep(3); }} className={cx('justify-self-start rounded-xl border border-line bg-surface px-4 py-3 font-semibold hover:border-board', cls === 13 && 'ring-2 ring-board')}>Repeater JEE / NEET batch</button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-3xl">{cls === 13 ? 'Choose your entrance batch' : 'Choose your stream'}</h1>
              <div className="grid gap-3 sm:grid-cols-2">
                {STREAMS.filter(s => cls !== 13 || s.id === 'PCM' || s.id === 'PCB').map(s => (
                  <button key={s.id} onClick={() => { setStream(s.id); finish(s.id); }} className={cx('card grid gap-1 p-5 text-left transition hover:-translate-y-0.5 hover:border-board', stream === s.id && 'ring-2 ring-board')}>
                    <span className="font-display text-xl font-bold">{s.label}</span>
                    <span className="text-muted">{s.core}</span>
                    <span className="text-sm text-sky">Leads to: {s.leads}</span>
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

  function finishWith(c: number) {
    setProfile({ name: name.trim(), board, cls: c, stream: null, tracks: [] });
    router.push('/student');
  }
}
