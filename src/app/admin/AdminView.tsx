'use client';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, Reveal, VerifiedPill, cx, host } from '@/components/ui';

export interface CatalogRow { id: string; board: string; cls: number; name: string; verified: string; session: string; src: string; units: number }

const TAGS = ['Board', 'Class', 'Subject → unit → chapter', 'Exam relevance', 'Question type', 'Difficulty', 'Bloom level'];
const BLUEPRINTS: Record<string, [string, string][]> = {
  'CBSE Class 10 (80 + 20)': [['Theory paper', '80 marks · 3 h · MCQ, short, long, case-based'], ['Internal assessment', '20 marks · periodic tests, portfolio, lab']],
  'ICSE Class 10': [['Groups I and II', '80 external + 20 internal'], ['Group III', '50 external + 50 internal']],
  'JEE Main Paper 1': [['Questions', '75 · 25 per subject (20 MCQ + 5 numerical)'], ['Marks', '300 · +4 / −1 · 3 hours']],
  'NEET-UG': [['Questions', '180 · Physics 45, Chemistry 45, Biology 90'], ['Marks', '720 · +4 / −1 · 3 hours · OMR']],
};

export function AdminView({ rows, generated }: { rows: CatalogRow[]; generated: string }) {
  const [board, setBoard] = useState('All');
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [bp, setBp] = useState(Object.keys(BLUEPRINTS)[0]);
  const boards = ['All', ...Array.from(new Set(rows.map(r => r.board)))];
  const list = useMemo(() => rows.filter(r => (board === 'All' || r.board === board) && (status === 'All' || r.verified === status) && (!q || r.name.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => a.board.localeCompare(b.board) || a.cls - b.cls || a.name.localeCompare(b.name)), [rows, board, status, q]);
  const counts = useMemo(() => rows.reduce<Record<string, number>>((m, r) => { m[r.verified] = (m[r.verified] || 0) + 1; return m; }, {}), [rows]);
  const empty = rows.filter(r => !r.units).length;

  return (
    <>
      <Reveal>
        <p className="eyebrow">Content and academic admin</p>
        <h1 className="text-3xl">Syllabus catalogue</h1>
        <p className="text-muted">{rows.length} subjects across CBSE, CISCE, ICSE and ISC · data built {generated}. Each subject keeps its source and verification status.</p>
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[['official', 'Official'], ['partly_official', 'Partly verified'], ['secondary_only', 'Verify'], ['draft', 'Draft (from LMS doc)']].map(([k, l]) => (
          <button key={k} onClick={() => setStatus(status === k ? 'All' : k)} className={cx('card grid gap-1 p-4 text-left', status === k && 'ring-2 ring-board')}>
            <span className="text-sm text-muted">{l}</span><b className="font-display text-3xl">{counts[k] || 0}</b>
          </button>
        ))}
        <div className="card grid gap-1 p-4"><span className="text-sm text-muted">No units yet</span><b className="font-display text-3xl text-warn">{empty}</b></div>
      </div>
      <Card className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <input id="admin-q" className="input max-w-xs" placeholder="Search subjects" value={q} onChange={e => setQ(e.target.value)} />
          <select className="input w-auto" value={board} onChange={e => setBoard(e.target.value)} aria-label="Board">{boards.map(b => <option key={b}>{b}</option>)}</select>
          <span className="ml-auto self-center text-sm text-muted">{list.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-muted"><tr><th className="p-2">Board</th><th className="p-2">Class</th><th className="p-2">Subject</th><th className="p-2">Units</th><th className="p-2">Status</th><th className="p-2">Session</th><th className="p-2">Source</th></tr></thead>
            <tbody>
              {list.slice(0, 300).map(r => (
                <tr key={r.id} className="border-t border-line">
                  <td className="p-2 font-mono text-xs">{r.board}</td><td className="p-2 tabular-nums">{r.cls}</td><td className="p-2 font-semibold">{r.name}</td>
                  <td className={cx('p-2 tabular-nums', !r.units && 'font-bold text-warn')}>{r.units}</td>
                  <td className="p-2"><VerifiedPill v={r.verified} /></td><td className="p-2 text-xs text-muted">{r.session}</td>
                  <td className="p-2">{r.src ? <a href={r.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky hover:underline">{host(r.src)} <ExternalLink size={11} /></a> : <span className="text-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="grid content-start gap-3">
          <h2 className="text-xl">Question tags (every item)</h2>
          <div className="flex flex-wrap gap-2">{TAGS.map(t => <span key={t} className="pill bg-surface2 text-ink">{t}</span>)}</div>
          <p className="text-sm text-muted">One tagged bank serves board courses and entrance tracks without duplicating content. AI-generated items carry difficulty, topic and per-option misconception notes.</p>
        </Card>
        <Card className="grid content-start gap-3">
          <h2 className="text-xl">Test-paper blueprint</h2>
          <select className="input" value={bp} onChange={e => setBp(e.target.value)} aria-label="Blueprint">{Object.keys(BLUEPRINTS).map(k => <option key={k}>{k}</option>)}</select>
          {BLUEPRINTS[bp].map(([a, b]) => <div key={a} className="rounded-xl bg-surface2 px-3 py-2"><b>{a}</b><p className="text-sm text-muted">{b}</p></div>)}
        </Card>
      </div>
    </>
  );
}
