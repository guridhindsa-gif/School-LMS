import { RoleShell } from '@/components/RoleShell';
import { TeacherView } from './TeacherView';

export const metadata = { title: 'Teacher' };

export default function TeacherPage() {
  return <RoleShell role="Teacher"><TeacherView /></RoleShell>;
}
