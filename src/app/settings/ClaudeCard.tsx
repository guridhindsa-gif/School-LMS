'use client';
import { CheckCircle2, Eye, EyeOff, KeyRound, Sparkles, Trash2, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Dots, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { CLAUDE_MODEL_OPTIONS, maskKey, useAiSettings } from '@/lib/ai-settings';

const KEY_RE = /^sk-ant-[A-Za-z0-9_\-]{20,300}$/;
const MODEL_KEY: Record<string, string> = { 'claude-sonnet-5-5': 'claude.mSonnet', 'claude-haiku-5-5': 'claude.mHaiku', 'claude-opus-5-5': 'claude.mOpus' };

type Test = { ok: boolean; msg: string } | null;

/** "Use my own Claude": the user adds their Claude API key so AI runs on their Claude account. */
export function ClaudeCard({ onChange }: { onChange: () => void }) {
  const { t } = useT();
  const s = useAiSettings();
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<Test>(null);
  const [sure, setSure] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function check(key: string, model: string) {
    setTesting(true); setTest(null);
    try {
      const r = await fetch('/api/ai/health', { headers: { 'x-claude-key': key, 'x-claude-model': model }, cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (j.ok && j.modelAvailable !== false) setTest({ ok: true, msg: t('claude.testOk', { model }) });
      else if (j.ok) setTest({ ok: false, msg: t('claude.testNoModel', { model }) });
      else setTest({ ok: false, msg: j.code === 'claude_key' ? t('ai.claudeKey') : j.code === 'claude_billing' ? t('ai.claudeBilling') : j.code === 'rate_limited' ? t('ai.rateLimited') : j.error || t('claude.testFail') });
      return !!j.ok;
    } catch { setTest({ ok: false, msg: t('claude.testFail') }); return false; }
    finally { setTesting(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const k = draft.trim();
    if (!KEY_RE.test(k)) { setErr(t('claude.errKey')); inputRef.current?.focus(); return; }
    setErr('');
    s.setClaude({ claudeKey: k, useClaude: true });
    setDraft('');
    await check(k, s.claudeModel);
    onChange();
  }

  const on = s.useClaude && !!s.claudeKey;
  return (
    <section className="card grid gap-5 p-6" aria-labelledby="claude-h">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-ctl bg-violet/15 text-violet" aria-hidden><Sparkles size={19} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="claude-h" className="text-xl">{t('claude.title')}</h2>
          <p className="text-sm text-muted">{t('claude.desc')}</p>
        </div>
        {s.claudeKey && (
          <button role="switch" aria-checked={on} onClick={() => { s.setClaude({ useClaude: !on }); setTest(null); onChange(); }}
            className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm font-semibold">
            <span className={cx('relative h-5 w-9 rounded-full transition', on ? 'bg-good' : 'bg-surface3')}><span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-[1.15rem]' : 'left-0.5')} /></span>
            {on ? t('claude.on') : t('claude.off')}
          </button>
        )}
      </div>

      <div className={cx('rounded-ctl px-4 py-3 text-sm', on ? 'bg-good/10' : 'bg-surface2')} role="status">
        <b>{on ? t('claude.statusOn', { model: s.claudeModel }) : t('claude.statusOff')}</b>
      </div>

      {s.claudeKey ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3 rounded-ctl border border-line px-4 py-3">
            <KeyRound size={17} className="text-muted" aria-hidden />
            <span className="min-w-0 flex-1"><span className="text-sm text-muted">{t('claude.savedKey')}</span> <code className="font-mono text-sm">{maskKey(s.claudeKey)}</code></span>
            <button className="btn-ghost h-9 min-h-0 text-sm" onClick={() => check(s.claudeKey, s.claudeModel)} disabled={testing}>{t('claude.test')}</button>
            {sure
              ? <button className="btn-soft h-9 min-h-0 text-sm text-bad" autoFocus onClick={() => { s.forgetKey(); setSure(false); setTest(null); onChange(); }}><Trash2 size={15} aria-hidden /> {t('claude.removeSure')}</button>
              : <button className="btn-soft h-9 min-h-0 text-sm" onClick={() => setSure(true)}><Trash2 size={15} aria-hidden /> {t('claude.remove')}</button>}
          </div>
          <div className="grid gap-1.5 sm:max-w-sm">
            <label htmlFor="claude-model" className="font-semibold">{t('claude.model')}</label>
            <select id="claude-model" className="input" value={s.claudeModel} onChange={e => { s.setClaude({ claudeModel: e.target.value }); setTest(null); onChange(); }}>
              {CLAUDE_MODEL_OPTIONS.map(m => <option key={m} value={m}>{t(MODEL_KEY[m])}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <form onSubmit={save} noValidate className="grid gap-2">
          <label htmlFor="claude-key" className="font-semibold">{t('claude.keyLabel')}</label>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full min-w-0 sm:w-auto sm:flex-1">
              <input ref={inputRef} id="claude-key" className="input w-full pr-11 font-mono" type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false}
                placeholder="sk-ant-…" value={draft} onChange={e => setDraft(e.target.value)}
                aria-invalid={err ? 'true' : undefined} aria-describedby={`claude-key-hint${err ? ' claude-key-err' : ''}`} />
              <button type="button" className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-ctl text-muted hover:text-ink" onClick={() => setShow(v => !v)} aria-label={show ? t('claude.hide') : t('claude.show')} aria-pressed={show}>
                {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
              </button>
            </div>
            <button type="submit" className="btn-primary" disabled={testing}><KeyRound size={16} aria-hidden /> {t('claude.save')}</button>
          </div>
          {err && <p id="claude-key-err" className="text-sm text-bad" role="alert">{err}</p>}
          <p id="claude-key-hint" className="text-sm text-muted">{t('claude.keyHint')}</p>
        </form>
      )}

      <div aria-live="polite">
        {testing && <p className="flex items-center gap-2 text-sm text-muted"><Dots /> {t('claude.testing')}</p>}
        {test && <p className={cx('flex items-start gap-2 text-sm font-semibold', test.ok ? 'text-good' : 'text-bad')}>{test.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden /> : <XCircle size={17} className="mt-0.5 shrink-0" aria-hidden />}{test.msg}</p>}
      </div>

      <details className="rounded-ctl border border-line p-4 text-sm">
        <summary className="cursor-pointer font-semibold">{t('claude.howTitle')}</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          {['claude.how1', 'claude.how2', 'claude.how3', 'claude.how4'].map(k => <li key={k}>{t(k)}</li>)}
        </ol>
        <p className="mt-3 text-muted">{t('claude.billing')}</p>
      </details>
      <p className="text-xs text-muted">{t('claude.privacy')}</p>
    </section>
  );
}
