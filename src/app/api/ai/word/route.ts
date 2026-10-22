import { z } from 'zod';
import { route, readJson, json, requireApiUserId } from '@/server/api';
import { consumeAiCredit, refundAiCredit } from '@/server/plan';
import { generateWordDetails } from '@/server/ai';

const schema = z.object({ word: z.string().trim().min(1, 'Önce bir kelime yaz.').max(60) });

/** Fills in translation, definition, example and pronunciation for a word. */
export const POST = route(async (req) => {
  const userId = await requireApiUserId();
  const { word } = await readJson(req, schema);
  const plan = await consumeAiCredit(userId);
  try {
    const details = await generateWordDetails(word);
    return json({ ...details, aiRemaining: Number.isFinite(plan.aiRemaining) ? plan.aiRemaining - 1 : null });
  } catch (error) {
    await refundAiCredit(userId);
    throw error;
  }
});
