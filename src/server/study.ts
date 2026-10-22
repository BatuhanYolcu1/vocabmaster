import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { ApiError, notFound } from './api';
import { evaluateAchievements, type EarnedAchievement } from './achievements';
import { schedule, cardStage, type Rating, NEW_CARD } from '@/lib/srs';
import { XP, levelForXp, streakMultiplier, effectiveStreak } from '@/lib/levels';
import { CEFR_LEVELS, isCefrLevel } from '@/lib/constants';
import { daysBetween, dayStamp, startOfToday } from '@/lib/dates';
import { shuffle } from '@/lib/utils';
import type { StudyMode, StudySource } from '@/lib/study-modes';

// ─────────────────────────────────────────────────────────────
// Queue building
// ─────────────────────────────────────────────────────────────

export const studyWordSelect = {
  id: true,
  word: true,
  turkishTranslation: true,
  definitionTr: true,
  exampleSentence: true,
  exampleSentenceTr: true,
  type: true,
  level: true,
  category: true,
  pronunciation: true,
} satisfies Prisma.WordSelect;

export type StudyWordRow = Prisma.WordGetPayload<{ select: typeof studyWordSelect }>;

export interface StudyCard extends StudyWordRow {
  srs: { interval: number; easeFactor: number; reviewCount: number };
  stage: ReturnType<typeof cardStage>;
}

export interface Distractor {
  word: string;
  turkishTranslation: string;
  type: string;
}

/** A sentence can be used for fill-in-the-blank only if it actually contains the word. */
export function sentenceHasWord(sentence: string | null | undefined, word: string) {
  if (!sentence) return false;
  const escaped = word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}`, 'i').test(sentence);
}

function levelWindow(level: string): string[] {
  const i = CEFR_LEVELS.indexOf(isCefrLevel(level) ? level : 'B1');
  return CEFR_LEVELS.slice(Math.max(0, i - 1), i + 2);
}

function interestCategories(interests: string, level: string): string[] {
  const list = interests
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (['A1', 'A2'].includes(level)) list.push('Temel');
  return Array.from(new Set(list));
}

async function randomSystemWordIds(opts: {
  userId: string;
  levels: string[];
  categories: string[];
  take: number;
  exclude: string[];
}): Promise<string[]> {
  if (opts.take <= 0) return [];
  const categoryFilter = opts.categories.length
    ? Prisma.sql`AND w."category" IN (${Prisma.join(opts.categories)})`
    : Prisma.empty;
  const excludeFilter = opts.exclude.length ? Prisma.sql`AND w."id" NOT IN (${Prisma.join(opts.exclude)})` : Prisma.empty;
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT w."id" FROM "Word" w
    WHERE w."isSystem" = true
      AND w."level" IN (${Prisma.join(opts.levels)})
      ${categoryFilter}
      ${excludeFilter}
      AND NOT EXISTS (SELECT 1 FROM "Progress" p WHERE p."wordId" = w."id" AND p."userId" = ${opts.userId})
    ORDER BY random()
    LIMIT ${opts.take}`;
  return rows.map((r) => r.id);
}

interface QueueOptions {
  userId: string;
  source: StudySource;
  mode: StudyMode;
  size: number;
}

