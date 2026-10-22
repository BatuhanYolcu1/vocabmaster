import type { Metadata } from 'next';
import { requireOnboardedUser } from '@/server/session';
import { prisma } from '@/server/db';
import { getListSummaries } from '@/server/lists';
import { getPlanInfo } from '@/server/plan';
import { PageHeader } from '@/components/ui/misc';
import { StudyHub } from './study-hub';
import { CATEGORY_INFO } from '@/lib/constants';

export const metadata: Metadata = { title: 'Çalış' };

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const user = await requireOnboardedUser();
  const { source } = await searchParams;
  const now = new Date();

  const [dueNow, weakCount, lists, categories, plan] = await Promise.all([
    prisma.progress.count({ where: { userId: user.id, nextReview: { lte: now } } }),
    prisma.progress.count({ where: { userId: user.id, wrongCount: { gt: 0 } } }),
    getListSummaries(user.id),
    prisma.word.groupBy({ by: ['category'], where: { isSystem: true }, _count: { _all: true } }),
    getPlanInfo(user.id),
  ]);

  return (
    <>
      <PageHeader title="Çalış" description="Ne çalışacağını ve nasıl çalışacağını seç. Her cevap akıllı tekrar takvimini günceller." />
      <StudyHub
        initialSource={source ?? 'daily'}
        dueNow={dueNow}
        weakCount={weakCount}
        lists={lists.map((l) => ({ id: l.id, name: l.name, count: l.count, due: l.due }))}
        categories={categories
          .map((c) => ({ name: c.category, label: CATEGORY_INFO[c.category]?.label ?? c.category, count: c._count._all }))
          .sort((a, b) => Object.keys(CATEGORY_INFO).indexOf(a.name) - Object.keys(CATEGORY_INFO).indexOf(b.name))}
        storyEnabled={plan.limits.storyMode}
      />
    </>
  );
}
