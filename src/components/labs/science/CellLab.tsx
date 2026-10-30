'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cx } from '@/components/ui';
import { LabNote } from '../Slider';

type View = 'plant' | 'animal' | 'compare';
type Part = { id: string; x: number; y: number };
// Marker positions (in the 300×220 drawing) for each labelled part.
const PLANT: Part[] = [
  { id: 'wall', x: 22, y: 30 }, { id: 'membrane', x: 40, y: 60 }, { id: 'cytoplasm', x: 70, y: 175 }, { id: 'nucleus', x: 228, y: 62 },
  { id: 'vacuole', x: 150, y: 118 }, { id: 'chloroplast', x: 64, y: 98 }, { id: 'mitochondria', x: 246, y: 170 },
];
const ANIMAL: Part[] = [
  { id: 'membrane', x: 46, y: 70 }, { id: 'cytoplasm', x: 96, y: 160 }, { id: 'nucleus', x: 152, y: 108 },
  { id: 'mitochondria', x: 214, y: 150 }, { id: 'vacuole', x: 92, y: 98 }, { id: 'centrosome', x: 206, y: 74 }, { id: 'lysosome', x: 128, y: 178 },
];
const COMPARE: [string, boolean, boolean][] = [
  ['wall', true, false], ['membrane', true, true], ['nucleus', true, true], ['chloroplast', true, false],
  ['vacuole', true, true], ['centrosome', false, true], ['mitochondria', true, true],
];

/** Plant cell vs animal cell: tap a numbered part to learn what it does. */
export default function CellLab() {
  const { t } = useT();
  const [view, setView] = useState<View>('plant');
  const [sel, setSel] = useState<string | null>('nucleus');
  const parts = view === 'animal' ? ANIMAL : PLANT;
  const desc = sel ? t(`ls2.cell.d.${sel}${sel === 'vacuole' ? (view === 'animal' ? 'A' : 'P') : ''}`) : '';

  return (
    <div className="grid gap-4">
      <div className="seg w-fit" role="radiogroup" aria-label={t('ls2.cell.view')}>
        {(['plant', 'animal', 'compare'] as const).map(v => <button key={v} role="radio" aria-checked={view === v} onClick={() => { setView(v); setSel(v === 'compare' ? null : 'nucleus'); }}>{t(`ls2.cell.${v}`)}</button>)}
      </div>
      {view === 'compare' ? (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[320px] text-sm">
            <caption className="sr-only">{t('ls2.cell.compareCap')}</caption>
            <thead className="bg-surface2 text-left"><tr><th className="p-2.5">{t('ls2.cell.part')}</th><th className="p-2.5">{t('ls2.cell.plant')}</th><th className="p-2.5">{t('ls2.cell.animal')}</th></tr></thead>
            <tbody>
              {COMPARE.map(([id, p, a]) => (
                <tr key={id} className="border-t border-line">
                  <th scope="row" className="p-2.5 text-left font-semibold">{t(`ls2.cell.p.${id}`)}</th>
                  <td className="p-2.5">{id === 'vacuole' ? t('ls2.cell.vacPlant') : p ? t('ls2.cell.yes') : t('ls2.cell.no')}</td>
                  <td className="p-2.5">{id === 'vacuole' ? t('ls2.cell.vacAnimal') : id === 'centrosome' ? t('ls2.cell.yes') : a ? t('ls2.cell.yes') : t('ls2.cell.no')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <svg viewBox="0 0 300 220" className="w-full rounded-card border border-line bg-surface" role="img" aria-label={t(`ls2.cell.aria.${view}`)}>
            {view === 'plant' ? (
              <g>
                <rect x="12" y="12" width="276" height="196" rx="10" fill="#9fcf7a" stroke="#4d7c2b" strokeWidth="6" />
                <rect x="22" y="22" width="256" height="176" rx="8" fill="#e8f5d9" stroke="#6b9b3c" strokeWidth="2" />
                <ellipse cx="150" cy="118" rx="70" ry="50" fill="#c7e6f5" stroke="#5c9cc0" strokeWidth="2" />
                <circle cx="228" cy="62" r="24" fill="#c8a8e9" stroke="#7a4fb0" strokeWidth="2" /><circle cx="232" cy="60" r="7" fill="#7a4fb0" />
                {[[64, 98], [56, 150], [100, 58], [246, 120], [190, 176]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="12" ry="7" fill="#3f8f2f" />)}
                <ellipse cx="246" cy="170" rx="12" ry="6" fill="#f08a4b" />
              </g>
            ) : (
              <g>
                <path d="M40 110 C 30 50, 110 20, 170 32 S 280 60, 266 120 S 220 205, 140 198 S 48 170, 40 110 Z" fill="#fde4d0" stroke="#c97b4a" strokeWidth="2.5" />
                <circle cx="152" cy="108" r="26" fill="#c8a8e9" stroke="#7a4fb0" strokeWidth="2" /><circle cx="156" cy="106" r="8" fill="#7a4fb0" />
                <ellipse cx="214" cy="150" rx="13" ry="6" fill="#f08a4b" /><ellipse cx="90" cy="140" rx="12" ry="6" fill="#f08a4b" />
                <circle cx="92" cy="98" r="9" fill="#c7e6f5" stroke="#5c9cc0" />
                <g stroke="#5b4b8a" strokeWidth="3"><line x1="200" y1="68" x2="212" y2="68" /><line x1="206" y1="74" x2="206" y2="86" /></g>
                <circle cx="128" cy="178" r="6" fill="#e05d7a" />
              </g>
            )}
            {parts.map((p, i) => (
              <g key={p.id}>
                <circle cx={p.x} cy={p.y} r="11" fill={sel === p.id ? 'rgb(var(--accent))' : 'rgb(var(--night))'} stroke="#fff" strokeWidth="2" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={sel === p.id ? '#2b1b02' : '#fff'}>{i + 1}</text>
              </g>
            ))}
          </svg>
          <div className="grid gap-3">
            <ol className="grid gap-1.5" aria-label={t('ls2.cell.parts')}>
              {parts.map((p, i) => (
                <li key={p.id}><button onClick={() => setSel(p.id)} aria-pressed={sel === p.id}
                  className={cx('flex min-h-10 w-full items-center gap-2 rounded-ctl border px-3 text-left text-sm font-semibold', sel === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-surface')}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-night text-xs text-onnight">{i + 1}</span>{t(`ls2.cell.p.${p.id}`)}</button></li>
              ))}
            </ol>
            {sel && <p className="rounded-ctl bg-surface2 p-3 text-sm" aria-live="polite"><b>{t(`ls2.cell.p.${sel}`)}:</b> {desc}</p>}
          </div>
        </div>
      )}
      <LabNote>{t('ls2.cell.note')}</LabNote>
    </div>
  );
}
