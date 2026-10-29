import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from './AppShell';

const ROLES = [['/student', 'Student'], ['/teacher', 'Teacher'], ['/parent', 'Parent'], ['/principal', 'Principal'], ['/admin', 'Content admin']];

export function RoleShell({ role, children }: { role: string; children: React.ReactNode }) {
  const pad = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' };
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 py-3" style={pad}>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-board text-marigold"><GraduationCap size={19} /></span>
            <span className="hidden sm:inline">School LMS</span>
          </Link>
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Apps">
            {ROLES.map(([href, label]) => (
              <Link key={href} href={href} aria-current={label === role ? 'page' : undefined}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${label === role ? 'bg-board text-chalk' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>{label}</Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 py-6 pb-16" style={pad}>{children}</main>
    </div>
  );
}
