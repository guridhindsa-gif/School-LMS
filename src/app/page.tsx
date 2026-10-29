import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCheck, Database, FlaskConical, GraduationCap, Languages, Lightbulb, LineChart, MessageSquareText, RotateCcw, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
import { HeroBoard } from '@/components/HeroBoard';
import { Logo, ThemeToggle } from '@/components/AppShell';
import { LABS } from '@/components/labs/registry';

const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };

const ROLES = [
  { href: '/student', title: 'Students', desc: 'Picture lessons, a tutor that hints before it tells, practice at your level and exam tracks.', icon: GraduationCap, tone: 'bg-primary text-onprimary', cta: 'Start learning' },
  { href: '/teacher', title: 'Teachers', desc: 'See who needs support, draft lessons and assignments with AI, and approve before students see them.', icon: BookOpen, tone: 'bg-teal text-white', cta: 'Open teacher app' },
  { href: '/parent', title: 'Parents', desc: 'A plain-language weekly summary in English, हिंदी or ਪੰਜਾਬੀ, with ways to help at home.', icon: Users, tone: 'bg-accent text-[#2b1b02]', cta: 'Open parent app' },
  { href: '/principal', title: 'Principals', desc: 'Coverage, attendance and outcomes as actions to take, not walls of numbers.', icon: LineChart, tone: 'bg-violet text-white', cta: 'Open principal app' },
  { href: '/admin', title: 'Content admins', desc: 'The syllabus catalogue with sources, sessions and verification status for every subject.', icon: Database, tone: 'bg-night text-onnight', cta: 'Open catalogue' },
];

const JOURNEY = [
  { n: '01', t: 'Choose board and class', d: 'CBSE or CISCE, Class 1 to 12, plus the entrance tracks open to your class and stream.' },
  { n: '02', t: 'Learn by seeing', d: 'Each chapter opens as an animated picture lesson with narration, built from the official syllabus.' },
  { n: '03', t: 'Practise at your level', d: 'Questions get harder as you improve, with hints and an explanation for every option.' },
  { n: '04', t: 'Check and revise', d: 'Chapter tests, mocks and spaced revision bring back what you are about to forget.' },
];

