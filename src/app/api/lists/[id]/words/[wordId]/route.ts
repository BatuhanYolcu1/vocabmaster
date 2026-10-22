import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId, forbidden, notFound } from '@/server/api';
import { removeWordFromList } from '@/server/lists';
import { wordPatchSchema } from '@/lib/schemas';

type Ctx = { params: Promise<{ id: string; wordId: string }> };

/** Edits a custom word the user created. Library words are read-only. */
export const PATCH = route<Ctx>(async (req, { params }) => {
  const userId = await requireApiUserId();
  const { id, wordId } = await params;
  const body = await readJson(req, wordPatchSchema);

  const item = await prisma.wordListItem.findFirst({
    where: { wordListId: id, wordId, wordList: { userId } },
    select: { word: { select: { isSystem: true, createdByUserId: true } } },
  });
  if (!item) throw notFound('Kelime bu listede değil.');
  if (item.word.isSystem || item.word.createdByUserId !== userId) {
    throw forbidden('Kütüphane kelimeleri düzenlenemez.');
  }

  const word = await prisma.word.update({
    where: { id: wordId },
    data: { ...body, pronunciation: body.pronunciation === undefined ? undefined : body.pronunciation || null },
  });
  return json(word);
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const userId = await requireApiUserId();
  const { id, wordId } = await params;
  await removeWordFromList(userId, id, wordId);
  return json({ ok: true });
});
