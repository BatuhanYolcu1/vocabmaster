import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { AdminShell } from './admin-shell';

export const metadata: Metadata = { title: { default: 'Yönetim', template: '%s · Yönetim · VocabMaster' }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell name={user.name ?? user.email}>{children}</AdminShell>;
}
