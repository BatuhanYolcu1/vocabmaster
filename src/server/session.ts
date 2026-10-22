import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { prisma } from './db';

/** The signed-in user's id, or null. */
export const getSessionUserId = cache(async (): Promise<string | null> => {
  const session = await auth();
  return session?.user?.id ?? null;
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  xp: true,
  level: true,
  streak: true,
  lastStudyDate: true,
  dailyGoal: true,
  languageLevel: true,
  interests: true,
  onboardingComplete: true,
  subscriptionType: true,
  subscriptionEndsAt: true,
  password: true,
  createdAt: true,
} as const;

/** Full user row for the current request (deduplicated per request). */
export const getCurrentUser = cache(async () => {
  const id = await getSessionUserId();
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, hasPassword: Boolean(password) };
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** For server pages: the user, or a redirect to /login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/** For server pages: the user, sent to onboarding first if they haven't finished it. */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.onboardingComplete) redirect('/onboarding');
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}
