'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpenText, Clapperboard, FlaskConical, ListChecks, PencilLine, RefreshCw, Sparkles, Target, Volume2, Square } from 'lucide-react';
import { VisualLesson } from '@/components/visual/VisualLesson';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Crumbs } from '@/components/Crumbs';
import { Markdown } from '@/components/Markdown';
import { TutorChat } from '@/components/TutorChat';
import { BandPill, Dots, Reveal, Ring, cx } from '@/components/ui';
import { LabView } from '@/components/labs/LabView';
import { labFor } from '@/components/labs/registry';
import { band } from '@/lib/adaptive';
import { friendlyError, streamText } from '@/lib/ai-client';
import { useLMS, useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';
import type { ResolvedUnit } from '@/lib/context';

type Tab = 'visual' | 'lesson' | 'lab' | 'topics';

export function LearnView({ r }: { r: ResolvedUnit }) {
  const hydrated = useHydrated();
  const lang = useLMS(s => s.profile.language);
  const sk = useLMS(s => s.skills[r.unitId]);
  const setContext = useTutor(s => s.setContext);
  const lab = labFor(r.title, r.cls);
  const [tab, setTab] = useState<Tab>('visual');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ctl = useRef<AbortController | null>(null);
  const cacheKey = `lesson:${r.unitId}:${lang}`;

  useEffect(() => { setContext(r.ctx, r.title.length > 40 ? r.title.slice(0, 40) + '…' : r.title); }, [r, setContext]);

  const generate = useCallback(async (force = false) => {
    ctl.current?.abort();
    if (!force) { try { const c = localStorage.getItem(cacheKey); if (c) { setText(c); return; } } catch { /* ignore */ } }
    setErr(''); setText(''); setBusy(true);
    ctl.current = new AbortController();
    try {
      const full = await streamText('/api/ai/lesson', { ctx: { ...stripClient(r.ctx), language: lang } }, setText, ctl.current.signal);
      try { localStorage.setItem(cacheKey, full); } catch { /* storage full */ }
    } catch (e) {
      const m = friendlyError(e); if (m) setErr(m);
    } finally { setBusy(false); }
  }, [cacheKey, lang, r.ctx]);

  useEffect(() => { if (hydrated && tab === 'lesson') generate(); return () => ctl.current?.abort(); }, [hydrated, generate, tab]);

  const [speaking, setSpeaking] = useState(false);
  function speak() {
    try {
      if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(text.replace(/[#>*_`$\\]/g, '').slice(0, 5000));
      u.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN'; u.rate = 0.95; u.onend = () => setSpeaking(false);
      speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
    } catch { /* no audio */ }
  }

  const tabs: { id: Tab; label: string; icon: typeof BookOpenText; show: boolean }[] = [
    { id: 'visual', label: 'Picture lesson', icon: Clapperboard, show: true },
    { id: 'lesson', label: 'Read notes', icon: BookOpenText, show: true },
    { id: 'lab', label: lab ? lab.title : 'Lab', icon: FlaskConical, show: !!lab },
    { id: 'topics', label: `Official sub-topics${r.topics.length ? ` (${r.topics.length})` : ''}`, icon: ListChecks, show: true },
  ];
  const enc = encodeURIComponent(r.unitId);

  return (
    <div className="grid gap-6">
      <Reveal>
        <Crumbs items={r.crumbs} />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {hydrated && <Ring value={sk?.pKnown ?? 0} size={66} />}
          <div className="grid min-w-0 flex-1 gap-1">
            <h1 className="text-2xl sm:text-3xl">{r.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {hydrated && <BandPill band={band(sk)} />}
              {r.marks != null && <span className="tag !bg-ink !text-bg">{r.marks} marks</span>}
              {sk?.weakTopics?.length ? <span className="text-sm text-muted">Work on: {sk.weakTopics.slice(0, 3).join(', ')}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/student/practice/${enc}`} className="btn-primary"><Target size={17} /> Adaptive practice</Link>
            <Link href={`/student/test/${enc}`} className="btn-ghost"><PencilLine size={17} /> Chapter test</Link>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="card min-w-0 p-0">
          <div className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-3" role="tablist">
            {tabs.filter(t => t.show).map(t => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={cx('relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 font-semibold transition', tab === t.id ? 'text-ink' : 'text-muted hover:text-ink')}>
                <t.icon size={16} />{t.label}
                {tab === t.id && <motion.span layoutId="learn-tab" className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-marigold" />}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-7">
            {tab === 'visual' && hydrated && <VisualLesson unitId={r.unitId} title={r.title} ctx={r.ctx} labId={lab?.id} young={(r.cls ?? 9) <= 5} />}
            {tab === 'lesson' && (
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill bg-board/10 text-board dark:text-chalk"><Sparkles size={12} /> Written by AI for your class{lang !== 'en' ? ` · ${lang === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}` : ''}</span>
                  <div className="ml-auto flex gap-2">
                    {text && !busy && <button className="btn-ghost text-sm" onClick={speak}>{speaking ? <Square size={15} /> : <Volume2 size={15} />}{speaking ? 'Stop' : 'Read aloud'}</button>}
                    {busy ? <button className="btn-ghost text-sm" onClick={() => ctl.current?.abort()}><Square size={15} /> Stop</button>
                      : <button className="btn-ghost text-sm" onClick={() => generate(true)}><RefreshCw size={15} /> New version</button>}
                  </div>
                </div>
                {err && (
                  <div role="alert" className="grid gap-2 rounded-xl bg-bad/10 p-4 text-bad">
                    <b>{err}</b>
                    <span className="text-sm">Open <Link href="/settings" className="underline">Settings &amp; AI</Link> to check the Ollama connection. The official sub-topics are under the third tab.</span>
                  </div>
                )}
                {!text && busy && <p className="flex items-center gap-3 text-muted"><Dots /> Writing your lesson…</p>}
                {text && <Markdown text={text} />}
                {text && !busy && (
                  <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-4">
                    <Link href={`/student/practice/${enc}`} className="btn-primary"><Target size={17} /> Practise this now</Link>
                    {lab && <button className="btn-ghost" onClick={() => setTab('lab')}><FlaskConical size={17} /> Try the lab</button>}
                  </div>
                )}
              </div>
            )}
            {tab === 'lab' && lab && <LabView id={lab.id} />}
            {tab === 'topics' && (
              r.topics.length ? (
                <ol className="grid gap-2">
                  {r.topics.map((t, i) => (
                    <li key={i} className="flex gap-3 rounded-xl bg-surface2/60 px-4 py-2.5"><span className="font-mono text-sm text-muted">{i + 1}.</span><span>{t}</span></li>
                  ))}
                </ol>
              ) : <p className="text-muted">The official syllabus lists this unit without separate sub-topics.</p>
            )}
          </div>
        </section>

        <aside className="card hidden h-[calc(100dvh-8rem)] min-h-[520px] p-4 xl:sticky xl:top-20 xl:block">
          <TutorChat compact />
        </aside>
      </div>
    </div>
  );
}

function stripClient<T extends { unitId?: string }>(c: T) { const { unitId: _u, ...rest } = c; return rest; }
