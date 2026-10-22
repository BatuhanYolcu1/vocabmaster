import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId } from '@/server/api';
import { getListSummaries, addWordsToList } from '@/server/lists';
import { listCreateSchema } from '@/lib/schemas';

export const GET = route(async () => {
  const userId = await requireApiUserId();
  return json(await getListSummaries(userId));
});

export const POST = route(async (req) => {
  const userId = await requireApiUserId();
  const { name, description, words, wordIds } = await readJson(req, listCreateSchema);

  const result = await prisma.$transaction(
    async (tx) => {
      const list = await tx.wordList.create({
        data: { name, description: description || null, userId },
        select: { id: true, name: true },
      });
      const counts =
        words.length || wordIds.length ? await addWordsToList(tx, userId, list.id, words, wordIds) : { added: 0, skipped: 0 };
      return { ...list, ...counts };
    },
    { timeout: 30_000 },
  );

  return json(result, { status: 201 });
});
