'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { Arrow, C, fmt } from './kit';

export const K = 8.99e9; // N m² C⁻²
export const coulombForce = (q1uC: number, q2uC: number, r: number) => (K * Math.abs(q1uC * 1e-6 * q2uC * 1e-6)) / (r * r);

/** Two point charges: force by Coulomb's law, attraction or repulsion, and the electric field around them. */
export default function CoulombLab() {
  const { t } = useT();
  const [q1, setQ1] = useState(4);
  const [q2, setQ2] = useState(-2);
  const [r, setR] = useState(0.5);
  const F = coulombForce(q1, q2, r);
  const nature = q1 === 0 || q2 === 0 ? 'none' : q1 * q2 > 0 ? 'repel' : 'attract';
  // geometry: 1 m of separation = 220 px; charges centred
  const px = 220, x1 = 160 - (r * px) / 2, x2 = 160 + (r * px) / 2, y = 100;
  const mPerPx = 1 / px;
  const field = (gx: number, gy: number) => {
    let ex = 0, ey = 0;
    for (const [q, cx] of [[q1, x1], [q2, x2]] as [number, number][]) {
      const dx = (gx - cx) * mPerPx, dy = (gy - y) * mPerPx, d2 = dx * dx + dy * dy;
      if (d2 < 1e-6) continue;
      const e = (K * q * 1e-6) / d2, d = Math.sqrt(d2);
      ex += (e * dx) / d; ey += (e * dy) / d;
    }
    return [ex, ey];
  };
  const grid: [number, number][] = [];
  for (let gx = 20; gx <= 300; gx += 28) for (let gy = 20; gy <= 180; gy += 26) grid.push([gx, gy]);
  const Emid = Math.hypot(...field(160, y));
  const len = 14 * Math.min(1, F / 50 + 0.25);
  const dir = nature === 'repel' ? -1 : 1; // force on q1 points toward q2 when attracting

  return (
    <div className="grid gap-4">
      <svg viewBox="0 0 320 200" className="w-full rounded-ctl border border-line bg-surface2" role="img"
        aria-label={t('lsr.cl.aria', { q1, q2, r: fmt(r, 2), F: fmt(F, 3), nature: t(`lsr.cl.${nature}`) })}>
        {grid.map(([gx, gy], i) => {
          const [ex, ey] = field(gx, gy), m = Math.hypot(ex, ey);
          if (!m || Math.hypot(gx - x1, gy - y) < 16 || Math.hypot(gx - x2, gy - y) < 16) return null;
          const l = Math.min(11, 3 + Math.log10(1 + m / 1e4) * 2.2);
          return <Arrow key={i} x1={gx - (ex / m) * l} y1={gy - (ey / m) * l} x2={gx + (ex / m) * l} y2={gy + (ey / m) * l} color={C.muted} width={1.2} />;
        })}
        <line x1={x1} x2={x2} y1={y + 34} y2={y + 34} stroke={C.ink} />
        <text x="160" y={y + 48} fontSize="11" textAnchor="middle" fill={C.ink}>r = {fmt(r, 2)} m</text>
        {nature !== 'none' && <>
          <Arrow x1={x1} y1={y} x2={x1 + dir * (18 + len)} y2={y} color={C.accent} width={3} />
          <Arrow x1={x2} y1={y} x2={x2 - dir * (18 + len)} y2={y} color={C.accent} width={3} />
        </>}
        {([[q1, x1], [q2, x2]] as [number, number][]).map(([q, cx], i) => (
          <g key={i}><circle cx={cx} cy={y} r="13" fill={q > 0 ? C.bad : q < 0 ? C.primary : C.muted} />
            <text x={cx} y={y + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="#fff">{q > 0 ? '+' : q < 0 ? '−' : '0'}</text>
            <text x={cx} y={y - 20} fontSize="10" textAnchor="middle" fill={C.ink}>{q} μC</text></g>
        ))}
      </svg>
      <div className="grid gap-3">
        <Slider id="cl-q1" label={t('lsr.cl.q1')} value={q1} min={-10} max={10} unit=" μC" onChange={setQ1} />
        <Slider id="cl-q2" label={t('lsr.cl.q2')} value={q2} min={-10} max={10} unit=" μC" onChange={setQ2} />
        <Slider id="cl-r" label={t('lsr.cl.r')} value={r} min={0.1} max={1} step={0.05} unit=" m" onChange={setR} />
      </div>
      <Readout items={[['F = k|q₁q₂|/r²', `${fmt(F, 3)} N`], [t('lsr.cl.natureL'), t(`lsr.cl.${nature}`)], [t('lsr.cl.emid'), `${fmt(Emid, 3)} N/C`], ['F × r²', `${fmt(F * r * r, 3)} N m²`]]} />
      <Legend items={[[C.bad, t('lsr.cl.pos')], [C.primary, t('lsr.cl.neg')], [C.accent, t('lsr.cl.force')], [C.muted, t('lsr.cl.field')]]} />
      <LabNote>{t('lsr.cl.note')}</LabNote>
    </div>
  );
}
