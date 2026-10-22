import 'server-only';
import { prisma } from './db';
import { LEARNED_INTERVAL, MASTERED_INTERVAL } from '@/lib/srs';
import { dayStamp, lastDays, startOfToday, weekdayLabel, shortDateLabel } from '@/lib/dates';
import { effectiveStreak, levelProgress } from '@/lib/levels';

export async function getDashboardData(userId: string) {
  const now = new Date();
  const week = lastDays(7, now);
  const todayStart = startOfToday(now);
  const tomorrow = new Date(todayStart.getTime() + 86_400_000);

  const [user, dueNow, dueToday, learned, mastered, studied, activities, lists, weak, todaySessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, xp: true, streak: true, lastStudyDate: true, dailyGoal: true, languageLevel: true },
    }),
    prisma.progress.count({ where: { userId, nextReview: { lte: now } } }),
    prisma.progress.count({ where: { userId, nextReview: { gt: now, lt: tomorrow } } }),
    prisma.progress.count({ where: { userId, interval: { gte: LEARNED_INTERVAL } } }),
    prisma.progress.count({ where: { userId, interval: { gte: MASTERED_INTERVAL } } }),
    prisma.progress.count({ where: { userId } }),
    prisma.dailyActivity.findMany({
      where: { userId, date: { gte: week[0] } },
      select: { date: true, xpEarned: true, wordsStudied: true },
    }),
    prisma.wordList.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      select: { id: true, name: true, _count: { select: { items: true } } },
    }),
    prisma.progress.findMany({
      where: { userId, wrongCount: { gt: 0 } },
      orderBy: [{ wrongCount: 'desc' }, { updatedAt: 'desc' }],
      take: 5,
      select: {
        correctCount: true,
        wrongCount: true,
        word: { select: { id: true, word: true, turkishTranslation: true } },
      },
    }),
    prisma.studySession.count({ where: { userId, completedAt: { gte: todayStart } } }),
  ]);

  const byDay = new Map(activities.map((a) => [a.date.getTime(), a]));
  const today = byDay.get(dayStamp(now).getTime());

  return {
    name: user.name,
    level: levelProgress(user.xp),
    streak: effectiveStreak(user.streak, user.lastStudyDate, now),
    studiedToday: (today?.wordsStudied ?? 0) > 0,
    dailyGoal: user.dailyGoal,
    todayWords: today?.wordsStudied ?? 0,
    todayXp: today?.xpEarned ?? 0,
    todaySessions,
    dueNow,
    dueLaterToday: dueToday,
    learned,
    mastered,
    studied,
    week: week.map((d) => {
      const a = byDay.get(d.getTime());
      return { label: weekdayLabel(d), date: d.toISOString(), xp: a?.xpEarned ?? 0, words: a?.wordsStudied ?? 0 };
    }),
    lists: lists.map((l) => ({ id: l.id, name: l.name, count: l._count.items })),
    weak: weak.map((w) => ({
      id: w.word.id,
      word: w.word.word,
      translation: w.word.turkishTranslation,
      accuracy: Math.round((w.correctCount / (w.correctCount + w.wrongCount)) * 100),
    })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDetailedStats(userId: string) {
  const now = new Date();
  const days = lastDays(30, now);

  const [user, activities, progress, reviewsByMode, sessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { xp: true, streak: true, lastStudyDate: true, createdAt: true },
    }),
    prisma.dailyActivity.findMany({
      where: { userId, date: { gte: days[0] } },
      select: { date: true, xpEarned: true, wordsStudied: true },
    }),
    prisma.progress.findMany({
      where: { userId },
      select: {
        interval: true,
        reviewCount: true,
        correctCount: true,
        wrongCount: true,
        nextReview: true,
        word: { select: { id: true, word: true, turkishTranslation: true, category: true, level: true } },
      },
    }),
    prisma.reviewLog.groupBy({
      by: ['mode'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.studySession.aggregate({ where: { userId, completedAt: { not: null } }, _count: { _all: true } }),
  ]);

  const byDay = new Map(activities.map((a) => [a.date.getTime(), a]));
  const trend = days.map((d) => {
    const a = byDay.get(d.getTime());
    return { label: shortDateLabel(d), xp: a?.xpEarned ?? 0, words: a?.wordsStudied ?? 0 };
  });

  let correct = 0;
  let wrong = 0;
  const stages = { learning: 0, review: 0, mastered: 0 };
  const categories = new Map<string, number>();
  const levels = new Map<string, number>();
  const upcoming = new Map<number, number>();
  const horizon = lastDays(1, now)[0].getTime();

  for (const p of progress) {
    correct += p.correctCount;
    wrong += p.wrongCount;
    if (p.interval >= MASTERED_INTERVAL) stages.mastered++;
    else if (p.interval >= LEARNED_INTERVAL) stages.review++;
    else stages.learning++;
    categories.set(p.word.category, (categories.get(p.word.category) ?? 0) + 1);
    levels.set(p.word.level, (levels.get(p.word.level) ?? 0) + 1);
    const dayOffset = Math.max(0, Math.floor((dayStamp(p.nextReview).getTime() - horizon) / 86_400_000));
    if (dayOffset < 7) upcoming.set(dayOffset, (upcoming.get(dayOffset) ?? 0) + 1);
  }

  const weak = progress
    .filter((p) => p.wrongCount > 0)
    .map((p) => ({
      id: p.word.id,
      word: p.word.word,
      translation: p.word.turkishTranslation,
      wrong: p.wrongCount,
      accuracy: Math.round((p.correctCount / (p.correctCount + p.wrongCount)) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong)
    .slice(0, 8);

  const forecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(horizon + i * 86_400_000);
    return { label: i === 0 ? 'Bugün' : weekdayLabel(d), count: upcoming.get(i) ?? 0 };
  });

  return {
    level: levelProgress(user.xp),
    streak: effectiveStreak(user.streak, user.lastStudyDate, now),
    memberSince: user.createdAt,
    totals: {
      studied: progress.length,
      learned: stages.review + stages.mastered,
      mastered: stages.mastered,
      reviews: correct + wrong,
      accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null,
      sessions: sessions._count._all,
      activeDays30: activities.filter((a) => a.wordsStudied > 0).length,
    },
    stages,
    trend,
    forecast,
    categories: [...categories.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    levels: [...levels.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)),
    modes: reviewsByMode.map((m) => ({ mode: m.mode, count: m._count._all })).sort((a, b) => b.count - a.count),
    weak,
  };
}

export type DetailedStats = Awaited<ReturnType<typeof getDetailedStats>>;