export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 py-3" style={pad}>
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight"><Logo /><span>School<span className="text-primary">LMS</span></span></Link>
          <nav className="ml-6 hidden gap-1 text-sm font-semibold text-muted md:flex" aria-label="Sections">
            <a href="#features" className="rounded-ctl px-3 py-2 hover:bg-surface2 hover:text-ink">Features</a>
            <a href="#journey" className="rounded-ctl px-3 py-2 hover:bg-surface2 hover:text-ink">How it works</a>
            <a href="#roles" className="rounded-ctl px-3 py-2 hover:bg-surface2 hover:text-ink">For schools</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/student" className="btn-primary">Start learning</Link>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="relative">
          <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_60%_30%,black,transparent)]" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:py-20" style={pad}>
            <div className="grid gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />CBSE · CISCE · Classes 1–12 · JEE · NEET · CUET
              </span>
              <h1 className="text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[4.1rem]">
                See it. Try it. <span className="relative whitespace-nowrap text-primary">Understand it.<svg viewBox="0 0 300 14" className="absolute -bottom-2 left-0 w-full" aria-hidden><path d="M3 10 C 80 2, 200 2, 297 8" stroke="rgb(var(--accent))" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span>
              </h1>
              <p className="max-w-xl text-lg text-muted">A learning studio for every chapter of your board syllabus: animated picture lessons, interactive labs, an AI tutor that guides with hints, and practice that adapts to you.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/student" className="btn-primary px-6 py-3 text-base">Start learning <ArrowRight size={18} /></Link>
                <a href="#roles" className="btn-ghost px-6 py-3 text-base">I&apos;m an educator</a>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                <li className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-teal" /> Official syllabus sources cited</li>
                <li className="flex items-center gap-1.5"><Languages size={16} className="text-teal" /> English, हिंदी, ਪੰਜਾਬੀ</li>
                <li className="flex items-center gap-1.5"><Sparkles size={16} className="text-teal" /> Runs on your school&apos;s own AI</li>
              </ul>
            </div>
            <HeroBoard />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 py-16 sm:py-20" style={pad}>
            <div className="grid max-w-2xl gap-3">
              <p className="eyebrow">One studio, three ways in</p>
              <h2 className="text-3xl sm:text-4xl">Every chapter becomes something you can watch, touch and talk about.</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="card grid content-start gap-4 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-ctl bg-primary/12 text-primary"><MessageSquareText size={20} /></span>
                <h3 className="text-xl">Vidya, the AI tutor</h3>
                <p className="text-muted">Knows the chapter you are on and how well you know it. Three modes, so help matches the moment.</p>
                <ul className="grid gap-2 text-sm">
                  <li className="flex gap-2 rounded-xl bg-surface2 px-3 py-2"><Lightbulb size={16} className="mt-0.5 shrink-0 text-accent" /><span><b>Guide me</b> — questions and hints, not answers</span></li>
                  <li className="flex gap-2 rounded-xl bg-surface2 px-3 py-2"><MessageSquareText size={16} className="mt-0.5 shrink-0 text-primary" /><span><b>Explain</b> — a clear walk-through with an example</span></li>
                  <li className="flex gap-2 rounded-xl bg-surface2 px-3 py-2"><CheckCheck size={16} className="mt-0.5 shrink-0 text-teal" /><span><b>Check my work</b> — finds the first mistake</span></li>
                </ul>
              </article>
              <article className="card grid content-start gap-4 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-ctl bg-teal/12 text-teal"><Target size={20} /></span>
                <h3 className="text-xl">Practice that adapts</h3>
                <p className="text-muted">Mastery is estimated after every answer, and the next question is pitched where you succeed about seven times in ten.</p>
                <div className="grid gap-2 rounded-xl bg-surface2 p-4" aria-hidden>
                  {[['Not started', 0], ['Learning', 0.3], ['Practising', 0.62], ['Strong', 0.86]].map(([l, v]) => (
                    <div key={l as string} className="grid grid-cols-[84px_1fr] items-center gap-3 text-xs font-semibold"><span className="text-muted">{l}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-surface3"><i className="block h-full rounded-full" style={{ width: `${(v as number) * 100 || 3}%`, background: (v as number) >= 0.8 ? 'rgb(var(--good))' : (v as number) >= 0.5 ? 'rgb(var(--primary))' : 'rgb(var(--accent))' }} /></span></div>
                  ))}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><RotateCcw size={12} /> Spaced revision schedules each chapter</p>
                </div>
              </article>
              <article className="card grid content-start gap-4 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-ctl bg-accent/15 text-warn"><FlaskConical size={20} /></span>
                <h3 className="text-xl">Visual labs</h3>
                <p className="text-muted">Change a value and watch the science respond. Labs open inside the chapters they belong to.</p>
                <ul className="flex flex-wrap gap-2">
                  {LABS.map(l => <li key={l.id}><Link href={`/student/labs?lab=${l.id}`} className="inline-flex rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold hover:border-primary/40 hover:text-primary">{l.title}</Link></li>)}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Journey */}
        <section id="journey" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-10 py-16 sm:py-20" style={pad}>
            <div className="grid max-w-2xl gap-3">
              <p className="eyebrow">How it works</p>
              <h2 className="text-3xl sm:text-4xl">A clear path through every chapter.</h2>
            </div>
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {JOURNEY.map((j, i) => (
                <li key={j.n} className="relative grid content-start gap-3 rounded-card border border-line bg-surface p-5">
                  <span className="font-mono text-sm font-semibold text-primary">{j.n}</span>
                  <h3 className="text-lg">{j.t}</h3>
                  <p className="text-sm text-muted">{j.d}</p>
                  {i < JOURNEY.length - 1 && <ArrowRight size={18} className="absolute -right-4 top-6 z-10 hidden rounded-full bg-bg text-muted lg:block" aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="scroll-mt-20 bg-night text-onnight">
          <div className="mx-auto grid max-w-6xl gap-10 py-16 sm:py-20" style={pad}>
            <div className="grid max-w-2xl gap-3">
              <p className="eyebrow !text-onnight/60">For the whole school</p>
              <h2 className="text-3xl sm:text-4xl">One platform, five focused apps.</h2>
              <p className="text-onnight/70">Each role sees what it needs to act on, in the same design language.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ROLES.map(r => (
                <Link key={r.href} href={r.href} className="group grid content-start gap-3 rounded-card border border-white/10 bg-white/[.04] p-5 transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.08]">
                  <span className={`grid h-11 w-11 place-items-center rounded-ctl ${r.tone}`}><r.icon size={20} /></span>
                  <h3 className="text-lg">{r.title}</h3>
                  <p className="text-sm text-onnight/70">{r.desc}</p>
                  <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold">{r.cta} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 py-8 text-sm text-muted" style={pad}>
          <span className="flex items-center gap-2 font-semibold text-ink"><Logo size={26} /> School LMS</span>
          <span>Learner progress is saved in this browser until your school connects its data server.</span>
          <Link href="/settings" className="ml-auto font-semibold hover:text-ink">Settings &amp; AI</Link>
        </div>
      </footer>
    </div>
  );
}
