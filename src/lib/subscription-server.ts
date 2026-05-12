// Server-side subscription enforcement utilities
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS, type Plan } from './subscription';

/**
 * Get user's current plan and check daily limits
 * Resets daily counters if a new day has started
 */
export async function getUserPlanInfo(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionType: true,
            subscriptionEndsAt: true,
            aiUsageCount: true,
            lastUsageReset: true,
        },
    });

    if (!user) return null;

    // Check if subscription has expired → fall back to FREE
    let activePlan: Plan = user.subscriptionType as Plan;
    if (activePlan !== 'FREE' && user.subscriptionEndsAt && new Date() > user.subscriptionEndsAt) {
        activePlan = 'FREE';
        // Downgrade in DB
        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionType: 'FREE' },
        });
    }

    // Check if daily counters need reset (new day in Turkey timezone)
    const now = new Date();
    const lastReset = user.lastUsageReset;
    const isNewDay = !lastReset || 
        now.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }) !== 
        lastReset.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let aiUsageCount = user.aiUsageCount;

    if (isNewDay) {
        aiUsageCount = 0;
        await prisma.user.update({
            where: { id: userId },
            data: { aiUsageCount: 0, lastUsageReset: now },
        });
    }

    const limits = PLAN_LIMITS[activePlan];

    return {
        plan: activePlan,
        limits,
        aiUsageCount,
        aiLimitReached: limits.dailyAILimit !== Infinity && aiUsageCount >= limits.dailyAILimit,
    };
}

/**
 * Increment AI usage counter
 */
export async function incrementAIUsage(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { aiUsageCount: { increment: 1 } },
    });
}

/**
 * Check if user can create more word lists
 */
export async function canCreateWordList(userId: string): Promise<{ allowed: boolean; current: number; max: number; plan: Plan }> {
    const planInfo = await getUserPlanInfo(userId);
    if (!planInfo) return { allowed: false, current: 0, max: 0, plan: 'FREE' };

    const listCount = await prisma.wordList.count({ where: { userId } });
    const max = planInfo.limits.maxWordLists;

    return {
        allowed: max === Infinity || listCount < max,
        current: listCount,
        max: max === Infinity ? -1 : max, // -1 means unlimited
        plan: planInfo.plan,
    };
}

/**
 * Check how many words user added today
 */
export async function getDailyWordCount(userId: string): Promise<{ count: number; limit: number; plan: Plan }> {
    const planInfo = await getUserPlanInfo(userId);
    if (!planInfo) return { count: 0, limit: 10, plan: 'FREE' };

    // Count words created today by this user
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await prisma.word.count({
        where: {
            createdByUserId: userId,
            createdAt: { gte: todayStart },
        },
    });

    return {
        count: todayCount,
        limit: planInfo.limits.dailyWordLimit === Infinity ? -1 : planInfo.limits.dailyWordLimit,
        plan: planInfo.plan,
    };
}

/**
 * Check if user can access a study mode
 */
export async function canAccessMode(userId: string, mode: string): Promise<{ allowed: boolean; plan: Plan; availableModes: string[] }> {
    const planInfo = await getUserPlanInfo(userId);
    if (!planInfo) return { allowed: false, plan: 'FREE', availableModes: [] };

    return {
        allowed: planInfo.limits.studyModes.includes(mode),
        plan: planInfo.plan,
        availableModes: planInfo.limits.studyModes,
    };
}
