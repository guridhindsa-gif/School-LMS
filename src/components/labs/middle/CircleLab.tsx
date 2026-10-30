'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, fmt } from './ui';

/** Circumference unrolls to 2πr; cutting the circle into sectors and re-arranging them gives a near-parallelogram of area πr × r. */
export default function CircleLab() {
  const { t } = useT();
  const [r, setR] = useState(3);
  const [n, setN] = useState(12);
  const Cf = 2 * Math.PI * r, A = Math.PI * r * r;
  const S = 16; // px per cm
  const R = r * S, cx = 110, cy = 110;
  const sector = (i: number) => {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI;
    return `M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}Z`;
  };
  // rearranged: n sectors alternating apex up/down along a row; total width ≈ πr, height ≈ r
  const half = Math.PI / n; // half sector angle
  const chord = 2 * R * Math.sin(half);
  const rowX = 20, rowY = 260;
  const rearranged = Array.from({ length: n }, (_, i) => {
    const up = i % 2 === 0;
    const x = rowX + (i * chord) / 2;
    const baseY = up ? rowY + R * Math.cos(half) : rowY;
    const apexY = up ? rowY : rowY + R * Math.cos(half);
    const ax = x + chord / 2;
    const b0x = x, b1x = x + chord;
    // arc on the base (bulges outward from apex)
    return `M${ax} ${apexY} L${b0x} ${baseY} A${R} ${R} 0 0 ${up ? 0 : 1} ${b1x} ${baseY}Z`;
  });
  const width = (n / 2) * chord;
  const lineLen = Cf * S;
  const vbW = Math.max(240 + 20, rowX + width + chord / 2 + 20, 20 + lineLen + 20);

  return (
    <div className="grid gap-5">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${vbW} ${rowY + R + 60}`} className="w-full min-w-[300px] rounded-card border border-line bg-surface" role="img"
          aria-label={t('lm.circle.aria', { r, c: fmt(Cf), a: fmt(A), n })}>
          {Array.from({ length: n }, (_, i) => <path key={i} d={sector(i)} fill={i % 2 ? C.teal : C.primary} fillOpacity=".55" stroke={C.surface} strokeWidth="1" />)}
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.ink} strokeWidth="2" />
          <text x={cx + R / 2} y={cy - 5} fontSize="11" textAnchor="middle" fontWeight="700" fill={C.ink}>r</text>
          {/* circumference unrolled */}
          <line x1={20} y1={cy + R + 26} x2={20 + lineLen} y2={cy + R + 26} stroke={C.accent} strokeWidth="5" strokeLinecap="round" />
          <text x={20} y={cy + R + 46} fontSize="11" fill={C.accent} fontWeight="700">2πr = {fmt(Cf)} cm</text>
          {rearranged.map((d, i) => <path key={i} d={d} fill={i % 2 ? C.teal : C.primary} fillOpacity=".55" stroke={C.surface} strokeWidth="1" />)}
          <text x={rowX} y={rowY + R + 40} fontSize="11" fill={C.ink}>≈ πr × r = {fmt(Math.PI * r)} × {r}</text>
        </svg>
      </div>
      <Slider id="c-r" label={t('lm.circle.radius')} value={r} min={1} max={6} unit=" cm" onChange={setR} />
      <Slider id="c-n" label={t('lm.circle.sectors')} value={n} min={4} max={40} step={2} onChange={setN} />
      <Legend items={[[C.accent, t('lm.circle.unrolled')], [C.primary, t('lm.circle.sectorsKey')]]} />
      <Readout items={[
        [t('lm.circle.circ'), `${fmt(Cf)} cm`],
        [t('lm.circle.area'), `${fmt(A)} cm²`],
        [t('lm.circle.width'), `≈ ${fmt(width / S)} cm (πr = ${fmt(Math.PI * r)})`],
        [t('lm.circle.height'), `≈ ${fmt((R * Math.cos(half)) / S)} cm (r = ${r})`],
      ]} />
      <LabNote>{t('lm.circle.note')}</LabNote>
    </div>
  );
}
