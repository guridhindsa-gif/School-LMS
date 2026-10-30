'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, GraduationCap, Users } from 'lucide-react';
import { DemoGate, useDemo } from '@/components/RoleShell';
import { PageHeader, Reveal, SampleBadge, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';

/* Demo figures — rendered only inside DemoGate (opt-in, under the demo banner). */
const KPI = [
  { k: 'principal.kpi.att', v: '93.4%', d: 'principal.kpi.attD', up: true },
  { k: 'principal.kpi.cov', v: '66%', d: 'principal.kpi.covD', up: false },
  { k: 'principal.kpi.risk', v: '18', d: 'principal.kpi.riskD', up: false },
  { k: 'principal.kpi.active', v: '78%', d: 'principal.kpi.activeD', up: null },
];
const ALERTS = [
  { icon: AlertTriangle, tone: 'bg-accent/15 text-warn', i: 1, href: '#coverage' },
  { icon: Users, tone: 'bg-bad/12 text-bad', i: 2, href: '#compare' },
  { icon: GraduationCap, tone: 'bg-primary/12 text-primary', i: 3, href: '#adoption' },
];
const COVER: [string, number, number][] = [['1–2', 0.82, 0.8], ['3–5', 0.74, 0.75], ['6–8', 0.66, 0.7], ['9–10', 0.64, 0.7], ['11–12', 0.58, 0.7]];
const SUBJ = ['maths', 'science', 'english', 'social', 'lang'];
const GRID: [number, number[]][] = [[8, [71, 68, 79, 74, 81]], [9, [64, 70, 76, 69, 80]], [10, [58, 62, 72, 66, 77]], [11, [55, 60, 70, 63, 75]]];
const TREND = [88.1, 91.4, 90.2, 92.8, 93.4, 92.1, 93.4, 94.0];
const BANDS = [
  { min: 75, key: 'principal.band.hi', cls: 'bg-good/20 text-ink' },
  { min: 65, key: 'principal.band.mid', cls: 'bg-accent/25 text-ink' },
  { min: 0, key: 'principal.band.lo', cls: 'bg-bad/20 text-ink' },
];
const band = (v: number) => BANDS.find(b => v >= b.min)!;
const ADOPT: [string, number, number, boolean][] = [['science', 14, 41, true], ['maths', 6, 33, true], ['lang', 1, 8, false]];

export function PrincipalView() {
  const { t, locale } = useT();
  const demo = useDemo();
  const reduce = useReducedMotion();
  const W = 340, H = 110, min = 86, max = 96;
  const pts = TREND.map((v, i) => [(i / (TREND.length - 1)) * W, H - ((v - min) / (max - min)) * H] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const week = new Date(2026, 9, 26).toLocaleDateString(locale, { day: 'numeric', month: 'short' });

  return (
    <>
      <PageHeader eyebrow={demo ? t('principal.eyebrowDemo', { date: week }) : t('roles.principal')} title={t('principal.title')} desc={t('principal.desc')} actions={demo ? <SampleBadge /> : undefined} />

      <DemoGate role="principal">
        {/* 1. Headline outcomes */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPI.map((k, i) => (
            <Reveal key={k.k} delay={i * 0.04}>
              <div className="card grid h-full gap-1 p-4 sm:p-5">
                <span className="text-sm text-muted">{t(k.k)}</span>
                <b className="font-display text-3xl tabular-nums sm:text-4xl">{k.v}</b>
                <span className={cx('flex items-center gap-1 text-xs font-semibold', k.up === true ? 'text-good' : k.up === false ? 'text-warn' : 'text-muted')}>
                  {k.up === true && <ArrowUpRight size={14} aria-hidden />}{k.up === false && <ArrowDownRight size={14} aria-hidden />}{t(k.d)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 2. Actionable alerts */}
        <section className="card grid gap-3 p-5 sm:p-6" aria-labelledby="alerts-title">
          <div className="flex items-center justify-between gap-2"><h2 id="alerts-title" className="h-section">{t('principal.attention')}</h2><span className="pill bg-accent/15 text-warn">{t('principal.actions', { n: ALERTS.length })}</span></div>
          <ul className="grid gap-3 lg:grid-cols-3">
            {ALERTS.map(a => (
              <li key={a.i} className="grid content-start gap-2 rounded-ctl border border-line p-4">
                <span className={cx('grid h-9 w-9 place-items-center rounded-lg', a.tone)}><a.icon size={17} aria-hidden /></span>
                <b className="leading-snug">{t(`principal.alert${a.i}.t`)}</b>
                <p className="text-sm text-muted"><span className="font-semibold text-ink">{t('principal.recommended')}</span> {t(`principal.alert${a.i}.a`)}</p>
                <a href={a.href} className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{t(`principal.alert${a.i}.link`)} <ArrowRight size={14} aria-hidden /></a>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Trends */}
        <div className="grid gap-5 lg:grid-cols-2">
          <section id="coverage" className="card grid scroll-mt-28 content-start gap-3 p-5 sm:p-6" aria-labelledby="cov-title">
            <h2 id="cov-title" className="text-lg">{t('principal.coverage')}</h2>
            {COVER.map(([n, v, plan]) => {
              const label = t('principal.classes', { r: n });
              return (
                <div key={n} className="grid grid-cols-[110px_1fr_56px] items-center gap-3 text-sm">
                  <span>{label}</span>
                  <div className="relative h-2.5 rounded-full bg-surface2" role="img" aria-label={t('teacher.coverageAria', { sec: label, done: Math.round(v * 100), plan: Math.round(plan * 100) })}>
                    <i className={cx('absolute inset-y-0 left-0 rounded-full', v + 0.02 < plan ? 'bg-accent' : 'bg-teal')} style={{ width: `${v * 100}%` }} />
                    <i className="absolute -top-1 h-[18px] w-0.5 rounded bg-ink" style={{ left: `${plan * 100}%` }} aria-hidden />
                  </div>
                  <span className="text-right font-mono tabular-nums">{Math.round(v * 100)}%</span>
                </div>
              );
            })}
            <p className="flex flex-wrap gap-4 text-xs text-muted"><span className="flex items-center gap-1.5"><i className="h-2 w-4 rounded bg-teal" aria-hidden />{t('principal.onPlan')}</span><span className="flex items-center gap-1.5"><i className="h-2 w-4 rounded bg-accent" aria-hidden />{t('principal.behind')}</span><span className="flex items-center gap-1.5"><i className="h-3 w-0.5 bg-ink" aria-hidden />{t('principal.plan')}</span></p>
          </section>
          <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="att-title">
            <div className="flex items-baseline justify-between gap-2"><h2 id="att-title" className="text-lg">{t('principal.attendance')}</h2><span className="font-mono text-sm text-good">{TREND[TREND.length - 1]}%</span></div>
            <svg viewBox={`-30 -10 ${W + 44} ${H + 34}`} className="w-full" role="img" aria-label={t('principal.attAria', { a: TREND[0], b: TREND[TREND.length - 1] })}>
              {[88, 92, 96].map(g => { const y = H - ((g - min) / (max - min)) * H; return <g key={g}><line x1={0} x2={W} y1={y} y2={y} stroke="rgb(var(--line))" /><text x={-6} y={y + 3} textAnchor="end" fontSize="10" fill="rgb(var(--muted))">{g}%</text></g>; })}
              {TREND.map((_, i) => <text key={i} x={pts[i][0]} y={H + 18} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">{t('principal.week', { n: i + 1 })}</text>)}
              <motion.path d={`${d} L${W} ${H} L0 ${H}Z`} fill="rgb(var(--teal) / .14)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
              <motion.path d={d} fill="none" stroke="rgb(var(--teal))" strokeWidth="2.5" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
              {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4.5 : 2.5} fill="rgb(var(--teal))" />)}
            </svg>
          </section>
        </div>

        {/* 4. Comparison */}
        <section id="compare" className="card grid scroll-mt-28 gap-3 p-5 sm:p-6" aria-labelledby="cmp-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="cmp-title" className="text-lg">{t('principal.compare')}</h2>
            <ul className="flex flex-wrap gap-2 text-xs" aria-label={t('principal.legend')}>{BANDS.map(b => <li key={b.key} className={cx('rounded-md px-2 py-0.5 font-semibold', b.cls)}>{t(b.key)}</li>)}</ul>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-separate border-spacing-1 text-center text-sm tabular-nums">
              <caption className="sr-only">{t('principal.compare')}</caption>
              <thead><tr><th scope="col" className="p-2 text-left text-muted">{t('principal.class')}</th>{SUBJ.map(s => <th key={s} scope="col" className="p-2 font-semibold text-muted">{t(`principal.subj.${s}`)}</th>)}</tr></thead>
              <tbody>{GRID.map(([c, row]) => <tr key={c}><th scope="row" className="p-2 text-left font-semibold">{t('shell.class', { n: c })}</th>{row.map((v, i) => <td key={i} className={cx('rounded-md p-2 font-semibold', band(v).cls)}>{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="text-sm text-muted">{t('principal.trendNote')}</p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="card grid content-start gap-3 p-5 sm:p-6" aria-labelledby="fc-title">
            <h2 id="fc-title" className="text-lg">{t('principal.forecast')}</h2>
            <div className="grid grid-cols-3 gap-2 text-center">{[['87%', 'principal.fc1'], ['23', 'principal.fc2'], ['31', 'principal.fc3']].map(([v, k]) => <div key={k} className="rounded-ctl bg-surface2 p-3"><b className="font-display text-2xl">{v}</b><p className="text-xs text-muted">{t(k)}</p></div>)}</div>
            <p className="text-sm text-muted">{t('principal.fcNote')}</p>
          </section>
          <section id="adoption" className="card grid scroll-mt-28 content-start gap-3 p-5 sm:p-6" aria-labelledby="ad-title">
            <h2 id="ad-title" className="text-lg">{t('principal.adoption')}</h2>
            {ADOPT.map(([s, a, b, high]) => (
              <div key={s} className="flex items-center gap-3 border-t border-line pt-3 first:border-0 first:pt-0">
                <div className="flex-1"><b>{t(`principal.subj.${s}`)}</b><p className="text-sm text-muted">{t('principal.adoptRow', { a, b })}</p></div>
                <span className={cx('pill', high ? 'bg-good/15 text-good' : 'bg-accent/20 text-warn')}>{t(high ? 'principal.high' : 'principal.low')}</span>
              </div>
            ))}
          </section>
        </div>
      </DemoGate>
    </>
  );
}
