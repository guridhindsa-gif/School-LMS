'use client';
import { useRef, useState } from 'react';
import { cssVar, useCanvas } from './useCanvas';
import { Readout, Slider } from './Slider';

/** Spring–mass oscillator that traces its displacement–time graph (SHM). */
export default function WavesLab() {
  const [k, setK] = useState(20);   // N/m
  const [m, setM] = useState(0.5);  // kg
  const [A, setA] = useState(0.8);  // relative amplitude
  const [damp, setDamp] = useState(0);
  const hist = useRef<number[]>([]);
  const omega = Math.sqrt(k / m), T = (2 * Math.PI) / omega, f = 1 / T;

  const ref = useCanvas((x, w, h, t) => {
    const chalk = cssVar('--chalk'), mari = cssVar('--marigold');
    x.fillStyle = cssVar('--board-2'); x.fillRect(0, 0, w, h);
    const split = Math.min(w * 0.32, 220), mid = h / 2, amp = (h / 2 - 34) * A;
    const y = amp * Math.exp(-damp * t) * Math.cos(omega * t);
    // ceiling + spring
    x.strokeStyle = chalk; x.lineWidth = 2; x.beginPath(); x.moveTo(split * 0.2, 16); x.lineTo(split * 0.8, 16); x.stroke();
    const cx = split / 2, top = 16, boxY = mid + y;
    x.beginPath(); x.moveTo(cx, top);
    const coils = 14;
    for (let i = 1; i <= coils; i++) { const yy = top + ((boxY - 26 - top) * i) / coils; x.lineTo(cx + (i % 2 ? 14 : -14), yy); }
    x.lineTo(cx, boxY - 22); x.stroke();
    x.fillStyle = mari; x.fillRect(cx - 24, boxY - 22, 48, 44);
    x.fillStyle = '#2b1b02'; x.font = '700 12px "IBM Plex Mono", monospace'; x.textAlign = 'center'; x.fillText(`${m} kg`, cx, boxY + 4); x.textAlign = 'left';
    // equilibrium line
    x.setLineDash([4, 6]); x.globalAlpha = 0.4; x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    // graph
    hist.current.push(y); if (hist.current.length > Math.floor(w - split - 20)) hist.current.shift();
    x.strokeStyle = mari; x.lineWidth = 2.5; x.beginPath();
    hist.current.forEach((v, i) => { const px = split + 10 + i; const py = mid + v; i ? x.lineTo(px, py) : x.moveTo(px, py); });
    x.stroke();
    // connector
    x.globalAlpha = 0.35; x.strokeStyle = chalk; x.beginPath(); x.moveTo(cx + 24, boxY); x.lineTo(split + 10 + hist.current.length, boxY); x.stroke(); x.globalAlpha = 1;
    x.fillStyle = chalk; x.font = '12px Mukta, sans-serif'; x.fillText('displacement x(t)', split + 14, 22); x.fillText('time →', w - 56, h - 10);
  }, 0.5);

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-2xl"><canvas ref={ref} role="img" aria-label="Spring-mass oscillator drawing its displacement-time graph" /></div>
      <Slider id="w-k" label="Spring constant k" value={k} min={5} max={80} unit=" N/m" onChange={v => { setK(v); hist.current = []; }} />
      <Slider id="w-m" label="Mass m" value={m} min={0.1} max={2} step={0.1} unit=" kg" onChange={v => { setM(v); hist.current = []; }} />
      <Slider id="w-a" label="Amplitude" value={A} min={0.2} max={1} step={0.05} onChange={setA} />
      <Slider id="w-d" label="Damping" value={damp} min={0} max={0.5} step={0.02} onChange={v => { setDamp(v); hist.current = []; }} />
      <Readout items={[['ω = √(k/m)', `${omega.toFixed(2)} rad/s`], ['Period T', `${T.toFixed(2)} s`], ['Frequency f', `${f.toFixed(2)} Hz`], ['x(t)', damp ? 'A e^(−bt) cos ωt' : 'A cos ωt']]} />
      <p className="text-sm text-muted">A stiffer spring (bigger k) or a lighter mass oscillates faster: T = 2π√(m/k). Amplitude does not change the period in SHM. Add damping to see the amplitude die away, as in a real shock absorber.</p>
    </div>
  );
}
