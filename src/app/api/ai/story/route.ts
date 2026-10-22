import { z } from 'zod';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId, ApiError, notFound } from '@/server/api';
import { consumeAiCredit, refundAiCredit } from '@/server/plan';
import { generateStory } from '@/server/ai';
import { CEFR_LEVELS } from '@/lib/constants';
import { shuffle } from '@/lib/utils';

const schema = z.object({
  listId: z.string().min(1).nullable().optional(),
  level: z.enum(CEFR_LEVELS).default('B1'),
});

/** Writes a short story around words the user is learning (Pro). */
export const POST = route(async (req) => {
  const userId = await requireApiUserId();
  const { listId, level } = await readJson(req, schema);

  let candidates: Array<{ id: string; word: string; turkishTranslation: string }>;
  if (listId) {
    const list = await prisma.wordList.findFirst({
      where: { id: listId, userId },
      select: { items: { select: { word: { select: { id: true, word: true, turkishTranslation: true } } } } },
    });
    if (!list) throw notFound('Liste bulunamadı.');
    candidates = list.items.map((i) => i.word);
  } else {
    // Words currently in learning/review are the ones a story helps most with.
    const rows = await prisma.progress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 40,
      select: { word: { select: { id: true, word: true, turkishTranslation: true } } },
    });
    candidates = rows.map((r) => r.word);
  }

  const words = shuffle(candidates).slice(0, 8);
  if (words.length < 3) {
    throw new ApiError(400, 'Hikâye için en az 3 kelime gerekiyor. Önce birkaç kelime çalış ya da listeye ekle.', 'NOT_ENOUGH_WORDS');
  }

  await consumeAiCredit(userId, { requireStoryMode: true });
  try {
    const story = await generateStory(words.map((w) => w.word), level);
    return json({ ...story, level, words });
  } catch (error) {
    await refundAiCredit(userId);
    throw error;
  }
});
