import { route, readJson, json, requireApiUserId } from '@/server/api';
import { recordAnswer } from '@/server/study';
import { answerSchema } from '@/lib/schemas';
import { ratingFromAnswer } from '@/lib/srs';

export const POST = route(async (req) => {
  const userId = await requireApiUserId();
  const body = await readJson(req, answerSchema);

  // Only flashcards let the learner pick a rating; other modes are right/wrong.
  const rating = body.mode === 'flashcard' && body.rating ? body.rating : ratingFromAnswer(body.correct);
  const correct = body.mode === 'flashcard' ? rating !== 'hard' : body.correct;

  const result = await recordAnswer({ userId, wordId: body.wordId, sessionId: body.sessionId, mode: body.mode, rating, correct });
  return json(result);
});
