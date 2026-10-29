'use client';
import { useState } from 'react';
import { cssVar, useCanvas } from './useCanvas';
import { LabNote, Legend, Readout, Slider } from './Slider';

type Kind = 'quadratic' | 'sine' | 'linear';

export default function GrapherLab() {
  const [kind, setKind] = useState<Kind>('quadratic');
  const [a, setA] = useState(1), [b, setB] = useState(-2), [c, setC] = useState(-3);
  const f = (x: number) => kind === 'quadratic' ? a * x * x + b * x + c : kind === 'sine' ? a * Math.sin(b * x + c) : a * x + b;
  const D = b * b - 4 * a * c;
  const roots = kind === 'quadratic' && a !== 0 ? (D < 0 ? [] : D === 0 ? [-b / (2 * a)] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)]) : kind === 'linear' && a !== 0 ? [-b / a] : [];
  const vx = -b / (2 * a), vy = f(vx);

  const ref = useCanvas((x, w, h) => {
    const range = 8, sx = w / (2 * range), sy = h / (2 * range * (h / w));
    const X = (v: number) => w / 2 + v * sx, Y = (v: number) => h / 2 - v * sy;
    const ink = cssVar('--ink'), line = cssVar('--line'), mari = cssVar('--accent'), board = cssVar('--primary');
    x.fillStyle = cssVar('--surface'); x.fillRect(0, 0, w, h);
    x.strokeStyle = line; x.lineWidth = 1;
    for (let i = -range; i <= range; i++) { x.beginPath(); x.moveTo(X(i), 0); x.lineTo(X(i), h); x.stroke(); x.beginPath(); x.moveTo(0, Y(i)); x.lineTo(w, Y(i)); x.stroke(); }
    x.strokeStyle = ink; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(0, Y(0)); x.lineTo(w, Y(0)); x.stroke(); x.beginPath(); x.moveTo(X(0), 0); x.lineTo(X(0), h); x.stroke();
    x.fillStyle = ink; x.font = '11px "IBM Plex Mono", monospace';
    for (let i = -range + 2; i < range; i += 2) if (i) { x.fillText(String(i), X(i) - 4, Y(0) + 14); x.fillText(String(i), X(0) + 5, Y(i) + 4); }
    // curve
    x.strokeStyle = board; x.lineWidth = 3.5; x.beginPath();
    let first = true;
    for (let px = 0; px <= w; px += 2) {
      const xv = (px - w / 2) / sx, yv = f(xv);
      if (!isFinite(yv) || Math.abs(yv) > 100) { first = true; continue; }
      first ? x.moveTo(px, Y(yv)) : x.lineTo(px, Y(yv)); first = false;
    }
    x.stroke();
    // roots + vertex
    roots.forEach(r => { x.fillStyle = mari; x.beginPath(); x.arc(X(r), Y(0), 6, 0, Math.PI * 2); x.fill(); });
    if (kind === 'quadratic' && a !== 0) { x.fillStyle = cssVar('--bad'); x.beginPath(); x.arc(X(vx), Y(vy), 6, 0, Math.PI * 2); x.fill(); }
  }, 0.62);

  const eq = kind === 'quadratic' ? `y = ${a}x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : kind === 'sine' ? `y = ${a} sin(${b}x ${c < 0 ? '−' : '+'} ${Math.abs(c)})` : `y = ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}`;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="seg" role="radiogroup" aria-label="Function type">
        {(['quadratic', 'linear', 'sine'] as Kind[]).map(k => (
          <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className="capitalize">{k}</button>
        ))}
        </div>
        <span className="ml-auto rounded-ctl bg-surface2 px-3 py-1 font-mono text-sm" aria-live="polite">{eq}</span>
      </div>
      <div className="overflow-hidden rounded-card border border-line"><canvas ref={ref} role="img" aria-label={`Graph of ${eq}`} /></div>
      <Slider id="g-a" label="a" value={a} min={-3} max={3} step={0.5} onChange={setA} />
      <Slider id="g-b" label="b" value={b} min={-6} max={6} step={0.5} onChange={setB} />
      {kind !== 'linear' && <Slider id="g-c" label="c" value={c} min={-6} max={6} step={0.5} onChange={setC} />}
      {kind === 'quadratic' && (
        <Readout items={[['Discriminant D', D.toFixed(2)], ['Roots', roots.length ? roots.map(r => r.toFixed(2)).join(', ') : 'none (D < 0)'], ['Vertex', a ? `(${vx.toFixed(2)}, ${vy.toFixed(2)})` : '—'], ['Opens', a > 0 ? 'upward' : a < 0 ? 'downward' : 'line']]} />
      )}
      {kind === 'sine' && <Readout items={[['Amplitude', String(Math.abs(a))], ['Period', b ? `${(2 * Math.PI / Math.abs(b)).toFixed(2)}` : '∞'], ['Phase shift', b ? (-c / b).toFixed(2) : '—'], ['Range', `[−${Math.abs(a)}, ${Math.abs(a)}]`]]} />}
      {kind === 'linear' && <Readout items={[['Slope', String(a)], ['y-intercept', String(b)], ['x-intercept', a ? (-b / a).toFixed(2) : 'none'], ['Angle', `${(Math.atan(a) * 180 / Math.PI).toFixed(1)}°`]]} />}
      <Legend items={[['rgb(var(--primary))', 'Graph'], ['rgb(var(--accent))', 'Roots (x-intercepts)'], ...(kind === 'quadratic' ? [['rgb(var(--bad))', 'Vertex'] as [string, string]] : [])]} />
      <LabNote>Amber dots are where the graph cuts the x-axis (the roots); the red dot is the vertex. When D &lt; 0 the parabola never touches the x-axis, so there are no real roots.</LabNote>
    </div>
  );
}
