// Subscription plan limits and utilities

export type Plan = 'FREE' | 'LITE' | 'PRO';

export interface PlanLimits {
    dailyWordLimit: number;
    maxWordLists: number;
    dailyAILimit: number;
    studyModes: string[];
    hasDetailedStats: boolean;
    hasExcelImport: boolean;
    hasStoryMode: boolean;
    hasPrioritySupport: boolean;
    adFree: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
    FREE: {
        dailyWordLimit: 10,
        maxWordLists: 3,
        dailyAILimit: 5,
        studyModes: ['flashcard', 'quiz', 'typing'],
        hasDetailedStats: false,
        hasExcelImport: false,
        hasStoryMode: false,
        hasPrioritySupport: false,
        adFree: false,
    },
    LITE: {
        dailyWordLimit: 50,
        maxWordLists: 10,
        dailyAILimit: 30,
        studyModes: ['flashcard', 'quiz', 'typing', 'listening', 'matching'],
        hasDetailedStats: true,
        hasExcelImport: true,
        hasStoryMode: false,
        hasPrioritySupport: false,
        adFree: true,
    },
    PRO: {
        dailyWordLimit: Infinity,
        maxWordLists: Infinity,
        dailyAILimit: Infinity,
        studyModes: ['flashcard', 'quiz', 'typing', 'listening', 'matching', 'speaking', 'story'],
        hasDetailedStats: true,
        hasExcelImport: true,
        hasStoryMode: true,
        hasPrioritySupport: true,
        adFree: true,
    },
};

export function getPlanLimits(plan: Plan): PlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

export function canAccessStudyMode(plan: Plan, mode: string): boolean {
    return getPlanLimits(plan).studyModes.includes(mode);
}

export function isWithinDailyLimit(plan: Plan, currentCount: number): boolean {
    const limit = getPlanLimits(plan).dailyWordLimit;
    return limit === Infinity || currentCount < limit;
}

export function isWithinAILimit(plan: Plan, currentCount: number): boolean {
    const limit = getPlanLimits(plan).dailyAILimit;
    return limit === Infinity || currentCount < limit;
}

export function isWithinListLimit(plan: Plan, currentCount: number): boolean {
    const limit = getPlanLimits(plan).maxWordLists;
    return limit === Infinity || currentCount < limit;
}

// Plan display info
export const PLAN_INFO: Record<Plan, { name: string; icon: string; color: string; price: string }> = {
    FREE: { name: 'Ücretsiz', icon: 'stars', color: 'text-slate-400', price: '₺0' },
    LITE: { name: 'Lite', icon: 'bolt', color: 'text-[#135bec]', price: '₺29.99/ay' },
    PRO: { name: 'Pro', icon: 'diamond', color: 'text-purple-400', price: '₺59.99/ay' },
};
