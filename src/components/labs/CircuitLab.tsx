'use client';
import { useState } from 'react';
import { cssVar, useCanvas } from './useCanvas';
import { Readout, Slider } from './Slider';
import { cx } from '../ui';

export default function CircuitLab() {
  const [V, setV] = useState(6);
  const [r1, setR1] = useState(4), [r2, setR2] = useState(6);
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const R = mode === 'series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const I = V / R, P = V * I;
  const i1 = mode === 'series' ? I : V / r1, i2 = mode === 'series' ? I : V / r2;

  const ref = useCanvas((x, w, h, t) => {
    const ink = cssVar('--ink'), mari = cssVar('--marigold'), sky = cssVar('--sky');
    x.fillStyle = cssVar('--surface'); x.fillRect(0, 0, w, h);
    const L = w * 0.1, Rr = w * 0.9, T = h * 0.18, B = h * 0.82;
    x.strokeStyle = ink; x.lineWidth = 3; x.lineJoin = 'round';
    // loop path for electrons
    const path: [number, number][] = [];
    const seg = (ax: number, ay: number, bx: number, by: number, n = 40) => { for (let i = 0; i < n; i++) path.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]); };
    // battery on left
    x.beginPath(); x.moveTo(L, B); x.lineTo(L, h / 2 + 18); x.moveTo(L, h / 2 - 18); x.lineTo(L, T); x.stroke();
    x.lineWidth = 4; x.beginPath(); x.moveTo(L - 20, h / 2 - 8); x.lineTo(L + 20, h / 2 - 8); x.stroke();
    x.lineWidth = 8; x.beginPath(); x.moveTo(L - 10, h / 2 + 8); x.lineTo(L + 10, h / 2 + 8); x.stroke();
    x.fillStyle = ink; x.font = '700 13px "IBM Plex Mono", monospace'; x.fillText(`${V} V`, L + 26, h / 2 + 5);
    x.lineWidth = 3;
    const res = (cx: number, cy: number, label: string, vertical = false) => {
      x.save(); x.translate(cx, cy); if (vertical) x.rotate(Math.PI / 2);
      x.fillStyle = cssVar('--surface'); x.fillRect(-34, -12, 68, 24);
      x.beginPath(); x.moveTo(-34, 0); for (let i = 0; i < 6; i++) x.lineTo(-28 + i * 11.3, i % 2 ? 10 : -10); x.lineTo(34, 0); x.stroke(); x.restore();
      x.fillStyle = ink; x.fillText(label, cx - 14, cy + (vertical ? 0 : -18));
    };
    if (mode === 'series') {
      x.beginPath(); x.moveTo(L, T); x.lineTo(Rr, T); x.lineTo(Rr, B); x.lineTo(L, B); x.stroke();
      res(w * 0.38, T, `${r1} Ω`); res(w * 0.68, T, `${r2} Ω`);
      seg(L, B, L, T); seg(L, T, Rr, T, 80); seg(Rr, T, Rr, B); seg(Rr, B, L, B, 80);
    } else {
      const M = (T + B) / 2;
      x.beginPath(); x.moveTo(L, T); x.lineTo(w * 0.4, T); x.moveTo(L, B); x.lineTo(w * 0.4, B);
      x.moveTo(w * 0.4, T); x.lineTo(w * 0.4, B); x.moveTo(Rr, T); x.lineTo(Rr, B);
      x.moveTo(w * 0.4, T + (M - T) * 0.35); x.lineTo(Rr, T + (M - T) * 0.35); x.moveTo(w * 0.4, B - (B - M) * 0.35); x.lineTo(Rr, B - (B - M) * 0.35); x.stroke();
      res(w * 0.68, T + (M - T) * 0.35, `${r1} Ω`); res(w * 0.68, B - (B - M) * 0.35, `${r2} Ω`);
      seg(L, B, L, T); seg(L, T, w * 0.4, T, 30);
    }
    // electrons (speed ∝ current)
    const speed = Math.min(I, 6) * 0.05;
    x.fillStyle = sky;
    const n = path.length;
    for (let k = 0; k < 28; k++) {
      const idx = Math.floor(((k / 28 + t * speed) % 1) * n);
      const [px, py] = path[idx] || [0, 0];
      x.beginPath(); x.arc(px, py, 4, 0, Math.PI * 2); x.fill();
    }
    if (mode === 'parallel') {
      const M = (T + B) / 2;
      [[T + (M - T) * 0.35, i1], [B - (B - M) * 0.35, i2]].forEach(([yy, ii], j) => {
        for (let k = 0; k < 10; k++) {
          const u = ((k / 10 + t * Math.min(ii, 6) * 0.05 + j * 0.05) % 1);
          x.beginPath(); x.arc(w * 0.4 + u * (Rr - w * 0.4), yy, 4, 0, Math.PI * 2); x.fill();
        }
      });
    }
    // bulb glow ∝ power
    const glow = Math.min(1, P / 20);
    x.fillStyle = `rgba(255, 196, 60, ${0.15 + glow * 0.75})`; x.shadowColor = mari; x.shadowBlur = 30 * glow;
    x.beginPath(); x.arc(w * 0.53, B, 14, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
    x.fillStyle = ink; x.fillText('bulb', w * 0.53 - 16, B + 30);
  }, 0.5);

  return (
    <div className="grid gap-4">
      <div className="flex gap-2" role="radiogroup" aria-label="Connection">
        {(['series', 'parallel'] as const).map(m => <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={cx('rounded-full border px-3 py-1 text-sm font-semibold capitalize', mode === m ? 'border-ink bg-ink text-bg' : 'border-line bg-surface')}>{m}</button>)}
      </div>
      <div className="overflow-hidden rounded-2xl border border-line"><canvas ref={ref} role="img" aria-label={`${mode} circuit with ${r1} and ${r2} ohm resistors at ${V} volts`} /></div>
      <Slider id="c-v" label="Voltage V" value={V} min={1} max={12} unit=" V" onChange={setV} />
      <Slider id="c-r1" label="R₁" value={r1} min={1} max={20} unit=" Ω" onChange={setR1} />
      <Slider id="c-r2" label="R₂" value={r2} min={1} max={20} unit=" Ω" onChange={setR2} />
      <Readout items={[['Total resistance', `${R.toFixed(2)} Ω`], ['Current I = V/R', `${I.toFixed(2)} A`], ['Power P = VI', `${P.toFixed(1)} W`], [mode === 'series' ? 'V across R₁, R₂' : 'I through R₁, R₂', mode === 'series' ? `${(I * r1).toFixed(1)} V, ${(I * r2).toFixed(1)} V` : `${i1.toFixed(2)} A, ${i2.toFixed(2)} A`]]} />
      <p className="text-sm text-muted">In series the same current flows through both resistors and voltages add up. In parallel each branch gets the full voltage and currents add up, so total resistance is smaller than either resistor: 1/R = 1/R₁ + 1/R₂.</p>
    </div>
  );
}
