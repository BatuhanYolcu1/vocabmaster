import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId, ApiError } from '@/server/api';
import { profileUpdateSchema } from '@/lib/schemas';

export const PATCH = route(async (req) => {
  const userId = await requireApiUserId();
  const body = await readJson(req, profileUpdateSchema);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      image: body.image === undefined ? undefined : body.image || null,
      dailyGoal: body.dailyGoal,
      languageLevel: body.languageLevel,
      interests: body.interests?.join(','),
      onboardingComplete: body.onboardingComplete,
    },
    select: { name: true, image: true, dailyGoal: true, languageLevel: true, interests: true, onboardingComplete: true },
  });
  return json(user);
});

const deleteSchema = z.object({
  confirm: z.string().trim(),
  password: z.string().max(200).optional().default(''),
});

/** Permanently deletes the account and everything that belongs to it. */
export const DELETE = route(async (req) => {
  const userId = await requireApiUserId();
  const { confirm, password } = await readJson(req, deleteSchema);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, password: true } });

  if (confirm.toLocaleLowerCase('tr-TR') !== 'hesabımı sil') {
    throw new ApiError(400, 'Onaylamak için "hesabımı sil" yaz.', 'CONFIRMATION_REQUIRED');
  }
  if (user.password && !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(400, 'Şifre hatalı.', 'WRONG_PASSWORD');
  }

  await prisma.$transaction([
    prisma.word.deleteMany({ where: { createdByUserId: userId, isSystem: false } }),
    prisma.activityLog.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
  return json({ ok: true });
});
