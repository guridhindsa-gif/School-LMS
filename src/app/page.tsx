'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCheck, Database, FlaskConical, GraduationCap, Languages, Lightbulb, LineChart, MessageSquareText, RotateCcw, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
import { HeroBoard } from '@/components/HeroBoard';
import { LangSwitch, Logo, ThemeToggle, Wordmark } from '@/components/AppShell';
import { DestinationArt, Vidya } from '@/components/art';
import { LABS } from '@/components/labs/registry';
import { LangSync, useT } from '@/lib/i18n';

// a spread of labs across subjects and stages for the landing page
const FEATURED = ['place-value', 'clock', 'angles', 'magnets', 'ph', 'refraction', 'projectile', 'titration'].map(id => LABS.find(l => l.id === id)).filter((l): l is (typeof LABS)[number] => !!l).slice(0, 8);

const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };

const ROLES = [
  { href: '/student', k: 'student', icon: GraduationCap, tone: 'bg-primary text-onprimary', cta: 'land.start' },
  { href: '/teacher', k: 'teacher', icon: BookOpen, tone: 'bg-teal text-white', cta: 'land.open' },
  { href: '/parent', k: 'parent', icon: Users, tone: 'bg-accent text-[#2b1b02]', cta: 'land.open' },
  { href: '/principal', k: 'principal', icon: LineChart, tone: 'bg-violet text-white', cta: 'land.open' },
  { href: '/admin', k: 'admin', icon: Database, tone: 'bg-white/15 text-onnight', cta: 'land.open' },
];

