import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId, notFound } from '@/server/api';
import { getListDetail, deleteList } from '@/server/lists';
import { listUpdateSchema } from '@/lib/schemas';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const userId = await requireApiUserId();
  const { id } = await params;
  const list = await getListDetail(userId, id);
  if (!list) throw notFound('Liste bulunamadı.');
  return json(list);
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const userId = await requireApiUserId();
  const { id } = await params;
  const body = await readJson(req, listUpdateSchema);
  const { count } = await prisma.wordList.updateMany({
    where: { id, userId },
    data: { name: body.name, description: body.description === undefined ? undefined : body.description || null },
  });
  if (!count) throw notFound('Liste bulunamadı.');
  return json({ ok: true });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const userId = await requireApiUserId();
  const { id } = await params;
  await deleteList(userId, id);
  return json({ ok: true });
});
