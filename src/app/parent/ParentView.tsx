'use client';
import { motion } from 'framer-motion';
import { Volume2, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, Reveal, Ring, cx } from '@/components/ui';

const DIGEST = {
  en: { t: 'This week for Aarav', b: 'Aarav finished 4 of 5 Science tasks and scored 18/20 in the Light chapter test. He found angle questions hard. Try this at home: put a pencil in a glass of water and ask him why it looks bent.', l: 'en-IN' },
  hi: { t: 'आरव का यह सप्ताह', b: 'आरव ने विज्ञान के 5 में से 4 काम पूरे किए और प्रकाश अध्याय की परीक्षा में 20 में से 18 अंक पाए। कोण वाले प्रश्न उसे कठिन लगे। घर पर करें: पानी के गिलास में पेंसिल रखें और पूछें कि वह मुड़ी हुई क्यों दिखती है।', l: 'hi-IN' },
  pa: { t: 'ਆਰਵ ਦਾ ਇਹ ਹਫ਼ਤਾ', b: 'ਆਰਵ ਨੇ ਵਿਗਿਆਨ ਦੇ 5 ਵਿੱਚੋਂ 4 ਕੰਮ ਪੂਰੇ ਕੀਤੇ ਅਤੇ ਪ੍ਰਕਾਸ਼ ਅਧਿਆਇ ਦੇ ਟੈਸਟ ਵਿੱਚ 20 ਵਿੱਚੋਂ 18 ਅੰਕ ਲਏ। ਕੋਣ ਵਾਲੇ ਸਵਾਲ ਉਸਨੂੰ ਔਖੇ ਲੱਗੇ। ਘਰ ਵਿੱਚ ਕਰੋ: ਪਾਣੀ ਦੇ ਗਲਾਸ ਵਿੱਚ ਪੈਨਸਿਲ ਰੱਖੋ ਅਤੇ ਪੁੱਛੋ ਕਿ ਉਹ ਮੁੜੀ ਹੋਈ ਕਿਉਂ ਦਿਸਦੀ ਹੈ।', l: 'pa-IN' },
};
const HPC: [string, number[]][] = [['Scientific inquiry', [2, 3, 2, 3]], ['Communication', [2, 2, 3, 2]], ['Collaboration', [3, 3, 3, 3]], ['Creativity', [2, 2, 2, 3]], ['Physical well-being', [3, 2, 3, 3]]];
const LV = ['', 'Beginning', 'Progressing', 'Proficient'];
const LVC = ['', 'bg-bad/15 text-bad', 'bg-marigold/20 text-warn', 'bg-good/15 text-good'];

export function ParentView() {
  const [lang, setLang] = useState<'en' | 'hi' | 'pa'>('en');
  const [freq, setFreq] = useState('Weekly digest');
  const [curio, setCurio] = useState('Often');
  const [sent, setSent] = useState(false);
  const d = DIGEST[lang];
  const speak = () => { try { const u = new SpeechSynthesisUtterance(d.b); u.lang = d.l; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* no audio */ } };
  return (
    <>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Parent · Aarav S. · Class 8-B</p><h1 className="text-3xl">{d.t}</h1></div>
          <div className="flex gap-1 rounded-xl bg-surface2 p-1" role="radiogroup" aria-label="Language">
            {(['en', 'hi', 'pa'] as const).map(l => <button key={l} role="radio" aria-checked={lang === l} onClick={() => setLang(l)} className={cx('rounded-lg px-3 py-1 text-sm font-semibold', lang === l ? 'bg-surface shadow-soft' : 'text-muted')}>{l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}</button>)}
          </div>
        </div>
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.section key={lang} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="chalkboard grid gap-4 rounded-2xl p-6 shadow-lift">
          <p className="font-mono text-xs uppercase tracking-widest text-chalk/70">Weekly digest · sample</p>
          <p className="text-lg leading-relaxed">{d.b}</p>
          <button className="btn-primary justify-self-start" onClick={speak}><Volume2 size={17} /> Listen</button>
        </motion.section>
        <Card className="grid content-start gap-4">
          <div className="flex justify-around">
            <div className="grid justify-items-center gap-1"><Ring value={0.96} size={70} /><span className="text-sm text-muted">Attendance</span></div>
            <div className="grid justify-items-center gap-1"><Ring value={0.9} size={70} label="18/20" /><span className="text-sm text-muted">Light test</span></div>
            <div className="grid justify-items-center gap-1"><Ring value={0.8} size={70} label="4/5" /><span className="text-sm text-muted">Tasks</span></div>
          </div>
          <ul className="grid gap-2 text-sm">
            <li className="flex justify-between rounded-xl bg-surface2 px-3 py-2"><span><b>PTM</b> · Saturday 7 Nov, 10:00–12:00</span><span className="pill bg-sky/15 text-sky">Event</span></li>
            <li className="flex justify-between rounded-xl bg-surface2 px-3 py-2"><span><b>Term 2 fee</b> due 10 Nov</span><span className="pill bg-marigold/20 text-warn">Due</span></li>
          </ul>
        </Card>
      </div>

      <Card className="grid gap-4">
        <div><p className="eyebrow">Holistic Progress Card · Middle stage · Term 1</p><h2 className="text-xl">How Aarav is growing</h2></div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] gap-2">
            <div className="grid grid-cols-[170px_repeat(4,1fr)] gap-2 text-center text-sm font-bold"><span /><span>Teacher</span><span>Self</span><span>Peer</span><span>Parent</span></div>
            {HPC.map(([dom, v], i) => (
              <motion.div key={dom} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="grid grid-cols-[170px_repeat(4,1fr)] items-center gap-2 text-sm">
                <b>{dom}</b>{v.map((n, k) => <span key={k} className={cx('rounded-lg py-1.5 text-center font-semibold', LVC[n])}>{LV[n]}</span>)}
              </motion.div>
            ))}
          </div>
        </div>
        <p className="rounded-xl border-l-4 border-marigold bg-marigold/10 px-4 py-3 text-sm"><b>Teacher’s note:</b> Aarav asks good “why” questions in Science and works well in groups. Next term: explain his reasoning in writing, not only aloud.</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="grid content-start gap-3">
          <p className="eyebrow">Your input for the card</p>
          <b>At home, Aarav shows curiosity about how things work.</b>
          <div className="flex gap-2">{['Rarely', 'Sometimes', 'Often'].map(o => <button key={o} onClick={() => setCurio(o)} className={cx('rounded-full border px-3 py-1 text-sm font-semibold', curio === o ? 'border-ink bg-ink text-bg' : 'border-line')}>{o}</button>)}</div>
          <label className="grid gap-1 text-sm font-semibold">One thing you noticed<textarea id="parent-note" className="input min-h-20" defaultValue="He fixed the table fan with his grandfather." /></label>
          <button className={sent ? 'btn-soft justify-self-start' : 'btn-primary justify-self-start'} onClick={() => setSent(true)}>{sent ? <><Check size={16} /> Sent to class teacher</> : 'Send to class teacher'}</button>
        </Card>
        <Card className="grid content-start gap-3">
          <p className="eyebrow">Notifications</p>
          <b>How often should we message you?</b>
          <div className="flex flex-wrap gap-2">{['Only urgent', 'Daily summary', 'Weekly digest'].map(o => <button key={o} onClick={() => setFreq(o)} className={cx('rounded-full border px-3 py-1 text-sm font-semibold', freq === o ? 'border-ink bg-ink text-bg' : 'border-line')}>{o}</button>)}</div>
          <p className="text-sm text-muted">Absences and safety alerts always come at once.</p>
        </Card>
      </div>
    </>
  );
}
