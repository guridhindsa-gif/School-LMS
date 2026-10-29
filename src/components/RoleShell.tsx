import Link from 'next/link';
import { BookOpen, Database, GraduationCap, LineChart, Users } from 'lucide-react';
import { Logo, ThemeToggle } from './AppShell';

const ROLES = [
  { href: '/student', label: 'Student', icon: GraduationCap, dot: 'bg-primary' },
  { href: '/teacher', label: 'Teacher', icon: BookOpen, dot: 'bg-teal' },
  { href: '/parent', label: 'Parent', icon: Users, dot: 'bg-accent' },
  { href: '/principal', label: 'Principal', icon: LineChart, dot: 'bg-violet' },
  { href: '/admin', label: 'Content admin', icon: Database, dot: 'bg-night dark:bg-onnight' },
] as const;

export type RoleName = (typeof ROLES)[number]['label'];

const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };

/** Shell for the staff and parent apps: brand, role identity, role switcher and theme. */
export function RoleShell({ role, children }: { role: RoleName; children: React.ReactNode }) {
  const me = ROLES.find(r => r.label === role)!;
  return (
    <div className="min-h-dvh overflow-x-clip">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 py-3" style={pad}>
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-display text-lg font-extrabold tracking-tight" aria-label="School LMS home">
            <Logo size={34} />
            <span className="hidden sm:inline">School<span className="text-primary">LMS</span></span>
          </Link>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-bold">
            <i className={`h-2 w-2 rounded-full ${me.dot}`} aria-hidden />{role}
          </span>
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Switch app">
            {ROLES.map(r => (
              <Link key={r.href} href={r.href} aria-current={r.label === role ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-ctl px-3 py-2 text-sm font-semibold transition ${r.label === role ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>
                <r.icon size={15} aria-hidden />{r.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto md:ml-2"><ThemeToggle /></div>
        </div>
        {/* compact switcher on small screens: scrolls inside itself, never the page */}
        <nav className="flex gap-1 overflow-x-auto border-t border-line/70 py-2 md:hidden" style={pad} aria-label="Switch app">
          {ROLES.map(r => (
            <Link key={r.href} href={r.href} aria-current={r.label === role ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${r.label === role ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'}`}>
              <r.icon size={14} aria-hidden />{r.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto grid max-w-7xl gap-6 py-6 pb-16 outline-none sm:py-8" style={pad}>{children}</main>
    </div>
  );
}
