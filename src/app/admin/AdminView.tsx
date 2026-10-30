'use client';
import { useMemo, useRef, useState } from 'react';
import { ExternalLink, Flag, Search, X } from 'lucide-react';
import { Empty, PageHeader, VerifiedPill, cx, host } from '@/components/ui';
import { FlagPanel } from './FlagPanel';
import { useT } from '@/lib/i18n';
import { useSchool, useSchoolHydrated } from '@/lib/school-store';

export interface CatalogRow { id: string; board: string; cls: number; name: string; verified: string; session: string; src: string; units: number }

const TAGS = ['board', 'class', 'path', 'exam', 'qtype', 'difficulty', 'bloom'];
/** Paper names are proper nouns; each row is [label key, detail key]. */
const BLUEPRINTS: Record<string, [string, string][]> = {
  'CBSE Class 10 (80 + 20)': [['admin.bp.theory', 'admin.bp.theoryD'], ['admin.bp.internal', 'admin.bp.internalD']],
  'ICSE Class 10': [['admin.bp.g12', 'admin.bp.g12D'], ['admin.bp.g3', 'admin.bp.g3D']],
  'JEE Main Paper 1': [['admin.bp.questions', 'admin.bp.jeeQ'], ['admin.bp.marks', 'admin.bp.jeeM']],
  'NEET-UG': [['admin.bp.questions', 'admin.bp.neetQ'], ['admin.bp.marks', 'admin.bp.neetM']],
};
const STATUS: [string, string][] = [['official', 'text-good'], ['partly_official', 'text-primary'], ['secondary_only', 'text-warn'], ['draft', 'text-warn']];

