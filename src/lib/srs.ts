// Spaced repetition scheduler (SM-2 with learning steps, Anki-style).
// This is the single source of truth: the server uses it to schedule reviews
// and the client uses it to preview the intervals on the rating buttons.
// Intervals are stored in minutes.

export type Rating = 'hard' | 'good' | 'easy';

export interface SrsState {
  interval: number; // minutes until the next review
  easeFactor: number;
  reviewCount: number;
}

export interface SrsResult extends SrsState {
  nextReview: Date;
}

export const DAY = 1440;
export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const MAX_INTERVAL = 365 * DAY;
export const LEARNED_INTERVAL = DAY; // graduated out of learning steps
export const MASTERED_INTERVAL = 21 * DAY;

const STEP_AGAIN = 1;
const STEP_FIRST = 10;
const GRADUATING_INTERVAL = DAY;
const EASY_INTERVAL = 4 * DAY;
const RELEARN_INTERVAL = 10;

export const NEW_CARD: SrsState = { interval: 0, easeFactor: DEFAULT_EASE, reviewCount: 0 };

const clampEase = (ease: number) => Math.min(MAX_EASE, Math.max(MIN_EASE, Math.round(ease * 100) / 100));

export function schedule(state: SrsState, rating: Rating, now: Date = new Date()): SrsResult {
  const inReview = state.interval >= GRADUATING_INTERVAL;
  let interval: number;
  let ease = state.easeFactor || DEFAULT_EASE;

  if (!inReview) {
    // Learning phase: short steps until the card graduates to 1 day.
    if (rating === 'hard') {
      interval = STEP_AGAIN;
    } else if (rating === 'good') {
      interval = state.reviewCount === 0 || state.interval < STEP_FIRST ? STEP_FIRST : GRADUATING_INTERVAL;
    } else {
      interval = EASY_INTERVAL;
      ease += 0.15;
    }
  } else if (rating === 'hard') {
    // Lapse: forgotten review card goes back to a short relearning step.
    interval = RELEARN_INTERVAL;
    ease -= 0.2;
  } else if (rating === 'good') {
    interval = Math.max(state.interval + DAY, Math.round(state.interval * ease));
  } else {
    interval = Math.max(state.interval + 2 * DAY, Math.round(state.interval * ease * 1.3));
    ease += 0.15;
  }

  interval = Math.min(interval, MAX_INTERVAL);

  return {
    interval,
    easeFactor: clampEase(ease),
    reviewCount: state.reviewCount + 1,
    nextReview: new Date(now.getTime() + interval * 60_000),
  };
}

/** Quiz modes only know right/wrong; map that onto a rating. */
export function ratingFromAnswer(correct: boolean): Rating {
  return correct ? 'good' : 'hard';
}

export type CardStage = 'new' | 'learning' | 'review' | 'mastered';

export function cardStage(state: Pick<SrsState, 'interval' | 'reviewCount'> | null | undefined): CardStage {
  if (!state || state.reviewCount === 0) return 'new';
  if (state.interval < LEARNED_INTERVAL) return 'learning';
  if (state.interval >= MASTERED_INTERVAL) return 'mastered';
  return 'review';
}

export const CARD_STAGE_LABELS: Record<CardStage, string> = {
  new: 'Yeni',
  learning: 'Öğreniliyor',
  review: 'Tekrarda',
  mastered: 'Ustalaşıldı',
};
