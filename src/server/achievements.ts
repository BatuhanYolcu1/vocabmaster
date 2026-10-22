import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { LEARNED_INTERVAL } from '@/lib/srs';
import { dayStamp, hourInTurkey } from '@/lib/dates';
import { levelForXp } from '@/lib/levels';
import { ACHIEVEMENTS, type AchievementDef } from '@/lib/achievement-defs';

export { ACHIEVEMENTS };

let synced: Promise<void> | null = null;

/** Upserts the definitions once per server instance. */
export function ensureAchievements() {
  synced ??= (async () => {
    for (const def of ACHIEVEMENTS) {
      const data = {
        nameTr: def.nameTr,
        description: def.description,
        descriptionTr: def.descriptionTr,
        icon: def.icon,
        xpReward: def.xpReward,
        condition: JSON.stringify({ metric: def.metric, target: def.target }),
      };
      await prisma.achievement.upsert({ where: { name: def.name }, update: data, create: { name: def.name, ...data } });
    }
  })().catch((error) => {
    synced = null;
    throw error;
  });
  return synced;
}

export interface AchievementContext {
  streak: number;
  level: number;
  /** Set when evaluating right after a session finishes */
  session?: { total: number; correct: number; durationMs: number };
  /** Set when evaluating right after an answer */
  answeredAt?: Date;
}

export interface EarnedAchievement {
  name: string;
  nameTr: string;
  icon: string;
  xpReward: number;
}

/**
 * Checks every not-yet-earned achievement and awards the ones now satisfied.
 * Returns what was newly earned (its XP is added to the user inside `tx`).
 */
export async function evaluateAchievements(
  tx: Prisma.TransactionClient,
  userId: string,
  ctx: AchievementContext,
): Promise<EarnedAchievement[]> {
  await ensureAchievements();

  const earnedRows = await tx.userAchievement.findMany({
    where: { userId },
    select: { achievement: { select: { name: true } } },
  });
  const earned = new Set(earnedRows.map((r) => r.achievement.name));
  const pending = ACHIEVEMENTS.filter((a) => !earned.has(a.name));
  if (pending.length === 0) return [];

  let wordsLearned: number | null = null;
  const learnedCount = async () =>
    (wordsLearned ??= await tx.progress.count({ where: { userId, interval: { gte: LEARNED_INTERVAL } } }));

  const hour = ctx.answeredAt ? hourInTurkey(ctx.answeredAt) : null;
  const unlocked: AchievementDef[] = [];

  for (const def of pending) {
    let ok = false;
    switch (def.metric) {
      case 'wordsLearned':
        ok = (await learnedCount()) >= def.target;
        break;
      case 'streak':
        ok = ctx.streak >= def.target;
        break;
      case 'level':
        ok = ctx.level >= def.target;
        break;
      case 'perfectSession':
        ok = !!ctx.session && ctx.session.total >= 5 && ctx.session.correct === ctx.session.total;
        break;
      case 'speedRun':
        ok = !!ctx.session && ctx.session.total >= 10 && ctx.session.durationMs > 0 && ctx.session.durationMs < 120_000;
        break;
      case 'longSession':
        ok = !!ctx.session && ctx.session.total >= 50;
        break;
      case 'nightStudy':
        ok = hour !== null && hour >= 0 && hour < 5;
        break;
      case 'earlyStudy':
        ok = hour !== null && hour >= 5 && hour < 7;
        break;
      case 'allCategories': {
        if (!ctx.session) break;
        const [all, studied] = await Promise.all([
          tx.word.findMany({ where: { isSystem: true }, distinct: ['category'], select: { category: true } }),
          tx.word.findMany({
            where: { isSystem: true, progress: { some: { userId } } },
            distinct: ['category'],
            select: { category: true },
          }),
        ]);
        ok = all.length > 0 && studied.length >= all.length;
        break;
      }
    }
    if (ok) unlocked.push(def);
  }

  if (unlocked.length === 0) return [];

  const rows = await tx.achievement.findMany({ where: { name: { in: unlocked.map((u) => u.name) } } });
  await tx.userAchievement.createMany({
    data: rows.map((r) => ({ userId, achievementId: r.id })),
    skipDuplicates: true,
  });
  const bonus = unlocked.reduce((sum, a) => sum + a.xpReward, 0);
  if (bonus > 0) {
    await tx.user.update({ where: { id: userId }, data: { xp: { increment: bonus } } });
    // Counts toward weekly/monthly leaderboards too.
    const date = dayStamp();
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, xpEarned: bonus },
      update: { xpEarned: { increment: bonus } },
    });
  }

  return unlocked.map(({ name, nameTr, icon, xpReward }) => ({ name, nameTr, icon, xpReward }));
}

/** Progress toward each achievement, for the achievements page. */
export async function achievementProgress(userId: string) {
  await ensureAchievements();
  const [user, earnedRows, learned] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true, xp: true } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { earnedAt: true, achievement: { select: { name: true } } },
    }),
    prisma.progress.count({ where: { userId, interval: { gte: LEARNED_INTERVAL } } }),
  ]);
  const earnedAt = new Map(earnedRows.map((r) => [r.achievement.name, r.earnedAt]));
  const level = levelForXp(user?.xp ?? 0);

  return ACHIEVEMENTS.map((def) => {
    let current = 0;
    if (def.metric === 'wordsLearned') current = learned;
    else if (def.metric === 'streak') current = user?.streak ?? 0;
    else if (def.metric === 'level') current = level;
    const at = earnedAt.get(def.name) ?? null;
    return {
      name: def.name,
      title: def.nameTr,
      description: def.descriptionTr,
      icon: def.icon,
      xpReward: def.xpReward,
      earnedAt: at,
      current: at ? def.target : Math.min(current, def.target),
      target: def.target,
      measurable: ['wordsLearned', 'streak', 'level'].includes(def.metric),
    };
  });
}
