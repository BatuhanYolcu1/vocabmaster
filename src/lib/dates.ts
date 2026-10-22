// All "calendar day" logic (streaks, daily goals, charts) runs on Turkey time,
// regardless of where the server runs.
export const APP_TIME_ZONE = 'Europe/Istanbul';

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const hourFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  hourCycle: 'h23',
});

/** "2026-10-22" for the given instant, in Turkey time. */
export function dayKey(date: Date = new Date()): string {
  return dayFormatter.format(date);
}

/** Midnight UTC of the Turkey calendar day — the value stored in DailyActivity.date. */
export function dayStamp(date: Date = new Date()): Date {
  return new Date(`${dayKey(date)}T00:00:00.000Z`);
}

/** Whole calendar days from `from` to `to` (Turkey time). */
export function daysBetween(from: Date, to: Date): number {
  const a = dayStamp(from).getTime();
  const b = dayStamp(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** The instant Turkey's current day started (for "today" range queries). */
export function startOfToday(now: Date = new Date()): Date {
  // Turkey is UTC+3 all year (no DST since 2016).
  return new Date(dayStamp(now).getTime() - 3 * 3_600_000);
}

export function hourInTurkey(date: Date = new Date()): number {
  return Number(hourFormatter.format(date));
}

/** Last `count` day stamps, oldest first, ending today. */
export function lastDays(count: number, now: Date = new Date()): Date[] {
  const today = dayStamp(now).getTime();
  return Array.from({ length: count }, (_, i) => new Date(today - (count - 1 - i) * 86_400_000));
}

const shortWeekday = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Labels for day stamps (which are midnight UTC). */
export function weekdayLabel(stamp: Date) {
  return shortWeekday.format(stamp);
}

export function shortDateLabel(stamp: Date) {
  return shortDate.format(stamp);
}

export function relativeDayLabel(date: Date, now: Date = new Date()) {
  const diff = daysBetween(now, date);
  if (diff === 0) return 'bugün';
  if (diff === 1) return 'yarın';
  if (diff === -1) return 'dün';
  if (diff > 1 && diff < 7) return `${diff} gün sonra`;
  if (diff < -1 && diff > -7) return `${-diff} gün önce`;
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', timeZone: APP_TIME_ZONE }).format(date);
}
