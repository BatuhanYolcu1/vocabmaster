import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiAdminId } from '@/server/api';
import { wordInputSchema, wordPatchSchema } from '@/lib/schemas';
import { CEFR_LEVELS, isCefrLevel } from '@/lib/constants';

export const GET = route(async (req) => {
  await requireApiAdminId();
  const params = new URL(req.url).searchParams;
  const q = params.get('q')?.trim() ?? '';
  const category = params.get('category') ?? '';
  const level = params.get('level') ?? '';
  const incomplete = params.get('incomplete') === '1';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const take = 30;

  const where: Prisma.WordWhereInput = { isSystem: true };
  if (q) where.OR = [{ word: { contains: q, mode: 'insensitive' } }, { turkishTranslation: { contains: q, mode: 'insensitive' } }];
  if (category) where.category = category;
  if (isCefrLevel(level)) where.level = level;
  if (incomplete) where.AND = [{ OR: [{ exampleSentence: '' }, { definitionTr: '' }] }];

  const [words, total] = await Promise.all([
    prisma.word.findMany({ where, orderBy: { word: 'asc' }, skip: (page - 1) * take, take }),
    prisma.word.count({ where }),
  ]);
  return json({ words, total, page, pageCount: Math.max(1, Math.ceil(total / take)) });
});

const meta = { level: z.enum(CEFR_LEVELS), category: z.string().trim().min(1).max(40) };

export const POST = route(async (req) => {
  await requireApiAdminId();
  const body = await readJson(req, wordInputSchema.extend(meta));
  const word = await prisma.word.create({
    data: { ...body, pronunciation: body.pronunciation || null, isSystem: true },
  });
  return json(word, { status: 201 });
});

export const PATCH = route(async (req) => {
  await requireApiAdminId();
  const { id, ...body } = await readJson(
    req,
    wordPatchSchema.extend({ id: z.string().min(1), level: meta.level.optional(), category: meta.category.optional() }),
  );
  const word = await prisma.word.update({
    where: { id, isSystem: true },
    data: { ...body, pronunciation: body.pronunciation === undefined ? undefined : body.pronunciation || null },
  });
  return json(word);
});

export const DELETE = route(async (req) => {
  await requireApiAdminId();
  const { id } = await readJson(req, z.object({ id: z.string().min(1) }));
  // Progress, review logs and list items cascade with the word.
  await prisma.word.delete({ where: { id, isSystem: true } });
  return json({ ok: true });
});
