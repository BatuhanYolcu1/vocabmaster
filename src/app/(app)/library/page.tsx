import type { Metadata } from 'next';
import { requireOnboardedUser } from '@/server/session';
import { prisma } from '@/server/db';
import { PageHeader } from '@/components/ui/misc';
import { LibraryView } from './library-view';
import { CATEGORY_INFO, CEFR_LEVELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Kütüphane' };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ list?: string; category?: string }> }) {
  const user = await requireOnboardedUser();
  const { list, category } = await searchParams;

  const [categories, levels, lists, total, studied] = await Promise.all([
    prisma.word.groupBy({ by: ['category'], where: { isSystem: true }, _count: { _all: true } }),
    prisma.word.groupBy({ by: ['level'], where: { isSystem: true }, _count: { _all: true } }),
    prisma.wordList.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, select: { id: true, name: true } }),
    prisma.word.count({ where: { isSystem: true } }),
    prisma.progress.count({ where: { userId: user.id, word: { isSystem: true } } }),
  ]);

  const order = Object.keys(CATEGORY_INFO);
  return (
    <>
      <PageHeader
        title="Kütüphane"
        description={`Seviyelere ve konulara ayrılmış ${total} hazır kelime. Şimdiye kadar ${studied} tanesini çalıştın.`}
      />
      <LibraryView
        categories={categories
          .map((c) => ({ name: c.category, label: CATEGORY_INFO[c.category]?.label ?? c.category, description: CATEGORY_INFO[c.category]?.description ?? '', count: c._count._all }))
          .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))}
        levels={CEFR_LEVELS.filter((l) => levels.some((x) => x.level === l))}
        lists={lists}
        targetListId={lists.some((l) => l.id === list) ? list! : null}
        initialCategory={category ?? ''}
      />
    </>
  );
}
