import type { Metadata } from 'next';
import { requireOnboardedUser } from '@/server/session';
import { getPlanInfo } from '@/server/plan';
import { getSettings } from '@/server/settings';
import { prisma } from '@/server/db';
import { ImportView } from './import-view';

export const metadata: Metadata = { title: 'İçe aktar' };

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ list?: string }> }) {
  const user = await requireOnboardedUser();
  const { list } = await searchParams;
  const [plan, settings, lists] = await Promise.all([
    getPlanInfo(user.id),
    getSettings(),
    prisma.wordList.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, select: { id: true, name: true } }),
  ]);

  return (
    <ImportView
      lists={lists}
      initialListId={lists.some((l) => l.id === list) ? list! : null}
      fileImport={plan.limits.fileImport}
      ai={{
        available: settings.AI_ENABLED && Boolean(process.env.GEMINI_API_KEY),
        remaining: Number.isFinite(plan.aiRemaining) ? plan.aiRemaining : null,
      }}
    />
  );
}
