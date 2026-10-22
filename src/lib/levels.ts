import { daysBetween } from './dates';

// XP → level curve. Total XP needed to reach level n: 50·(n−1)² + 50·(n−1)
// L2 = 100, L3 = 300, L5 = 1 000, L10 = 4 500, L20 = 19 000.

export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1;
  return 50 * n * n + 50 * n;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

const TITLES: Array<[minLevel: number, title: string]> = [
  [1, 'Yeni Başlayan'],
  [3, 'Çırak'],
  [5, 'Öğrenci'],
  [8, 'Pratisyen'],
  [12, 'Deneyimli'],
  [16, 'Uzman'],
  [22, 'Usta'],
  [30, 'Efsane'],
];

export function levelTitle(level: number): string {
  let title = TITLES[0][1];
  for (const [min, t] of TITLES) if (level >= min) title = t;
  return title;
}

export interface LevelProgress {
  level: number;
  title: string;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  /** 0–1 progress through the current level */
  progress: number;
  xpToNext: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = nextLevelXp - currentLevelXp;
  return {
    level,
    title: levelTitle(level),
    xp,
    currentLevelXp,
    nextLevelXp,
    progress: span > 0 ? (xp - currentLevelXp) / span : 0,
    xpToNext: nextLevelXp - xp,
  };
}

// ── XP rules ──
export const XP = {
  correct: 10,
  correctButHard: 6,
  wrong: 2,
  sessionComplete: 15,
  perfectSession: 15,
  /** Same word answered again within this window earns no XP (anti-farming). */
  repeatCooldownMs: 15_000,
} as const;

/** Streak bonus: +1.7% per day, capped at +50% (30 days). */
export function streakMultiplier(streak: number) {
  return 1 + Math.min(Math.max(streak, 0), 30) / 60;
}

/** The stored streak is only bumped on study days; it is broken if the last study day is before yesterday. */
export function effectiveStreak(streak: number, lastStudyDate: Date | null, now: Date = new Date()): number {
  if (!lastStudyDate || streak <= 0) return 0;
  return daysBetween(lastStudyDate, now) <= 1 ? streak : 0;
}

/** Whether the user already studied today (Turkey time). */
export function studiedToday(lastStudyDate: Date | null, now: Date = new Date()) {
  return !!lastStudyDate && daysBetween(lastStudyDate, now) === 0;
}
