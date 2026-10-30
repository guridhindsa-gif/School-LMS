'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, BarChart3, FlaskConical, Home, Maximize2, Moon, Search, Sparkles, Star as StarIcon, Sun, Trophy, X, Settings, Flame, Users, ArrowRight, CornerDownLeft, Gamepad2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TutorChat } from './TutorChat';
import { Vidya } from './art';
import { cx, useFocusTrap } from './ui';
import { level } from '@/lib/achievements';
import { LANGS, LangSync, useT, type Lang } from '@/lib/i18n';
import { useLMS, useHydrated } from '@/lib/store';
import { useTutor } from '@/lib/tutor-store';

type NavItem = { href: string; key: string; short: string; icon: typeof Home };
const GROUPS: { key: string; items: NavItem[] }[] = [
  { key: 'nav.learn', items: [
    { href: '/student', key: 'nav.home', short: 'nav.home', icon: Home },
    { href: '/student/syllabus', key: 'nav.syllabus', short: 'nav.syllabusShort', icon: BookOpen },
    { href: '/student/labs', key: 'nav.labs', short: 'nav.labsShort', icon: FlaskConical },
  ] },
  { key: 'nav.prepare', items: [
    { href: '/student/exams', key: 'nav.exams', short: 'nav.examsShort', icon: Trophy },
    { href: '/student/progress', key: 'nav.progress', short: 'nav.progress', icon: BarChart3 },
  ] },
  { key: 'nav.help', items: [
    { href: '/student/tutor', key: 'nav.tutor', short: 'nav.tutorShort', icon: Sparkles },
  ] },
];
const ALL = GROUPS.flatMap(g => g.items);
const MOBILE = ['/student', '/student/syllabus', '/student/labs', '/student/exams', '/student/progress'];
/** Classes 1–5: four big destinations, no exam or analytics navigation. */
const JUNIOR: NavItem[] = [
  { href: '/student', key: 'nav.home', short: 'nav.home', icon: Home },
  { href: '/student/junior/learn', key: 'jr.learn', short: 'jr.learn', icon: BookOpen },
  { href: '/student/junior/play', key: 'jr.play', short: 'jr.playShort', icon: Gamepad2 },
  { href: '/student/junior/stars', key: 'jr.stars', short: 'jr.stars', icon: StarIcon },
];
const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };

