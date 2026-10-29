'use client';
import { useRef, useState } from 'react';
import { Rocket } from 'lucide-react';
import { cssVar, useCanvas } from './useCanvas';
import { Readout, Slider } from './Slider';

const G = 9.8;

export default function ProjectileLab() {
  const [u, setU] = useState(20);
  const [deg, setDeg] = useState(45);
  const [h0, setH0] = useState(0);
  const launch = useRef<{ t0: number; u: number; a: number; h0: number } | null>(null);
  const trails = useRef<{ pts: [number, number][]; c: string }[]>([]);
  const a = (deg * Math.PI) / 180;
  const uy = u * Math.sin(a), ux = u * Math.cos(a);
  const T = (uy + Math.sqrt(uy * uy + 2 * G * h0)) / G;
  const R = ux * T, H = h0 + (uy * uy) / (2 * G);

  const ref = useCanvas((x, w, h, t) => {
    const pad = 34, worldW = 100, worldH = 55;
    const sx = (w - pad * 1.5) / worldW, sy = (h - pad * 1.6) / worldH;
    const X = (m: number) => pad + m * sx, Y = (m: number) => h - pad - m * sy;
    const chalk = cssVar('--chalk'), mari = cssVar('--marigold');
    x.fillStyle = cssVar('--board-2'); x.fillRect(0, 0, w, h);
    // grid
    x.strokeStyle = chalk; x.globalAlpha = 0.12; x.lineWidth = 1;
    for (let m = 0; m <= worldW; m += 10) { x.beginPath(); x.moveTo(X(m), Y(0)); x.lineTo(X(m), Y(worldH)); x.stroke(); }
    for (let m = 0; m <= worldH; m += 10) { x.beginPath(); x.moveTo(X(0), Y(m)); x.lineTo(X(worldW), Y(m)); x.stroke(); }
    x.globalAlpha = 1; x.fillStyle = chalk; x.font = '11px "IBM Plex Mono", monospace';
    for (let m = 0; m <= worldW; m += 20) x.fillText(`${m} m`, X(m) + 2, h - 10);
    x.lineWidth = 2; x.beginPath(); x.moveTo(X(0), Y(0)); x.lineTo(X(worldW), Y(0)); x.stroke();
    // launch platform
    if (h0 > 0) { x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(X(0) - 14, Y(h0), 18, Y(0) - Y(h0)); }
    // predicted path
    x.setLineDash([4, 6]); x.globalAlpha = 0.45; x.strokeStyle = chalk; x.beginPath();
    for (let k = 0; k <= 60; k++) { const tt = (T * k) / 60; const px = X(ux * tt), py = Y(h0 + uy * tt - 0.5 * G * tt * tt); k ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    // old trails
    trails.current.forEach((tr, k) => {
      x.strokeStyle = tr.c; x.globalAlpha = 0.25 + 0.15 * (k / Math.max(1, trails.current.length)); x.lineWidth = 2.5;
      x.beginPath(); tr.pts.forEach(([px, py], j) => (j ? x.lineTo(X(px), Y(py)) : x.moveTo(X(px), Y(py)))); x.stroke();
    });
    x.globalAlpha = 1;
    // cannon
    x.save(); x.translate(X(0), Y(h0)); x.rotate(-a); x.fillStyle = mari; x.fillRect(-4, -6, 36, 12); x.restore();
    // flying ball
    const L = launch.current;
    if (L) {
      if (L.t0 < 0) L.t0 = t;
      const la = L.a, lux = L.u * Math.cos(la), luy = L.u * Math.sin(la);
      const LT = (luy + Math.sqrt(luy * luy + 2 * G * L.h0)) / G;
      let tt = matchMedia('(prefers-reduced-motion: reduce)').matches ? LT : (t - L.t0) * 1.2;
      const done = tt >= LT; if (done) tt = LT;
      const pts: [number, number][] = [];
      for (let k = 0; k <= 40; k++) { const s = (tt * k) / 40; pts.push([lux * s, L.h0 + luy * s - 0.5 * G * s * s]); }
      x.strokeStyle = mari; x.lineWidth = 3.5; x.beginPath(); pts.forEach(([px, py], j) => (j ? x.lineTo(X(px), Y(py)) : x.moveTo(X(px), Y(py)))); x.stroke();
      const [bx, by] = pts[pts.length - 1];
      // velocity vectors
      const vx = lux, vy = luy - G * tt;
      x.lineWidth = 2; x.strokeStyle = '#9ad1ff'; arrow(x, X(bx), Y(by), X(bx) + vx * 1.6, Y(by));
      x.strokeStyle = '#ffb4a2'; arrow(x, X(bx), Y(by), X(bx), Y(by) - vy * 1.6);
      x.fillStyle = '#fff'; x.shadowColor = mari; x.shadowBlur = 14; x.beginPath(); x.arc(X(bx), Y(by), 7, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
      if (done) { trails.current = [...trails.current.slice(-4), { pts, c: mari }]; launch.current = null; }
    }
  }, 0.55);

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-2xl"><canvas ref={ref} role="img" aria-label="Projectile motion simulation" /></div>
      <div className="grid gap-3">
        <Slider id="pj-u" label="Speed u" value={u} min={5} max={30} unit=" m/s" onChange={setU} />
        <Slider id="pj-a" label="Angle θ" value={deg} min={5} max={85} unit="°" onChange={setDeg} />
        <Slider id="pj-h" label="Launch height" value={h0} min={0} max={20} unit=" m" onChange={setH0} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => { launch.current = { t0: -1, u, a, h0 }; }}><Rocket size={17} /> Launch</button>
        <button className="btn-ghost" onClick={() => { trails.current = []; }}>Clear trails</button>
      </div>
      <Readout items={[['Time of flight', `${T.toFixed(2)} s`], ['Max height', `${H.toFixed(1)} m`], ['Range', `${R.toFixed(1)} m`], ['uₓ, uᵧ', `${ux.toFixed(1)}, ${uy.toFixed(1)} m/s`]]} />
      <p className="text-sm text-muted">Blue arrow: horizontal velocity (constant). Red arrow: vertical velocity (changes by g every second). From the ground, range is greatest at 45°, and θ and 90° − θ land at the same spot — try 30° and 60°.</p>
    </div>
  );
}

function arrow(x: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1), l = Math.hypot(x2 - x1, y2 - y1);
  if (l < 4) return;
  x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
  x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - 8 * Math.cos(a - 0.4), y2 - 8 * Math.sin(a - 0.4)); x.lineTo(x2 - 8 * Math.cos(a + 0.4), y2 - 8 * Math.sin(a + 0.4)); x.closePath();
  x.fillStyle = x.strokeStyle; x.fill();
}
