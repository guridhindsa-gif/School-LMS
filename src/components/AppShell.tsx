'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, BarChart3, FlaskConical, Home, Maximize2, Moon, Search, Sparkles, Sun, Trophy, X, Settings, Flame, Users, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TutorChat } from './TutorChat';
import { cx, useFocusTrap } from './ui';
import { level } from '@/lib/achievements';
import { useLMS, useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

type NavItem = { href: string; label: string; short: string; icon: typeof Home };
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Learn', items: [
    { href: '/student', label: 'Home', short: 'Home', icon: Home },
    { href: '/student/syllabus', label: 'My syllabus', short: 'Syllabus', icon: BookOpen },
    { href: '/student/labs', label: 'Visual labs', short: 'Labs', icon: FlaskConical },
  ] },
  { title: 'Prepare', items: [
    { href: '/student/exams', label: 'Competitive exams', short: 'Exams', icon: Trophy },
    { href: '/student/progress', label: 'Progress', short: 'Progress', icon: BarChart3 },
  ] },
  { title: 'Help', items: [
    { href: '/student/tutor', label: 'Vidya AI tutor', short: 'Tutor', icon: Sparkles },
  ] },
];
const MOBILE = ['/student', '/student/syllabus', '/student/labs', '/student/exams', '/student/progress'];
const ALL = GROUPS.flatMap(g => g.items);
const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { open, setOpen } = useTutor();
  const hydrated = useHydrated();
  const profile = useLMS(s => s.profile);
  const streak = useLMS(s => s.streak.current);
  const xp = useLMS(s => s.xp);
  const [palette, setPalette] = useState(false);
  const reduce = useReducedMotion();

  // Classes 1–5 get the friendlier "junior" stage of the design system.
  useEffect(() => {
    const r = document.documentElement;
    if (profile.cls && profile.cls <= 5) r.setAttribute('data-stage', 'junior'); else r.removeAttribute('data-stage');
  }, [profile.cls]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); }
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);

  const active = (href: string) => (href === '/student' ? path === '/student' : path.startsWith(href));
  const lv = level(xp);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <Brand />
        <nav className="mt-7 grid gap-5 overflow-y-auto" aria-label="Student">
          {GROUPS.map(g => (
            <div key={g.title} className="grid gap-0.5">
              <p className="eyebrow px-3 pb-1">{g.title}</p>
              {g.items.map(n => (
                <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}
                  className={cx('relative flex items-center gap-3 rounded-ctl px-3 py-2.5 font-semibold transition', active(n.href) ? 'text-primary' : 'text-muted hover:bg-surface2 hover:text-ink')}>
                  {active(n.href) && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-ctl bg-primary/10" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
                  {active(n.href) && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary" aria-hidden />}
                  <n.icon size={18} className="relative" /><span className="relative">{n.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 pt-4">
          {hydrated && profile.board && (
            <Link href="/student/progress" className="grid gap-2 rounded-card border border-line bg-surface2/60 p-3 text-sm transition hover:border-primary/40">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-night font-display font-bold text-onnight">{(profile.name || 'S').slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{profile.name || 'Student'}</p>
                  <p className="truncate text-xs text-muted">{profile.board} · {profile.cls === 13 ? 'Repeater' : `Class ${profile.cls}`}{profile.stream ? ` · ${profile.stream}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold"><span>Level {lv.level}</span><span className="text-muted">{lv.toNext} XP to next</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface3" role="progressbar" aria-label={`Level ${lv.level} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)}>
                <div className="h-full rounded-full bg-primary" style={{ width: `${lv.progress * 100}%` }} />
              </div>
            </Link>
          )}
          <Link href="/settings" className="flex items-center gap-3 rounded-ctl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface2 hover:text-ink"><Settings size={17} /> Settings &amp; AI</Link>
          <Link href="/" className="flex items-center gap-3 rounded-ctl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface2 hover:text-ink"><Users size={17} /> Switch role</Link>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="mx-auto flex max-w-7xl items-center gap-2 py-3 sm:gap-3" style={pad}>
            <div className="lg:hidden"><Brand small /></div>
            <button onClick={() => setPalette(true)} aria-haspopup="dialog" className="flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-ctl border border-line bg-surface px-3 py-2 text-left text-muted transition hover:border-primary/40">
              <Search size={16} /><span className="truncate text-sm">Search chapters, topics, pages…</span>
              <kbd className="ml-auto hidden rounded border border-line px-1.5 font-mono text-[10px] sm:block">Ctrl K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {hydrated && (
                <>
                  <span className="pill bg-accent/15 text-warn" title={`${streak}-day learning streak`}><Flame size={13} aria-hidden />{streak}<span className="sr-only"> day streak</span></span>
                  <span className="pill hidden bg-primary/10 text-primary sm:inline-flex" title="Experience points">{xp} XP</span>
                </>
              )}
              <LangSwitch />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto max-w-7xl pb-32 pt-6 outline-none sm:pt-8 lg:pb-24" style={pad}>
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) — every main destination is reachable */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Student">
        {MOBILE.map(h => ALL.find(n => n.href === h)!).map(n => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}
            className={cx('relative grid justify-items-center gap-0.5 py-2 text-[11px] font-semibold', active(n.href) ? 'text-primary' : 'text-muted')}>
            {active(n.href) && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" aria-hidden />}
            <n.icon size={20} aria-hidden />{n.short}
          </Link>
        ))}
      </nav>

      {/* Floating tutor button */}
      {path !== '/student/tutor' && (
        <motion.button onClick={() => setOpen(true)} whileHover={reduce ? undefined : { y: -2 }} whileTap={{ scale: 0.96 }}
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-40 flex items-center gap-2 rounded-full bg-night py-3 pl-3 pr-4 font-semibold text-onnight shadow-float ring-1 ring-white/10 lg:bottom-6"
          style={{ right: 'max(16px, env(safe-area-inset-right, 0px))' }}
          aria-label="Ask Vidya, the AI tutor" aria-haspopup="dialog">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white"><Sparkles size={15} /></span>
          <span className="hidden sm:inline">Ask Vidya</span>
        </motion.button>
      )}

      <TutorDrawer open={open} onClose={() => setOpen(false)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

function TutorDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-night/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.aside ref={ref} role="dialog" aria-modal="true" aria-labelledby="tutor-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-line bg-surface shadow-float"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
            <div className="flex items-center gap-3 border-b border-line px-5 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-onprimary"><Sparkles size={17} /></span>
              <div className="min-w-0 flex-1"><h2 id="tutor-title" className="text-lg">Vidya</h2><p className="text-xs text-muted">AI tutor · knows the chapter you are on</p></div>
              <Link href="/student/tutor" onClick={onClose} className="btn-icon" aria-label="Open the tutor full page"><Maximize2 size={16} /></Link>
              <button className="btn-icon" onClick={onClose} aria-label="Close tutor"><X size={18} /></button>
            </div>
            <div className="min-h-0 flex-1 px-5 pb-4 pt-3"><TutorChat compact /></div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Brand({ small }: { small?: boolean }) {
  return (
    <Link href="/student" className="flex items-center gap-2.5 px-2 font-display text-xl font-extrabold tracking-tight" aria-label="School LMS home">
      <Logo />
      {!small && <span>School<span className="text-primary">LMS</span></span>}
    </Link>
  );
}

/** Brand mark: an open book whose pages form a rising path. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[30%] bg-night shadow-soft" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M4 9.5c4-1.6 8-1.2 12 1.5v15c-4-2.7-8-3.1-12-1.5v-15Z" fill="rgb(var(--primary))" />
        <path d="M28 9.5c-4-1.6-8-1.2-12 1.5v15c4-2.7 8-3.1 12-1.5v-15Z" fill="rgb(var(--teal))" />
        <circle cx="23.5" cy="5.5" r="3" fill="rgb(var(--accent))" />
      </svg>
    </span>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  return (
    <button className="btn-icon h-9 w-9" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={dark}
      onClick={() => { const d = !dark; setDark(d); document.documentElement.classList.toggle('dark', d); try { localStorage.setItem('lms-theme', d ? 'dark' : 'light'); } catch { /* ignore */ } }}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function LangSwitch() {
  const lang = useLMS(s => s.profile.language);
  const setProfile = useLMS(s => s.setProfile);
  return (
    <select aria-label="Language for AI lessons, narration and tutor" value={lang} onChange={e => setProfile({ language: e.target.value as 'en' | 'hi' | 'pa' })}
      className="h-9 rounded-ctl border border-line bg-surface px-2 text-sm font-semibold">
      <option value="en">EN</option><option value="hi">हिंदी</option><option value="pa">ਪੰਜਾਬੀ</option>
    </select>
  );
}

type Hit = { key: string; title: string; sub: string; href: string; kind: 'page' | 'chapter' };

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<{ id: string; name: string; subject: string; where: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(0);
  const profile = useLMS(s => s.profile);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, open, onClose);
  useEffect(() => { if (!open) { setQ(''); setRes([]); setSel(0); } }, [open]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); setBusy(false); return; }
    const c = new AbortController();
    setBusy(true);
    const t = setTimeout(() => {
      const p = new URLSearchParams({ q, board: profile.board || 'CBSE' });
      if (profile.cls && profile.cls <= 12) p.set('cls', String(profile.cls));
      fetch(`/api/syllabus?${p}`, { signal: c.signal }).then(r => r.json()).then(j => { setRes(j.results || []); setBusy(false); }).catch(() => setBusy(false));
    }, 180);
    return () => { clearTimeout(t); c.abort(); };
  }, [q, profile.board, profile.cls]);

  const hits: Hit[] = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const pages: Hit[] = [...ALL, { href: '/settings', label: 'Settings & AI', short: '', icon: Settings }]
      .filter(n => !ql || n.label.toLowerCase().includes(ql))
      .map(n => ({ key: n.href, title: n.label, sub: 'Go to page', href: n.href, kind: 'page' }));
    const chapters: Hit[] = res.map(r => ({ key: r.id, title: r.name, sub: `${r.subject} · ${r.where}`, href: `/student/learn/${encodeURIComponent(r.id)}`, kind: 'chapter' }));
    return [...chapters, ...pages].slice(0, 12);
  }, [q, res]);
  useEffect(() => setSel(0), [hits.length]);
  const go = (h?: Hit) => { if (!h) return; onClose(); router.push(h.href); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[55] grid place-items-start bg-night/50 px-4 pt-[12vh] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div ref={box} className="card mx-auto w-full max-w-xl overflow-hidden shadow-float" initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search">
            <div className="flex items-center gap-2 border-b border-line px-4"><Search size={17} className="text-muted" aria-hidden />
              <input data-autofocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search chapters in your class, or jump to a page…"
                role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={hits[sel] ? `hit-${sel}` : undefined} aria-autocomplete="list"
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(hits.length - 1, s + 1)); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
                  else if (e.key === 'Enter') { e.preventDefault(); go(hits[sel]); }
                }}
                className="h-14 flex-1 bg-transparent outline-none" />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">Esc</kbd>
            </div>
            <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[52vh] overflow-y-auto p-2">
              {hits.map((h, i) => (
                <li key={h.key} id={`hit-${i}`} role="option" aria-selected={i === sel}>
                  <button tabIndex={-1} onMouseEnter={() => setSel(i)} onClick={() => go(h)}
                    className={cx('flex w-full items-center gap-3 rounded-ctl px-3 py-2 text-left', i === sel && 'bg-primary/10')}>
                    <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg', h.kind === 'chapter' ? 'bg-teal/15 text-teal' : 'bg-surface2 text-muted')}>{h.kind === 'chapter' ? <BookOpen size={15} /> : <ArrowRight size={15} />}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{h.title}</span><span className="block truncate text-sm text-muted">{h.sub}</span></span>
                    {i === sel && <CornerDownLeft size={14} className="text-muted" aria-hidden />}
                  </button>
                </li>
              ))}
              {q.trim().length >= 2 && !busy && !res.length && <li className="px-3 py-3 text-sm text-muted">No chapters in your class match “{q}”.</li>}
              {busy && <li className="px-3 py-3 text-sm text-muted">Searching your syllabus…</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
