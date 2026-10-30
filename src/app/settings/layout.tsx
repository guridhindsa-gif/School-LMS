import { AppShell } from '@/components/AppShell';

export const metadata = { title: 'Settings' };

/** Settings live inside the same shell as the student app, so navigation stays consistent. */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
