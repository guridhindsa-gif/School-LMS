'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, Square, CalendarDays, Lightbulb, Clock, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DemoGate, useDemo } from '@/components/RoleShell';
import { Bar, PageHeader, Reveal, SampleBadge, cx } from '@/components/ui';
import { LANGS, localeOf, useT, type Lang } from '@/lib/i18n';
import { useLMS } from '@/lib/store';
import { ParentForms } from './ParentForms';

/* Demo content — only rendered after opting into demo data, under the demo banner. */
const FACTS: [string, string, string][] = [['parent.fact.att', '96%', 'parent.fact.term'], ['parent.fact.test', '18/20', 'parent.subj.science'], ['parent.fact.tasks', 'parent.fact.tasksV', 'parent.fact.week']];
const SUBJECTS: { name: string; v: number; i: number }[] = [
  { name: 'parent.subj.english', v: 0.81, i: 1 }, { name: 'parent.subj.science', v: 0.78, i: 2 }, { name: 'parent.subj.hindi', v: 0.74, i: 3 },
  { name: 'parent.subj.social', v: 0.7, i: 4 }, { name: 'parent.subj.maths', v: 0.66, i: 5 },
];
const HELP = [
  { icon: Lightbulb, tone: 'bg-accent/15 text-warn', i: 1 },
  { icon: Clock, tone: 'bg-primary/12 text-primary', i: 2 },
];
const DATES = [
  { icon: CalendarDays, i: 1, tone: 'bg-teal/12 text-teal' },
  { icon: Wallet, i: 2, tone: 'bg-accent/15 text-warn' },
];
const HPC: [string, number[]][] = [['parent.hpc.d1', [2, 3, 2, 3]], ['parent.hpc.d2', [2, 2, 3, 2]], ['parent.hpc.d3', [3, 3, 3, 3]], ['parent.hpc.d4', [2, 2, 2, 3]], ['parent.hpc.d5', [3, 2, 3, 3]]];
const LVC = ['', 'bg-accent/20 text-warn', 'bg-primary/12 text-primary', 'bg-good/15 text-good'];

