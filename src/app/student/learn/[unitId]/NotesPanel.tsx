'use client';
import Link from 'next/link';
import { FlaskConical, RefreshCw, Sparkles, Square, Target, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { Dots, Notice, Skeleton } from '@/components/ui';
import { friendlyError, streamText } from '@/lib/ai-client';
import type { LearnContext } from '@/lib/types';

const LANG = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' } as const;

/** AI-written chapter notes: streamed, cached per language, typeset with KaTeX, read aloud. */
export function NotesPanel({ unitId, ctx, lang, hasLab, onLab, active }: { unitId: string; ctx: LearnContext; lang: 'en' | 'hi' | 'pa'; hasLab: boolean; onLab: () => void; active: boolean }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const ctl = useRef<AbortController | null>(null);
  const cacheKey = `lesson:${unitId}:${lang}`;

  const generate = useCallback(async (force = false) => {
    ctl.current?.abort();
    if (!force) { try { const c = localStorage.getItem(cacheKey); if (c) { setText(c); return; } } catch { /* ignore */ } }
    setErr(''); setText(''); setBusy(true);
    ctl.current = new AbortController();
    try {
      const { unitId: _u, ...rest } = ctx;
      const full = await streamText('/api/ai/lesson', { ctx: { ...rest, language: lang } }, setText, ctl.current.signal);
      try { localStorage.setItem(cacheKey, full); } catch { /* storage full */ }
    } catch (e) {
      const m = friendlyError(e); if (m) setErr(m);
    } finally { setBusy(false); }
  }, [cacheKey, lang, ctx]);

  useEffect(() => { if (active) generate(); return () => ctl.current?.abort(); }, [active, generate]);
  useEffect(() => () => { try { speechSynthesis.cancel(); } catch { /* */ } }, []);

  function speak() {
    try {
      if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(text.replace(/[#>*_`$\\]/g, '').slice(0, 5000));
      u.lang = LANG[lang]; u.rate = 0.95; u.onend = () => setSpeaking(false);
      speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
    } catch { /* no audio */ }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-primary/10 text-primary"><Sparkles size={12} /> Written by AI for your class{lang !== 'en' ? ` · ${lang === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}` : ''}</span>
        <div className="ml-auto flex gap-2">
          {text && !busy && <button className="btn-ghost h-9 min-h-0 text-sm" onClick={speak} aria-pressed={speaking}>{speaking ? <Square size={15} /> : <Volume2 size={15} />}{speaking ? 'Stop reading' : 'Read aloud'}</button>}
          {busy ? <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => ctl.current?.abort()}><Square size={15} /> Stop</button>
            : <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => generate(true)}><RefreshCw size={15} /> New version</button>}
        </div>
      </div>
      {err && (
        <Notice tone="error" title={err} action={<button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => generate(true)}>Try again</button>}>
          Open <Link href="/settings" className="font-semibold underline">Settings &amp; AI</Link> to check the Ollama connection. The official sub-topics are always available in the Topics tab.
        </Notice>
      )}
      {!text && busy && <div className="grid gap-4"><p className="flex items-center gap-3 text-sm text-muted"><Dots /> Writing notes for your class…</p><Skeleton lines={7} /></div>}
      {text && <article aria-busy={busy} className="mx-auto w-full max-w-[72ch]"><Markdown text={text} /></article>}
      {text && !busy && (
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Link href={`/student/practice/${encodeURIComponent(unitId)}`} className="btn-primary"><Target size={17} /> Practise this now</Link>
          {hasLab && <button className="btn-ghost" onClick={onLab}><FlaskConical size={17} /> Explore in the lab</button>}
        </div>
      )}
    </div>
  );
}