export async function buildQueue({ userId, source, mode, size }: QueueOptions) {
  const now = new Date();
  // Over-fetch for modes that filter words afterwards.
  const want = mode === 'fill-blank' ? size * 4 : size;
  let ids: string[] = [];
  let title = 'Günlük çalışma';

  if (source.kind === 'daily') {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { languageLevel: true, interests: true, dailyGoal: true },
    });

    const due = await prisma.progress.findMany({
      where: { userId, nextReview: { lte: now } },
      orderBy: { nextReview: 'asc' },
      take: want,
      select: { wordId: true },
    });
    ids = due.map((d) => d.wordId);

    let room = want - ids.length;
    if (room > 0) {
      // New words from the user's own lists come first — they chose them.
      const fromLists = await prisma.wordListItem.findMany({
        where: {
          wordList: { userId },
          wordId: { notIn: ids },
          word: { progress: { none: { userId } } },
        },
        orderBy: { createdAt: 'asc' },
        take: room,
        select: { wordId: true },
      });
      ids.push(...new Set(fromLists.map((f) => f.wordId)));
      room = want - ids.length;
    }
    if (room > 0) {
      const levels = levelWindow(user.languageLevel);
      const categories = interestCategories(user.interests, user.languageLevel);
      let picked = await randomSystemWordIds({ userId, levels, categories, take: room, exclude: ids });
      if (picked.length < room) {
        // Interests exhausted → widen to every category at the user's level window.
        picked = picked.concat(
          await randomSystemWordIds({ userId, levels, categories: [], take: room - picked.length, exclude: [...ids, ...picked] }),
        );
      }
      if (picked.length < room) {
        picked = picked.concat(
          await randomSystemWordIds({
            userId,
            levels: [...CEFR_LEVELS],
            categories: [],
            take: room - picked.length,
            exclude: [...ids, ...picked],
          }),
        );
      }
      ids.push(...picked);
      room = want - ids.length;
    }
    if (room > 0) {
      // Everything is learned and nothing is due: practise what comes up soonest.
      const ahead = await prisma.progress.findMany({
        where: { userId, wordId: { notIn: ids } },
        orderBy: { nextReview: 'asc' },
        take: room,
        select: { wordId: true },
      });
      ids.push(...ahead.map((a) => a.wordId));
    }
  } else if (source.kind === 'weak') {
    title = 'Zayıf kelimeler';
    const rows = await prisma.progress.findMany({
      where: { userId, wrongCount: { gt: 0 } },
      orderBy: { wrongCount: 'desc' },
      take: 60,
      select: { wordId: true, correctCount: true, wrongCount: true },
    });
    ids = rows
      .sort((a, b) => a.correctCount / (a.correctCount + a.wrongCount) - b.correctCount / (b.correctCount + b.wrongCount))
      .slice(0, want)
      .map((r) => r.wordId);
  } else {
    let candidateIds: string[];
    if (source.kind === 'list') {
      const list = await prisma.wordList.findFirst({
        where: { id: source.id, userId },
        select: { name: true, items: { select: { wordId: true } } },
      });
      if (!list) throw notFound('Liste bulunamadı.');
      title = list.name;
      candidateIds = list.items.map((i) => i.wordId);
    } else {
      title = source.name;
      const words = await prisma.word.findMany({
        where: { isSystem: true, category: source.name },
        orderBy: [{ level: 'asc' }, { word: 'asc' }],
        select: { id: true },
      });
      candidateIds = words.map((w) => w.id);
    }

    const progress = await prisma.progress.findMany({
      where: { userId, wordId: { in: candidateIds } },
      select: { wordId: true, nextReview: true },
    });
    const byWord = new Map(progress.map((p) => [p.wordId, p.nextReview]));
    const due: string[] = [];
    const fresh: string[] = [];
    const later: Array<{ id: string; at: Date }> = [];
    for (const id of candidateIds) {
      const next = byWord.get(id);
      if (!next) fresh.push(id);
      else if (next <= now) due.push(id);
      else later.push({ id, at: next });
    }
    later.sort((a, b) => a.at.getTime() - b.at.getTime());
    ids = [...shuffle(due), ...(source.kind === 'list' ? shuffle(fresh) : fresh), ...later.map((l) => l.id)].slice(0, want);
  }

  const unique = Array.from(new Set(ids));
  const [rows, progress] = await Promise.all([
    prisma.word.findMany({ where: { id: { in: unique } }, select: studyWordSelect }),
    prisma.progress.findMany({
      where: { userId, wordId: { in: unique } },
      select: { wordId: true, interval: true, easeFactor: true, reviewCount: true },
    }),
  ]);
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const progressById = new Map(progress.map((p) => [p.wordId, p]));

  let cards: StudyCard[] = unique
    .map((id) => rowById.get(id))
    .filter((r): r is StudyWordRow => !!r)
    .map((row) => {
      const p = progressById.get(row.id);
      const srs = p ? { interval: p.interval, easeFactor: p.easeFactor, reviewCount: p.reviewCount } : NEW_CARD;
      return { ...row, srs, stage: cardStage(srs) };
    });

  if (mode === 'fill-blank') cards = cards.filter((c) => sentenceHasWord(c.exampleSentence, c.word));
  cards = shuffle(cards.slice(0, size));

  const distractors = await pickDistractors(cards.map((c) => c.id), 40);
  return { title, cards, distractors };
}

