'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, Square, CalendarDays, Lightbulb, Clock, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, PageHeader, Reveal, SampleBadge, cx } from '@/components/ui';
import { useSchool, useSchoolHydrated } from '@/lib/school-store';
import { ParentForms } from './ParentForms';

type Lang = 'en' | 'hi' | 'pa';
const DIGEST: Record<Lang, { t: string; b: string; l: string }> = {
  en: { t: 'This week for Aarav', b: 'Aarav finished 4 of 5 Science tasks and scored 18/20 in the Light chapter test. He found angle questions hard. Try this at home: put a pencil in a glass of water and ask him why it looks bent.', l: 'en-IN' },
  hi: { t: 'आरव का यह सप्ताह', b: 'आरव ने विज्ञान के 5 में से 4 काम पूरे किए और प्रकाश अध्याय की परीक्षा में 20 में से 18 अंक पाए। कोण वाले प्रश्न उसे कठिन लगे। घर पर करें: पानी के गिलास में पेंसिल रखें और पूछें कि वह मुड़ी हुई क्यों दिखती है।', l: 'hi-IN' },
  pa: { t: 'ਆਰਵ ਦਾ ਇਹ ਹਫ਼ਤਾ', b: 'ਆਰਵ ਨੇ ਵਿਗਿਆਨ ਦੇ 5 ਵਿੱਚੋਂ 4 ਕੰਮ ਪੂਰੇ ਕੀਤੇ ਅਤੇ ਪ੍ਰਕਾਸ਼ ਅਧਿਆਇ ਦੇ ਟੈਸਟ ਵਿੱਚ 20 ਵਿੱਚੋਂ 18 ਅੰਕ ਲਏ। ਕੋਣ ਵਾਲੇ ਸਵਾਲ ਉਸਨੂੰ ਔਖੇ ਲੱਗੇ। ਘਰ ਵਿੱਚ ਕਰੋ: ਪਾਣੀ ਦੇ ਗਲਾਸ ਵਿੱਚ ਪੈਨਸਿਲ ਰੱਖੋ ਅਤੇ ਪੁੱਛੋ ਕਿ ਉਹ ਮੁੜੀ ਹੋਈ ਕਿਉਂ ਦਿਸਦੀ ਹੈ।', l: 'pa-IN' },
};
const FACTS: [string, string, string][] = [['Attendance', '96%', 'this term'], ['Light test', '18/20', 'Science'], ['Tasks done', '4 of 5', 'this week']];
const SUBJECTS: { name: string; v: number; strength: string; next: string }[] = [
  { name: 'English', v: 0.81, strength: 'Reads aloud with confidence', next: 'Longer written answers' },
  { name: 'Science', v: 0.78, strength: 'Asks good “why” questions', next: 'Angles in light diagrams' },
  { name: 'Hindi', v: 0.74, strength: 'Strong vocabulary', next: 'Grammar exercises' },
  { name: 'Social Science', v: 0.7, strength: 'Remembers events well', next: 'Map work' },
  { name: 'Maths', v: 0.66, strength: 'Quick mental arithmetic', next: 'Word problems on ratios' },
];
const HELP = [
  { icon: Lightbulb, tone: 'bg-accent/15 text-warn', t: 'Angle questions felt hard', d: 'Put a pencil in a glass of water and ask why it looks bent. Five minutes is enough.' },
  { icon: Clock, tone: 'bg-primary/12 text-primary', t: 'One Science task was missed', d: 'Agree on a fixed 20-minute study time after dinner on school days.' },
];
const DATES = [
  { icon: CalendarDays, t: 'Parent–teacher meeting', d: 'Saturday 7 Nov, 10:00–12:00', tag: 'Event', tone: 'bg-teal/12 text-teal' },
  { icon: Wallet, t: 'Term 2 fee', d: 'Due 10 Nov', tag: 'Due', tone: 'bg-accent/15 text-warn' },
];
const HPC: [string, number[]][] = [['Scientific inquiry', [2, 3, 2, 3]], ['Communication', [2, 2, 3, 2]], ['Collaboration', [3, 3, 3, 3]], ['Creativity', [2, 2, 2, 3]], ['Physical well-being', [3, 2, 3, 3]]];
const LV = ['', 'Beginning', 'Progressing', 'Proficient'];
const LVC = ['', 'bg-accent/20 text-warn', 'bg-primary/12 text-primary', 'bg-good/15 text-good'];

