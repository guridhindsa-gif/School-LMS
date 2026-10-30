'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { cssVar, useCanvas } from '../useCanvas';
import { LabNote, Readout, Slider } from '../Slider';

// 100 g of water at 1 atm, heated from −20 °C. Specific heats (J/g·°C) and latent heats (J/g): textbook values.
const M = 100, C_ICE = 2.1, C_WATER = 4.18, C_STEAM = 2.0, LF = 334, LV = 2260;
const STAGES = [M * C_ICE * 20, M * LF, M * C_WATER * 100, M * LV, M * C_STEAM * 20]; // J
const TOTAL = STAGES.reduce((a, b) => a + b, 0);

/** Temperature, state and melted/boiled fraction after Q joules have been supplied. */
function stateAt(Q: number) {
  let q = Q;
  const [a, b, c, d] = STAGES;
  if (q <= a) return { T: -20 + q / (M * C_ICE), phase: 'solid' as const, f: 0 };
  q -= a;
  if (q <= b) return { T: 0, phase: 'melting' as const, f: q / b };
  q -= b;
  if (q <= c) return { T: q / (M * C_WATER), phase: 'liquid' as const, f: 0 };
  q -= c;
  if (q <= d) return { T: 100, phase: 'boiling' as const, f: q / d };
  q -= d;
  return { T: 100 + q / (M * C_STEAM), phase: 'gas' as const, f: 0 };
}

const N = 36;
const seeds = Array.from({ length: N }, (_, i) => ({ gx: i % 6, gy: Math.floor(i / 6), a: (i * 2.399) % (Math.PI * 2), s: 0.6 + ((i * 37) % 10) / 12 }));

export default function StatesLab() {
  const { t } = useT();
  const [Q, setQ] = useState(0); // kJ
  const st = stateAt(Q * 1000);

  const ref = useCanvas((x, w, h, time) => {
    x.fillStyle = cssVar('--surface'); x.fillRect(0, 0, w, h);
    const box = Math.min(w, h) - 20, ox = (w - box) / 2, oy = 10;
    x.strokeStyle = cssVar('--ink'); x.lineWidth = 2; x.strokeRect(ox, oy, box, box);
    const cell = box / 7;
    // how "gas-like" each particle is: 0 = fixed lattice, 1 = liquid, 2 = gas
    seeds.forEach((p, i) => {
      let mode = st.phase === 'solid' ? 0 : st.phase === 'liquid' ? 1 : st.phase === 'gas' ? 2 : 0;
      if (st.phase === 'melting') mode = i / N < st.f ? 1 : 0;
      if (st.phase === 'boiling') mode = i / N < st.f ? 2 : 1;
      const temp = st.T + 30; // drives vibration speed
      let px: number, py: number;
      if (mode === 0) {
        const amp = 1 + temp * 0.05;
        px = ox + cell * (p.gx + 0.75) + Math.sin(time * 9 * p.s + p.a) * amp;
        py = oy + box - cell * (p.gy + 0.75) + Math.cos(time * 8 * p.s + p.a) * amp;
      } else if (mode === 1) {
        const ang = p.a + time * 0.6 * p.s;
        px = ox + box / 2 + Math.cos(ang) * (box * 0.12 + (i % 6) * cell * 0.45) * 0.8;
        py = oy + box * 0.68 + Math.sin(ang * 1.3) * box * 0.2;
      } else {
        const sp = 0.25 + temp * 0.002;
        const u = (Math.sin(p.a * 7) * 0.5 + 0.5 + time * sp * p.s) % 1, v = (Math.cos(p.a * 5) * 0.5 + 0.5 + time * sp * 0.8 * p.s) % 1;
        const tri = (z: number) => (z < 0.5 ? z * 2 : 2 - z * 2);
        px = ox + 8 + tri(u) * (box - 16); py = oy + 8 + tri(v) * (box - 16);
      }
      x.fillStyle = mode === 0 ? cssVar('--primary') : mode === 1 ? cssVar('--teal') : cssVar('--accent');
      x.beginPath(); x.arc(px, py, cell * 0.28, 0, Math.PI * 2); x.fill();
    });
  }, 0.62);

  // heating curve (temperature vs heat supplied)
  const W = 300, H = 150, tx = (q: number) => 30 + (q / TOTAL) * (W - 40), ty = (T: number) => H - 20 - ((T + 20) / 140) * (H - 30);
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) { const q = (i / 120) * TOTAL; pts.push(`${tx(q).toFixed(1)},${ty(stateAt(q).T).toFixed(1)}`); }
  const phaseLabel = t(`ls2.states.p.${st.phase}`, { pct: Math.round(st.f * 100) });

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-card border border-line">
          <canvas ref={ref} role="img" aria-label={t('ls2.states.aria', { q: Q, temp: st.T.toFixed(1), phase: phaseLabel })} />
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-card border border-line bg-surface" role="img" aria-label={t('ls2.states.curveAria')}>
          <line x1="30" y1={H - 20} x2={W - 6} y2={H - 20} stroke="rgb(var(--line))" /><line x1="30" y1="8" x2="30" y2={H - 20} stroke="rgb(var(--line))" />
          {[0, 100].map(T => <g key={T}><line x1="30" x2={W - 6} y1={ty(T)} y2={ty(T)} stroke="rgb(var(--line))" strokeDasharray="3 3" /><text x="26" y={ty(T) + 3} fontSize="9" textAnchor="end" fill="rgb(var(--muted))">{T}°</text></g>)}
          <polyline points={pts.join(' ')} fill="none" stroke="rgb(var(--primary))" strokeWidth="2.2" />
          <circle cx={tx(Q * 1000)} cy={ty(st.T)} r="4.5" fill="rgb(var(--accent))" />
          <text x={W - 6} y={H - 6} fontSize="9" textAnchor="end" fill="rgb(var(--muted))">{t('ls2.states.heatAxis')}</text>
          <text x="34" y="14" fontSize="9" fill="rgb(var(--muted))">{t('ls2.states.tempAxis')}</text>
        </svg>
      </div>
      <Slider id="st-q" label={t('ls2.states.heat')} value={Q} min={0} max={Math.ceil(TOTAL / 1000)} step={0.5} unit=" kJ" onChange={setQ} />
      <Readout items={[[t('ls2.states.temp'), `${st.T.toFixed(1)} °C`], [t('ls2.states.state'), phaseLabel], [t('ls2.states.heat'), `${Q.toFixed(1)} kJ`], [t('ls2.states.mass'), '100 g']]} />
      <LabNote>{t('ls2.states.note')}</LabNote>
    </div>
  );
}
