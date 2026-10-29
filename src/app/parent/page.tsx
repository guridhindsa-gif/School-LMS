import { RoleShell } from '@/components/RoleShell';
import { ParentView } from './ParentView';

export const metadata = { title: 'Parent' };

export default function ParentPage() {
  return <RoleShell role="Parent"><ParentView /></RoleShell>;
}
