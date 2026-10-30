'use client';
import { useT } from '@/lib/i18n';
import { useState } from 'react';
import { cssVar, useCanvas } from './useCanvas';
import { LabNote, Legend, Readout, Slider } from './Slider';

const MEDIA = [{ n: 1.0, name: 'Air', key: 'lb.rf.air' }, { n: 1.33, name: 'Water', key: 'lb.rf.water' }, { n: 1.5, name: 'Glass', key: 'lb.rf.glass' }, { n: 2.42, name: 'Diamond', key: 'lb.rf.diamond' }];

/** Snell's law with photons, partial reflection and total internal reflection. */
export default function RefractionLab() {
  const [angle, setAngle] = useState(40);
  const { t: tt, lang } = useT();
  const [top, setTop] = useState(0);    // index into MEDIA (incident medium)
  const [bottom, setBottom] = useState(2);
  const n1 = MEDIA[top].n, n2 = MEDIA[bottom].n;
  const i = (angle * Math.PI) / 180;
  const s = (n1 / n2) * Math.sin(i);
  const tir = s > 1;
  const r = tir ? null : Math.asin(s);
  const critical = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  const ref = useCanvas((x, w, h, t) => {
    const P = { x: w / 2, y: h / 2 }, L = Math.hypot(w, h);
    x.clearRect(0, 0, w, h);
    const tint = (n: number, a: number) => `rgba(${n > 2 ? '200,230,255' : n > 1.4 ? '140,200,240' : n > 1.1 ? '70,140,230' : '230,240,255'},${a})`;
    x.fillStyle = cssVar('--night-2'); x.fillRect(0, 0, w, h);
    x.fillStyle = tint(n1, n1 > 1 ? 0.28 : 0.04); x.fillRect(0, 0, w, h / 2);
    x.fillStyle = tint(n2, n2 > 1 ? 0.28 : 0.04); x.fillRect(0, h / 2, w, h / 2);
    const chalk = cssVar('--on-night'), mari = cssVar('--accent');
    // normal
    x.setLineDash([6, 6]); x.strokeStyle = chalk; x.globalAlpha = 0.5; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(P.x, 8); x.lineTo(P.x, h - 8); x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    // rays
    const A = { x: P.x - L * Math.sin(i), y: P.y - L * Math.cos(i) };
    const Rf = { x: P.x + L * Math.sin(i), y: P.y - L * Math.cos(i) };
    x.lineWidth = 3.5; x.strokeStyle = mari; x.beginPath(); x.moveTo(A.x, A.y); x.lineTo(P.x, P.y); x.stroke();
    x.globalAlpha = tir ? 1 : 0.28; x.beginPath(); x.moveTo(P.x, P.y); x.lineTo(Rf.x, Rf.y); x.stroke(); x.globalAlpha = 1;
    if (r !== null) { x.beginPath(); x.moveTo(P.x, P.y); x.lineTo(P.x + L * Math.sin(r), P.y + L * Math.cos(r)); x.stroke(); }
    // angle arcs
    x.lineWidth = 1.5; x.strokeStyle = chalk;
    x.beginPath(); x.arc(P.x, P.y, 52, -Math.PI / 2 - i, -Math.PI / 2); x.stroke();
    if (r !== null) { x.beginPath(); x.arc(P.x, P.y, 52, Math.PI / 2 - r, Math.PI / 2); x.stroke(); }
    x.fillStyle = chalk; x.font = '600 14px Figtree, sans-serif';
    x.fillText(`i = ${angle}°`, P.x - 110, P.y - 60);
    if (r !== null) x.fillText(`r = ${((r * 180) / Math.PI).toFixed(1)}°`, P.x + 24, P.y + 74);
    else x.fillText(tt('lb.rf.tir'), P.x + 20, P.y - 20);
    x.font = '700 13px "IBM Plex Mono", monospace';
    const up = (s: string) => (lang === 'en' ? s.toUpperCase() : s);
    x.fillText(`${up(tt(MEDIA[top].key))}  n = ${n1}`, 14, 24);
    x.fillText(`${up(tt(MEDIA[bottom].key))}  n = ${n2}`, 14, h - 14);
    // photons: speed ∝ 1/n
    const seg = Math.min(L, h * 0.9);
    for (let k = 0; k < 7; k++) {
      const u = ((t * 0.35 + k / 7) % 1) * 2;
      let px: number, py: number;
      if (u < 1) { px = P.x - (1 - u) * seg * Math.sin(i); py = P.y - (1 - u) * seg * Math.cos(i); }
      else {
        const d = ((u - 1) * seg * n1) / (tir ? n1 : n2);
        if (r === null) { px = P.x + d * Math.sin(i); py = P.y - d * Math.cos(i); }
        else { px = P.x + d * Math.sin(r); py = P.y + d * Math.cos(r); }
      }
      if (py < 0 || py > h || px < 0 || px > w) continue;
      x.fillStyle = '#fff'; x.shadowColor = mari; x.shadowBlur = 10;
      x.beginPath(); x.arc(px, py, 4, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
    }
  });

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-card"><canvas ref={ref} role="img" aria-label={tt('lb.rf.aria', { a: tt(MEDIA[top].key), b: tt(MEDIA[bottom].key), deg: angle, result: r === null ? tt('lb.rf.tir') : tt('lb.rf.refracted', { deg: ((r * 180) / Math.PI).toFixed(1) }) })} /></div>
      <Legend items={[['rgb(var(--accent))', tt('lb.rf.ray')], ['rgb(var(--on-night))', tt('lb.rf.normal')]]} />
      <Slider id="refr-angle" label={tt('lb.rf.angle')} value={angle} min={0} max={85} unit="°" onChange={setAngle} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">{tt('lb.rf.from')}
          <select className="input" value={top} onChange={e => setTop(+e.target.value)}>{MEDIA.map((m, k) => <option key={m.name} value={k}>{tt(m.key)} (n = {m.n})</option>)}</select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">{tt('lb.rf.into')}
          <select className="input" value={bottom} onChange={e => setBottom(+e.target.value)}>{MEDIA.map((m, k) => <option key={m.name} value={k}>{tt(m.key)} (n = {m.n})</option>)}</select>
        </label>
      </div>
      <Readout items={[
        [tt('lb.rf.snell'), `${n1}·sin i = ${n2}·sin r`],
        [tt('lb.rf.refrAngle'), r === null ? tt('lb.rf.none') : `${((r * 180) / Math.PI).toFixed(1)}°`],
        [tt('lb.rf.critical'), critical ? `${critical.toFixed(1)}°` : tt('lb.rf.na')],
        [tt('lb.rf.speed'), `${(3 / n2).toFixed(2)} × 10⁸ m/s`],
      ]} />
      <LabNote>{tt('lb.rf.note')}</LabNote>
    </div>
  );
}
