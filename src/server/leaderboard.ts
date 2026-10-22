import 'server-only';
import { prisma } from './db';
import { lastDays } from '@/lib/dates';
import { levelForXp } from '@/lib/levels';

export type LeaderboardPeriod = 'week' | 'month' | 'all';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  xp: number;
  level: number;
  isMe: boolean;
}

function displayName(name: string | null) {
  const parts = (name ?? 'Anonim').trim().split(/\s+/);
  // Privacy: first name + initial of the last name only.
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

export async function getLeaderboard(userId: string, period: LeaderboardPeriod) {
  const TOP = 25;
  let rows: Array<{ id: string; xp: number }>;

  if (period === 'all') {
    rows = (
      await prisma.user.findMany({ where: { xp: { gt: 0 } }, orderBy: { xp: 'desc' }, take: TOP, select: { id: true, xp: true } })
    ).map((u) => ({ id: u.id, xp: u.xp }));
  } else {
    const since = lastDays(period === 'week' ? 7 : 30)[0];
    const grouped = await prisma.dailyActivity.groupBy({
      by: ['userId'],
      where: { date: { gte: since }, xpEarned: { gt: 0 } },
      _sum: { xpEarned: true },
      orderBy: { _sum: { xpEarned: 'desc' } },
      take: TOP,
    });
    rows = grouped.map((g) => ({ id: g.userId, xp: g._sum.xpEarned ?? 0 }));
  }

  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    select: { id: true, name: true, image: true, xp: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  const entries: LeaderboardEntry[] = rows.map((r, i) => {
    const u = byId.get(r.id);
    return {
      rank: i + 1,
      id: r.id,
      name: displayName(u?.name ?? null),
      image: u?.image ?? null,
      xp: r.xp,
      level: levelForXp(u?.xp ?? 0),
      isMe: r.id === userId,
    };
  });

  // Where am I, if not in the top list?
  let me: LeaderboardEntry | null = entries.find((e) => e.isMe) ?? null;
  if (!me) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, image: true, xp: true } });
    if (user) {
      let myXp = user.xp;
      let ahead: number;
      if (period === 'all') {
        ahead = await prisma.user.count({ where: { xp: { gt: user.xp } } });
      } else {
        const since = lastDays(period === 'week' ? 7 : 30)[0];
        const mine = await prisma.dailyActivity.aggregate({
          where: { userId, date: { gte: since } },
          _sum: { xpEarned: true },
        });
        myXp = mine._sum.xpEarned ?? 0;
        const all = await prisma.dailyActivity.groupBy({
          by: ['userId'],
          where: { date: { gte: since } },
          _sum: { xpEarned: true },
          having: { xpEarned: { _sum: { gt: myXp } } },
        });
        ahead = all.length;
      }
      me = {
        rank: ahead + 1,
        id: userId,
        name: displayName(user.name),
        image: user.image,
        xp: myXp,
        level: levelForXp(user.xp),
        isMe: true,
      };
    }
  }

  return { entries, me };
}