export function AdminView({ rows, generated }: { rows: CatalogRow[]; generated: string }) {
  const { t, locale } = useT();
  const all = t('admin.all');
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
      <PageHeader eyebrow={t('admin.eyebrow')} title={t('admin.title')}
        desc={t('admin.desc', { n: rows.length.toLocaleString(locale), date: generated })} />

      {/* Verification overview doubles as a filter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label={t('admin.filterStatus')}>
        {STATUS.map(([k, c]) => (
          <button key={k} aria-pressed={status === k} onClick={() => setStatus(status === k ? 'All' : k)}
            className={cx('card card-hover grid gap-1 p-4 text-left', status === k && 'border-primary ring-2 ring-primary/40')}>
            <span className="text-sm text-muted">{t(`admin.st.${k}`)}</span><b className={cx('font-display text-3xl', c)}>{counts[k] || 0}</b>
          </button>
        ))}
        <button aria-pressed={status === 'empty'} onClick={() => setStatus(status === 'empty' ? 'All' : 'empty')}
          className={cx('card card-hover grid gap-1 p-4 text-left', status === 'empty' && 'border-primary ring-2 ring-primary/40')}>
          <span className="text-sm text-muted">{t('admin.st.empty')}</span><b className="font-display text-3xl text-warn">{empty}</b>
        </button>
      </div>

      <section className="card grid gap-4 p-4 sm:p-5" aria-labelledby="cat-title">
        <h2 id="cat-title" className="sr-only">{t('admin.catalogue')}</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <span className="sr-only">{t('admin.search')}</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input className="input pl-9" placeholder={t('admin.search')} value={q} onChange={e => setQ(e.target.value)} />
          </label>
          <label className="grid gap-0.5 text-xs font-semibold text-muted">{t('admin.board')}<select className="input w-auto text-sm text-ink" value={board} onChange={e => setBoard(e.target.value)}>{boards.map(b => <option key={b} value={b}>{b === 'All' ? all : b}</option>)}</select></label>
          <label className="grid gap-0.5 text-xs font-semibold text-muted">{t('admin.class')}<select className="input w-auto text-sm text-ink" value={cls} onChange={e => setCls(e.target.value)}>{classes.map(c => <option key={c} value={c}>{c === 'All' ? all : t('shell.class', { n: c })}</option>)}</select></label>
          <label className="grid gap-0.5 text-xs font-semibold text-muted">{t('admin.status')}<select className="input w-auto text-sm text-ink" value={status} onChange={e => setStatus(e.target.value)}><option value="All">{all}</option>{STATUS.map(([k]) => <option key={k} value={k}>{t(`admin.st.${k}`)}</option>)}<option value="empty">{t('admin.st.empty')}</option></select></label>
          {filtered && <button className="btn-ghost min-h-10 text-sm" onClick={clear}><X size={14} aria-hidden /> {t('admin.clear')}</button>}
          <span className="ml-auto self-center text-sm text-muted" aria-live="polite">{t('admin.shown', { n: list.length, total: rows.length })}</span>
        </div>

        {!list.length ? (
          <Empty title={t('admin.noMatch')} action={<button className="btn-ghost" onClick={clear}>{t('admin.clear')}</button>}>{t('admin.noMatchBody')}</Empty>
        ) : (
          <div className="max-h-[560px] overflow-auto rounded-ctl border border-line">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="sticky top-0 z-10 bg-surface2 text-left text-xs uppercase tracking-wide text-muted">
                <tr>{['board', 'class', 'subject', 'units', 'status', 'session', 'source'].map(h => <th key={h} scope="col" className="p-2.5">{t(`admin.th.${h}`)}</th>)}<th scope="col" className="p-2.5"><span className="sr-only">{t('admin.th.actions')}</span></th></tr>
              </thead>
              <tbody>
                {list.slice(0, 300).map(r => (
                  <tr key={r.id} className={cx('border-t border-line', flagFor?.id === r.id && 'bg-primary/[.06]')}>
                    <td className="p-2.5 font-mono text-xs">{r.board}</td><td className="p-2.5 tabular-nums">{r.cls}</td>
                    <td className="p-2.5 font-semibold">{r.name}{flagged.has(r.id) && <span className="pill ml-2 bg-accent/15 text-warn"><Flag size={10} aria-hidden />{t('admin.flagged')}</span>}</td>
                    <td className={cx('p-2.5 tabular-nums', !r.units && 'font-bold text-warn')}>{r.units}</td>
                    <td className="p-2.5"><VerifiedPill v={r.verified} /></td><td className="p-2.5 text-xs text-muted">{r.session || '—'}</td>
                    <td className="p-2.5">{r.src ? <a href={r.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{host(r.src)} <ExternalLink size={11} aria-hidden /><span className="sr-only">{t('admin.newTab')}</span></a> : <span className="text-muted">{t('admin.noSource')}</span>}</td>
                    <td className="p-2.5"><button className="btn-ghost min-h-8 px-2.5 py-1 text-xs" onClick={() => openFlag(r)} aria-label={t('admin.flagAria', { s: `${r.board} · ${t('shell.class', { n: r.cls })} · ${r.name}` })}><Flag size={12} aria-hidden /> {t('admin.flag')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 300 && <p className="p-3 text-center text-sm text-muted">{t('admin.first300')}</p>}
          </div>
        )}
      </section>

      <div ref={panel} className="scroll-mt-28"><FlagPanel rows={rows} subject={flagFor} onPick={setFlagFor} /></div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="tags-title">
          <h2 id="tags-title" className="text-lg">{t('admin.tags')}</h2>
          <div className="flex flex-wrap gap-2">{TAGS.map(k => <span key={k} className="pill bg-surface2 text-ink">{t(`admin.tag.${k}`)}</span>)}</div>
          <p className="text-sm text-muted">{t('admin.tagsNote')}</p>
        </section>
        <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="bp-title">
          <h2 id="bp-title" className="text-lg">{t('admin.bp')}</h2>
          <label className="grid gap-1 text-sm font-semibold">{t('admin.paper')}<select className="input" value={bp} onChange={e => setBp(e.target.value)}>{Object.keys(BLUEPRINTS).map(k => <option key={k}>{k}</option>)}</select></label>
          <dl className="grid gap-2">{BLUEPRINTS[bp].map(([a, b]) => <div key={a} className="rounded-ctl bg-surface2 px-3 py-2"><dt className="font-semibold">{t(a)}</dt><dd className="text-sm text-muted">{t(b)}</dd></div>)}</dl>
        </section>
      </div>
    </>
  );
}
