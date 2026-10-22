import 'server-only';
import { prisma } from './db';
import { ApiError } from './api';
import { PLAN_LIMITS, normalizePlan, type Plan, type PlanLimits } from '@/lib/plans';
import { dayKey } from '@/lib/dates';
import { getSettings } from './settings';

export interface PlanInfo {
  plan: Plan;
  limits: PlanLimits;
  endsAt: Date | null;
  aiUsedToday: number;
  aiRemaining: number; // Infinity for unlimited
}

export async function getPlanInfo(userId: string): Promise<PlanInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionType: true, subscriptionEndsAt: true, aiUsageCount: true, lastUsageReset: true },
  });
  if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı.');

  const expired = user.subscriptionEndsAt !== null && user.subscriptionEndsAt.getTime() < Date.now();
  const plan: Plan = expired ? 'FREE' : normalizePlan(user.subscriptionType);
  if (expired && user.subscriptionType !== 'FREE') {
    await prisma.user.update({ where: { id: userId }, data: { subscriptionType: 'FREE' } });
  }

  const aiUsedToday = dayKey(user.lastUsageReset) === dayKey() ? user.aiUsageCount : 0;
  const limits = PLAN_LIMITS[plan];

  return {
    plan,
    limits,
    endsAt: expired ? null : user.subscriptionEndsAt,
    aiUsedToday,
    aiRemaining: Math.max(0, limits.dailyAiLimit - aiUsedToday),
  };
}

/** Throws a friendly error when AI is disabled or the daily quota is spent; otherwise counts one use. */
export async function consumeAiCredit(userId: string, opts: { requireStoryMode?: boolean } = {}) {
  const settings = await getSettings();
  if (!settings.AI_ENABLED) {
    throw new ApiError(503, 'Yapay zekâ özellikleri şu an bakımda. Biraz sonra tekrar dene.', 'AI_DISABLED');
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(503, 'Yapay zekâ servisi yapılandırılmamış.', 'AI_NOT_CONFIGURED');
  }

  const info = await getPlanInfo(userId);
  if (opts.requireStoryMode && !info.limits.storyMode) {
    throw new ApiError(403, 'Hikâye modu Pro planla kullanılabilir.', 'PLAN_REQUIRED');
  }
  if (info.aiRemaining <= 0) {
    throw new ApiError(
      429,
      `Bugünkü ${info.limits.dailyAiLimit} AI hakkını kullandın. Yarın yenilenir ya da Pro ile sınırsız kullanabilirsin.`,
      'AI_LIMIT_REACHED',
    );
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: info.aiUsedToday === 0 ? { aiUsageCount: 1, lastUsageReset: now } : { aiUsageCount: { increment: 1 } },
  });
  return info;
}

/** Gives the credit back when the AI call itself failed. */
export async function refundAiCredit(userId: string) {
  await prisma.user.updateMany({
    where: { id: userId, aiUsageCount: { gt: 0 } },
    data: { aiUsageCount: { decrement: 1 } },
  });
}
