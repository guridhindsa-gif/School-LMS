'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Readout, Slider } from '../Slider';
import { C, Seg } from './ui';

type Shape = 'rect' | 'L';
const N = 12; // grid is 12 × 12 cm
const TARGET = 12;

/** Rectangles and an L-shape on a centimetre grid: area counts squares, perimeter walks the edge. */
export default function AreaPerimeterLab() {
  const { t } = useT();
  const [shape, setShape] = useState<Shape>('rect');
  const [w, setW] = useState(4), [h, setH] = useState(3);
  const [cw, setCw] = useState(2), [ch, setCh] = useState(1);
  const [found, setFound] = useState<string[]>([]);

  const cutW = Math.min(cw, w - 1), cutH = Math.min(ch, h - 1);
  const area = shape === 'rect' ? w * h : w * h - cutW * cutH;
  // A corner notch does not change the total edge length: the two cut edges replace the removed ones.
  const per = 2 * (w + h);

  useEffect(() => {
    if (shape === 'rect' && area === TARGET) {
      const key = `${Math.min(w, h)}×${Math.max(w, h)}`;
      setFound(f => (f.includes(key) ? f : [...f, key].sort()));
    }
  }, [shape, w, h, area]);

  const S = 22, ox = 10, oy = 10;
  const cells: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (shape === 'L' && x >= w - cutW && y < cutH) continue;
    cells.push([x, y]);
  }
  const outline = shape === 'rect'
    ? `M${ox} ${oy} h${w * S} v${h * S} h${-w * S}Z`
    : `M${ox} ${oy} h${(w - cutW) * S} v${cutH * S} h${cutW * S} v${(h - cutH) * S} h${-w * S}Z`;

  return (
    <div className="grid gap-5">
      <Seg label={t('lm.ap.shape')} value={shape} onChange={setShape} options={[['rect', t('lm.ap.rect')], ['L', t('lm.ap.lshape')]]} />
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox={`0 0 ${N * S + 20} ${N * S + 20}`} className="w-full max-w-sm rounded-card border border-line bg-surface" role="img"
          aria-label={t('lm.ap.aria', { shape: t(shape === 'rect' ? 'lm.ap.rect' : 'lm.ap.lshape'), area, per })}>
          {Array.from({ length: N + 1 }, (_, i) => (
            <g key={i}><line x1={ox + i * S} y1={oy} x2={ox + i * S} y2={oy + N * S} stroke={C.line} /><line x1={ox} y1={oy + i * S} x2={ox + N * S} y2={oy + i * S} stroke={C.line} /></g>
          ))}
          {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={ox + x * S + 1} y={oy + y * S + 1} width={S - 2} height={S - 2} rx="3" fill={C.teal} fillOpacity=".35" />)}
          <path d={outline} fill="none" stroke={C.accent} strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
        <div className="grid content-start gap-3">
          <Slider id="ap-w" label={t('lm.ap.length')} value={w} min={2} max={N} unit=" cm" onChange={setW} />
          <Slider id="ap-h" label={t('lm.ap.breadth')} value={h} min={2} max={N} unit=" cm" onChange={setH} />
          {shape === 'L' && <>
            {w > 2 && <Slider id="ap-cw" label={t('lm.ap.cutW')} value={cutW} min={1} max={w - 1} unit=" cm" onChange={setCw} />}
            {h > 2 && <Slider id="ap-ch" label={t('lm.ap.cutH')} value={cutH} min={1} max={h - 1} unit=" cm" onChange={setCh} />}
          </>}
          <Readout items={[
            [t('lm.ap.area'), `${area} cm²`],
            [t('lm.ap.perimeter'), `${per} cm`],
            [t('lm.ap.formulaA'), shape === 'rect' ? `${w} × ${h}` : `${w}×${h} − ${cutW}×${cutH}`],
            [t('lm.ap.formulaP'), `2 × (${w} + ${h})`],
          ]} />
          {shape === 'rect' && (
            <div className="rounded-ctl border border-line bg-surface2/60 p-3 text-sm" aria-live="polite">
              <b>{t('lm.ap.challenge', { n: TARGET })}</b>
              <p className="text-muted">{found.length ? t('lm.ap.found', { list: found.map(f => { const [a, b] = f.split('×').map(Number); return `${f} (P = ${2 * (a + b)} cm)`; }).join(', ') }) : t('lm.ap.none')}</p>
            </div>
          )}
        </div>
      </div>
      <LabNote>{shape === 'rect' ? t('lm.ap.note') : t('lm.ap.noteL')}</LabNote>
    </div>
  );
}
