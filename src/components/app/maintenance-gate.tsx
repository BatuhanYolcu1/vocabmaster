import { getSettings } from '@/server/settings';
import { getCurrentUser } from '@/server/session';
import { MaintenanceSwitch } from './maintenance-switch';

/** During maintenance everyone but admins sees a notice (login stays reachable so admins can sign in). */
export async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  if (!settings.MAINTENANCE_MODE) return <>{children}</>;
  const user = await getCurrentUser();
  return <MaintenanceSwitch isAdmin={user?.role === 'ADMIN'}>{children}</MaintenanceSwitch>;
}