async function pickDistractors(excludeIds: string[], take: number): Promise<Distractor[]> {
  const excludeFilter = excludeIds.length ? Prisma.sql`AND "id" NOT IN (${Prisma.join(excludeIds)})` : Prisma.empty;
  return prisma.$queryRaw<Distractor[]>`
    SELECT "word", "turkishTranslation", "type" FROM "Word"
    WHERE "isSystem" = true ${excludeFilter}
    ORDER BY random()
    LIMIT ${take}`;
}

// ─────────────────────────────────────────────────────────────
// Sessions & answers
// ─────────────────────────────────────────────────────────────

export async function startSession(userId: string, mode: StudyMode, source: string) {
  return prisma.studySession.create({ data: { userId, mode, source }, select: { id: true } });
}

async function assertWordAccess(tx: Prisma.TransactionClient, userId: string, wordId: string) {
  const word = await tx.word.findUnique({
    where: { id: wordId },
    select: { isSystem: true, createdByUserId: true },
  });
  if (!word) throw notFound('Kelime bulunamadı.');
  if (word.isSystem || word.createdByUserId === userId) return;
  const inList = await tx.wordListItem.findFirst({ where: { wordId, wordList: { userId } }, select: { id: true } });
  if (!inList) throw new ApiError(403, 'Bu kelimeye erişimin yok.');
}

/** Streak after studying at `now`: same day keeps it, next day extends it, a gap restarts it. */
function nextStreak(current: number, lastStudyDate: Date | null, now: Date) {
  if (!lastStudyDate) return 1;
  const gap = daysBetween(lastStudyDate, now);
  if (gap <= 0) return Math.max(current, 1);
  if (gap === 1) return current + 1;
  return 1;
}

export interface AnswerInput {
  userId: string;
  wordId: string;
  sessionId?: string | null;
  mode: StudyMode;
  rating: Rating;
  correct: boolean;
}

export interface AnswerResult {
  xp: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  streak: number;
  streakExtended: boolean;
  todayWords: number;
  dailyGoal: number;
  progress: { interval: number; nextReview: string; stage: ReturnType<typeof cardStage> };
  achievements: EarnedAchievement[];
}

export async function recordAnswer(input: AnswerInput): Promise<AnswerResult> {
  const now = new Date();
  const { userId, wordId } = input;

  return prisma.$transaction(
    async (tx) => {
      await assertWordAccess(tx, userId, wordId);

      if (input.sessionId) {
        const session = await tx.studySession.findUnique({ where: { id: input.sessionId }, select: { userId: true } });
        if (!session || session.userId !== userId) throw new ApiError(403, 'Geçersiz oturum.');
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { xp: true, level: true, streak: true, lastStudyDate: true, dailyGoal: true },
      });

      // ── SRS ──
      const existing = await tx.progress.findUnique({ where: { userId_wordId: { userId, wordId } } });
      const next = schedule(existing ?? NEW_CARD, input.rating, now);
      const progress = await tx.progress.upsert({
        where: { userId_wordId: { userId, wordId } },
        create: {
          userId,
          wordId,
          interval: next.interval,
          easeFactor: next.easeFactor,
          nextReview: next.nextReview,
          reviewCount: next.reviewCount,
          correctCount: input.correct ? 1 : 0,
          wrongCount: input.correct ? 0 : 1,
          lastRating: input.rating,
        },
        update: {
          interval: next.interval,
          easeFactor: next.easeFactor,
          nextReview: next.nextReview,
          reviewCount: next.reviewCount,
          correctCount: input.correct ? { increment: 1 } : undefined,
          wrongCount: input.correct ? undefined : { increment: 1 },
          lastRating: input.rating,
        },
      });

      // ── Streak ──
      const streak = nextStreak(effectiveStreak(user.streak, user.lastStudyDate, now) || 0, user.lastStudyDate, now);
      // True on the first answer of the day — the client celebrates the streak then.
      const streakExtended = !user.lastStudyDate || daysBetween(user.lastStudyDate, now) > 0;

      // ── XP (server decides; repeated answers on the same word in quick succession earn nothing) ──
      const recent = await tx.reviewLog.findFirst({
        where: { userId, wordId, createdAt: { gte: new Date(now.getTime() - XP.repeatCooldownMs) } },
        select: { id: true },
      });
      const base = !input.correct ? XP.wrong : input.rating === 'hard' ? XP.correctButHard : XP.correct;
      const xp = recent ? 0 : Math.round(base * streakMultiplier(streak));

      // ── Daily activity (a word counts once per day toward the goal) ──
      const studiedTodayAlready = await tx.reviewLog.findFirst({
        where: { userId, wordId, createdAt: { gte: startOfToday(now) } },
        select: { id: true },
      });
      const day = dayStamp(now);
      const activity = await tx.dailyActivity.upsert({
        where: { userId_date: { userId, date: day } },
        create: { userId, date: day, xpEarned: xp, wordsStudied: 1 },
        update: { xpEarned: { increment: xp }, wordsStudied: studiedTodayAlready ? undefined : { increment: 1 } },
        select: { wordsStudied: true },
      });

      await tx.reviewLog.create({
        data: { userId, wordId, sessionId: input.sessionId ?? null, mode: input.mode, rating: input.rating, correct: input.correct, xp },
      });

      if (input.sessionId) {
        await tx.studySession.update({
          where: { id: input.sessionId },
          data: { total: { increment: 1 }, correct: input.correct ? { increment: 1 } : undefined, xpEarned: { increment: xp } },
        });
      }

      let totalXp = user.xp + xp;
      await tx.user.update({
        where: { id: userId },
        data: { xp: totalXp, level: levelForXp(totalXp), streak, lastStudyDate: now },
      });

      const achievements = await evaluateAchievements(tx, userId, {
        streak,
        level: levelForXp(totalXp),
        answeredAt: now,
      });
      totalXp += achievements.reduce((s, a) => s + a.xpReward, 0);
      const level = levelForXp(totalXp);
      if (achievements.length) await tx.user.update({ where: { id: userId }, data: { level } });

      return {
        xp,
        totalXp,
        level,
        leveledUp: level > levelForXp(user.xp),
        streak,
        streakExtended,
        todayWords: activity.wordsStudied,
        dailyGoal: user.dailyGoal,
        progress: { interval: progress.interval, nextReview: progress.nextReview.toISOString(), stage: cardStage(progress) },
        achievements,
      };
    },
    { timeout: 15_000 },
  );
}

