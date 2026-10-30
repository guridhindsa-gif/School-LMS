'use client';
import { useMemo, useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Plot, Seg, fmt } from './kit';

export const KW = 1e-14;
export const KA_ACETIC = 1.8e-5;

/**
 * pH after adding Vb mL of NaOH (Cb M) to Va mL of acid (Ca M), from the exact charge balance
 * [H⁺] + [Na⁺] = [OH⁻] + [A⁻]. Strong acid: [A⁻] = Cacid. Weak acid: [A⁻] = Cacid·Ka/(Ka + [H⁺]).
 */
export function titrationPH(Ca: number, Va: number, Cb: number, Vb: number, weak: boolean, Ka = KA_ACETIC): number {
  const Vt = Va + Vb, cA = (Ca * Va) / Vt, cNa = (Cb * Vb) / Vt;
  if (!weak) { const d = cA - cNa; return -Math.log10((d + Math.sqrt(d * d + 4 * KW)) / 2); }
  const f = (h: number) => h + cNa - KW / h - (cA * Ka) / (Ka + h); // increases with h
  let lo = -15, hi = 1;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(10 ** mid) > 0) hi = mid; else lo = mid; }
  return -(lo + hi) / 2;
}

type Ind = 'phenol' | 'methyl';
function indicatorColour(ind: Ind, pH: number): string {
  if (ind === 'phenol') { const k = Math.min(1, Math.max(0, (pH - 8.2) / 1.8)); return `rgba(219, 39, 119, ${0.08 + 0.72 * k})`; }
  if (pH < 3.1) return 'rgb(220, 38, 38)';
  if (pH > 4.4) return 'rgb(234, 179, 8)';
  return 'rgb(249, 115, 22)';
}

/** Titrate HCl or CH₃COOH with NaOH: live pH curve, equivalence point and indicator colour. */
export default function TitrationLab() {
  const { t } = useT();
  const [weak, setWeak] = useState(false);
  const [Ca, setCa] = useState(0.1);
  const [Va, setVa] = useState(25);
  const [Cb, setCb] = useState(0.1);
  const [ind, setInd] = useState<Ind>('phenol');
  const Veq = (Ca * Va) / Cb;
  const Vmax = Math.min(100, Math.max(10, Math.ceil(2 * Veq)));
  const [Vb, setVb] = useState(0);
  const vb = Math.min(Vb, Vmax);
  const pH = titrationPH(Ca, Va, Cb, vb, weak);
  const pHeq = titrationPH(Ca, Va, Cb, Veq, weak);
  const curve = useMemo(() => Array.from({ length: 241 }, (_, i) => { const v = (i / 240) * Vmax; return [v, titrationPH(Ca, Va, Cb, v, weak)] as [number, number]; }), [Ca, Va, Cb, Vmax, weak]);
  const colour = indicatorColour(ind, pH);
  const fill = 20 + Math.min(1, (Va + vb) / (Va + Vmax)) * 50;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <Seg label={t('lsr.ti.acid')} value={weak ? 'weak' : 'strong'} onChange={v => setWeak(v === 'weak')} options={[['strong', t('lsr.ti.strong')], ['weak', t('lsr.ti.weak')]]} />
        <Seg label={t('lsr.ti.indicator')} value={ind} onChange={setInd} options={[['phenol', t('lsr.ti.phenol')], ['methyl', t('lsr.ti.methyl')]]} />
      </div>
      <div className="grid items-start gap-4 md:grid-cols-[160px_1fr]">
        <svg viewBox="0 0 140 170" className="mx-auto w-full max-w-[170px]" role="img" aria-label={t('lsr.ti.aria', { v: fmt(vb, 3), pH: pH.toFixed(2) })}>
          <rect x="62" y="4" width="16" height="70" rx="3" fill="none" stroke={C.ink} strokeWidth="2" />
          <rect x="64" y={6 + (vb / Vmax) * 66} width="12" height={66 - (vb / Vmax) * 66} fill={C.primary} opacity=".35" />
          <path d="M68 74h4v10h-4z" fill={C.ink} />
          <path d={`M50 96 L50 110 L22 158 Q20 164 28 164 L112 164 Q120 164 118 158 L90 110 L90 96 Z`} fill="none" stroke={C.ink} strokeWidth="2" />
          <clipPath id="flask-clip"><path d="M50 96 L50 110 L22 158 Q20 164 28 164 L112 164 Q120 164 118 158 L90 110 L90 96 Z" /></clipPath>
          <rect x="0" y={164 - fill} width="140" height={fill} fill={colour} clipPath="url(#flask-clip)" />
          <rect x="0" y={164 - fill} width="140" height={fill} fill="rgb(var(--primary))" opacity=".06" clipPath="url(#flask-clip)" />
        </svg>
        <Plot label={t('lsr.ti.plotAria')} xLabel={t('lsr.ti.xLabel')} yLabel="pH" xMin={0} xMax={Vmax} yMin={0} yMax={14}
          series={[{ pts: curve, color: C.primary }]} marks={[{ x: vb, y: pH }]} vlines={[{ x: Veq, text: t('lsr.ti.eq') }]} />
      </div>
      <div className="grid gap-3">
        <Slider id="ti-vb" label={t('lsr.ti.added')} value={Number(vb.toFixed(1))} min={0} max={Vmax} step={0.1} unit=" mL" onChange={setVb} />
        <Slider id="ti-ca" label={t('lsr.ti.Ca')} value={Ca} min={0.05} max={0.5} step={0.01} unit=" M" onChange={setCa} />
        <Slider id="ti-va" label={t('lsr.ti.Va')} value={Va} min={10} max={50} step={1} unit=" mL" onChange={setVa} />
        <Slider id="ti-cb" label={t('lsr.ti.Cb')} value={Cb} min={0.05} max={0.5} step={0.01} unit=" M" onChange={setCb} />
      </div>
      <Readout items={[
        ['pH', pH.toFixed(2)],
        [t('lsr.ti.veq'), `${fmt(Veq, 3)} mL`],
        [t('lsr.ti.pheq'), pHeq.toFixed(2)],
        weak ? [t('lsr.ti.half'), `${titrationPH(Ca, Va, Cb, Veq / 2, true).toFixed(2)} (pKₐ ${(-Math.log10(KA_ACETIC)).toFixed(2)})`] : [t('lsr.ti.mmol'), `${fmt(Ca * Va, 3)} mmol`],
      ]} />
      <Legend items={[[C.primary, t('lsr.ti.legCurve')], [C.accent, t('lsr.ti.legEq')]]} />
      <LabNote>{t(weak ? 'lsr.ti.noteWeak' : 'lsr.ti.noteStrong')}</LabNote>
    </div>
  );
}
