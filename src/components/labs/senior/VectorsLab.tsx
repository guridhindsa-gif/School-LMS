'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { Arrow, C, Seg, fmt } from './kit';

const rad = (d: number) => (d * Math.PI) / 180;
/** Magnitude of A + B from the law of cosines form R = √(A² + B² + 2AB cos θ). */
export const resultant = (A: number, B: number, thetaDeg: number) => Math.sqrt(A * A + B * B + 2 * A * B * Math.cos(rad(thetaDeg)));

/** Add two vectors by the triangle or parallelogram law; components and resultant. */
export default function VectorsLab() {
  const { t } = useT();
  const [A, setA] = useState(6);
  const [aDeg, setADeg] = useState(20);
  const [B, setB] = useState(4);
  const [bDeg, setBDeg] = useState(80);
  const [law, setLaw] = useState<'triangle' | 'parallelogram'>('triangle');
  const Ax = A * Math.cos(rad(aDeg)), Ay = A * Math.sin(rad(aDeg));
  const Bx = B * Math.cos(rad(bDeg)), By = B * Math.sin(rad(bDeg));
  const Rx = Ax + Bx, Ry = Ay + By, Rm = Math.hypot(Rx, Ry);
  const Rdeg = ((Math.atan2(Ry, Rx) * 180) / Math.PI + 360) % 360;
  let theta = Math.abs(bDeg - aDeg) % 360; if (theta > 180) theta = 360 - theta;
  const S = 7, O = { x: 160, y: 120 }; // px per unit, origin
  const P = (x: number, y: number) => ({ x: O.x + x * S, y: O.y - y * S });
  const a = P(Ax, Ay), b0 = law === 'triangle' ? a : O, b = P((law === 'triangle' ? Ax : 0) + Bx, (law === 'triangle' ? Ay : 0) + By), r = P(Rx, Ry);

  return (
    <div className="grid gap-4">
      <Seg label={t('lsr.vc.law')} value={law} onChange={setLaw} options={[['triangle', t('lsr.vc.triangle')], ['parallelogram', t('lsr.vc.parallelogram')]]} />
      <svg viewBox="0 0 320 240" className="w-full rounded-ctl border border-line bg-surface" role="img"
        aria-label={t('lsr.vc.aria', { A, a: aDeg, B, b: bDeg, R: fmt(Rm, 3), r: fmt(Rdeg, 3) })}>
        {Array.from({ length: 23 }, (_, i) => <line key={`v${i}`} x1={O.x + (i - 11) * 14} x2={O.x + (i - 11) * 14} y1="0" y2="240" stroke={C.line} strokeWidth=".6" />)}
        {Array.from({ length: 17 }, (_, i) => <line key={`h${i}`} y1={O.y + (i - 8) * 14} y2={O.y + (i - 8) * 14} x1="0" x2="320" stroke={C.line} strokeWidth=".6" />)}
        <line x1="0" x2="320" y1={O.y} y2={O.y} stroke={C.muted} /><line x1={O.x} x2={O.x} y1="0" y2="240" stroke={C.muted} />
        {law === 'parallelogram' && <>
          <line x1={a.x} y1={a.y} x2={r.x} y2={r.y} stroke={C.teal} strokeDasharray="4 3" />
          <line x1={P(Bx, By).x} y1={P(Bx, By).y} x2={r.x} y2={r.y} stroke={C.primary} strokeDasharray="4 3" />
        </>}
        <line x1={r.x} y1={r.y} x2={r.x} y2={O.y} stroke={C.accent} strokeDasharray="2 3" opacity=".7" />
        <line x1={O.x} y1={r.y} x2={r.x} y2={r.y} stroke={C.accent} strokeDasharray="2 3" opacity=".7" />
        <Arrow x1={O.x} y1={O.y} x2={a.x} y2={a.y} color={C.primary} width={3} label="A" />
        <Arrow x1={b0.x} y1={b0.y} x2={b.x} y2={b.y} color={C.teal} width={3} label="B" />
        <Arrow x1={O.x} y1={O.y} x2={r.x} y2={r.y} color={C.accent} width={3.5} label="R" />
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider id="vc-a" label={t('lsr.vc.A')} value={A} min={0} max={8} step={0.5} onChange={setA} />
        <Slider id="vc-ad" label={t('lsr.vc.aDir')} value={aDeg} min={0} max={360} step={5} unit="°" onChange={setADeg} />
        <Slider id="vc-b" label={t('lsr.vc.B')} value={B} min={0} max={8} step={0.5} onChange={setB} />
        <Slider id="vc-bd" label={t('lsr.vc.bDir')} value={bDeg} min={0} max={360} step={5} unit="°" onChange={setBDeg} />
      </div>
      <Readout items={[
        ['Aₓ, Aᵧ', `${fmt(Ax, 3)}, ${fmt(Ay, 3)}`],
        ['Bₓ, Bᵧ', `${fmt(Bx, 3)}, ${fmt(By, 3)}`],
        ['|R| = √(Rₓ² + Rᵧ²)', `${fmt(Rm, 4)} ∠ ${fmt(Rdeg, 3)}°`],
        [`√(A² + B² + 2AB cos ${fmt(theta, 3)}°)`, fmt(resultant(A, B, theta), 4)],
      ]} />
      <Legend items={[[C.primary, 'A'], [C.teal, 'B'], [C.accent, t('lsr.vc.legR')]]} />
      <LabNote>{t('lsr.vc.note')}</LabNote>
    </div>
  );
}
