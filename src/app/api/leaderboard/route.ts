import { route, json, requireApiUserId } from '@/server/api';
import { getLeaderboard, type LeaderboardPeriod } from '@/server/leaderboard';

export const GET = route(async (req) => {
  const userId = await requireApiUserId();
  const raw = new URL(req.url).searchParams.get('period');
  const period: LeaderboardPeriod = raw === 'month' || raw === 'all' ? raw : 'week';
  return json(await getLeaderboard(userId, period), { headers: { 'Cache-Control': 'private, max-age=30' } });
});
