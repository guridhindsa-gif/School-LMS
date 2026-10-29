'use client';
import { useMemo, useRef, useState } from 'react';
import { ExternalLink, Flag, Search, X } from 'lucide-react';
import { Empty, PageHeader, VerifiedPill, cx, host } from '@/components/ui';
import { FlagPanel } from './FlagPanel';
import { useSchool, useSchoolHydrated } from '@/lib/school-store';

export interface CatalogRow { id: string; board: string; cls: number; name: string; verified: string; session: string; src: string; units: number }

const TAGS = ['Board', 'Class', 'Subject → unit → chapter', 'Exam relevance', 'Question type', 'Difficulty', 'Bloom level'];
const BLUEPRINTS: Record<string, [string, string][]> = {
  'CBSE Class 10 (80 + 20)': [['Theory paper', '80 marks · 3 h · MCQ, short, long, case-based'], ['Internal assessment', '20 marks · periodic tests, portfolio, lab']],
  'ICSE Class 10': [['Groups I and II', '80 external + 20 internal'], ['Group III', '50 external + 50 internal']],
  'JEE Main Paper 1': [['Questions', '75 · 25 per subject (20 MCQ + 5 numerical)'], ['Marks', '300 · +4 / −1 · 3 hours']],
  'NEET-UG': [['Questions', '180 · Physics 45, Chemistry 45, Biology 90'], ['Marks', '720 · +4 / −1 · 3 hours · OMR']],
};
const STATUS: [string, string, string][] = [['official', 'Official', 'text-good'], ['partly_official', 'Partly verified', 'text-primary'], ['secondary_only', 'Verify', 'text-warn'], ['draft', 'Draft (from LMS doc)', 'text-warn']];

