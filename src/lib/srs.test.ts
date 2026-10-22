import { describe, expect, it } from 'vitest';
import { schedule, NEW_CARD, DAY, MIN_EASE, MAX_INTERVAL, cardStage } from './srs';

const now = new Date('2026-10-22T09:00:00Z');

describe('schedule', () => {
  it('new card: good → 10 min learning step, easy → 4 days, hard → 1 min', () => {
    expect(schedule(NEW_CARD, 'good', now).interval).toBe(10);
    expect(schedule(NEW_CARD, 'easy', now).interval).toBe(4 * DAY);
    expect(schedule(NEW_CARD, 'hard', now).interval).toBe(1);
  });

  it('graduates a learning card to 1 day on the second good answer', () => {
    const step1 = schedule(NEW_CARD, 'good', now);
    const step2 = schedule(step1, 'good', now);
    expect(step2.interval).toBe(DAY);
    expect(cardStage(step2)).toBe('review');
  });

  it('grows review intervals by the ease factor', () => {
    const card = { interval: 4 * DAY, easeFactor: 2.5, reviewCount: 3 };
    expect(schedule(card, 'good', now).interval).toBe(10 * DAY);
    expect(schedule(card, 'easy', now).interval).toBe(13 * DAY);
  });

  it('a lapse drops a review card to relearning and lowers ease', () => {
    const card = { interval: 10 * DAY, easeFactor: 2.5, reviewCount: 5 };
    const lapsed = schedule(card, 'hard', now);
    expect(lapsed.interval).toBe(10);
    expect(lapsed.easeFactor).toBeCloseTo(2.3);
    expect(cardStage(lapsed)).toBe('learning');
  });

  it('never drops ease below the minimum and caps the interval', () => {
    let card = { interval: 300 * DAY, easeFactor: MIN_EASE, reviewCount: 9 };
    card = schedule(card, 'hard', now);
    expect(card.easeFactor).toBe(MIN_EASE);
    const big = schedule({ interval: 300 * DAY, easeFactor: 3, reviewCount: 9 }, 'easy', now);
    expect(big.interval).toBe(MAX_INTERVAL);
  });

  it('sets nextReview interval minutes after now', () => {
    const r = schedule(NEW_CARD, 'good', now);
    expect(r.nextReview.getTime() - now.getTime()).toBe(10 * 60_000);
    expect(r.reviewCount).toBe(1);
  });
});
