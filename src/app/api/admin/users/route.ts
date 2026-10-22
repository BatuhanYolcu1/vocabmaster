import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiAdminId, badRequest } from '@/server/api';

export const GET = route(async (req) => {
  await requireApiAdminId();
  const params = new URL(req.url).searchParams;
  const q = params.get('q')?.trim() ?? '';
  const plan = params.get('plan') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const take = 25;

  const where: Prisma.UserWhereInput = {};
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];
  if (plan === 'FREE') where.subscriptionType = 'FREE';
  if (plan === 'PRO') where.subscriptionType = { in: ['PRO', 'LITE'] };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionType: true,
        subscriptionEndsAt: true,
        xp: true,
        streak: true,
        lastStudyDate: true,
        createdAt: true,
        _count: { select: { wordLists: true, progress: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return json({ users, total, page, pageCount: Math.max(1, Math.ceil(total / take)) });
});

const patchSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(['FREE', 'PRO']).optional(),
  /** Pro duration in days; omit or 0 for no end date */
  days: z.number().int().min(0).max(3650).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const PATCH = route(async (req) => {
  const adminId = await requireApiAdminId();
  const body = await readJson(req, patchSchema);
  if (body.userId === adminId && body.role === 'USER') throw badRequest('Kendi admin yetkini kaldıramazsın.');

  const data: Prisma.UserUpdateInput = {};
  if (body.plan === 'FREE') {
    data.subscriptionType = 'FREE';
    data.subscriptionEndsAt = null;
  } else if (body.plan === 'PRO') {
    data.subscriptionType = 'PRO';
    data.subscriptionEndsAt = body.days ? new Date(Date.now() + body.days * 86_400_000) : null;
  }
  if (body.role) data.role = body.role;

  const user = await prisma.user.update({
    where: { id: body.userId },
    data,
    select: { id: true, role: true, subscriptionType: true, subscriptionEndsAt: true },
  });
  await prisma.activityLog.create({
    data: { userId: adminId, action: 'admin_user_update', details: JSON.stringify({ target: body.userId, ...body }) },
  });
  return json(user);
});
