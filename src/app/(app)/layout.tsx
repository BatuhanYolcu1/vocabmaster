import { AppShell } from '@/components/app/app-shell';
import { requireOnboardedUser } from '@/server/session';
import { getPlanInfo } from '@/server/plan';
import { prisma } from '@/server/db';
import { effectiveStreak, levelProgress, studiedToday } from '@/lib/levels';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  const now = new Date();

  const [plan, dueNow, announcements] = await Promise.all([
    getPlanInfo(user.id),
    prisma.progress.count({ where: { userId: user.id, nextReview: { lte: now } } }),
    prisma.announcement.findMany({
      where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, message: true, type: true, targetPlan: true },
    }),
  ]);

  const lp = levelProgress(user.xp);
  const streak = effectiveStreak(user.streak, user.lastStudyDate, now);

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        isAdmin: user.role === 'ADMIN',
        isPro: plan.plan === 'PRO',
        streak,
        studiedToday: studiedToday(user.lastStudyDate, now),
        level: lp.level,
        levelProgress: lp.progress,
        xp: user.xp,
        dueNow,
      }}
      announcements={announcements
        .filter((a) => !a.targetPlan || a.targetPlan === plan.plan || (a.targetPlan === 'LITE' && plan.plan === 'PRO'))
        .map(({ id, title, message, type }) => ({ id, title, message, type }))}
    >
      {children}
    </AppShell>
  );
}
