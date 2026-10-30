'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Legend, Readout, Slider } from '../Slider';
import { C, Seg } from './ui';

type Op = '+' | '-';
const MIN = -20, MAX = 20;
const sign = (n: number) => (n < 0 ? `(${n})` : String(n));

/** Integer addition and subtraction as jumps on a number line; subtracting is adding the opposite. */
export default function IntegersLab() {
  const { t } = useT();
  const [a, setA] = useState(-3), [b, setB] = useState(5);
  const [op, setOp] = useState<Op>('-');
  const step = op === '+' ? b : -b; // a − b = a + (−b)
  const res = a + step;

  const W = 640, pad = 20, X = (v: number) => pad + ((v - MIN) / (MAX - MIN)) * (W - 2 * pad);
  const y = 70;
  const arrow = (x1: number, x2: number, yy: number, col: string) => {
    const dir = x2 >= x1 ? 1 : -1;
    return (
      <g>
        <path d={`M${x1} ${yy} Q${(x1 + x2) / 2} ${yy - 34} ${x2} ${yy}`} fill="none" stroke={col} strokeWidth="3" />
        {x1 !== x2 && <path d={`M${x2} ${yy} l${-8 * dir} -9 M${x2} ${yy} l${-11 * dir} 2`} stroke={col} strokeWidth="3" strokeLinecap="round" />}
      </g>
    );
  };

  return (
    <div className="grid gap-5">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 110`} className="w-full min-w-[520px] rounded-card border border-line bg-surface" role="img"
          aria-label={t('lm.int.aria', { a, op, b, res })}>
          <line x1={pad} y1={y} x2={W - pad} y2={y} stroke={C.ink} strokeWidth="2" />
          {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map(v => (
            <g key={v}>
              <line x1={X(v)} y1={y - (v % 5 ? 4 : 8)} x2={X(v)} y2={y + (v % 5 ? 4 : 8)} stroke={v === 0 ? C.ink : C.muted} strokeWidth={v === 0 ? 2 : 1} />
              {v % 5 === 0 && <text x={X(v)} y={y + 22} fontSize="11" textAnchor="middle" fill={v === 0 ? C.ink : C.muted} fontWeight={v === 0 ? 700 : 400}>{v}</text>}
            </g>
          ))}
          {arrow(X(0), X(a), y - 2, C.primary)}
          {arrow(X(a), X(res), y - 26, C.accent)}
          <circle cx={X(res)} cy={y} r="7" fill={C.teal} />
          <text x={X(res)} y={y + 40} fontSize="12" fontWeight="700" textAnchor="middle" fill={C.teal}>{res}</text>
        </svg>
      </div>
      <Seg label={t('lm.int.operation')} value={op} onChange={setOp} options={[['+', t('lm.int.add')], ['-', t('lm.int.sub')]]} />
      <Slider id="int-a" label={t('lm.int.first')} value={a} min={-10} max={10} onChange={setA} />
      <Slider id="int-b" label={t('lm.int.second')} value={b} min={-10} max={10} onChange={setB} />
      <Legend items={[[C.primary, t('lm.int.startAt', { a })], [C.accent, t('lm.int.move', { n: step })], [C.teal, t('lm.int.answer')]]} />
      <Readout items={[
        [t('lm.int.sum'), `${a} ${op} ${sign(b)} = ${res}`],
        [t('lm.int.asAdd'), op === '-' ? `${a} + ${sign(-b)} = ${res}` : '—'],
        [t('lm.int.direction'), step > 0 ? t('lm.int.right', { n: step }) : step < 0 ? t('lm.int.left', { n: -step }) : t('lm.int.stay')],
        [t('lm.int.temp'), t('lm.int.tempVal', { a, res })],
      ]} />
      <LabNote>{t('lm.int.note')}</LabNote>
    </div>
  );
}