export const isJunior = (cls: number | null | undefined) => !!cls && cls <= 5;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { open, setOpen } = useTutor();
  const hydrated = useHydrated();
  const profile = useLMS(s => s.profile);
  const streak = useLMS(s => s.streak.current);
  const xp = useLMS(s => s.xp);
  const [palette, setPalette] = useState(false);
  const reduce = useReducedMotion();
  const { t } = useT();
  const junior = hydrated && isJunior(profile.cls);

  // Classes 1–5 get the friendlier "junior" stage of the design system.
  useEffect(() => {
    const r = document.documentElement;
    if (junior) r.setAttribute('data-stage', 'junior'); else r.removeAttribute('data-stage');
  }, [junior]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); } };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);

  const active = (href: string) => (href === '/student' ? path === '/student' : path.startsWith(href));
  const lv = level(xp);
  // The lesson studio shows Vidya in its own side panel on wide screens: never show a second entry point there.
  const tutorInPage = path === '/student/tutor';
  const tutorPanel = path.startsWith('/student/learn/');
  const classLabel = profile.cls === 13 ? t('shell.repeater') : t('shell.class', { n: profile.cls ?? '' });

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <LangSync />
      <a href="#main" className="skip-link">{t('shell.skip')}</a>

      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <Brand />
        <nav className="mt-7 grid gap-5 overflow-y-auto" aria-label={t('nav.main')}>
          {junior ? (
            <div className="grid gap-1.5">
              {JUNIOR.map(n => <SideLink key={n.href} n={n} on={active(n.href)} reduce={!!reduce} big label={t(n.key)} />)}
            </div>
          ) : GROUPS.map(g => (
            <div key={g.key} className="grid gap-0.5">
              <p className="px-3 pb-1 text-xs font-semibold text-muted">{t(g.key)}</p>
              {g.items.map(n => <SideLink key={n.href} n={n} on={active(n.href)} reduce={!!reduce} label={t(n.key)} />)}
            </div>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 pt-4">
          {hydrated && profile.board && (
            <Link href={junior ? '/student/junior/stars' : '/student/progress'} className="grid gap-2 rounded-card border border-line bg-surface2/60 p-3 text-sm transition hover:border-primary/40">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-night font-display font-bold text-onnight">{(profile.name || 'S').slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{profile.name || t('shell.student')}</p>
                  <p className="truncate text-xs text-muted">{profile.board} · {classLabel}{profile.stream ? ` · ${profile.stream}` : ''}</p>
                </div>
              </div>
              {!junior && (
                <>
                  <div className="flex items-center justify-between text-xs font-semibold"><span>{t('shell.level', { n: lv.level })}</span><span className="text-muted">{t('shell.toNext', { n: lv.toNext })}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface3" role="progressbar" aria-label={t('shell.levelProgress', { n: lv.level })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${lv.progress * 100}%` }} />
                  </div>
                </>
              )}
            </Link>
          )}
          <Link href="/settings" className="flex items-center gap-3 rounded-ctl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface2 hover:text-ink"><Settings size={17} /> {t('nav.settings')}</Link>
          {!junior && <Link href="/" className="flex items-center gap-3 rounded-ctl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface2 hover:text-ink"><Users size={17} /> {t('nav.switchRole')}</Link>}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="mx-auto flex max-w-7xl items-center gap-2 py-2.5 sm:gap-3" style={pad}>
            <div className="lg:hidden"><Brand small /></div>
            {!junior && (
              <>
                <button onClick={() => setPalette(true)} aria-haspopup="dialog" className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-ctl border border-line bg-surface px-3 py-2 text-left text-muted transition hover:border-primary/40 sm:flex">
                  <Search size={16} aria-hidden /><span className="truncate text-sm">{t('shell.search')}</span>
                  <kbd className="ml-auto hidden rounded border border-line px-1.5 font-mono text-[10px] md:block">{typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'}</kbd>
                </button>
                <button onClick={() => setPalette(true)} aria-haspopup="dialog" aria-label={t('shell.searchShort')} className="btn-icon h-9 w-9 min-h-0 sm:hidden"><Search size={17} /></button>
              </>
            )}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {hydrated && !junior && (
                <>
                  <span className="pill bg-accent/15 text-warn" title={t('shell.streak', { n: streak })}><Flame size={13} aria-hidden />{streak}<span className="sr-only"> {t('shell.streak', { n: streak })}</span></span>
                  <span className="pill hidden bg-primary/10 text-primary md:inline-flex" title={t('shell.xp')}>{xp} XP</span>
                </>
              )}
              {!tutorInPage && (
                <button onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={t('shell.askVidyaLabel')}
                  className={cx('flex h-9 items-center gap-1.5 rounded-full bg-night pl-1 pr-1 font-semibold text-onnight shadow-soft transition hover:bg-night2 sm:pr-3.5', tutorPanel && !junior && 'xl:hidden')}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10"><Vidya size={22} /></span>
                  <span className="hidden text-sm sm:inline">{t('shell.askVidya')}</span>
                </button>
              )}
              <LangSwitch />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto max-w-7xl pb-28 pt-6 outline-none sm:pt-8 lg:pb-16" style={pad}>
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) — every main destination is reachable */}
      <nav className={cx('fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-surface/95 backdrop-blur-md lg:hidden', junior ? 'grid-cols-4' : 'grid-cols-5')} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label={t('nav.main')}>
        {(junior ? JUNIOR : MOBILE.map(h => ALL.find(n => n.href === h)!)).map(n => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}
            className={cx('relative grid justify-items-center gap-0.5 py-2 font-semibold', junior ? 'text-xs' : 'text-[11px]', active(n.href) ? 'text-primary' : 'text-muted')}>
            {active(n.href) && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" aria-hidden />}
            <n.icon size={junior ? 24 : 20} aria-hidden /><span className="max-w-full truncate px-1">{t(n.short)}</span>
          </Link>
        ))}
      </nav>

      <TutorDrawer open={open} onClose={() => setOpen(false)} />
      {!junior && <CommandPalette open={palette} onClose={() => setPalette(false)} />}
    </div>
  );
}

