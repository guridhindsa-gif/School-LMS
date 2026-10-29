import { AppShell } from '@/components/AppShell';

export const metadata = { title: 'Student' };

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
