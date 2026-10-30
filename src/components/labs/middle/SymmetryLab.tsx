'use client';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Readout } from '../Slider';
import { C, Seg, btn } from './ui';

type Line = 'vertical' | 'horizontal' | 'diagonal';
const N = 8;
const key = (r: number, c: number) => `${r},${c}`;

/** Which half of the grid the student draws on, and where each cell lands in the mirror. */
const editable = (line: Line, r: number, c: number) => (line === 'vertical' ? c < N / 2 : line === 'horizontal' ? r < N / 2 : r > c);
const mirror = (line: Line, r: number, c: number): [number, number] => (line === 'vertical' ? [r, N - 1 - c] : line === 'horizontal' ? [N - 1 - r, c] : [c, r]);

const SHAPES: { id: string; order: number; lines: number; pts: string }[] = [
  { id: 'triangle', order: 3, lines: 3, pts: poly(3) },
  { id: 'square', order: 4, lines: 4, pts: poly(4, 45) },
  { id: 'rectangle', order: 2, lines: 2, pts: '-60,-34 60,-34 60,34 -60,34' },
  { id: 'hexagon', order: 6, lines: 6, pts: poly(6) },
  { id: 'parallelogram', order: 2, lines: 0, pts: '-60,30 -20,-30 60,-30 20,30' },
];
function poly(n: number, start = -90) {
  return Array.from({ length: n }, (_, i) => { const a = ((start + (360 / n) * i) * Math.PI) / 180; return `${(52 * Math.cos(a)).toFixed(1)},${(52 * Math.sin(a)).toFixed(1)}`; }).join(' ');
}

/** Draw on one half; the mirror line reflects it. Then explore rotational symmetry of shapes. */
export default function SymmetryLab() {
  const { t } = useT();
  const reduce = useReducedMotion();
  const [line, setLine] = useState<Line>('vertical');
  const [on, setOn] = useState<Set<string>>(new Set([key(1, 2), key(2, 1), key(2, 2), key(3, 3), key(5, 1)]));
  const [shape, setShape] = useState(SHAPES[0]);
  const [turns, setTurns] = useState(0);

  const toggle = (r: number, c: number) => setOn(s => { const n = new Set(s); const k = key(r, c); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const changeLine = (l: Line) => { setLine(l); setOn(s => new Set([...s].filter(k => { const [r, c] = k.split(',').map(Number); return editable(l, r, c); }))); };
  const mirrored = new Set([...on].map(k => { const [r, c] = k.split(',').map(Number); return key(...mirror(line, r, c)); }));
  const angle = turns * (360 / shape.order);
  const back = turns > 0 && turns % shape.order === 0;
  const shown = useTween(angle, !!reduce);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4" aria-labelledby="sym-reflect">
        <h3 id="sym-reflect" className="text-lg">{t('lm.sym.reflectTitle')}</h3>
        <Seg label={t('lm.sym.line')} value={line} onChange={changeLine} options={[['vertical', t('lm.sym.vertical')], ['horizontal', t('lm.sym.horizontal')], ['diagonal', t('lm.sym.diagonal')]]} />
        <div className="grid items-start gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="grid grid-cols-8 gap-0.5 rounded-card border border-line bg-line p-0.5" role="group" aria-label={t('lm.sym.gridAria')}>
              {Array.from({ length: N * N }, (_, i) => {
                const r = Math.floor(i / N), c = i % N, k = key(r, c), ed = editable(line, r, c);
                const filled = on.has(k), refl = mirrored.has(k);
                return (
                  <button key={k} type="button" disabled={!ed} aria-pressed={ed ? filled : undefined}
                    aria-label={t(ed ? 'lm.sym.cell' : 'lm.sym.cellMirror', { r: r + 1, c: c + 1 }) + (refl ? ` · ${t('lm.sym.reflected')}` : '')}
                    onClick={() => toggle(r, c)}
                    className="aspect-square min-h-6 rounded-[3px] transition"
                    style={{ background: filled ? 'rgb(var(--primary))' : refl ? 'rgb(var(--accent) / .75)' : ed ? 'rgb(var(--surface))' : 'rgb(var(--surface-2))' }} />
                );
              })}
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              {line === 'vertical' && <line x1="50" y1="0" x2="50" y2="100" stroke={C.bad} strokeWidth="1" strokeDasharray="3 2" />}
              {line === 'horizontal' && <line x1="0" y1="50" x2="100" y2="50" stroke={C.bad} strokeWidth="1" strokeDasharray="3 2" />}
              {line === 'diagonal' && <line x1="0" y1="0" x2="100" y2="100" stroke={C.bad} strokeWidth="1" strokeDasharray="3 2" />}
            </svg>
          </div>
          <div className="grid content-start gap-3">
            <Readout items={[[t('lm.sym.drawn'), String(on.size)], [t('lm.sym.mirrored'), String(mirrored.size)]]} />
            <div className="flex flex-wrap gap-2">
              <button className={btn()} onClick={() => setOn(new Set())}>{t('lm.sym.clear')}</button>
            </div>
            <p className="text-sm text-muted">{t('lm.sym.howTo')}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t border-line pt-5" aria-labelledby="sym-rot">
        <h3 id="sym-rot" className="text-lg">{t('lm.sym.rotTitle')}</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('lm.sym.shape')}>
          {SHAPES.map(s => <button key={s.id} type="button" role="radio" aria-checked={shape.id === s.id} className={btn(shape.id === s.id)} onClick={() => { setShape(s); setTurns(0); }}>{t(`lm.sym.s.${s.id}`)}</button>)}
        </div>
        <div className="grid items-center gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
          <svg viewBox="-80 -80 160 160" className="mx-auto w-48" role="img" aria-label={t('lm.sym.rotAria', { shape: t(`lm.sym.s.${shape.id}`), deg: angle % 360 })}>
            <polygon points={shape.pts} fill="none" stroke={C.line} strokeWidth="2" strokeDasharray="4 3" />
            <g transform={`rotate(${shown})`}>
              <polygon points={shape.pts} fill={C.teal} fillOpacity=".3" stroke={C.teal} strokeWidth="3" strokeLinejoin="round" />
              <circle cx={shape.pts.split(' ')[0].split(',').map(Number)[0]} cy={shape.pts.split(' ')[0].split(',').map(Number)[1]} r="6" fill={C.accent} />
            </g>
            <circle r="3" fill={C.ink} />
          </svg>
          <div className="grid content-start gap-3">
            <div className="flex flex-wrap gap-2">
              <button className={btn(true)} onClick={() => setTurns(n => n + 1)}>{t('lm.sym.rotate', { deg: Math.round(360 / shape.order) })}</button>
              <button className={btn()} onClick={() => setTurns(0)}>{t('lm.sym.reset')}</button>
            </div>
            <Readout items={[[t('lm.sym.order'), String(shape.order)], [t('lm.sym.smallest'), `${Math.round(360 / shape.order)}°`], [t('lm.sym.lines'), String(shape.lines)], [t('lm.sym.turned'), `${angle}°`]]} />
            {back && <p className="text-sm font-semibold text-good" role="status">{t('lm.sym.back', { n: turns })}</p>}
          </div>
        </div>
      </section>
      <LabNote>{t('lm.sym.note')}</LabNote>
    </div>
  );
}

/** Smoothly animates a number towards `target` (rotation about the SVG origin); instant with reduced motion. */
function useTween(target: number, instant: boolean) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (instant) { setV(target); from.current = target; return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 500), e = 1 - Math.pow(1 - k, 3);
      const x = a + (target - a) * e; setV(x); from.current = x;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, instant]);
  return v;
}
