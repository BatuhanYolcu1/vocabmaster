import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { route, json, requireApiUserId } from '@/server/api';
import { cardStage } from '@/lib/srs';
import { isCefrLevel } from '@/lib/constants';

const PAGE_SIZE = 30;

/** Library = the curated system words, with the user's progress on each. */
export const GET = route(async (req) => {
  const userId = await requireApiUserId();
  const params = new URL(req.url).searchParams;
  const q = params.get('q')?.trim().slice(0, 60) ?? '';
  const category = params.get('category') ?? '';
  const level = params.get('level') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const where: Prisma.WordWhereInput = { isSystem: true };
  if (category) where.category = category;
  if (isCefrLevel(level)) where.level = level;
  if (q) {
    where.OR = [
      { word: { contains: q, mode: 'insensitive' } },
      { turkishTranslation: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.word.findMany({
      where,
      orderBy: [{ word: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
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
        progress: { where: { userId }, select: { interval: true, reviewCount: true } },
      },
    }),
    prisma.word.count({ where }),
  ]);

  return json({
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    words: rows.map(({ progress, ...w }) => ({ ...w, stage: cardStage(progress[0]) })),
  });
});
