import { route, readJson, json, requireApiUserId } from '@/server/api';
import { buildQueue, startSession } from '@/server/study';
import { sessionStartSchema } from '@/lib/schemas';
import { parseSource, serializeSource } from '@/lib/study-modes';

/** Starts a study session and returns the cards to practise. */
export const POST = route(async (req) => {
  const userId = await requireApiUserId();
  const { mode, source: rawSource, size } = await readJson(req, sessionStartSchema);
  const source = parseSource(rawSource);

  const queue = await buildQueue({ userId, source, mode, size });
  const session = queue.cards.length > 0 ? await startSession(userId, mode, serializeSource(source)) : null;

  return json({ sessionId: session?.id ?? null, ...queue });
});