export function ParentView() {
  const hydrated = useSchoolHydrated();
  const prefs = useSchool(s => s.parentPrefs);
  const setPrefs = useSchool(s => s.setParentPrefs);
  const lang: Lang = hydrated ? prefs.language : 'en';
  const [speaking, setSpeaking] = useState(false);
  const reduce = useReducedMotion();
  const d = DIGEST[lang];

  useEffect(() => () => { try { speechSynthesis.cancel(); } catch { /* none */ } }, []);
  useEffect(() => { try { speechSynthesis.cancel(); } catch { /* none */ } setSpeaking(false); }, [lang]);

  function speak() {
    try {
      if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(d.b); u.lang = d.l; u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
      speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
    } catch { setSpeaking(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Parent · Aarav S. · Class 8-B" title={d.t}
        actions={<>
          <div className="seg" role="radiogroup" aria-label="Language of the summary">
            {(['en', 'hi', 'pa'] as const).map(l => <button key={l} role="radio" aria-checked={lang === l} onClick={() => setPrefs({ language: l })}>{l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}</button>)}
          </div>
          <SampleBadge />
        </>} />

      {/* 1. The week in plain language */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <motion.section key={lang} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel-night grid content-start gap-5 rounded-card p-6 shadow-lift sm:p-7" aria-label="Weekly summary">
          <p className="font-mono text-xs uppercase tracking-widest text-onnight/60">Weekly summary</p>
          <p className="text-lg leading-relaxed sm:text-xl" lang={d.l}>{d.b}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-accent" onClick={speak} aria-pressed={speaking}>{speaking ? <><Square size={16} /> Stop</> : <><Volume2 size={17} /> Listen</>}</button>
            <span className="text-sm text-onnight/60">Read aloud in the language you choose</span>
          </div>
          <dl className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            {FACTS.map(([k, v, s]) => <div key={k}><dt className="text-xs text-onnight/60">{k}</dt><dd className="font-display text-2xl font-bold">{v}</dd><dd className="text-xs text-onnight/60">{s}</dd></div>)}
          </dl>
        </motion.section>

        <Reveal delay={0.05}>
          <section className="card grid h-full content-start gap-3 p-5 sm:p-6" aria-labelledby="help-title">
            <h2 id="help-title" className="h-section">How you can help this week</h2>
            {HELP.map(h => (
              <div key={h.t} className="flex gap-3 rounded-ctl border border-line p-3">
                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', h.tone)}><h.icon size={17} /></span>
                <div><b className="block">{h.t}</b><p className="text-sm text-muted">{h.d}</p></div>
              </div>
            ))}
            <p className="eyebrow mt-2">Coming up</p>
            {DATES.map(x => (
              <div key={x.t} className="flex items-center gap-3 rounded-ctl bg-surface2/70 px-3 py-2 text-sm">
                <x.icon size={16} className="text-muted" aria-hidden />
                <span className="min-w-0 flex-1"><b>{x.t}</b> · {x.d}</span>
                <span className={cx('pill', x.tone)}>{x.tag}</span>
              </div>
            ))}
          </section>
        </Reveal>
      </div>

      {/* 2. Subjects */}
      <section className="card grid gap-4 p-5 sm:p-6" aria-labelledby="subj-title">
        <div><p className="eyebrow">Term 1 so far</p><h2 id="subj-title" className="h-section">Progress and strengths by subject</h2></div>
        <ul className="grid gap-3">
          {SUBJECTS.map(s => (
            <li key={s.name} className="grid gap-2 border-t border-line pt-3 first:border-0 first:pt-0 md:grid-cols-[150px_1fr_1.4fr] md:items-center md:gap-4">
              <b>{s.name}</b>
              <div className="flex items-center gap-2"><Bar value={s.v} className="flex-1" /><span className="w-10 text-right font-mono text-sm tabular-nums">{Math.round(s.v * 100)}%</span></div>
              <p className="text-sm"><span className="text-good">Strength:</span> {s.strength} <span className="text-muted">· Next: {s.next}</span></p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Holistic Progress Card */}
      <section className="card grid gap-4 p-5 sm:p-6" aria-labelledby="hpc-title">
        <div><p className="eyebrow">Holistic Progress Card · Middle stage · Term 1</p><h2 id="hpc-title" className="h-section">How Aarav is growing</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-1.5 text-sm">
            <thead><tr className="text-center"><th className="text-left font-semibold text-muted">Domain</th>{['Teacher', 'Self', 'Peer', 'Parent'].map(h => <th key={h} scope="col" className="font-semibold text-muted">{h}</th>)}</tr></thead>
            <tbody>
              {HPC.map(([dom, v]) => (
                <tr key={dom}><th scope="row" className="pr-2 text-left font-semibold">{dom}</th>{v.map((n, k) => <td key={k} className={cx('rounded-lg py-1.5 text-center font-semibold', LVC[n])}>{LV[n]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted" aria-hidden>{[1, 2, 3].map(n => <span key={n} className={cx('rounded-md px-2 py-0.5 font-semibold', LVC[n])}>{LV[n]}</span>)}</div>
        <p className="rounded-ctl border-l-4 border-teal bg-teal/10 px-4 py-3 text-sm"><b>Teacher’s note:</b> Aarav asks good “why” questions in Science and works well in groups. Next term: explain his reasoning in writing, not only aloud.</p>
      </section>

      <ParentForms />
    </>
  );
}