export function ParentView() {
  const { t, lang } = useT();
  const demo = useDemo();
  const setProfile = useLMS(s => s.setProfile);
  const [speaking, setSpeaking] = useState(false);
  const reduce = useReducedMotion();
  const digest = t('parent.demo.digest');

  useEffect(() => () => { try { speechSynthesis.cancel(); } catch { /* none */ } }, []);
  useEffect(() => { try { speechSynthesis.cancel(); } catch { /* none */ } setSpeaking(false); }, [lang]);

  function speak() {
    try {
      if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(digest); u.lang = localeOf(lang); u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
      speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
    } catch { setSpeaking(false); }
  }

  return (
    <>
      <PageHeader eyebrow={demo ? t('parent.eyebrowDemo') : t('roles.parent')} title={demo ? t('parent.demo.title') : t('parent.title')} desc={demo ? undefined : t('parent.desc')}
        actions={<>
          <div className="seg" role="radiogroup" aria-label={t('parent.langLabel')}>
            {LANGS.map(l => <button key={l.id} role="radio" aria-checked={lang === l.id} lang={l.locale} onClick={() => setProfile({ language: l.id as Lang })}>{l.label}</button>)}
          </div>
          {demo && <SampleBadge />}
        </>} />

      <DemoGate role="parent">
        {/* 1. The week in plain language */}
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <motion.section key={lang} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel-night grid content-start gap-5 rounded-card p-6 shadow-lift sm:p-7" aria-labelledby="wk-title">
            <p id="wk-title" className="font-mono text-xs uppercase tracking-widest text-onnight/60">{t('parent.weekly')}</p>
            <p className="text-lg leading-relaxed sm:text-xl">{digest}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-accent" onClick={speak} aria-pressed={speaking}>{speaking ? <><Square size={16} aria-hidden /> {t('common.stop')}</> : <><Volume2 size={17} aria-hidden /> {t('common.listen')}</>}</button>
              <span className="text-sm text-onnight/60">{t('parent.listenNote')}</span>
            </div>
            <dl className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              {FACTS.map(([k, v, s]) => <div key={k}><dt className="text-xs text-onnight/60">{t(k)}</dt><dd className="font-display text-2xl font-bold">{v.startsWith('parent.') ? t(v) : v}</dd><dd className="text-xs text-onnight/60">{t(s)}</dd></div>)}
            </dl>
          </motion.section>

          <Reveal delay={0.05}>
            <section className="card grid h-full content-start gap-3 p-5 sm:p-6" aria-labelledby="help-title">
              <h2 id="help-title" className="h-section">{t('parent.help')}</h2>
              {HELP.map(h => (
                <div key={h.i} className="flex gap-3 rounded-ctl border border-line p-3">
                  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', h.tone)}><h.icon size={17} aria-hidden /></span>
                  <div><b className="block">{t(`parent.help${h.i}.t`)}</b><p className="text-sm text-muted">{t(`parent.help${h.i}.d`)}</p></div>
                </div>
              ))}
              <p className="eyebrow mt-2">{t('parent.comingUp')}</p>
              {DATES.map(x => (
                <div key={x.i} className="flex items-center gap-3 rounded-ctl bg-surface2/70 px-3 py-2 text-sm">
                  <x.icon size={16} className="text-muted" aria-hidden />
                  <span className="min-w-0 flex-1"><b>{t(`parent.date${x.i}.t`)}</b> · {t(`parent.date${x.i}.d`)}</span>
                  <span className={cx('pill', x.tone)}>{t(`parent.date${x.i}.tag`)}</span>
                </div>
              ))}
            </section>
          </Reveal>
        </div>

        {/* 2. Subjects */}
        <section className="card grid gap-4 p-5 sm:p-6" aria-labelledby="subj-title">
          <div><p className="eyebrow">{t('parent.term')}</p><h2 id="subj-title" className="h-section">{t('parent.subjects')}</h2></div>
          <ul className="grid gap-3">
            {SUBJECTS.map(s => (
              <li key={s.name} className="grid gap-2 border-t border-line pt-3 first:border-0 first:pt-0 md:grid-cols-[150px_1fr_1.4fr] md:items-center md:gap-4">
                <b>{t(s.name)}</b>
                <div className="flex items-center gap-2"><Bar value={s.v} className="flex-1" /><span className="w-10 text-right font-mono text-sm tabular-nums">{Math.round(s.v * 100)}%</span></div>
                <p className="text-sm"><span className="font-semibold text-good">{t('parent.strength')}</span> {t(`parent.s${s.i}`)} <span className="text-muted">· {t('parent.next')} {t(`parent.n${s.i}`)}</span></p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Holistic Progress Card */}
        <section className="card grid gap-4 p-5 sm:p-6" aria-labelledby="hpc-title">
          <div><p className="eyebrow">{t('parent.hpc.eyebrow')}</p><h2 id="hpc-title" className="h-section">{t('parent.hpc.title')}</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-1.5 text-sm">
              <caption className="sr-only">{t('parent.hpc.title')}</caption>
              <thead><tr className="text-center"><th scope="col" className="text-left font-semibold text-muted">{t('parent.hpc.domain')}</th>{['teacher', 'self', 'peer', 'parent'].map(h => <th key={h} scope="col" className="font-semibold text-muted">{t(`parent.hpc.${h}`)}</th>)}</tr></thead>
              <tbody>
                {HPC.map(([dom, v]) => (
                  <tr key={dom}><th scope="row" className="pr-2 text-left font-semibold">{t(dom)}</th>{v.map((n, k) => <td key={k} className={cx('rounded-lg py-1.5 text-center font-semibold', LVC[n])}>{t(`parent.lv${n}`)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-wrap gap-3 text-xs text-muted" aria-label={t('parent.hpc.legend')}>{[1, 2, 3].map(n => <li key={n} className={cx('rounded-md px-2 py-0.5 font-semibold', LVC[n])}>{t(`parent.lv${n}`)}</li>)}</ul>
          <p className="rounded-ctl border-l-4 border-teal bg-teal/10 px-4 py-3 text-sm"><b>{t('parent.hpc.noteLabel')}</b> {t('parent.hpc.note')}</p>
        </section>
      </DemoGate>

      <ParentForms child={demo ? 'Aarav' : ''} />
    </>
  );
}
