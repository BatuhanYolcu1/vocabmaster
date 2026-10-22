import { route, json, requireApiUserId } from '@/server/api';
import { completeSession } from '@/server/study';

export const POST = route<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const userId = await requireApiUserId();
  const { id } = await params;
  return json(await completeSession(userId, id));
});
