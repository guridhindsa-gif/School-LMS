'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Plot, fmt, useFrameTime } from './kit';

export const HC_EV_NM = 1239.84; // h·c in eV·nm
export const H_EV_S = 4.1357e-15; // Planck constant in eV·s
/** Work functions in eV (NCERT Class 12 Physics, Table 11.1). */
export const METALS: [string, number][] = [['Cs', 2.14], ['K', 2.3], ['Na', 2.75], ['Ca', 3.2], ['Cu', 4.65], ['Pt', 5.65]];
export const kmax = (lambdaNm: number, phi: number) => HC_EV_NM / lambdaNm - phi;

/** Visible-light colour for a wavelength (approximate); ultraviolet shown as violet-grey. */
function lightColour(nm: number) {
  if (nm < 380) return 'rgb(150, 120, 220)';
  const c = (r: number, g: number, b: number) => `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  if (nm < 440) return c((440 - nm) / 60, 0, 1);
  if (nm < 490) return c(0, (nm - 440) / 50, 1);
  if (nm < 510) return c(0, 1, (510 - nm) / 20);
  if (nm < 580) return c((nm - 510) / 70, 1, 0);
  if (nm < 645) return c(1, (645 - nm) / 65, 0);
  return c(1, 0, 0);
}

/** Light on a metal: emission only above the threshold frequency; KEmax = hf − φ; intensity changes current, not energy. */
export default function PhotoelectricLab() {
  const { t } = useT();
  const [lambda, setLambda] = useState(400);
  const [intensity, setIntensity] = useState(60);
  const [metal, setMetal] = useState(2);
  const [name, phi] = METALS[metal];
  const E = HC_EV_NM / lambda;
  const K = E - phi;
  const emits = K > 0 && intensity > 0;
  const f14 = 2.998e17 / lambda / 1e14; // frequency in 10¹⁴ Hz (c = 2.998×10⁸ m/s)
  const f0 = phi / H_EV_S / 1e14;
  const lambda0 = HC_EV_NM / phi;
  const current = emits ? intensity : 0; // photocurrent ∝ intensity (arbitrary units)
  const time = useFrameTime(emits);
  const nE = Math.round(intensity / 12);
  const speed = 30 + Math.sqrt(Math.max(0, K)) * 60;
  const col = lightColour(lambda);

  return (
    <div className="grid gap-4">
      <svg viewBox="0 0 320 170" className="w-full rounded-ctl border border-line bg-surface2" role="img"
        aria-label={emits ? t('lsr.pe.ariaYes', { l: lambda, m: name, k: K.toFixed(2) }) : t('lsr.pe.ariaNo', { l: lambda, m: name })}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={20 + i * 14} y1={10} x2={90 + i * 14} y2={110} stroke={col} strokeWidth="3" opacity={0.15 + (intensity / 100) * 0.75} strokeDasharray="6 4" />
        ))}
        <rect x="70" y="110" width="110" height="18" fill={C.muted} />
        <text x="125" y="123" fontSize="11" fontWeight="700" textAnchor="middle" fill="#fff">{name} · φ = {phi} eV</text>
        <rect x="270" y="60" width="12" height="80" fill={C.ink} opacity=".7" /><text x="276" y="154" fontSize="9" textAnchor="middle" fill={C.ink}>{t('lsr.pe.collector')}</text>
        {emits && Array.from({ length: nE }, (_, i) => {
          const p = ((time * speed + i * 37) % 170) / 170;
          return <circle key={i} cx={110 + i * 6 + p * (160 - i * 6)} cy={108 - p * 50 - (i % 3) * 8} r="3.5" fill={C.primary} />;
        })}
        {!emits && intensity > 0 && <text x="125" y="96" fontSize="11" textAnchor="middle" fill={C.bad}>{t('lsr.pe.none')}</text>}
        <text x="300" y="20" fontSize="10" textAnchor="end" fill={C.ink}>I ∝ {current}%</text>
      </svg>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('lsr.pe.metal')}>
        {METALS.map(([m, w], i) => (
          <button key={m} role="radio" aria-checked={metal === i} onClick={() => setMetal(i)}
            className={`min-h-9 rounded-full border px-3 text-sm font-semibold ${metal === i ? 'border-primary bg-primary text-onprimary' : 'border-line bg-surface hover:border-primary/40'}`}>{m} · {w} eV</button>
        ))}
      </div>
      <div className="grid gap-3">
        <Slider id="pe-l" label={t('lsr.pe.lambda')} value={lambda} min={150} max={700} step={5} unit=" nm" onChange={setLambda} />
        <Slider id="pe-i" label={t('lsr.pe.intensity')} value={intensity} min={0} max={100} step={5} unit="%" onChange={setIntensity} />
      </div>
      <Plot label={t('lsr.pe.plotAria')} xLabel={t('lsr.pe.fLabel')} yLabel="Kₘₐₓ (eV)" xMin={0} xMax={20} yMin={0} yMax={6}
        series={[{ pts: [[f0, 0], [20, H_EV_S * 20e14 - phi]], color: C.primary }]} vlines={[{ x: f0, text: 'f₀', color: C.teal }]}
        marks={K > 0 ? [{ x: f14, y: K }] : [{ x: Math.min(f14, 20), y: 0, color: C.bad }]} height={180} />
      <Readout items={[
        ['E = hc/λ', `${E.toFixed(2)} eV`],
        ['Kₘₐₓ = hf − φ', K > 0 ? `${K.toFixed(2)} eV` : t('lsr.pe.noEmission')],
        [t('lsr.pe.stopping'), K > 0 ? `${K.toFixed(2)} V` : '—'],
        [t('lsr.pe.threshold'), `λ₀ = ${lambda0.toFixed(0)} nm · f₀ = ${fmt(f0, 3)}×10¹⁴ Hz`],
      ]} />
      <Legend items={[[C.primary, t('lsr.pe.legE')], [C.teal, t('lsr.pe.legF0')]]} />
      <LabNote>{t('lsr.pe.note')}</LabNote>
    </div>
  );
}
