'use client';
import Link from 'next/link';
import { CheckCircle2, RefreshCw, XCircle, Cpu, Languages, HardDrive, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dots, Notice, PageHeader, cx } from '@/components/ui';
import { useHydrated, useLMS } from '@/lib/store';
import { LANGS, useT } from '@/lib/i18n';
import { aiHeaders } from '@/lib/ai-settings';
import { ClaudeCard } from './ClaudeCard';

interface Health { ok: boolean; host: string; model: string; cloud: boolean; hasKey: boolean; models?: string[]; modelAvailable?: boolean; error?: string; provider?: 'ollama' | 'claude'; own?: boolean; code?: string }

const code = (s: string) => s.split(/(\.env\.example|\.env\.local|OLLAMA_API_KEY|OLLAMA_HOST=http:\/\/127\.0\.0\.1:11434|gpt-oss:20b|ollama serve|ollama pull llama3\.1:8b|npm run dev)/).map((p, i) => (i % 2 ? <code key={i} className="rounded bg-surface2 px-1">{p}</code> : p));

export default function SettingsPage() {
  const [h, setH] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const hydrated = useHydrated();
  const { t } = useT();
  const lang = useLMS(s => s.profile.language);
  const setProfile = useLMS(s => s.setProfile);
  const load = () => {
    setLoading(true); setFailed(false);
    fetch('/api/ai/health', { headers: aiHeaders(), cache: 'no-store' }).then(r => r.json()).then(setH).catch(() => { setH(null); setFailed(true); }).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const warnModel = h?.ok && h.modelAvailable === false;
  const good = h?.ok && !warnModel;

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} />

      <section className="card grid gap-5 p-6" aria-labelledby="ai-h">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-ctl bg-primary/10 text-primary" aria-hidden><Cpu size={19} /></span>
          <div className="min-w-0 flex-1"><h2 id="ai-h" className="text-xl">{t('settings.ai')}</h2><p className="text-sm text-muted">{t('settings.aiDesc')}</p></div>
          <button className="btn-ghost text-sm" onClick={load} disabled={loading}><RefreshCw size={15} aria-hidden className={cx(loading && 'animate-spin')} /> {t('settings.checkAgain')}</button>
        </div>

        <div aria-live="polite">
          {loading && <p className="flex items-center gap-2 text-muted"><Dots /> {t('settings.checking')}</p>}
          {!loading && failed && <Notice tone="error" title={t('settings.noServer')}>{t('settings.noServerDesc')}</Notice>}
          {!loading && h && (
            <div className="grid gap-3">
              <div className={cx('flex items-center gap-3 rounded-ctl border px-4 py-3', good ? 'border-good/30 bg-good/10' : h.ok ? 'border-accent/40 bg-accent/10' : 'border-bad/30 bg-bad/10')}>
                {good ? <CheckCircle2 size={22} className="text-good" aria-hidden /> : h.ok ? <AlertTriangle size={22} className="text-warn" aria-hidden /> : <XCircle size={22} className="text-bad" aria-hidden />}
                <div>
                  <b className={good ? 'text-good' : h.ok ? 'text-warn' : 'text-bad'}>{good ? t('settings.connected') : h.ok ? t('settings.noModel') : t('settings.notConnected')}</b>
                  <p className="text-sm text-muted">{good ? t('settings.ready') : h.ok ? (h.provider === 'claude' ? t('claude.testNoModel', { model: h.model }) : t('settings.pullModel')) : (h.error || t('settings.untilReachable'))}</p>
                </div>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">{t('settings.server')}</dt><dd className="break-all font-mono">{h.host}</dd></div>
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">{t('settings.model')}</dt><dd className="break-all font-mono">{h.model}</dd></div>
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">{t('settings.mode')}</dt><dd>{h.provider === 'claude' ? (h.own ? t('claude.modeOwn') : t('claude.modeSchool')) : h.cloud ? t('settings.cloud') : t('settings.local')}</dd></div>
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">{t('settings.key')}</dt><dd>{h.hasKey ? t('settings.keySet') : t('settings.keyNot')}</dd></div>
              </dl>
              {h.models && h.models.length > 0 && <p className="text-sm text-muted">{t('settings.models', { list: h.models.join(', ') })}</p>}
            </div>
          )}
        </div>
        {h?.provider !== 'claude' && <details className="group rounded-ctl border border-line p-4 text-sm" open={!loading && (failed || (!!h && !h.ok))}>
          <summary className="cursor-pointer font-semibold">{t('settings.how')}</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            {['settings.how1', 'settings.how2', 'settings.how3', 'settings.how4'].map(k => <li key={k}>{code(t(k))}</li>)}
          </ol>
        </details>}
      </section>

      {hydrated && <ClaudeCard onChange={load} />}

      <section className="card grid gap-4 p-6" aria-labelledby="lang-h">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-ctl bg-teal/12 text-teal" aria-hidden><Languages size={19} /></span>
          <div><h2 id="lang-h" className="text-xl">{t('settings.lang')}</h2><p className="text-sm text-muted">{t('settings.langDesc')}</p></div>
        </div>
        {hydrated && (
          <div className="seg w-fit flex-wrap" role="radiogroup" aria-labelledby="lang-h">
            {LANGS.map(l => <button key={l.id} role="radio" aria-checked={lang === l.id} lang={l.id} onClick={() => setProfile({ language: l.id })}>{l.label}</button>)}
          </div>
        )}
      </section>

      <section className="card grid gap-3 p-6" aria-labelledby="data-h">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-ctl bg-accent/15 text-warn" aria-hidden><HardDrive size={19} /></span>
          <div><h2 id="data-h" className="text-xl">{t('settings.data')}</h2><p className="text-sm text-muted">{t('settings.dataDesc')}</p></div>
        </div>
        <p className="text-sm">{t('settings.dataBody')}</p>
        <Link href="/student/progress" className="btn-ghost justify-self-start text-sm">{t('settings.viewProgress')}</Link>
      </section>
    </div>
  );
}
