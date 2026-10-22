import { describe, expect, it } from 'vitest';
import { checkTypedAnswer, normalizeAnswer, formatMinutes } from './utils';
import { dayKey, dayStamp, daysBetween, startOfToday } from './dates';
import { parseSource, serializeSource } from './study-modes';

describe('typed answers', () => {
  it('ignores case, accents and punctuation', () => {
    expect(normalizeAnswer('  Café! ')).toBe('cafe');
    expect(checkTypedAnswer('ABANDON', 'abandon')).toBe('correct');
  });

  it('accepts a single typo on longer words as "almost"', () => {
    expect(checkTypedAnswer('abandn', 'abandon')).toBe('almost');
    expect(checkTypedAnswer('cat', 'car')).toBe('wrong');
    expect(checkTypedAnswer('', 'car')).toBe('wrong');
  });
});

describe('formatMinutes', () => {
  it('formats SRS intervals compactly', () => {
    expect(formatMinutes(10)).toBe('10 dk');
    expect(formatMinutes(1440)).toBe('1 g');
    expect(formatMinutes(1440 * 60)).toBe('2 ay');
  });
});

describe('dates', () => {
  it('uses the Istanbul calendar day', () => {
    expect(dayKey(new Date('2026-10-21T21:30:00Z'))).toBe('2026-10-22');
    expect(dayStamp(new Date('2026-10-21T21:30:00Z')).toISOString()).toBe('2026-10-22T00:00:00.000Z');
    expect(startOfToday(new Date('2026-10-22T10:00:00Z')).toISOString()).toBe('2026-10-21T21:00:00.000Z');
    expect(daysBetween(new Date('2026-10-20T10:00:00Z'), new Date('2026-10-22T10:00:00Z'))).toBe(2);
  });
});

describe('study sources', () => {
  it('round-trips', () => {
    for (const raw of ['daily', 'weak', 'list:abc', 'category:İş']) {
      expect(serializeSource(parseSource(raw))).toBe(raw);
    }
    expect(parseSource('garbage')).toEqual({ kind: 'daily' });
  });
});
