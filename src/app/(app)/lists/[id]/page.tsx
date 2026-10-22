import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireOnboardedUser } from '@/server/session';
import { getListDetail } from '@/server/lists';
import { getPlanInfo } from '@/server/plan';
import { getSettings } from '@/server/settings';
import { ListDetailView } from './list-detail';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const list = await getListDetail(user.id, id);
  return { title: list?.name ?? 'Liste' };
}

export default async function ListPage({ params }: Props) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const [list, plan, settings] = await Promise.all([getListDetail(user.id, id), getPlanInfo(user.id), getSettings()]);
  if (!list) notFound();

  const aiAvailable = settings.AI_ENABLED && Boolean(process.env.GEMINI_API_KEY);
  return (
    <ListDetailView
      list={list}
      ai={{
        available: aiAvailable,
        remaining: Number.isFinite(plan.aiRemaining) ? plan.aiRemaining : null,
      }}
    />
  );
}