export function AdminView({ rows, generated }: { rows: CatalogRow[]; generated: string }) {
  const [board, setBoard] = useState('All');
  const [cls, setCls] = useState('All');
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [bp, setBp] = useState(Object.keys(BLUEPRINTS)[0]);
  const [flagFor, setFlagFor] = useState<CatalogRow | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const hydrated = useSchoolHydrated();
  const flags = useSchool(s => s.flags);
  const flagged = useMemo(() => new Set(hydrated ? flags.map(f => f.subjectId) : []), [flags, hydrated]);

  const boards = ['All', ...Array.from(new Set(rows.map(r => r.board))).sort()];
  const classes = ['All', ...Array.from(new Set(rows.map(r => r.cls))).sort((a, b) => a - b).map(String)];
  const list = useMemo(() => rows.filter(r => (board === 'All' || r.board === board) && (cls === 'All' || String(r.cls) === cls) && (status === 'All' || (status === 'empty' ? !r.units : r.verified === status)) && (!q || r.name.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => a.board.localeCompare(b.board) || a.cls - b.cls || a.name.localeCompare(b.name)), [rows, board, cls, status, q]);
  const counts = useMemo(() => rows.reduce<Record<string, number>>((m, r) => { m[r.verified] = (m[r.verified] || 0) + 1; return m; }, {}), [rows]);
  const empty = rows.filter(r => !r.units).length;
  const filtered = board !== 'All' || cls !== 'All' || status !== 'All' || !!q;
  const clear = () => { setBoard('All'); setCls('All'); setStatus('All'); setQ(''); };
  const openFlag = (r: CatalogRow) => { setFlagFor(r); setTimeout(() => panel.current?.scrollIntoView({ block: 'nearest' }), 30); };

  return (
    <>
      <PageHeader eyebrow="Content and academic admin" title="Syllabus catalogue"
        desc={`${rows.length} subjects across CBSE, CISCE, ICSE and ISC · data built ${generated}. Every subject keeps its source, session and verification status.`} />

      {/* Verification overview doubles as a filter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Filter by verification status">
        {STATUS.map(([k, l, c]) => (
          <button key={k} aria-pressed={status === k} onClick={() => setStatus(status === k ? 'All' : k)}
            className={cx('card card-hover grid gap-1 p-4 text-left', status === k && 'border-primary ring-2 ring-primary/40')}>
            <span className="text-sm text-muted">{l}</span><b className={cx('font-display text-3xl', c)}>{counts[k] || 0}</b>
          </button>
        ))}
        <button aria-pressed={status === 'empty'} onClick={() => setStatus(status === 'empty' ? 'All' : 'empty')}
          className={cx('card card-hover grid gap-1 p-4 text-left', status === 'empty' && 'border-primary ring-2 ring-primary/40')}>
          <span className="text-sm text-muted">No units yet</span><b className="font-display text-3xl text-bad">{empty}</b>
        </button>
      </div>

      <section className="card grid gap-4 p-4 sm:p-5" aria-labelledby="cat-title">
        <h2 id="cat-title" className="sr-only">Catalogue</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <span className="sr-only">Search subjects</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input className="input pl-9" placeholder="Search subjects" value={q} onChange={e => setQ(e.target.value)} />
          </label>
          <label className="grid gap-0.5 text-xs font-semibold text-muted">Board<select className="input w-auto text-sm text-ink" value={board} onChange={e => setBoard(e.target.value)}>{boards.map(b => <option key={b}>{b}</option>)}</select></label>
          <label className="grid gap-0.5 text-xs font-semibold text-muted">Class<select className="input w-auto text-sm text-ink" value={cls} onChange={e => setCls(e.target.value)}>{classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All' : `Class ${c}`}</option>)}</select></label>
          <label className="grid gap-0.5 text-xs font-semibold text-muted">Status<select className="input w-auto text-sm text-ink" value={status} onChange={e => setStatus(e.target.value)}><option value="All">All</option>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}<option value="empty">No units yet</option></select></label>
          {filtered && <button className="btn-ghost min-h-10 text-sm" onClick={clear}><X size={14} /> Clear filters</button>}
          <span className="ml-auto self-center text-sm text-muted" aria-live="polite">{list.length} of {rows.length} shown</span>
        </div>

        {!list.length ? (
          <Empty title="No subjects match" action={<button className="btn-ghost" onClick={clear}>Clear filters</button>}>Try another board, class or status, or a shorter search.</Empty>
        ) : (
          <div className="max-h-[560px] overflow-auto rounded-ctl border border-line">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="sticky top-0 z-10 bg-surface2 text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="p-2.5">Board</th><th className="p-2.5">Class</th><th className="p-2.5">Subject</th><th className="p-2.5">Units</th><th className="p-2.5">Status</th><th className="p-2.5">Session</th><th className="p-2.5">Source</th><th className="p-2.5"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {list.slice(0, 300).map(r => (
                  <tr key={r.id} className={cx('border-t border-line', flagFor?.id === r.id && 'bg-primary/[.06]')}>
                    <td className="p-2.5 font-mono text-xs">{r.board}</td><td className="p-2.5 tabular-nums">{r.cls}</td>
                    <td className="p-2.5 font-semibold">{r.name}{flagged.has(r.id) && <span className="pill ml-2 bg-accent/15 text-warn"><Flag size={10} aria-hidden />Flagged</span>}</td>
                    <td className={cx('p-2.5 tabular-nums', !r.units && 'font-bold text-bad')}>{r.units}</td>
                    <td className="p-2.5"><VerifiedPill v={r.verified} /></td><td className="p-2.5 text-xs text-muted">{r.session || '—'}</td>
                    <td className="p-2.5">{r.src ? <a href={r.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{host(r.src)} <ExternalLink size={11} aria-hidden /><span className="sr-only">(opens in a new tab)</span></a> : <span className="text-muted">No source</span>}</td>
                    <td className="p-2.5"><button className="btn-ghost min-h-8 px-2.5 py-1 text-xs" onClick={() => openFlag(r)} aria-label={`Flag ${r.board} Class ${r.cls} ${r.name} for review`}><Flag size={12} /> Flag</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 300 && <p className="p-3 text-center text-sm text-muted">Showing the first 300. Narrow the filters to see the rest.</p>}
          </div>
        )}
      </section>

      <div ref={panel} className="scroll-mt-28"><FlagPanel rows={rows} subject={flagFor} onPick={setFlagFor} /></div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="tags-title">
          <h2 id="tags-title" className="text-lg">Question tags on every item</h2>
          <div className="flex flex-wrap gap-2">{TAGS.map(t => <span key={t} className="pill bg-surface2 text-ink">{t}</span>)}</div>
          <p className="text-sm text-muted">One tagged bank serves board courses and entrance tracks without duplicating content. AI-generated items carry difficulty, topic and per-option misconception notes.</p>
        </section>
        <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="bp-title">
          <h2 id="bp-title" className="text-lg">Examination blueprint</h2>
          <label className="grid gap-1 text-sm font-semibold">Paper<select className="input" value={bp} onChange={e => setBp(e.target.value)}>{Object.keys(BLUEPRINTS).map(k => <option key={k}>{k}</option>)}</select></label>
          <dl className="grid gap-2">{BLUEPRINTS[bp].map(([a, b]) => <div key={a} className="rounded-ctl bg-surface2 px-3 py-2"><dt className="font-semibold">{a}</dt><dd className="text-sm text-muted">{b}</dd></div>)}</dl>
        </section>
      </div>
    </>
  );
}