export default function Home() {
  const { t, tf } = useT();
  return (
    <div className="min-h-dvh overflow-x-clip">
      <LangSync />
      <a href="#main" className="skip-link">{t('shell.skip')}</a>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-2 py-3 sm:gap-3" style={pad}>
          <Link href="/" className="flex items-center gap-2.5" aria-label={t('shell.home')}><Logo /><span className="hidden sm:inline"><Wordmark /></span></Link>
          <nav className="ml-6 hidden gap-1 text-sm font-semibold text-muted md:flex" aria-label={t('land.sections')}>
            <a href="#features" className="rounded-ctl px-3 py-2 hover:bg-surface2 hover:text-ink">{t('land.features')}</a>
            <a href="#journey" className="rounded-ctl px-3 py-2 hover:bg-surface2 hover:text-ink">{t('land.how')}</a>
            <a href="#roles" className="rounded-ctl px-3 py-2 hover:bg-surface2 hover:text-ink">{t('land.forSchools')}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitch />
            <ThemeToggle />
            <Link href="/student" className="btn-primary hidden sm:inline-flex">{t('land.start')}</Link>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="relative">
          <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_60%_30%,black,transparent)]" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:py-20" style={pad}>
            <div className="grid gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />CBSE · CISCE · 1–12 · JEE · NEET · CUET
              </span>
              <h1 className="text-[2.5rem] leading-[1.06] sm:text-6xl lg:text-[4.1rem]">
                {t('land.h1a')} <span className="relative inline-block text-primary">{t('land.h1b')}<svg viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full" aria-hidden><path d="M3 10 C 80 2, 200 2, 297 8" stroke="rgb(var(--accent))" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span>
              </h1>
              <p className="max-w-xl text-lg text-muted">{t('land.lead')}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/student" className="btn-primary px-6 py-3 text-base">{t('land.start')} <ArrowRight size={18} aria-hidden /></Link>
                <a href="#roles" className="btn-ghost px-6 py-3 text-base">{t('land.educator')}</a>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                <li className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-teal" aria-hidden /> {t('land.trust1')}</li>
                <li className="flex items-center gap-1.5"><Languages size={16} className="text-teal" aria-hidden /> {t('land.trust2')}</li>
                <li className="flex items-center gap-1.5"><Sparkles size={16} className="text-teal" aria-hidden /> {t('land.trust3')}</li>
              </ul>
            </div>
            <HeroBoard />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 py-14 sm:py-20" style={pad}>
            <div className="grid max-w-2xl gap-3">
              <p className="text-sm font-semibold text-primary">{t('land.featEyebrow')}</p>
              <h2 className="text-3xl sm:text-4xl">{t('land.featTitle')}</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="grid content-start gap-4 rounded-card border border-line bg-bg p-6">
                <Vidya size={52} />
                <h3 className="text-xl">{t('land.f1')}</h3>
                <p className="text-muted">{t('land.f1d')}</p>
                <ul className="grid gap-2 text-sm">
                  <li className="flex gap-2 rounded-xl bg-surface px-3 py-2"><Lightbulb size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden /><span><b>{t('tc.mode.socratic')}</b> — {t('tc.tip.socratic')}</span></li>
                  <li className="flex gap-2 rounded-xl bg-surface px-3 py-2"><MessageSquareText size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden /><span><b>{t('tc.mode.explain')}</b> — {t('tc.tip.explain')}</span></li>
                  <li className="flex gap-2 rounded-xl bg-surface px-3 py-2"><CheckCheck size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden /><span><b>{t('tc.mode.check')}</b> — {t('tc.tip.check')}</span></li>
                </ul>
              </article>
              <article className="grid content-start gap-4 rounded-card border border-line bg-bg p-6">
                <span className="grid h-[52px] w-[52px] place-items-center rounded-ctl bg-teal/12 text-teal"><Target size={24} aria-hidden /></span>
                <h3 className="text-xl">{t('land.f2')}</h3>
                <p className="text-muted">{t('land.f2d')}</p>
                <div className="grid gap-2 rounded-xl bg-surface p-4" aria-hidden>
                  {[['mastery.new', 0], ['mastery.learning', 0.3], ['mastery.practising', 0.62], ['mastery.strong', 0.86]].map(([l, v]) => (
                    <div key={l as string} className="grid grid-cols-[96px_1fr] items-center gap-3 text-xs font-semibold"><span className="text-muted">{t(l as string)}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-surface3"><i className="block h-full rounded-full" style={{ width: `${(v as number) * 100 || 3}%`, background: (v as number) >= 0.8 ? 'rgb(var(--good))' : (v as number) >= 0.5 ? 'rgb(var(--primary))' : 'rgb(var(--accent))' }} /></span></div>
                  ))}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><RotateCcw size={12} /> {t('land.f2r')}</p>
                </div>
              </article>
              <article className="grid content-start gap-4 rounded-card border border-line bg-bg p-6">
                <span className="grid h-[52px] w-[52px] place-items-center rounded-ctl bg-accent/15 text-warn"><FlaskConical size={24} aria-hidden /></span>
                <h3 className="text-xl">{t('land.f3')}</h3>
                <p className="text-muted">{t('land.f3d')}</p>
                <ul className="flex flex-wrap gap-2">
                  {FEATURED.map(l => <li key={l.id}><Link href={`/student/labs?lab=${l.id}`} className="inline-flex min-h-8 items-center rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold hover:border-primary/40 hover:text-primary">{tf(`lab.${l.id}.title`, l.title)}</Link></li>)}
                  <li><Link href="/student/labs" className="inline-flex min-h-8 items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary hover:bg-primary/15">{t('land.allLabs', { n: LABS.length })} →</Link></li>
                </ul>
              </article>
            </div>
            {/* Junior world */}
            <article className="grid items-center gap-6 rounded-card border border-line bg-gradient-to-r from-accent/10 via-surface to-primary/10 p-6 sm:grid-cols-[auto_1fr]">
              <div className="flex gap-2" aria-hidden>{(['learn', 'play', 'stars'] as const).map(k => <DestinationArt key={k} kind={k} size={72} />)}</div>
              <div className="grid gap-1.5"><h3 className="text-xl">{t('land.juniorTitle')}</h3><p className="text-muted">{t('land.juniorBody')}</p></div>
            </article>
          </div>
        </section>

        {/* Journey */}
        <section id="journey" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-10 py-14 sm:py-20" style={pad}>
            <div className="grid max-w-2xl gap-3">
              <p className="text-sm font-semibold text-primary">{t('land.howEyebrow')}</p>
              <h2 className="text-3xl sm:text-4xl">{t('land.howTitle')}</h2>
            </div>
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n, i) => (
                <li key={n} className="relative grid content-start gap-3 rounded-card border border-line bg-surface p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">0{n}</span>
                  <h3 className="text-lg">{t(`land.j${n}`)}</h3>
                  <p className="text-sm text-muted">{t(`land.j${n}d`)}</p>
                  {i < 3 && <ArrowRight size={18} className="absolute -right-4 top-6 z-10 hidden rounded-full bg-bg text-muted lg:block" aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="scroll-mt-20 bg-night text-onnight">
          <div className="mx-auto grid max-w-6xl gap-10 py-14 sm:py-20" style={pad}>
            <div className="grid max-w-2xl gap-3">
              <p className="text-sm font-semibold text-onnight/70">{t('land.rolesEyebrow')}</p>
              <h2 className="text-3xl sm:text-4xl">{t('land.rolesTitle')}</h2>
              <p className="text-onnight/75">{t('land.rolesBody')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ROLES.map(r => (
                <Link key={r.href} href={r.href} className="group grid content-start gap-3 rounded-card border border-white/10 bg-white/[.04] p-5 transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.08]">
                  <span className={`grid h-11 w-11 place-items-center rounded-ctl ${r.tone}`}><r.icon size={20} aria-hidden /></span>
                  <h3 className="text-lg">{t(`land.r.${r.k}`)}</h3>
                  <p className="text-sm text-onnight/75">{t(`land.r.${r.k}D`)}</p>
                  <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold">{t(r.cta)} <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 py-8 text-sm text-muted" style={pad}>
          <span className="flex items-center gap-2 text-ink"><Logo size={26} /><Wordmark /></span>
          <span>{t('land.footer')}</span>
          <Link href="/settings" className="ml-auto font-semibold hover:text-ink">{t('nav.settings')}</Link>
        </div>
      </footer>
    </div>
  );
}
