import Link from 'next/link';
import { GraduationCap, BookOpen, Users, LineChart, Database, Sparkles, ArrowRight } from 'lucide-react';
import { HeroBoard } from '@/components/HeroBoard';

const ROLES = [
  { href: '/student', title: 'Student', desc: 'Board-first syllabus, AI tutor, adaptive practice, mock tests and visual labs.', icon: GraduationCap, accent: 'bg-board text-chalk' },
  { href: '/teacher', title: 'Teacher', desc: 'Class insights, AI lesson builder, answer clustering and HPC evidence.', icon: BookOpen, accent: 'bg-marigold text-[#2b1b02]' },
  { href: '/parent', title: 'Parent', desc: 'Weekly digest in your language and the Holistic Progress Card.', icon: Users, accent: 'bg-sky text-white' },
  { href: '/principal', title: 'Principal', desc: 'Attendance, syllabus coverage, results forecast and adoption.', icon: LineChart, accent: 'bg-violet text-white' },
  { href: '/admin', title: 'Content admin', desc: 'Syllabus catalogue, sources, question tags and paper blueprints.', icon: Database, accent: 'bg-good text-white' },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl py-10" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="grid gap-5">
          <span className="eyebrow">CBSE · CISCE · Classes 1–12 · JEE · NEET · CUET</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl">Every class, every board, <span className="text-marigold">one tutor</span> that adapts to you.</h1>
          <p className="max-w-xl text-lg text-muted">Pick your board and class. Learn each chapter with an AI tutor that guides with hints, practise at the right difficulty, and see concepts move in interactive labs.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/student" className="btn-primary px-5 py-3 text-base">Start learning <ArrowRight size={18} /></Link>
            <Link href="/student/labs" className="btn-ghost px-5 py-3 text-base"><Sparkles size={18} /> Try a visual lab</Link>
          </div>
        </div>
        <HeroBoard />
      </section>

      <section className="mt-16 grid gap-4">
        <h2 className="text-2xl">Choose your app</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map(r => (
            <Link key={r.href} href={r.href} className="card group grid gap-3 p-5 transition hover:-translate-y-1 hover:shadow-lift">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${r.accent}`}><r.icon size={20} /></span>
              <h3 className="text-xl">{r.title}</h3>
              <p className="text-muted">{r.desc}</p>
              <span className="mt-auto flex items-center gap-1 font-semibold text-board dark:text-marigold">Open <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
