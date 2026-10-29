'use client';
import { motion } from 'framer-motion';
import { Bar, Card, Reveal } from '@/components/ui';

const COVER: [string, number][] = [['Classes 1–2', 0.82], ['Classes 3–5', 0.74], ['Classes 6–8', 0.66], ['Classes 9–10', 0.64], ['Classes 11–12', 0.58]];
const SUBJ = ['Maths', 'Science', 'English', 'Social Sc.', 'Languages'];
const GRID: [string, number[]][] = [['Class 8', [71, 68, 79, 74, 81]], ['Class 9', [64, 70, 76, 69, 80]], ['Class 10', [58, 62, 72, 66, 77]], ['Class 11', [55, 60, 70, 63, 75]]];
const TREND = [88.1, 91.4, 90.2, 92.8, 93.4, 92.1, 93.4, 94.0];

export function PrincipalView() {
  const col = (v: number) => (v >= 75 ? 'rgb(var(--good) / .22)' : v >= 65 ? 'rgb(var(--marigold) / .25)' : 'rgb(var(--bad) / .2)');
  const W = 320, H = 90, min = 86, max = 96;
  const pts = TREND.map((v, i) => [(i / (TREND.length - 1)) * W, H - ((v - min) / (max - min)) * H] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Principal dashboard</p><h1 className="text-3xl">School at a glance</h1></div>
          <span className="pill bg-surface2 text-muted">Sample data · week of 26 Oct</span>
        </div>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Attendance today', '93.4%', '+1.2 vs last week', 'bg-good/15 text-good'], ['Syllabus covered', '66%', '4% behind plan', 'bg-marigold/20 text-warn'], ['Students at risk', '18', '6 new this week', 'bg-bad/15 text-bad'], ['Weekly active on LMS', '78%', 'Students', 'bg-sky/15 text-sky']].map(([k, v, s, c], i) => (
          <Reveal key={k} delay={i * 0.05}><Card className="grid gap-1"><span className="text-sm text-muted">{k}</span><b className="font-display text-4xl tabular-nums">{v}</b><span className={`pill w-fit ${c}`}>{s}</span></Card></Reveal>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="grid content-start gap-3">
          <h2 className="text-xl">Syllabus coverage vs plan</h2>
          {COVER.map(([n, v]) => <div key={n} className="grid grid-cols-[110px_1fr_44px] items-center gap-3 text-sm"><span>{n}</span><Bar value={v} /><span className="text-right font-mono">{Math.round(v * 100)}%</span></div>)}
        </Card>
        <Card className="grid content-start gap-3">
          <h2 className="text-xl">Attendance · last 8 weeks</h2>
          <svg viewBox={`-8 -8 ${W + 16} ${H + 28}`} className="w-full" role="img" aria-label={`Attendance trend from ${TREND[0]}% to ${TREND[TREND.length - 1]}%`}>
            {[88, 92, 96].map(g => { const y = H - ((g - min) / (max - min)) * H; return <g key={g}><line x1={0} x2={W} y1={y} y2={y} stroke="rgb(var(--line))" /><text x={W} y={y - 3} textAnchor="end" fontSize="9" fill="rgb(var(--muted))">{g}%</text></g>; })}
            <motion.path d={`${d} L${W} ${H} L0 ${H}Z`} fill="rgb(var(--good) / .12)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
            <motion.path d={d} fill="none" stroke="rgb(var(--good))" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="rgb(var(--good))" />
          </svg>
        </Card>
      </div>
      <Card className="grid gap-3">
        <h2 className="text-xl">Average test score by class and subject (%)</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-center text-sm tabular-nums">
            <thead><tr><th className="p-2 text-left">Class</th>{SUBJ.map(s => <th key={s} className="p-2">{s}</th>)}</tr></thead>
            <tbody>{GRID.map(([c, row]) => <tr key={c} className="border-t border-line"><td className="p-2 text-left font-semibold">{c}</td>{row.map((v, i) => <td key={i} className="p-2" style={{ background: col(v) }}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="grid content-start gap-3">
          <h2 className="text-xl">Class 12 forecast</h2>
          <div className="grid grid-cols-3 gap-3 text-center">{[['87%', 'pass ≥ 75%'], ['23', 'JEE Adv. on track'], ['31', 'NEET 550+']].map(([v, k]) => <div key={k} className="rounded-xl bg-surface2 p-3"><b className="font-display text-2xl">{v}</b><p className="text-xs text-muted">{k}</p></div>)}</div>
          <p className="text-sm text-muted">Updates after every mock and pre-board.</p>
        </Card>
        <Card className="grid content-start gap-3">
          <h2 className="text-xl">Teacher platform use</h2>
          {[['Science', 'AI lessons 14 · tasks 41', 'High', 'bg-good/15 text-good'], ['Maths', 'AI lessons 6 · tasks 33', 'High', 'bg-good/15 text-good'], ['Languages', 'AI lessons 1 · tasks 8', 'Low · offer training', 'bg-marigold/20 text-warn']].map(([a, b, c, d]) => (
            <div key={a} className="flex items-center gap-3 border-t border-line pt-3 first:border-0 first:pt-0"><div className="flex-1"><b>{a}</b><p className="text-sm text-muted">{b}</p></div><span className={`pill ${d}`}>{c}</span></div>
          ))}
        </Card>
      </div>
    </>
  );
}
