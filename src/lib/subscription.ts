// Subscription plan limits

export type Plan = 'FREE' | 'PRO';

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

export const ALL_STUDY_MODES = [
  'flashcard',
  'multiple-choice',
  'typing',
  'matching',
  'listening',
  'speaking',
  'fill-blank',
  'story',
];

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    dailyWordLimit: Infinity,
    maxWordLists: Infinity,
    dailyAILimit: 5,
    studyModes: ALL_STUDY_MODES,
    hasDetailedStats: true,
    hasExcelImport: false,
    hasStoryMode: false,
    hasPrioritySupport: false,
    adFree: true,
  },
  PRO: {
    dailyWordLimit: Infinity,
    maxWordLists: Infinity,
    dailyAILimit: Infinity,
    studyModes: ALL_STUDY_MODES,
    hasDetailedStats: true,
    hasExcelImport: true,
    hasStoryMode: true,
    hasPrioritySupport: true,
    adFree: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
}

export function canAccessStudyMode(plan: Plan, mode: string): boolean {
  return getPlanLimits(plan).studyModes.includes(mode);
}

export function isWithinDailyLimit(_plan: Plan, _currentCount: number): boolean {
  return true;
}

export function isWithinAILimit(plan: Plan, currentCount: number): boolean {
  const limit = getPlanLimits(plan).dailyAILimit;
  return limit === Infinity || currentCount < limit;
}

export function isWithinListLimit(_plan: Plan, _currentCount: number): boolean {
  return true;
}

export const PLAN_INFO: Record<Plan, { name: string; icon: string; color: string; price: string }> = {
  FREE: { name: 'Ücretsiz', icon: 'stars', color: 'text-slate-400', price: '₺0' },
  PRO: { name: 'Pro', icon: 'diamond', color: 'text-purple-400', price: '₺49.99/ay' },
};
