import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const trNumber = new Intl.NumberFormat('tr-TR');

export function formatNumber(value: number) {
  return trNumber.format(value);
}

/** "3 dk", "5 sa", "12 g", "2 ay" — compact interval label for SRS buttons. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} dk`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} sa`;
  const days = Math.round(minutes / 1440);
  if (days < 30) return `${days} g`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} ay`;
  return `${Math.round(days / 365)} yıl`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} sn`;
  return s === 0 ? `${m} dk` : `${m} dk ${s} sn`;
}

export function firstName(name?: string | null, fallback = 'Öğrenci') {
  const first = name?.trim().split(/\s+/)[0];
  return first || fallback;
}

export function initials(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toLocaleUpperCase('tr-TR');
}

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Lowercase, strip accents/punctuation so typed answers compare fairly. */
export function normalizeAnswer(value: string) {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9' -]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance, used to accept answers with a single typo. */
export function editDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

export type AnswerVerdict = 'correct' | 'almost' | 'wrong';

/** Exact match is correct; one typo on words of 5+ letters counts as "almost" (still correct). */
export function checkTypedAnswer(input: string, expected: string): AnswerVerdict {
  const a = normalizeAnswer(input);
  const b = normalizeAnswer(expected);
  if (!a) return 'wrong';
  if (a === b) return 'correct';
  if (b.length >= 5 && editDistance(a, b) === 1) return 'almost';
  return 'wrong';
}
