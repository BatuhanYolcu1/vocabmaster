import { z } from 'zod';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiAdminId, ApiError } from '@/server/api';

const base = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, 'Kod 3–30 karakter olmalı; harf, rakam, - ve _ kullanılabilir.'),
  discount: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(1).max(100_000),
  active: z.boolean(),
  expiresAt: z.coerce.date().nullable(),
});
const createSchema = base.extend({
  maxUses: base.shape.maxUses.default(100),
  active: base.shape.active.default(true),
  expiresAt: base.shape.expiresAt.default(null),
});

export const GET = route(async () => {
  await requireApiAdminId();
  return json(await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }));
});

export const POST = route(async (req) => {
  await requireApiAdminId();
  const data = { ...(await readJson(req, createSchema)), targetPlan: 'PRO' };
  const exists = await prisma.coupon.findUnique({ where: { code: data.code }, select: { id: true } });
  if (exists) throw new ApiError(409, 'Bu kod zaten kullanılıyor.');
  return json(await prisma.coupon.create({ data }), { status: 201 });
});

export const PATCH = route(async (req) => {
  await requireApiAdminId();
  const { id, ...data } = await readJson(req, base.partial().extend({ id: z.string().min(1) }));
  return json(await prisma.coupon.update({ where: { id }, data }));
});

export const DELETE = route(async (req) => {
  await requireApiAdminId();
  const { id } = await readJson(req, z.object({ id: z.string().min(1) }));
  await prisma.coupon.delete({ where: { id } });
  return json({ ok: true });
});
