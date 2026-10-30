'use client';
import Link from 'next/link';
import { BookOpen, Check, ChevronDown, Database, FlaskConical, GraduationCap, LineChart, Users, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo, ThemeToggle, Wordmark } from './AppShell';
import { EmptyArt } from './art';
import { Skeleton, cx } from './ui';
import { LANGS, LangSync, useT, type Lang } from '@/lib/i18n';
import { useLMS } from '@/lib/store';
import { useSchool, useSchoolHydrated } from '@/lib/school-store';

const ROLES = [
  { href: '/student', label: 'Student', key: 'roles.student', icon: GraduationCap, dot: 'bg-primary' },
  { href: '/teacher', label: 'Teacher', key: 'roles.teacher', icon: BookOpen, dot: 'bg-teal' },
  { href: '/parent', label: 'Parent', key: 'roles.parent', icon: Users, dot: 'bg-accent' },
  { href: '/principal', label: 'Principal', key: 'roles.principal', icon: LineChart, dot: 'bg-violet' },
  { href: '/admin', label: 'Content admin', key: 'roles.admin', icon: Database, dot: 'bg-night dark:bg-onnight' },
] as const;

export type RoleName = (typeof ROLES)[number]['label'];

const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };

/** Shell for the staff and parent apps: brand, role identity, role switcher, language and theme. */
export function RoleShell({ role, children }: { role: RoleName; children: ReactNode }) {
  const { t } = useT();
  const me = ROLES.find(r => r.label === role)!;
  return (
    <div className="min-h-dvh overflow-x-clip">
      <LangSync />
      <a href="#main" className="skip-link">{t('shell.skip')}</a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-7xl items-center gap-2 py-3 sm:gap-3" style={pad}>
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-display text-lg font-extrabold tracking-tight" aria-label={t('shell.home')}>
            <Logo size={34} />
            <span className="hidden sm:inline"><Wordmark /></span>
          </Link>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-bold md:flex">
            <i className={`h-2 w-2 rounded-full ${me.dot}`} aria-hidden />{t(me.key)}
          </span>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label={t('roles.switchApp')}>
            {ROLES.map(r => (
              <Link key={r.href} href={r.href} aria-current={r.label === role ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-ctl px-3 py-2 text-sm font-semibold transition ${r.label === role ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>
                <r.icon size={15} aria-hidden />{t(r.key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <RoleMenu role={role} />
            <LangSelect />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto grid max-w-7xl gap-6 py-6 pb-16 outline-none sm:py-8" style={pad}>{children}</main>
    </div>
  );
}

/** Compact language select shared by all role apps (sets the global, persisted language). */
function LangSelect() {
  const { t, lang } = useT();
  const setProfile = useLMS(s => s.setProfile);
  return (
    <select aria-label={t('shell.language')} value={lang} onChange={e => setProfile({ language: e.target.value as Lang })}
      className="h-9 rounded-ctl border border-line bg-surface px-2 text-sm font-semibold">
      {LANGS.map(l => <option key={l.id} value={l.id}>{l.short}</option>)}
    </select>
  );
}

/** Role switcher as a menu below the lg breakpoint (the inline list would be clipped). */
function RoleMenu({ role }: { role: RoleName }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const me = ROLES.find(r => r.label === role)!;

  useEffect(() => {
    if (!open) return;
    const first = list.current?.querySelector<HTMLElement>('[aria-current="page"]') || list.current?.querySelector<HTMLElement>('a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(list.current?.querySelectorAll<HTMLElement>('a') || []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
      }
    };
    const onDown = (e: MouseEvent) => { if (!list.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <button ref={btn} className="btn-ghost h-9 min-h-0 gap-1.5 px-2.5 text-sm" aria-haspopup="true" aria-expanded={open} aria-controls="role-menu"
        aria-label={t('roles.menuLabel', { role: t(me.key) })} onClick={() => setOpen(o => !o)}>
        <i className={`h-2 w-2 rounded-full ${me.dot}`} aria-hidden /><span className="max-w-[9rem] truncate">{t(me.key)}</span><ChevronDown size={14} aria-hidden />
      </button>
      {open && (
        <ul ref={list} id="role-menu" aria-label={t('roles.switchApp')} className="card absolute right-0 top-11 z-40 grid w-56 gap-0.5 p-1.5 shadow-float">
          {ROLES.map(r => (
            <li key={r.href}>
              <Link href={r.href} aria-current={r.label === role ? 'page' : undefined} onClick={() => setOpen(false)}
                className={cx('flex items-center gap-2.5 rounded-ctl px-3 py-2.5 text-sm font-semibold outline-none hover:bg-surface2 focus-visible:bg-surface2', r.label === role ? 'text-primary' : 'text-ink')}>
                <r.icon size={16} aria-hidden /><span className="flex-1">{t(r.key)}</span>{r.label === role && <Check size={15} aria-hidden />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Honest data gate for dashboards that need the school data service.
 * Default: a "not connected" state that says nothing shown is real. The user may opt into
 * clearly bannered demo data (persisted on this device).
 */
export function DemoGate({ role, children }: { role: 'teacher' | 'parent' | 'principal'; children: ReactNode }) {
  const { t } = useT();
  const hydrated = useSchoolHydrated();
  const demo = useSchool(s => s.demo);
  const setDemo = useSchool(s => s.setDemo);
  if (!hydrated) return <Skeleton lines={6} />;
  if (demo) return <><DemoBanner />{children}</>;
  return (
    <section className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8" aria-labelledby="nc-title">
      <div className="justify-self-center"><EmptyArt kind="general" size={132} /></div>
      <div className="grid gap-3">
        <h2 id="nc-title" className="h-section">{t('roles.nc.title')}</h2>
        <p className="text-muted">{t('roles.nc.body')}</p>
        <ul className="grid gap-1.5 text-sm">
          {[1, 2, 3].map(i => <li key={i} className="flex gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />{t(`roles.nc.${role}${i}`)}</li>)}
        </ul>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button className="btn-primary" onClick={() => setDemo(true)}><FlaskConical size={16} /> {t('roles.nc.demo')}</button>
          <span className="text-xs text-muted">{t('roles.nc.docs')}</span>
        </div>
      </div>
    </section>
  );
}

/** Persistent banner shown whenever invented demo figures are on screen. */
export function DemoBanner() {
  const { t } = useT();
  const setDemo = useSchool(s => s.setDemo);
  return (
    <div role="note" className="flex flex-wrap items-center gap-3 rounded-ctl border-2 border-dashed border-accent bg-accent/10 px-4 py-3 text-sm">
      <FlaskConical size={18} className="shrink-0 text-warn" aria-hidden />
      <p className="min-w-0 flex-1"><b>{t('roles.demo.banner')}</b> <span className="text-muted">{t('roles.demo.body')}</span></p>
      <button className="btn-ghost h-9 min-h-0 px-3 text-sm" onClick={() => setDemo(false)}><X size={14} /> {t('roles.demo.off')}</button>
    </div>
  );
}

/** True when the role page should show demo figures (hydrated and opted in). */
export function useDemo() {
  const hydrated = useSchoolHydrated();
  const demo = useSchool(s => s.demo);
  return hydrated && demo;
}
