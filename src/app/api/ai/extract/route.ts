import { z } from 'zod';
import { route, readJson, json, requireApiUserId, ApiError } from '@/server/api';
import { consumeAiCredit, refundAiCredit } from '@/server/plan';
import { extractWordPairs } from '@/server/ai';

const schema = z.object({ text: z.string().trim().min(3, 'Önce metni yapıştır.').max(4000, 'Metin en fazla 4.000 karakter olabilir.') });

/** Pulls English words + Turkish meanings out of pasted text. */
export const POST = route(async (req) => {
  const userId = await requireApiUserId();
  const { text } = await readJson(req, schema);
  await consumeAiCredit(userId);
  try {
    const words = await extractWordPairs(text);
    if (words.length === 0) throw new ApiError(422, 'Metinde öğrenilecek bir kelime bulamadım.', 'NOTHING_FOUND');
    return json({ words });
  } catch (error) {
    await refundAiCredit(userId);
    throw error;
  }
});
