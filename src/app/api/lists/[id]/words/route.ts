import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId } from '@/server/api';
import { addWordsToList } from '@/server/lists';
import { listAddWordsSchema } from '@/lib/schemas';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const userId = await requireApiUserId();
  const { id } = await params;
  const { words, wordIds } = await readJson(req, listAddWordsSchema);
  const result = await prisma.$transaction((tx) => addWordsToList(tx, userId, id, words, wordIds), { timeout: 30_000 });
  return json(result);
});
