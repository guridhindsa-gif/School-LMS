import { RoleShell } from '@/components/RoleShell';
import { PrincipalView } from './PrincipalView';

export const metadata = { title: 'Principal' };

export default function PrincipalPage() {
  return <RoleShell role="Principal"><PrincipalView /></RoleShell>;
}
