'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';

type Kind = 'opaque' | 'translucent' | 'transparent';
const SCREEN = 100; // screen position, cm from the left edge

/** Point source, object and screen: shadow size from similar triangles. */
export default function ShadowsLab() {
  const { t } = useT();
  const [L, setL] = useState(10);   // light position (cm)
  const [O, setO] = useState(50);   // object position (cm)
  const [h, setH] = useState(6);    // object height (cm)
  const [kind, setKind] = useState<Kind>('opaque');
  const o = Math.max(O, L + 5);
  const k = (SCREEN - L) / (o - L);            // magnification by similar triangles
  const hs = h * k;
  const s = 4.2, x0 = 20, cy = 120;            // px per cm, left margin, axis
  const X = (cm: number) => x0 + cm * s;
  const topO = cy - (h / 2) * s, botO = cy + (h / 2) * s;
  const topS = cy - (hs / 2) * s, botS = cy + (hs / 2) * s;
  const shade = kind === 'opaque' ? 0.85 : kind === 'translucent' ? 0.3 : 0;
  const clip = (y: number) => Math.max(8, Math.min(232, y));

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-card border border-line bg-night">
        <svg viewBox="0 0 470 240" className="w-full" role="img"
          aria-label={t('ls2.shadows.aria', { l: L, o, h, hs: kind === 'transparent' ? 0 : hs.toFixed(1), kind: t(`ls2.shadows.${kind}`) })}>
          {/* screen */}
          <rect x={X(SCREEN)} y="10" width="10" height="220" fill="rgb(var(--on-night))" opacity=".85" />
          {/* light cone edges */}
          <g stroke="rgb(var(--accent))" strokeWidth="1.5" opacity=".75">
            <line x1={X(L)} y1={cy} x2={X(SCREEN)} y2={clip(topS)} />
            <line x1={X(L)} y1={cy} x2={X(SCREEN)} y2={clip(botS)} />
          </g>
          {/* shadow on screen */}
          {shade > 0 && <rect x={X(SCREEN) - 1} y={clip(topS)} width="12" height={clip(botS) - clip(topS)} fill="rgb(var(--ink))" opacity={shade} />}
          {/* object */}
          <rect x={X(o) - 3} y={topO} width="6" height={botO - topO} rx="2" fill="rgb(var(--primary))"
            opacity={kind === 'opaque' ? 1 : kind === 'translucent' ? 0.55 : 0.22} stroke="rgb(var(--on-night))" strokeWidth="1" />
          {/* point source */}
          <circle cx={X(L)} cy={cy} r="9" fill="rgb(var(--accent))" />
          <circle cx={X(L)} cy={cy} r="16" fill="rgb(var(--accent))" opacity=".25" />
          <text x={X(L)} y="232" textAnchor="middle" fontSize="11" fill="rgb(var(--on-night))">{t('ls2.shadows.light')}</text>
          <text x={X(o)} y="232" textAnchor="middle" fontSize="11" fill="rgb(var(--on-night))">{t('ls2.shadows.object')}</text>
        </svg>
      </div>
      <div className="seg w-fit flex-wrap" role="radiogroup" aria-label={t('ls2.shadows.material')}>
        {(['opaque', 'translucent', 'transparent'] as const).map(m => <button key={m} role="radio" aria-checked={kind === m} onClick={() => setKind(m)}>{t(`ls2.shadows.${m}`)}</button>)}
      </div>
      <Slider id="sh-l" label={t('ls2.shadows.lightPos')} value={L} min={0} max={40} unit=" cm" onChange={v => { setL(v); if (O < v + 5) setO(v + 5); }} />
      <Slider id="sh-o" label={t('ls2.shadows.objPos')} value={o} min={L + 5} max={95} unit=" cm" onChange={setO} />
      <Slider id="sh-h" label={t('ls2.shadows.objH')} value={h} min={2} max={12} unit=" cm" onChange={setH} />
      <Readout items={[
        [t('ls2.shadows.lightToObj'), `${o - L} cm`], [t('ls2.shadows.lightToScreen'), `${SCREEN - L} cm`],
        [t('ls2.shadows.shadowH'), kind === 'transparent' ? t('ls2.shadows.none') : `${hs.toFixed(1)} cm`], [t('ls2.shadows.times'), `× ${k.toFixed(2)}`],
      ]} />
      <Legend items={[['rgb(var(--accent))', t('ls2.shadows.rays')], ['rgb(var(--primary))', t('ls2.shadows.object')]]} />
      <LabNote>{t('ls2.shadows.note')}</LabNote>
    </div>
  );
}
