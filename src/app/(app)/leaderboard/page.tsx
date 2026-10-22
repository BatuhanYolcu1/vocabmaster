import type { Metadata } from 'next';
import { requireOnboardedUser } from '@/server/session';
import { getLeaderboard } from '@/server/leaderboard';
import { PageHeader } from '@/components/ui/misc';
import { LeaderboardView } from './leaderboard-view';

export const metadata: Metadata = { title: 'Sıralama' };

export default async function LeaderboardPage() {
  const user = await requireOnboardedUser();
  const initial = await getLeaderboard(user.id, 'week');
  return (
    <>
      <PageHeader title="Sıralama" description="Kazanılan XP’ye göre en çalışkanlar. Haftalık sıralama her gün güncellenir." />
      <LeaderboardView initial={initial} />
    </>
  );
}