export interface SessionSummary {
  total: number;
  correct: number;
  xpEarned: number;
  bonusXp: number;
  durationMs: number;
  totalXp: number;
  level: number;
  streak: number;
  todayWords: number;
  dailyGoal: number;
  achievements: EarnedAchievement[];
}

export async function completeSession(userId: string, sessionId: string): Promise<SessionSummary> {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const session = await tx.studySession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw notFound('Oturum bulunamadı.');

    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { xp: true, streak: true, lastStudyDate: true, dailyGoal: true },
    });
    const durationMs = (session.completedAt ?? now).getTime() - session.startedAt.getTime();
    const day = dayStamp(now);

    let bonusXp = 0;
    let achievements: EarnedAchievement[] = [];
    let totalXp = user.xp;

    if (!session.completedAt) {
      if (session.total >= 5) bonusXp += XP.sessionComplete;
      if (session.total >= 5 && session.correct === session.total) bonusXp += XP.perfectSession;

      await tx.studySession.update({
        where: { id: sessionId },
        data: { completedAt: now, xpEarned: { increment: bonusXp } },
      });
      if (session.total > 0) {
        await tx.dailyActivity.upsert({
          where: { userId_date: { userId, date: day } },
          create: { userId, date: day, xpEarned: bonusXp, sessionsCompleted: 1 },
          update: { xpEarned: { increment: bonusXp }, sessionsCompleted: { increment: 1 } },
        });
      }
      totalXp += bonusXp;
      await tx.user.update({ where: { id: userId }, data: { xp: totalXp, level: levelForXp(totalXp) } });

      achievements = await evaluateAchievements(tx, userId, {
        streak: user.streak,
        level: levelForXp(totalXp),
        session: { total: session.total, correct: session.correct, durationMs },
      });
      totalXp += achievements.reduce((s, a) => s + a.xpReward, 0);
      if (achievements.length) await tx.user.update({ where: { id: userId }, data: { level: levelForXp(totalXp) } });
    }

    const activity = await tx.dailyActivity.findUnique({
      where: { userId_date: { userId, date: day } },
      select: { wordsStudied: true },
    });

    return {
      total: session.total,
      correct: session.correct,
      xpEarned: session.xpEarned + bonusXp,
      bonusXp,
      durationMs,
      totalXp,
      level: levelForXp(totalXp),
      streak: effectiveStreak(user.streak, user.lastStudyDate, now),
      todayWords: activity?.wordsStudied ?? 0,
      dailyGoal: user.dailyGoal,
      achievements,
    };
  });
}
