'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, GraduationCap, Users } from 'lucide-react';
import { PageHeader, Reveal, SampleBadge, cx } from '@/components/ui';

const KPI = [
  { k: 'Attendance today', v: '93.4%', d: '+1.2 pts vs last week', up: true },
  { k: 'Syllabus covered', v: '66%', d: '4 pts behind plan', up: false },
  { k: 'Students at risk', v: '18', d: '6 new this week', up: false },
  { k: 'Weekly active on LMS', v: '78%', d: 'of students', up: null },
];
const ALERTS = [
  { icon: AlertTriangle, tone: 'bg-accent/15 text-warn', t: 'Classes 11–12 are 12 points behind the syllabus plan', a: 'Add two revision periods a week for Physics and Maths until the pre-boards.', href: '#coverage', link: 'See coverage' },
  { icon: Users, tone: 'bg-bad/12 text-bad', t: '6 more Class 10 students flagged at risk', a: 'Ask Class 10 teachers for a two-week support plan; Maths is the weakest subject.', href: '#compare', link: 'See class × subject' },
  { icon: GraduationCap, tone: 'bg-primary/12 text-primary', t: 'Language teachers rarely use the AI tools', a: 'Schedule a 30-minute hands-on session at the next staff meeting.', href: '#adoption', link: 'See platform use' },
];
const COVER: [string, number, number][] = [['Classes 1–2', 0.82, 0.8], ['Classes 3–5', 0.74, 0.75], ['Classes 6–8', 0.66, 0.7], ['Classes 9–10', 0.64, 0.7], ['Classes 11–12', 0.58, 0.7]];
const SUBJ = ['Maths', 'Science', 'English', 'Social Sc.', 'Languages'];
const GRID: [string, number[]][] = [['Class 8', [71, 68, 79, 74, 81]], ['Class 9', [64, 70, 76, 69, 80]], ['Class 10', [58, 62, 72, 66, 77]], ['Class 11', [55, 60, 70, 63, 75]]];
const TREND = [88.1, 91.4, 90.2, 92.8, 93.4, 92.1, 93.4, 94.0];
const BANDS = [
  { min: 75, label: '75 and above', cls: 'bg-good/20 text-ink' },
  { min: 65, label: '65–74', cls: 'bg-accent/25 text-ink' },
  { min: 0, label: 'Below 65', cls: 'bg-bad/20 text-ink' },
];
const band = (v: number) => BANDS.find(b => v >= b.min)!;

