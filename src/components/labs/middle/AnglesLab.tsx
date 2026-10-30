'use client';
import { useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Seg } from './ui';

type Mode = 'angle' | 'triangle';
const rad = (d: number) => (d * Math.PI) / 180;

export function angleKind(a: number) {
  if (a === 0) return 'zero';
  if (a < 90) return 'acute';
  if (a === 90) return 'right';
  if (a < 180) return 'obtuse';
  if (a === 180) return 'straight';
  if (a < 360) return 'reflex';
  return 'complete';
}

/** Rotate a ray over a protractor and classify the angle; triangle mode shows the angle sum. */
export default function AnglesLab() {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('angle');
  const [deg, setDeg] = useState(50);
  const [A, setA] = useState(60), [B, setB] = useState(70);
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState(false);

  // angle mode geometry: vertex at (150,160), radius 120
  const cx = 150, cy = 160, R = 120;
  const tip = [cx + R * Math.cos(rad(deg)), cy - R * Math.sin(rad(deg))];
  const large = deg > 180 ? 1 : 0;
  const arcR = 40;
  const arc = deg >= 360 ? `M${cx + arcR} ${cy} A${arcR} ${arcR} 0 1 0 ${cx - arcR} ${cy} A${arcR} ${arcR} 0 1 0 ${cx + arcR} ${cy}`
    : `M${cx + arcR} ${cy} A${arcR} ${arcR} 0 ${large} 0 ${cx + arcR * Math.cos(rad(deg))} ${cy - arcR * Math.sin(rad(deg))}`;
  const kind = angleKind(deg);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 300 - cx, y = cy - ((e.clientY - r.top) / r.height) * 200;
    let d = Math.round((Math.atan2(y, x) * 180) / Math.PI);
    if (d < 0) d += 360;
    setDeg(d);
  }

  // triangle mode: base PQ, angles A at P, B at Q, C = 180 − A − B
  const Cang = 180 - A - B;
  const L = 200, sinC = Math.sin(rad(Cang));
  const PR = sinC > 0 ? (L * Math.sin(rad(B))) / sinC : 0; // law of sines
  const P = [0, 0], Q = [L, 0], Rp = [PR * Math.cos(rad(A)), PR * Math.sin(rad(A))];
  const pts = [P, Q, Rp];
  const minX = Math.min(...pts.map(p => p[0])), maxX = Math.max(...pts.map(p => p[0])), maxY = Math.max(...pts.map(p => p[1]));
  const s = Math.min(260 / (maxX - minX || 1), 150 / (maxY || 1));
  const T = (p: number[]) => [20 + (p[0] - minX) * s, 180 - p[1] * s];
  const tp = pts.map(T);

  return (
    <div className="grid gap-5">
      <Seg label={t('lm.angles.mode')} value={mode} onChange={setMode} options={[['angle', t('lm.angles.modeAngle')], ['triangle', t('lm.angles.modeTriangle')]]} />
      {mode === 'angle' ? (
        <>
          <svg ref={svg} viewBox="0 0 300 200" className="w-full max-w-xl touch-none select-none rounded-card border border-line bg-surface" role="img"
            aria-label={t('lm.angles.aria', { deg, kind: t(`lm.angles.k.${kind}`) })}
            onPointerDown={e => { setDrag(true); (e.target as Element).setPointerCapture?.(e.pointerId); onMove(e); }} onPointerMove={onMove} onPointerUp={() => setDrag(false)}>
            {/* protractor */}
            <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}Z`} fill={C.primary} fillOpacity=".06" stroke={C.line} />
            {Array.from({ length: 19 }, (_, i) => i * 10).map(a => (
              <g key={a}>
                <line x1={cx + (R - (a % 30 ? 6 : 12)) * Math.cos(rad(a))} y1={cy - (R - (a % 30 ? 6 : 12)) * Math.sin(rad(a))} x2={cx + R * Math.cos(rad(a))} y2={cy - R * Math.sin(rad(a))} stroke={C.muted} strokeWidth="1" />
                {a % 30 === 0 && <text x={cx + (R - 22) * Math.cos(rad(a))} y={cy - (R - 22) * Math.sin(rad(a)) + 3} fontSize="8" textAnchor="middle" fill={C.muted}>{a}</text>}
              </g>
            ))}
            <line x1={cx} y1={cy} x2={cx + R + 10} y2={cy} stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
            <path d={arc} fill="none" stroke={C.accent} strokeWidth="3" />
            {deg === 90 && <path d={`M${cx + 14} ${cy} V${cy - 14} H${cx}`} fill="none" stroke={C.accent} strokeWidth="2" />}
            <line x1={cx} y1={cy} x2={tip[0]} y2={tip[1]} stroke={C.primary} strokeWidth="3" strokeLinecap="round" />
            <circle cx={tip[0]} cy={tip[1]} r="9" fill={C.primary} className="cursor-grab" />
            <circle cx={cx} cy={cy} r="4" fill={C.ink} />
            <text x={cx + 50 * Math.cos(rad(Math.min(deg, 359) / 2))} y={cy - 50 * Math.sin(rad(Math.min(deg, 359) / 2)) + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill={C.ink}>{deg}°</text>
          </svg>
          <Slider id="ang-deg" label={t('lm.angles.angle')} value={deg} min={0} max={360} unit="°" onChange={setDeg} />
          <Readout items={[[t('lm.angles.size'), `${deg}°`], [t('lm.angles.type'), t(`lm.angles.k.${kind}`)], [t('lm.angles.complement'), deg <= 90 ? `${90 - deg}°` : '—'], [t('lm.angles.supplement'), deg <= 180 ? `${180 - deg}°` : '—']]} />
          <LabNote>{t('lm.angles.note')}</LabNote>
        </>
      ) : (
        <>
          <svg viewBox="0 0 300 200" className="w-full max-w-xl rounded-card border border-line bg-surface" role="img" aria-label={t('lm.angles.triAria', { a: A, b: B, c: Cang })}>
            <polygon points={tp.map(p => p.join(',')).join(' ')} fill={C.teal} fillOpacity=".12" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
            {[[tp[0], A, C.primary], [tp[1], B, C.accent], [tp[2], Cang, C.violet]].map(([p, a, col], i) => (
              <g key={i}><circle cx={(p as number[])[0]} cy={(p as number[])[1]} r="5" fill={col as string} />
                <text x={(p as number[])[0] + (i === 1 ? -8 : 8)} y={(p as number[])[1] + (i === 2 ? -10 : 16)} fontSize="12" fontWeight="700" textAnchor={i === 1 ? 'end' : 'start'} fill={col as string}>{a as number}°</text></g>
            ))}
          </svg>
          <Slider id="tri-a" label={t('lm.angles.angleA')} value={A} min={10} max={160} unit="°" onChange={v => { setA(v); if (v + B > 170) setB(170 - v); }} />
          <Slider id="tri-b" label={t('lm.angles.angleB')} value={B} min={10} max={160} unit="°" onChange={v => { setB(v); if (A + v > 170) setA(170 - v); }} />
          <Legend items={[[C.primary, 'A'], [C.accent, 'B'], [C.violet, 'C']]} />
          <Readout items={[['∠A', `${A}°`], ['∠B', `${B}°`], ['∠C = 180° − A − B', `${Cang}°`], [t('lm.angles.sum'), `${A + B + Cang}°`]]} />
          <LabNote>{t('lm.angles.triNote')}</LabNote>
        </>
      )}
    </div>
  );
}
