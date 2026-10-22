import { describe, expect, it } from 'vitest';
import { xpForLevel, levelForXp, levelProgress, effectiveStreak, streakMultiplier } from './levels';

describe('levels', () => {
  it('follows the documented curve', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(10)).toBe(4500);
  });

  it('maps xp to level at the boundaries', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(4499)).toBe(9);
    expect(levelForXp(4500)).toBe(10);
  });

  it('reports progress within a level', () => {
    const p = levelProgress(200);
    expect(p.level).toBe(2);
    expect(p.progress).toBeCloseTo(0.5);
    expect(p.xpToNext).toBe(100);
  });

  it('caps the streak multiplier at 1.5x', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(30)).toBe(1.5);
    expect(streakMultiplier(300)).toBe(1.5);
  });
});

describe('effectiveStreak (Turkey time)', () => {
  const now = new Date('2026-10-22T10:00:00Z'); // 13:00 in Istanbul

  it('keeps the streak when the last study day was today or yesterday', () => {
    expect(effectiveStreak(5, new Date('2026-10-22T05:00:00Z'), now)).toBe(5);
    expect(effectiveStreak(5, new Date('2026-10-21T20:00:00Z'), now)).toBe(5); // 23:00 TR yesterday
  });

  it('breaks the streak after a missed day', () => {
    expect(effectiveStreak(5, new Date('2026-10-20T12:00:00Z'), now)).toBe(0);
  });

  it('treats 22:30 UTC as the next Turkish day', () => {
    // 2026-10-21T22:30Z is 01:30 on the 22nd in Istanbul → today
    expect(effectiveStreak(3, new Date('2026-10-21T22:30:00Z'), now)).toBe(3);
  });
});
