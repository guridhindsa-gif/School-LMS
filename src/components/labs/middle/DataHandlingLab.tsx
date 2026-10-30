'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout } from '../Slider';
import { C, Seg, fmt } from './ui';

type SetId = 'rain' | 'height' | 'marks';
/** Small illustrative data sets (made-up example values, for practice). */
const SETS: Record<SetId, { unit: string; labels: string[]; values: number[]; max: number }> = {
  rain: { unit: 'mm', labels: ['jun', 'jul', 'aug', 'sep', 'oct', 'nov'], values: [120, 260, 310, 180, 60, 20], max: 400 },
  height: { unit: 'cm', labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], values: [142, 150, 138, 150, 145, 147, 150], max: 200 },
  marks: { unit: '', labels: ['1', '2', '3', '4', '5', '6', '7', '8'], values: [7, 9, 6, 9, 8, 10, 5, 8], max: 10 },
};

export function stats(v: number[]) {
  const n = v.length, s = [...v].sort((a, b) => a - b);
  const mean = v.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const freq = new Map<number, number>(); v.forEach(x => freq.set(x, (freq.get(x) || 0) + 1));
  const top = Math.max(...freq.values());
  const mode = top > 1 ? [...freq].filter(([, f]) => f === top).map(([x]) => x).sort((a, b) => a - b) : [];
  return { n, sorted: s, mean, median, mode, range: s[n - 1] - s[0] };
}

/** Edit a data set and watch the bar graph, mean, median, mode and range respond. */
export default function DataHandlingLab() {
  const { t } = useT();
  const [set, setSet] = useState<SetId>('rain');
  const [data, setData] = useState<Record<SetId, number[]>>({ rain: SETS.rain.values, height: SETS.height.values, marks: SETS.marks.values });
  const D = SETS[set], vals = data[set];
  const st = stats(vals);
  const label = (i: number) => (set === 'rain' ? t(`lm.data.m.${D.labels[i]}`) : set === 'height' ? t('lm.data.student', { x: D.labels[i] }) : t('lm.data.test', { x: D.labels[i] }));
  const edit = (i: number, v: number) => setData(d => ({ ...d, [set]: d[set].map((x, k) => (k === i ? Math.max(0, Math.min(D.max, Math.round(v))) : x)) }));

  const W = 360, H = 200, pl = 34, pb = 26, bw = (W - pl - 10) / vals.length;
  const top = Math.max(...vals, 1) * 1.15;
  const Y = (v: number) => H - pb - (v / top) * (H - pb - 10);
  const u = D.unit ? ` ${D.unit}` : '';

  return (
    <div className="grid gap-5">
      <Seg label={t('lm.data.set')} value={set} onChange={setSet} options={[['rain', t('lm.data.rain')], ['height', t('lm.data.height')], ['marks', t('lm.data.marks')]]} />
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-card border border-line bg-surface" role="img" aria-label={t('lm.data.aria', { list: vals.map((v, i) => `${label(i)} ${v}${u}`).join(', '), mean: fmt(st.mean) })}>
          {[0, 0.25, 0.5, 0.75, 1].map(f => <g key={f}><line x1={pl} x2={W - 6} y1={Y(top * f)} y2={Y(top * f)} stroke={C.line} /><text x={pl - 4} y={Y(top * f) + 3} fontSize="8" textAnchor="end" fill={C.muted}>{Math.round(top * f)}</text></g>)}
          {vals.map((v, i) => (
            <g key={i}>
              <rect x={pl + i * bw + bw * 0.15} y={Y(v)} width={bw * 0.7} height={H - pb - Y(v)} rx="3" fill={st.mode.includes(v) ? C.accent : C.primary} />
              <text x={pl + i * bw + bw / 2} y={H - pb + 12} fontSize="8" textAnchor="middle" fill={C.muted}>{set === 'rain' ? t(`lm.data.m.${D.labels[i]}`) : D.labels[i]}</text>
            </g>
          ))}
          <line x1={pl} x2={W - 6} y1={Y(st.mean)} y2={Y(st.mean)} stroke={C.teal} strokeWidth="2" strokeDasharray="5 3" />
          <text x={W - 8} y={Y(st.mean) - 4} fontSize="9" fontWeight="700" textAnchor="end" fill={C.teal}>{t('lm.data.mean')} {fmt(st.mean)}</text>
        </svg>
        <fieldset className="grid content-start gap-2">
          <legend className="mb-1 text-sm font-semibold">{t('lm.data.edit')}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {vals.map((v, i) => (
              <label key={i} className="grid gap-0.5 text-xs font-semibold text-muted">{label(i)}
                <input type="number" inputMode="numeric" min={0} max={D.max} value={v} onChange={e => edit(i, Number(e.target.value))} className="input h-10 px-2 font-mono text-base text-ink" />
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <Legend items={[[C.primary, t('lm.data.bar')], [C.accent, t('lm.data.modeBar')], [C.teal, t('lm.data.meanLine')]]} />
      <Readout items={[
        [t('lm.data.mean'), `${fmt(st.mean)}${u}`],
        [t('lm.data.median'), `${fmt(st.median)}${u}`],
        [t('lm.data.mode'), st.mode.length ? st.mode.join(', ') + u : t('lm.data.noMode')],
        [t('lm.data.range'), `${st.range}${u}`],
      ]} />
      <p className="rounded-ctl bg-surface2/60 px-3 py-2 font-mono text-xs text-muted" aria-live="polite">{t('lm.data.sorted')}: {st.sorted.join(', ')} · n = {st.n}{st.n % 2 === 0 ? ` · ${t('lm.data.evenMedian')}` : ''}</p>
      <LabNote>{t('lm.data.note')}</LabNote>
    </div>
  );
}
