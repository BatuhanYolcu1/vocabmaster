import { z } from 'zod';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiAdminId } from '@/server/api';

const base = z.object({
  title: z.string().trim().min(1, 'Başlık gerekli.').max(120),
  message: z.string().trim().min(1, 'Mesaj gerekli.').max(500),
  type: z.enum(['info', 'success', 'warning', 'promo']),
  active: z.boolean(),
  targetPlan: z.enum(['FREE', 'PRO']).nullable(),
  expiresAt: z.coerce.date().nullable(),
});
const createSchema = base.extend({
  type: base.shape.type.default('info'),
  active: base.shape.active.default(true),
  targetPlan: base.shape.targetPlan.default(null),
  expiresAt: base.shape.expiresAt.default(null),
});

export const GET = route(async () => {
  await requireApiAdminId();
  return json(await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }));
});

export const POST = route(async (req) => {
  await requireApiAdminId();
  const data = await readJson(req, createSchema);
  return json(await prisma.announcement.create({ data }), { status: 201 });
});

export const PATCH = route(async (req) => {
  await requireApiAdminId();
  const { id, ...data } = await readJson(req, base.partial().extend({ id: z.string().min(1) }));
  return json(await prisma.announcement.update({ where: { id }, data }));
});

export const DELETE = route(async (req) => {
  await requireApiAdminId();
  const { id } = await readJson(req, z.object({ id: z.string().min(1) }));
  await prisma.announcement.delete({ where: { id } });
  return json({ ok: true });
});
