/**
 * Local-calendar date helpers.
 *
 * Everything here works off the device's own calendar fields on purpose.
 * `toISOString()` is UTC, which names the *previous* day in KST until 09:00 —
 * using it would file every morning's diary against yesterday and shift a whole
 * month of calendar cells by one.
 */

/**
 * Two weekday orders, named rather than repeated, because **the difference is
 * deliberate and looks like a typo.** Most screens label a Sunday-first week;
 * 일지/메인's 주간 기록 strip runs 월–일 because that is how Figma draws it.
 * They lived as four separate `WEEKDAYS` consts, three identical and one not —
 * exactly the shape someone "fixes" and breaks.
 */
export const WEEKDAYS_SUN_FIRST = ['일', '월', '화', '수', '목', '금', '토'] as const;
export const WEEKDAYS_MON_FIRST = ['월', '화', '수', '목', '금', '토', '일'] as const;

/** `Date.getDay()` is Sunday-based; shift it onto a Monday-first week. */
export function mondayFirstIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** `2026-08-17` — the form every `{date}` path segment and range bound takes. */
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * The inverse. Built from the parts rather than `new Date(iso)`, which the spec
 * parses as UTC midnight — in KST that reads back as the day before.
 */
export function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** A new `Date` offset by whole days. Negative goes back. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** The 1st of `date`'s month, and the last day of it — a calendar's query range. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** A new `Date` offset by whole months, keeping the 1st. */
export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** `[date - (count - 1), …, date]`, oldest first — the 7일 windows both use. */
export function lastDays(date: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(date, i - (count - 1)));
}
