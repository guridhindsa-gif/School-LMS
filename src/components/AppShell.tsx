'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, BarChart3, FlaskConical, GraduationCap, Home, Moon, Search, Sparkles, Sun, Trophy, X, Settings, Flame, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TutorChat } from './TutorChat';
import { cx } from './ui';
import { useLMS, useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

const NAV = [
  { href: '/student', label: 'Home', icon: Home },
  { href: '/student/syllabus', label: 'My syllabus', icon: BookOpen },
  { href: '/student/exams', label: 'Competitive exams', icon: Trophy },
  { href: '/student/tutor', label: 'AI tutor', icon: Sparkles },
  { href: '/student/labs', label: 'Visual labs', icon: FlaskConical },
  { href: '/student/progress', label: 'Progress', icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { open, setOpen } = useTutor();
  const hydrated = useHydrated();
  const profile = useLMS(s => s.profile);
  const streak = useLMS(s => s.streak.current);
  const xp = useLMS(s => s.xp);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); }
      if (e.key === 'Escape') { setPalette(false); setOpen(false); }
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [setOpen]);

  const active = (href: string) => (href === '/student' ? path === '/student' : path.startsWith(href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 border-r border-line bg-surface px-3 py-5 lg:flex">
        <Brand />
        <nav className="mt-6 grid gap-1" aria-label="Student">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}
              className={cx('relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition', active(n.href) ? 'text-chalk' : 'text-muted hover:bg-surface2 hover:text-ink')}>
              {active(n.href) && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-board" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <n.icon size={18} className="relative" /><span className="relative">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-2">
          {hydrated && profile.board && (
            <div className="rounded-xl bg-surface2 p-3 text-sm">
              <p className="font-semibold">{profile.name || 'Student'}</p>
              <p className="text-muted">{profile.board} · {profile.cls === 13 ? 'Repeater' : `Class ${profile.cls}`}{profile.stream ? ` · ${profile.stream}` : ''}</p>
            </div>
          )}
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted hover:bg-surface2 hover:text-ink"><Settings size={17} /> Settings &amp; AI</Link>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted hover:bg-surface2 hover:text-ink"><Users size={17} /> Switch role</Link>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="mx-auto flex max-w-6xl items-center gap-3 py-3" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
            <div className="lg:hidden"><Brand small /></div>
            <button onClick={() => setPalette(true)} className="ml-auto flex min-w-0 max-w-sm flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-left text-muted hover:border-board/50 lg:ml-0">
              <Search size={16} /><span className="truncate text-sm">Search chapters, topics…</span>
              <kbd className="ml-auto hidden rounded border border-line px-1.5 font-mono text-[10px] sm:block">Ctrl K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              {hydrated && (
                <>
                  <span className="pill bg-marigold/20 text-warn" title="Daily streak"><Flame size={13} />{streak}</span>
                  <span className="pill hidden bg-sky/15 text-sky sm:inline-flex" title="Experience points">{xp} XP</span>
                </>
              )}
              <LangSwitch />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl pb-28 pt-6 lg:pb-12" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Student">
        {NAV.filter(n => n.href !== '/student/labs').map(n => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}
            className={cx('grid justify-items-center gap-0.5 py-2 text-[11px] font-semibold', active(n.href) ? 'text-board dark:text-marigold' : 'text-muted')}>
            <n.icon size={20} />{n.label.split(' ')[0]}
          </Link>
        ))}
      </nav>

      {/* Floating tutor button */}
      {path !== '/student/tutor' && (
        <motion.button onClick={() => setOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          className="fixed z-40 flex items-center gap-2 rounded-full bg-board px-4 py-3 font-semibold text-chalk shadow-lift"
          style={{ right: 'max(16px, env(safe-area-inset-right, 0px))', bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
          aria-label="Open AI tutor">
          <Sparkles size={18} className="text-marigold" /><span className="hidden sm:inline">Ask Vidya</span>
        </motion.button>
      )}

      {/* Tutor drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside role="dialog" aria-modal="true" aria-label="AI tutor"
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-surface shadow-lift"
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
              <div className="flex items-center justify-between px-5 pt-4">
                <h2 className="text-xl">AI tutor</h2>
                <button className="btn-ghost h-9 w-9 !px-0" onClick={() => setOpen(false)} aria-label="Close tutor"><X size={18} /></button>
              </div>
              <div className="min-h-0 flex-1 px-5 pb-4 pt-2"><TutorChat compact /></div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

function Brand({ small }: { small?: boolean }) {
  return (
    <Link href="/student" className="flex items-center gap-2.5 px-2 font-display text-xl font-extrabold">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-board text-marigold shadow-soft"><GraduationCap size={20} /></span>
      {!small && <span>School LMS</span>}
    </Link>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  return (
    <button className="btn-ghost h-9 w-9 !px-0" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => { const d = !dark; setDark(d); document.documentElement.classList.toggle('dark', d); try { localStorage.setItem('lms-theme', d ? 'dark' : 'light'); } catch { /* ignore */ } }}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function LangSwitch() {
  const lang = useLMS(s => s.profile.language);
  const setProfile = useLMS(s => s.setProfile);
  return (
    <select aria-label="Language for AI lessons and tutor" value={lang} onChange={e => setProfile({ language: e.target.value as 'en' | 'hi' | 'pa' })}
      className="h-9 rounded-xl border border-line bg-surface px-2 text-sm font-semibold">
      <option value="en">EN</option><option value="hi">हिं</option><option value="pa">ਪੰ</option>
    </select>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<{ id: string; name: string; subject: string; where: string }[]>([]);
  const profile = useLMS(s => s.profile);
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 50); else { setQ(''); setRes([]); } }, [open]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    const c = new AbortController();
    const t = setTimeout(() => {
      const p = new URLSearchParams({ q, board: profile.board || 'CBSE' });
      if (profile.cls && profile.cls <= 12) p.set('cls', String(profile.cls));
      fetch(`/api/syllabus?${p}`, { signal: c.signal }).then(r => r.json()).then(j => setRes(j.results || [])).catch(() => {});
    }, 180);
    return () => { clearTimeout(t); c.abort(); };
  }, [q, profile.board, profile.cls]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[55] grid place-items-start bg-black/40 px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="card mx-auto w-full max-w-xl overflow-hidden" initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} onClick={e => e.stopPropagation()} role="dialog" aria-label="Search">
            <div className="flex items-center gap-2 border-b border-line px-4"><Search size={17} className="text-muted" />
              <input ref={ref} id="palette-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search chapters and topics in your class…" className="h-14 flex-1 bg-transparent outline-none" />
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {res.map(r => (
                <li key={r.id}><button className="w-full rounded-xl px-3 py-2 text-left hover:bg-surface2" onClick={() => { onClose(); router.push(`/student/learn/${encodeURIComponent(r.id)}`); }}>
                  <span className="font-semibold">{r.name}</span><span className="block text-sm text-muted">{r.subject} · {r.where}</span></button></li>
              ))}
              {q.trim().length >= 2 && !res.length && <li className="px-3 py-6 text-center text-muted">No chapters match “{q}”.</li>}
              {q.trim().length < 2 && <li className="px-3 py-6 text-center text-muted">Type at least 2 letters.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
