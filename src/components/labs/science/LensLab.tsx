'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';

/**
 * Thin lens ray diagram with the NCERT sign convention (distances measured from the optical centre,
 * along the incident light = +, object on the left so u < 0): 1/v − 1/u = 1/f, m = h′/h = v/u.
 */
export default function LensLab() {
  const { t } = useT();
  const [kind, setKind] = useState<'convex' | 'concave'>('convex');
  const [F, setF] = useState(10);   // |f| in cm
  const [d, setD] = useState(25);   // object distance |u| in cm
  const [h, setH] = useState(3);    // object height in cm
  const f = kind === 'convex' ? F : -F;
  const u = -d;
  const atF = kind === 'convex' && d === F;
  const v = atF ? Infinity : (u * f) / (u + f);
  const m = atF ? Infinity : v / u;
  const hi = m * h;
  const real = v > 0;

  const W = 480, H = 240, cx = 240, cy = 120, s = 3.4; // px per cm
  const X = (cm: number) => cx + cm * s, Y = (cm: number) => cy - cm * s;
  const ext = (x1: number, y1: number, x2: number, y2: number, to = W + 40) => { // extend a line to x = to
    const k = (y2 - y1) / (x2 - x1); return { x: to, y: y1 + k * (to - x1) };
  };
  const top = { x: X(u), y: Y(h) };
  const lensTop = { x: cx, y: Y(h) };
  // Ray 1: parallel to the axis, then through F′ (convex) or as if from F on the object side (concave)
  const r1to = kind === 'convex' ? ext(cx, top.y, X(F), cy) : ext(X(-F), cy, cx, top.y);
  // Ray 2: through the optical centre, undeviated
  const r2to = ext(top.x, top.y, cx, cy);
  const img = !atF && isFinite(v) ? { x: X(v), y: Y(hi) } : null;
  const nature = atF ? t('ls2.lens.atInf') :
    `${real ? t('ls2.lens.real') : t('ls2.lens.virtual')}, ${hi < 0 ? t('ls2.lens.inverted') : t('ls2.lens.erect')}, ${Math.abs(m) > 1.005 ? t('ls2.lens.magnified') : Math.abs(m) < 0.995 ? t('ls2.lens.diminished') : t('ls2.lens.same')}`;
  const P = 100 / f; // dioptre (f in cm)
  const fmt = (n: number) => (isFinite(n) ? (Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(1)) : '∞');

  return (
    <div className="grid gap-4">
      <div className="seg w-fit" role="radiogroup" aria-label={t('ls2.lens.type')}>
        {(['convex', 'concave'] as const).map(k => <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)}>{t(`ls2.lens.${k}`)}</button>)}
      </div>
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('ls2.lens.aria', { k: t(`ls2.lens.${kind}`), u: fmt(u), f: fmt(f), v: fmt(v), n: nature })}>
          <defs><clipPath id="lens-clip"><rect width={W} height={H} /></clipPath></defs>
          <g clipPath="url(#lens-clip)">
            <line x1="0" y1={cy} x2={W} y2={cy} stroke="rgb(var(--line))" strokeWidth="1.5" />
            {/* lens */}
            {kind === 'convex'
              ? <path d={`M${cx} 20 Q ${cx + 16} ${cy} ${cx} ${H - 20} Q ${cx - 16} ${cy} ${cx} 20 Z`} fill="rgb(var(--primary) / .18)" stroke="rgb(var(--primary))" strokeWidth="2" />
              : <path d={`M${cx - 9} 20 H${cx + 9} Q ${cx + 2} ${cy} ${cx + 9} ${H - 20} H${cx - 9} Q ${cx - 2} ${cy} ${cx - 9} 20 Z`} fill="rgb(var(--primary) / .18)" stroke="rgb(var(--primary))" strokeWidth="2" />}
            {[-2 * F, -F, F, 2 * F].map((x, i) => <g key={i}><circle cx={X(x)} cy={cy} r="3" fill="rgb(var(--ink))" /><text x={X(x)} y={cy + 16} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">{['2F₁', 'F₁', 'F₂', '2F₂'][i]}</text></g>)}
            {/* object */}
            <line x1={top.x} y1={cy} x2={top.x} y2={top.y} stroke="rgb(var(--teal))" strokeWidth="3.5" />
            <path d={`M${top.x - 6} ${top.y + 8} L${top.x} ${top.y} L${top.x + 6} ${top.y + 8}`} fill="none" stroke="rgb(var(--teal))" strokeWidth="3" />
            {/* rays */}
            <g stroke="rgb(var(--accent))" strokeWidth="2" fill="none">
              <line x1={top.x} y1={top.y} x2={lensTop.x} y2={lensTop.y} />
              <line x1={lensTop.x} y1={lensTop.y} x2={r1to.x} y2={r1to.y} />
              <line x1={top.x} y1={top.y} x2={r2to.x} y2={r2to.y} />
            </g>
            {/* virtual image: dashed back-extensions */}
            {img && !real && (
              <g stroke="rgb(var(--accent))" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity=".8">
                <line x1={lensTop.x} y1={lensTop.y} x2={img.x} y2={img.y} />
                <line x1={cx} y1={cy} x2={img.x} y2={img.y} />
              </g>
            )}
            {img && (
              <g opacity={real ? 1 : 0.7}>
                <line x1={img.x} y1={cy} x2={img.x} y2={img.y} stroke="rgb(var(--bad))" strokeWidth="3.5" strokeDasharray={real ? undefined : '6 4'} />
                <path d={`M${img.x - 6} ${img.y + (hi > 0 ? 8 : -8)} L${img.x} ${img.y} L${img.x + 6} ${img.y + (hi > 0 ? 8 : -8)}`} fill="none" stroke="rgb(var(--bad))" strokeWidth="3" />
              </g>
            )}
          </g>
        </svg>
      </div>
      <Slider id="ln-f" label={t('ls2.lens.focal')} value={F} min={5} max={20} unit=" cm" onChange={setF} />
      <Slider id="ln-d" label={t('ls2.lens.objDist')} value={d} min={3} max={60} unit=" cm" onChange={setD} />
      <Slider id="ln-h" label={t('ls2.lens.objH')} value={h} min={1} max={5} unit=" cm" onChange={setH} />
      <Readout items={[
        ['u, f', `${fmt(u)} cm, ${fmt(f)} cm`], ['v', `${fmt(v)} cm`],
        [t('ls2.lens.mag'), isFinite(m) ? `${m.toFixed(2)} (h′ = ${hi.toFixed(1)} cm)` : '∞'], [t('ls2.lens.power'), `${P > 0 ? '+' : ''}${P.toFixed(1)} D`],
      ]} />
      <p className="rounded-ctl bg-surface2 px-3 py-2 text-sm font-semibold" aria-live="polite">{t('ls2.lens.image')}: {nature}</p>
      <Legend items={[['rgb(var(--teal))', t('ls2.lens.object')], ['rgb(var(--bad))', t('ls2.lens.imageL')], ['rgb(var(--accent))', t('ls2.lens.rays')]]} />
      <LabNote>{t('ls2.lens.note')}</LabNote>
    </div>
  );
}
