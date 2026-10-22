import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';
import { route, readJson, json, ApiError } from '@/server/api';
import { getSettings } from '@/server/settings';
import { registerSchema } from '@/lib/schemas';

export const POST = route(async (req) => {
  const settings = await getSettings();
  if (!settings.REGISTRATION_ENABLED) {
    throw new ApiError(403, 'Yeni kayıtlar geçici olarak durduruldu.', 'REGISTRATION_CLOSED');
  }

  const { name, email, password } = await readJson(req, registerSchema);

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) throw new ApiError(409, 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.', 'EMAIL_TAKEN');

  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12) },
    select: { id: true },
  });

  return json({ id: user.id }, { status: 201 });
});
