'use client';
import Link from 'next/link';
import { CheckCircle2, RefreshCw, XCircle, ArrowLeft, Cpu, Languages, HardDrive, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo, ThemeToggle } from '@/components/AppShell';
import { Dots, Notice, cx } from '@/components/ui';
import { useHydrated, useLMS } from '@/lib/store';

interface Health { ok: boolean; host: string; model: string; cloud: boolean; hasKey: boolean; models?: string[]; modelAvailable?: boolean; error?: string }
const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };
const LANGS = [['en', 'English'], ['hi', 'हिंदी'], ['pa', 'ਪੰਜਾਬੀ']] as const;

export default function SettingsPage() {
  const [h, setH] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const hydrated = useHydrated();
  const lang = useLMS(s => s.profile.language);
  const setProfile = useLMS(s => s.setProfile);
  const load = () => {
    setLoading(true); setFailed(false);
    fetch('/api/ai/health').then(r => r.json()).then(setH).catch(() => { setH(null); setFailed(true); }).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const warnModel = h?.ok && h.modelAvailable === false;

  return (
    <div className="min-h-dvh">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 py-3" style={pad}>
          <Link href="/student" className="btn-ghost text-sm"><ArrowLeft size={16} /> Back to learning</Link>
          <span className="ml-auto"><Logo size={32} /></span>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto grid max-w-3xl gap-6 py-8 outline-none" style={pad}>
        <div className="grid gap-1.5"><p className="eyebrow">Settings</p><h1 className="h-page">Settings &amp; AI connection</h1></div>

        <section className="card grid gap-5 p-6" aria-labelledby="ai-h">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-ctl bg-primary/10 text-primary"><Cpu size={19} /></span>
            <div className="min-w-0 flex-1"><h2 id="ai-h" className="text-xl">AI model (Ollama)</h2><p className="text-sm text-muted">Powers Vidya, picture lessons and question generation.</p></div>
            <button className="btn-ghost text-sm" onClick={load} disabled={loading}><RefreshCw size={15} className={cx(loading && 'animate-spin')} /> Check again</button>
          </div>

          {loading && <p className="flex items-center gap-2 text-muted" role="status"><Dots /> Checking the connection…</p>}
          {!loading && failed && <Notice tone="error" title="Could not reach the app server">The health check did not respond. Make sure <code>npm run dev</code> (or the production server) is running, then check again.</Notice>}
          {!loading && h && (
            <div className="grid gap-3">
              <div role="status" className={cx('flex items-center gap-3 rounded-ctl border px-4 py-3', h.ok && !warnModel ? 'border-good/30 bg-good/10' : h.ok ? 'border-accent/40 bg-accent/10' : 'border-bad/30 bg-bad/10')}>
                {h.ok && !warnModel ? <CheckCircle2 size={22} className="text-good" /> : h.ok ? <AlertTriangle size={22} className="text-warn" /> : <XCircle size={22} className="text-bad" />}
                <div>
                  <b className={h.ok && !warnModel ? 'text-good' : h.ok ? 'text-warn' : 'text-bad'}>{h.ok && !warnModel ? 'Connected' : h.ok ? 'Connected, but the model was not found' : 'Not connected'}</b>
                  <p className="text-sm text-muted">{h.ok && !warnModel ? 'AI features are ready.' : h.ok ? `Pull or choose a model that exists on this server.` : (h.error || 'AI features will show an error until the server is reachable.')}</p>
                </div>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">Server</dt><dd className="break-all font-mono">{h.host}</dd></div>
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">Model</dt><dd className="font-mono">{h.model}</dd></div>
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">Mode</dt><dd>{h.cloud ? 'Ollama Cloud' : 'Local / self-hosted'}</dd></div>
                <div className="rounded-ctl bg-surface2 px-3 py-2"><dt className="text-muted">API key</dt><dd>{h.hasKey ? 'Set on the server (hidden)' : 'Not set'}</dd></div>
              </dl>
              {h.models && h.models.length > 0 && <p className="text-sm text-muted">Models on this server: {h.models.join(', ')}</p>}
            </div>
          )}
          <details className="group rounded-ctl border border-line p-4 text-sm" open={!loading && !!h && !h.ok}>
            <summary className="cursor-pointer font-semibold">How to connect</summary>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5">
              <li>Copy <code className="rounded bg-surface2 px-1">.env.example</code> to <code className="rounded bg-surface2 px-1">.env.local</code> in the project folder.</li>
              <li><b>Ollama Cloud:</b> paste your key into <code className="rounded bg-surface2 px-1">OLLAMA_API_KEY</code> and pick a model such as <code className="rounded bg-surface2 px-1">gpt-oss:20b</code>.</li>
              <li><b>Local Ollama:</b> run <code className="rounded bg-surface2 px-1">ollama serve</code>, pull a model (<code className="rounded bg-surface2 px-1">ollama pull llama3.1:8b</code>) and set <code className="rounded bg-surface2 px-1">OLLAMA_HOST=http://127.0.0.1:11434</code>.</li>
              <li>Restart <code className="rounded bg-surface2 px-1">npm run dev</code>. The key stays on the server and never reaches the browser.</li>
            </ol>
          </details>
        </section>

        <section className="card grid gap-4 p-6" aria-labelledby="lang-h">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-ctl bg-teal/12 text-teal"><Languages size={19} /></span>
            <div><h2 id="lang-h" className="text-xl">Learning language</h2><p className="text-sm text-muted">Used for AI lessons, narration and the tutor.</p></div>
          </div>
          {hydrated && (
            <div className="seg w-fit" role="radiogroup" aria-labelledby="lang-h">
              {LANGS.map(([id, label]) => <button key={id} role="radio" aria-checked={lang === id} onClick={() => setProfile({ language: id })}>{label}</button>)}
            </div>
          )}
        </section>

        <section className="card grid gap-3 p-6" aria-labelledby="data-h">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-ctl bg-accent/15 text-warn"><HardDrive size={19} /></span>
            <div><h2 id="data-h" className="text-xl">Your data</h2><p className="text-sm text-muted">Where progress is kept today.</p></div>
          </div>
          <p className="text-sm">Your profile, mastery, streaks and practice history are saved <b>in this browser only</b>, and tutor conversations last only for the current visit. Nothing syncs to other devices until your school connects a data server.</p>
          <Link href="/student/progress" className="btn-ghost justify-self-start text-sm">View or reset progress</Link>
        </section>
      </main>
    </div>
  );
}
