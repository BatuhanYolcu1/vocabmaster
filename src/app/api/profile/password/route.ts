import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';
import { route, readJson, json, requireApiUserId, ApiError } from '@/server/api';
import { passwordChangeSchema } from '@/lib/schemas';

export const PATCH = route(async (req) => {
  const userId = await requireApiUserId();
  const { currentPassword, newPassword } = await readJson(req, passwordChangeSchema);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { password: true } });

  // Accounts created with Google have no password yet; they can set one directly.
  if (user.password && !(await bcrypt.compare(currentPassword, user.password))) {
    throw new ApiError(400, 'Mevcut şifren hatalı.', 'WRONG_PASSWORD');
  }

  await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(newPassword, 12) } });
  return json({ ok: true });
});
