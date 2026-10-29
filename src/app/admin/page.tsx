import { RoleShell } from '@/components/RoleShell';
import data from '@/data/syllabus.json';
import { AdminView, type CatalogRow } from './AdminView';

export const metadata = { title: 'Content admin' };

export default function AdminPage() {
  const subjects = (data as unknown as { subjects: Record<string, { id: string; board: string; cls: number; name: string; verified: string; session?: string; src?: string; units: unknown[] }> }).subjects;
  const rows: CatalogRow[] = Object.values(subjects).map(s => ({ id: s.id, board: s.board, cls: s.cls, name: s.name, verified: s.verified, session: s.session || '', src: s.src || '', units: s.units.length }));
  return <RoleShell role="Content admin"><AdminView rows={rows} generated={(data as { generated: string }).generated} /></RoleShell>;
}