function SideLink({ n, on, reduce, label, big }: { n: NavItem; on: boolean; reduce: boolean; label: string; big?: boolean }) {
  return (
    <Link href={n.href} aria-current={on ? 'page' : undefined}
      className={cx('relative flex items-center gap-3 rounded-ctl px-3 font-semibold transition', big ? 'py-3.5 text-lg' : 'py-2.5', on ? 'text-primary' : 'text-muted hover:bg-surface2 hover:text-ink')}>
      {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-ctl bg-primary/10" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
      {on && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary" aria-hidden />}
      <n.icon size={big ? 22 : 18} className="relative" aria-hidden /><span className="relative">{label}</span>
    </Link>
  );
}

function TutorDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { t } = useT();
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
              <Vidya size={40} />
              <div className="min-w-0 flex-1"><h2 id="tutor-title" className="text-lg">{t('tutor.title')}</h2><p className="text-xs text-muted">{t('tutor.subtitle')}</p></div>
              <Link href="/student/tutor" onClick={onClose} className="btn-icon" aria-label={t('tutor.openFull')}><Maximize2 size={16} /></Link>
              <button className="btn-icon" onClick={onClose} aria-label={t('tutor.close')}><X size={18} /></button>
            </div>
            <div className="min-h-0 flex-1 px-5 pb-4 pt-3"><TutorChat compact /></div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Brand({ small }: { small?: boolean }) {
  const { t } = useT();
  return (
    <Link href="/student" className="flex items-center gap-2.5 px-2" aria-label={t('shell.home')}>
      <Logo />
      {!small && <Wordmark />}
    </Link>
  );
}

/** Wordmark: "School" in the display face, "LMS" as a small tracked tag. */
export function Wordmark({ invert }: { invert?: boolean }) {
  return (
    <span className="flex items-baseline gap-1.5 font-display text-[1.3rem] font-extrabold leading-none tracking-tight">
      School<span className={cx('rounded-md px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.14em]', invert ? 'bg-white/15 text-onnight' : 'bg-primary/10 text-primary')}>LMS</span>
    </span>
  );
}

/** Brand mark: an open book whose pages form a rising path, with the lamp of learning above. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[30%] bg-night shadow-soft" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M4 10c4-1.6 8-1.2 12 1.5v15c-4-2.7-8-3.1-12-1.5v-15Z" fill="rgb(var(--primary))" />
        <path d="M28 10c-4-1.6-8-1.2-12 1.5v15c4-2.7 8-3.1 12-1.5v-15Z" fill="rgb(var(--teal))" />
        <path d="M16 1.5c1.8 2.4 2.8 3.9 2.8 5.3a2.8 2.8 0 0 1-5.6 0c0-1.4 1-2.9 2.8-5.3Z" fill="rgb(var(--accent))" />
      </svg>
    </span>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const { t } = useT();
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  return (
    <button className="btn-icon h-9 w-9 min-h-0" aria-label={dark ? t('shell.themeLight') : t('shell.themeDark')} aria-pressed={dark}
      onClick={() => { const d = !dark; setDark(d); document.documentElement.classList.toggle('dark', d); try { localStorage.setItem('lms-theme', d ? 'dark' : 'light'); } catch { /* ignore */ } }}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function LangSwitch() {
  const lang = useLMS(s => s.profile.language);
  const setProfile = useLMS(s => s.setProfile);
  const { t } = useT();
  return (
    <select aria-label={t('shell.language')} title={t('shell.language')} value={lang} onChange={e => setProfile({ language: e.target.value as Lang })}
      className="h-9 rounded-ctl border border-line bg-surface px-2 text-sm font-semibold">
      {LANGS.map(l => <option key={l.id} value={l.id}>{l.short}</option>)}
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
  const { t } = useT();
  useFocusTrap(box, open, onClose);
  useEffect(() => { if (!open) { setQ(''); setRes([]); setSel(0); } }, [open]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); setBusy(false); return; }
    const c = new AbortController();
    setBusy(true);
    const tm = setTimeout(() => {
      const p = new URLSearchParams({ q, board: profile.board || 'CBSE' });
      if (profile.cls && profile.cls <= 12) p.set('cls', String(profile.cls));
      fetch(`/api/syllabus?${p}`, { signal: c.signal }).then(r => r.json()).then(j => { setRes(j.results || []); setBusy(false); }).catch(() => setBusy(false));
    }, 180);
    return () => { clearTimeout(tm); c.abort(); };
  }, [q, profile.board, profile.cls]);

  const hits: Hit[] = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const pages: Hit[] = [...ALL, { href: '/settings', key: 'nav.settings', short: '', icon: Settings }]
      .map(n => ({ ...n, label: t(n.key) }))
      .filter(n => !ql || n.label.toLowerCase().includes(ql))
      .map(n => ({ key: n.href, title: n.label, sub: t('palette.goto'), href: n.href, kind: 'page' as const }));
    const chapters: Hit[] = res.map(r => ({ key: r.id, title: r.name, sub: `${r.subject} · ${r.where}`, href: `/student/learn/${encodeURIComponent(r.id)}`, kind: 'chapter' }));
    return [...chapters, ...pages].slice(0, 12);
  }, [q, res, t]);
  useEffect(() => setSel(0), [hits.length]);
  const go = (h?: Hit) => { if (!h) return; onClose(); router.push(h.href); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[55] grid place-items-start bg-night/50 px-4 pt-[12vh] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div ref={box} className="card mx-auto w-full max-w-xl overflow-hidden shadow-float" initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t('palette.label')}>
            <div className="flex items-center gap-2 border-b border-line px-4"><Search size={17} className="text-muted" aria-hidden />
              <input data-autofocus value={q} onChange={e => setQ(e.target.value)} placeholder={t('palette.placeholder')}
                role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={hits[sel] ? `hit-${sel}` : undefined} aria-autocomplete="list" aria-label={t('palette.label')}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(hits.length - 1, s + 1)); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
                  else if (e.key === 'Enter') { e.preventDefault(); go(hits[sel]); }
                }}
                className="h-14 min-w-0 flex-1 bg-transparent outline-none" />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">Esc</kbd>
            </div>
            <ul id="palette-list" role="listbox" aria-label={t('palette.results')} className="max-h-[52vh] overflow-y-auto p-2">
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
              {q.trim().length >= 2 && !busy && !res.length && <li className="px-3 py-3 text-sm text-muted">{t('palette.none', { q })}</li>}
              {busy && <li className="px-3 py-3 text-sm text-muted">{t('palette.searching')}</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
