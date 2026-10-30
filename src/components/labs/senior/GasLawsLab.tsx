'use client';
import { useMemo, useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Readout, Slider } from '../Slider';
import { C, Plot, Seg, fmt, useFrameTime } from './kit';

const R = 8.314; // J mol⁻¹ K⁻¹  →  P(kPa) = nRT / V(L)
type Mode = 'boyle' | 'charles' | 'gay';

/** Ideal gas in a piston: Boyle, Charles and Gay-Lussac laws from PV = nRT, with moving particles. */
export default function GasLawsLab() {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('boyle');
  const [n, setN] = useState(1);
  const [T, setT] = useState(300);
  const [V, setV] = useState(24.6);
  const [Pfix, setPfix] = useState(101.3);
  const vol = mode === 'charles' ? (n * R * T) / Pfix : V;
  const P = mode === 'charles' ? Pfix : (n * R * T) / V;
  const VMAX = 60;
  const time = useFrameTime(true);
  const seeds = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: (i * 0.618) % 1, y: (i * 0.377 + 0.1) % 1, a: i * 2.4 })), []);
  const speed = 0.12 * Math.sqrt(T / 300); // ∝ √T (rms speed)
  const boxH = 30 + Math.min(1, vol / VMAX) * 120; // gas column height in px
  const bounce = (p: number) => { const m = ((p % 2) + 2) % 2; return m > 1 ? 2 - m : m; };

  const plot = mode === 'boyle'
    ? { xLabel: 'V (L)', yLabel: 'P (kPa)', xMin: 2, xMax: 50, yMin: 0, yMax: Math.max(...[2, 50].map(v => (n * R * T) / v)),
        pts: Array.from({ length: 60 }, (_, i) => { const v = 2 + (i / 59) * 48; return [v, (n * R * T) / v] as [number, number]; }), mark: { x: V, y: P } }
    : mode === 'charles'
      ? { xLabel: 'T (K)', yLabel: 'V (L)', xMin: 0, xMax: 600, yMin: 0, yMax: (n * R * 600) / Pfix,
          pts: [[0, 0], [600, (n * R * 600) / Pfix]] as [number, number][], mark: { x: T, y: vol } }
      : { xLabel: 'T (K)', yLabel: 'P (kPa)', xMin: 0, xMax: 600, yMin: 0, yMax: (n * R * 600) / V,
          pts: [[0, 0], [600, (n * R * 600) / V]] as [number, number][], mark: { x: T, y: P } };

  return (
    <div className="grid gap-4">
      <Seg label={t('lsr.gas.mode')} value={mode} onChange={setMode} options={[['boyle', t('lsr.gas.boyle')], ['charles', t('lsr.gas.charles')], ['gay', t('lsr.gas.gay')]]} />
      <div className="grid items-start gap-4 md:grid-cols-[200px_1fr]">
        <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[220px] rounded-ctl border border-line bg-surface2" role="img"
          aria-label={t('lsr.gas.aria', { P: fmt(P, 3), V: fmt(vol, 3), T: fmt(T, 3), n: fmt(n, 2) })}>
          <rect x="50" y="20" width="100" height="160" fill="none" stroke={C.ink} strokeWidth="3" />
          <rect x="52" y={180 - boxH} width="96" height={boxH} fill={C.primary} opacity=".12" />
          <rect x="50" y={170 - boxH} width="100" height="10" fill={C.muted} />
          <rect x="95" y="6" width="10" height={164 - boxH} fill={C.muted} />
          {seeds.map((s, i) => (
            <circle key={i} r="3.2" fill={C.accent}
              cx={56 + bounce(s.x + time * speed * Math.cos(s.a)) * 88}
              cy={176 - bounce(s.y + time * speed * Math.sin(s.a)) * (boxH - 8)} />
          ))}
          {vol > VMAX && <text x="100" y="196" fontSize="9" textAnchor="middle" fill={C.muted}>{t('lsr.gas.offscale')}</text>}
        </svg>
        <Plot label={t('lsr.gas.plotAria')} xLabel={plot.xLabel} yLabel={plot.yLabel} xMin={plot.xMin} xMax={plot.xMax} yMin={plot.yMin} yMax={plot.yMax}
          series={[{ pts: plot.pts, color: C.primary }]} marks={[plot.mark]} />
      </div>
      <div className="grid gap-3">
        <Slider id="gas-n" label={t('lsr.gas.n')} value={n} min={0.5} max={2} step={0.1} unit=" mol" onChange={setN} />
        <Slider id="gas-t" label={t('lsr.gas.T')} value={T} min={100} max={600} step={5} unit=" K" onChange={setT} />
        {mode !== 'charles' && <Slider id="gas-v" label={mode === 'boyle' ? t('lsr.gas.V') : t('lsr.gas.Vfix')} value={V} min={2} max={50} step={0.1} unit=" L" onChange={setV} />}
        {mode === 'charles' && <Slider id="gas-p" label={t('lsr.gas.Pfix')} value={Pfix} min={50} max={300} step={0.1} unit=" kPa" onChange={setPfix} />}
      </div>
      <Readout items={[['P', `${fmt(P, 4)} kPa`], ['V', `${fmt(vol, 4)} L`], ['T', `${fmt(T, 3)} K (${fmt(T - 273.15, 3)} °C)`], ['PV / T', `${fmt((P * vol) / T, 4)} J/K`]]} />
      <LabNote>{t(`lsr.gas.note.${mode}`)}</LabNote>
    </div>
  );
}