export function PrincipalView() {
  const reduce = useReducedMotion();
  const W = 340, H = 110, min = 86, max = 96;
  const pts = TREND.map((v, i) => [(i / (TREND.length - 1)) * W, H - ((v - min) / (max - min)) * H] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

  return (
    <>
      <PageHeader eyebrow="Principal · Week of 26 Oct" title="School at a glance" desc="Outcomes first, then what to act on, then the detail behind it." actions={<SampleBadge />} />

      {/* 1. Headline outcomes */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI.map((k, i) => (
          <Reveal key={k.k} delay={i * 0.04}>
            <div className="card grid h-full gap-1 p-4 sm:p-5">
              <span className="text-sm text-muted">{k.k}</span>
              <b className="font-display text-3xl tabular-nums sm:text-4xl">{k.v}</b>
              <span className={cx('flex items-center gap-1 text-xs font-semibold', k.up === true ? 'text-good' : k.up === false ? 'text-warn' : 'text-muted')}>
                {k.up === true && <ArrowUpRight size={14} aria-hidden />}{k.up === false && <ArrowDownRight size={14} aria-hidden />}{k.d}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 2. Actionable alerts */}
      <section className="card grid gap-3 p-5 sm:p-6" aria-labelledby="alerts-title">
        <div className="flex items-center justify-between gap-2"><h2 id="alerts-title" className="h-section">Needs your attention</h2><span className="pill bg-accent/15 text-warn">{ALERTS.length} actions</span></div>
        <ul className="grid gap-3 lg:grid-cols-3">
          {ALERTS.map(a => (
            <li key={a.t} className="grid content-start gap-2 rounded-ctl border border-line p-4">
              <span className={cx('grid h-9 w-9 place-items-center rounded-lg', a.tone)}><a.icon size={17} aria-hidden /></span>
              <b className="leading-snug">{a.t}</b>
              <p className="text-sm text-muted"><span className="font-semibold text-ink">Recommended:</span> {a.a}</p>
              <a href={a.href} className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{a.link} <ArrowRight size={14} aria-hidden /></a>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Trends */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section id="coverage" className="card grid scroll-mt-28 content-start gap-3 p-5 sm:p-6" aria-labelledby="cov-title">
          <h2 id="cov-title" className="text-lg">Syllabus coverage vs plan</h2>
          {COVER.map(([n, v, plan]) => (
            <div key={n} className="grid grid-cols-[100px_1fr_70px] items-center gap-3 text-sm">
              <span>{n}</span>
              <div className="relative h-2.5 rounded-full bg-surface2" role="img" aria-label={`${n}: ${Math.round(v * 100)}% covered, plan ${Math.round(plan * 100)}%`}>
                <i className={cx('absolute inset-y-0 left-0 rounded-full', v + 0.02 < plan ? 'bg-accent' : 'bg-teal')} style={{ width: `${v * 100}%` }} />
                <i className="absolute -top-1 h-[18px] w-0.5 rounded bg-ink" style={{ left: `${plan * 100}%` }} aria-hidden />
              </div>
              <span className="text-right font-mono tabular-nums">{Math.round(v * 100)}%</span>
            </div>
          ))}
          <p className="flex flex-wrap gap-4 text-xs text-muted"><span className="flex items-center gap-1.5"><i className="h-2 w-4 rounded bg-teal" />On plan</span><span className="flex items-center gap-1.5"><i className="h-2 w-4 rounded bg-accent" />Behind plan</span><span className="flex items-center gap-1.5"><i className="h-3 w-0.5 bg-ink" />Plan</span></p>
        </section>
        <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="att-title">
          <div className="flex items-baseline justify-between gap-2"><h2 id="att-title" className="text-lg">Attendance · last 8 weeks</h2><span className="font-mono text-sm text-good">{TREND[TREND.length - 1]}%</span></div>
          <svg viewBox={`-30 -10 ${W + 44} ${H + 34}`} className="w-full" role="img" aria-label={`Weekly attendance from ${TREND[0]}% to ${TREND[TREND.length - 1]}%`}>
            {[88, 92, 96].map(g => { const y = H - ((g - min) / (max - min)) * H; return <g key={g}><line x1={0} x2={W} y1={y} y2={y} stroke="rgb(var(--line))" /><text x={-6} y={y + 3} textAnchor="end" fontSize="10" fill="rgb(var(--muted))">{g}%</text></g>; })}
            {TREND.map((_, i) => <text key={i} x={pts[i][0]} y={H + 18} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">W{i + 1}</text>)}
            <motion.path d={`${d} L${W} ${H} L0 ${H}Z`} fill="rgb(var(--teal) / .14)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
            <motion.path d={d} fill="none" stroke="rgb(var(--teal))" strokeWidth="2.5" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
            {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4.5 : 2.5} fill="rgb(var(--teal))" />)}
          </svg>
        </section>
      </div>

      {/* 4. Comparison */}
      <section id="compare" className="card grid scroll-mt-28 gap-3 p-5 sm:p-6" aria-labelledby="cmp-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="cmp-title" className="text-lg">Average test score by class and subject (%)</h2>
          <ul className="flex flex-wrap gap-2 text-xs" aria-label="Legend">{BANDS.map(b => <li key={b.label} className={cx('rounded-md px-2 py-0.5 font-semibold', b.cls)}>{b.label}</li>)}</ul>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-separate border-spacing-1 text-center text-sm tabular-nums">
            <thead><tr><th scope="col" className="p-2 text-left text-muted">Class</th>{SUBJ.map(s => <th key={s} scope="col" className="p-2 font-semibold text-muted">{s}</th>)}</tr></thead>
            <tbody>{GRID.map(([c, row]) => <tr key={c}><th scope="row" className="p-2 text-left font-semibold">{c}</th>{row.map((v, i) => <td key={i} className={cx('rounded-md p-2 font-semibold', band(v).cls)}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="text-sm text-muted">Maths falls each year from Class 8 to 11; Languages stay strongest.</p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="fc-title">
          <h2 id="fc-title" className="text-lg">Class 12 forecast</h2>
          <div className="grid grid-cols-3 gap-2 text-center">{[['87%', 'expected to score ≥ 75%'], ['23', 'on track for JEE Advanced'], ['31', 'on track for NEET 550+']].map(([v, k]) => <div key={k} className="rounded-ctl bg-surface2 p-3"><b className="font-display text-2xl">{v}</b><p className="text-xs text-muted">{k}</p></div>)}</div>
          <p className="text-sm text-muted">Updates after every mock and pre-board.</p>
        </section>
        <section id="adoption" className="card grid scroll-mt-28 content-start gap-3 p-5 sm:p-6" aria-labelledby="ad-title">
          <h2 id="ad-title" className="text-lg">Teacher platform use</h2>
          {[['Science', 'AI lessons 14 · tasks 41', 'High', 'bg-good/15 text-good'], ['Maths', 'AI lessons 6 · tasks 33', 'High', 'bg-good/15 text-good'], ['Languages', 'AI lessons 1 · tasks 8', 'Low · offer training', 'bg-accent/20 text-warn']].map(([a, b, c, t]) => (
            <div key={a} className="flex items-center gap-3 border-t border-line pt-3 first:border-0 first:pt-0"><div className="flex-1"><b>{a}</b><p className="text-sm text-muted">{b}</p></div><span className={cx('pill', t)}>{c}</span></div>
          ))}
        </section>
      </div>
    </>
  );
}
