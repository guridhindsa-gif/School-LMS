'use client';
import Link from 'next/link';
import { FlaskConical, RefreshCw, Sparkles, Square, Target, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Vidya } from '@/components/art';
import { Markdown } from '@/components/Markdown';
import { Dots, Skeleton } from '@/components/ui';
import { friendlyError, streamText } from '@/lib/ai-client';
import { LANGS, localeOf, useT, type Lang } from '@/lib/i18n';
import type { LearnContext } from '@/lib/types';

/**
 * AI-written chapter notes: streamed, cached per language, typeset with KaTeX, read aloud.
 * When the AI is unavailable, the official syllabus sub-topics are shown instead — clearly labelled.
 */
export function NotesPanel({ unitId, ctx, topics, lang, hasLab, onLab, active }: { unitId: string; ctx: LearnContext; topics: string[]; lang: Lang; hasLab: boolean; onLab: () => void; active: boolean }) {
  const { t } = useT();
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
      u.lang = localeOf(lang); u.rate = 0.95; u.onend = () => setSpeaking(false);
      speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
    } catch { /* no audio */ }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {!err && <span className="pill bg-primary/10 text-primary"><Sparkles size={12} aria-hidden /> {t('notes.byAI')}{lang !== 'en' ? ` · ${LANGS.find(l => l.id === lang)?.label}` : ''}</span>}
        <div className="ml-auto flex gap-2">
          {text && !busy && <button className="btn-ghost h-9 min-h-0 text-sm" onClick={speak} aria-pressed={speaking}>{speaking ? <Square size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}{speaking ? t('notes.stopReading') : t('notes.readAloud')}</button>}
          {busy ? <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => ctl.current?.abort()}><Square size={15} aria-hidden /> {t('common.stop')}</button>
            : <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => generate(true)}><RefreshCw size={15} aria-hidden /> {err ? t('common.tryAgain') : t('notes.newVersion')}</button>}
        </div>
      </div>

      {err && (
        <div className="grid gap-4" role="alert">
          <div className="flex items-start gap-4 rounded-card border border-line bg-surface2/50 p-4">
            <Vidya size={48} mood="think" className="shrink-0" />
            <div className="grid gap-1 text-sm"><b className="text-base">{t('notes.aiDown')}</b><span className="text-muted">{t('notes.aiDownBody')}</span>
              <span className="text-xs text-muted">{t('vl.reason', { msg: err })} · <Link href="/settings" className="font-semibold underline">{t('vl.checkAI')}</Link></span></div>
          </div>
          {topics.length > 0 && (
            <section aria-labelledby="notes-syl" className="grid gap-2">
              <h3 id="notes-syl" className="text-lg">{t('notes.fromSyllabus')}</h3>
              <ol className="grid gap-2">{topics.map((x, i) => <li key={i} className="flex gap-3 rounded-xl bg-surface2/70 px-4 py-2.5 text-sm"><span className="font-mono text-muted">{String(i + 1).padStart(2, '0')}</span><span>{x}</span></li>)}</ol>
            </section>
          )}
        </div>
      )}
      {!text && busy && <div className="grid gap-4" role="status"><p className="flex items-center gap-3 text-sm text-muted"><Dots /> {t('notes.writing')}</p><Skeleton lines={7} /></div>}
      {text && <article aria-busy={busy} className="mx-auto w-full max-w-[72ch]"><Markdown text={text} /></article>}
      {(text && !busy) || err ? (
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Link href={`/student/practice/${encodeURIComponent(unitId)}`} className="btn-primary"><Target size={17} aria-hidden /> {t('notes.practise')}</Link>
          {hasLab && <button className="btn-ghost" onClick={onLab}><FlaskConical size={17} aria-hidden /> {t('notes.lab')}</button>}
        </div>
      ) : null}
    </div>
  );
}
