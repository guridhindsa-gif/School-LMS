'use client';
import Link from 'next/link';
import { CheckCircle2, RefreshCw, XCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/AppShell';
import { Dots } from '@/components/ui';

interface Health { ok: boolean; host: string; model: string; cloud: boolean; hasKey: boolean; models?: string[]; modelAvailable?: boolean; error?: string }

export default function SettingsPage() {
  const [h, setH] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); fetch('/api/ai/health').then(r => r.json()).then(setH).catch(() => setH(null)).finally(() => setLoading(false)); };
  useEffect(load, []);

  return (
    <main className="mx-auto grid max-w-3xl gap-6 py-8" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="flex items-center justify-between">
        <Link href="/student" className="btn-ghost text-sm"><ArrowLeft size={16} /> Back</Link>
        <ThemeToggle />
      </div>
      <h1 className="text-3xl">Settings &amp; AI connection</h1>

      <section className="card grid gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl">Ollama</h2>
          <button className="btn-ghost text-sm" onClick={load}><RefreshCw size={15} /> Check again</button>
        </div>
        {loading && <p className="flex items-center gap-2 text-muted"><Dots /> Checking…</p>}
        {!loading && h && (
          <div className="grid gap-3">
            <p className={`flex items-center gap-2 font-semibold ${h.ok ? 'text-good' : 'text-bad'}`}>
              {h.ok ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
              {h.ok ? 'Connected' : 'Not connected'}
            </p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-surface2 px-3 py-2"><dt className="text-muted">Server</dt><dd className="font-mono break-all">{h.host}</dd></div>
              <div className="rounded-xl bg-surface2 px-3 py-2"><dt className="text-muted">Model</dt><dd className="font-mono">{h.model}{h.ok && h.modelAvailable === false ? ' (not found on server)' : ''}</dd></div>
              <div className="rounded-xl bg-surface2 px-3 py-2"><dt className="text-muted">Mode</dt><dd>{h.cloud ? 'Ollama Cloud' : 'Local / self-hosted'}</dd></div>
              <div className="rounded-xl bg-surface2 px-3 py-2"><dt className="text-muted">API key</dt><dd>{h.hasKey ? 'Set (hidden)' : 'Not set'}</dd></div>
            </dl>
            {h.models && h.models.length > 0 && <p className="text-sm text-muted">Models on this server: {h.models.join(', ')}</p>}
          </div>
        )}
        <div className="grid gap-2 rounded-xl border border-line p-4 text-sm">
          <b>How to connect</b>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Copy <code className="rounded bg-surface2 px-1">.env.example</code> to <code className="rounded bg-surface2 px-1">.env.local</code> in the project folder.</li>
            <li><b>Ollama Cloud:</b> paste your key into <code className="rounded bg-surface2 px-1">OLLAMA_API_KEY</code> and pick a model such as <code className="rounded bg-surface2 px-1">gpt-oss:20b</code>.</li>
            <li><b>Local Ollama:</b> run <code className="rounded bg-surface2 px-1">ollama serve</code>, pull a model (<code className="rounded bg-surface2 px-1">ollama pull llama3.1:8b</code>) and set <code className="rounded bg-surface2 px-1">OLLAMA_HOST=http://127.0.0.1:11434</code>.</li>
            <li>Restart <code className="rounded bg-surface2 px-1">npm run dev</code>. The key stays on the server and never reaches the browser.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
