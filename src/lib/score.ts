import { addDays, isoDate } from '@/lib/dates';
import type { Tone } from '@/lib/design';

/**
 * Reading `/api/scores`. The counterpart to `diary-request.ts`, which handles
 * the write side.
 *
 * Two server behaviours shape everything in this file (both verified against
 * the live server 2026-08-17):
 *
 * 1. **`GET /api/scores/{date}` and `/today` are not read-only.** Fetching a
 *    single date *creates* that date's score row, permanently — a calendar
 *    drawing one month would record the whole month, and there is no way to
 *    undo it (`DELETE` → 405). Backlog 31. The ranged form creates nothing, so
 *    `scoresPath` only ever builds a range; a single day is a one-day window.
 * 2. **A day with no diary still scores.** `displayTotal` and `grade` are
 *    filled from the signup diagnosis baseline, so `grade` reads `GOOD` on a
 *    day the user never touched. Backlog 32. `dailyTotal` is the only field
 *    that distinguishes them, which is why nothing here reads `grade`.
 */
export type Grade = 'GOOD' | 'WARN' | 'DANGER';

/**
 * The orb's seven bands, deployed 2026-08-18. They subdivide 22's 70/40
 * boundaries (0/20/40/55/70/80/90), so `orbState` and `grade` never disagree.
 *
 * Like `grade`, this follows `displayTotal` — the smoothed level, not the day.
 * That is exactly right for the orb card, which shows `displayTotal`, and wrong
 * for anything per-day.
 */
export type OrbState =
  | 'DANGER_LOW'
  | 'DANGER_HIGH'
  | 'WARN_LOW'
  | 'WARN_HIGH'
  | 'GOOD_LOW'
  | 'GOOD_MID'
  | 'GOOD_HIGH';

export type AreaScores = {
  physical: number | null;
  mental: number | null;
  emotion: number | null;
  social: number | null;
  environment: number | null;
  grades: Record<'physical' | 'mental' | 'emotion' | 'social' | 'environment', Grade | null>;
};

export type DailyScore = {
  date: string;
  areas: AreaScores;
  /** `null` when there is no diary that day. The "was this day recorded" test. */
  dailyTotal: number | null;
  /** Always present — falls back to the diagnosis baseline. */
  displayTotal: number | null;
  grade: Grade | null;
  orbState: OrbState | null;
  scoringVersion: string;
};

/**
 * `GET /api/scores/items?from&to` — one row per recorded day with the sleep,
 * water and stress atoms behind 홈's stat-card badges and 신체's weekly cards
 * (sleep and water deployed 2026-08-18, stress verified 2026-10-02, backlog 10).
 *
 * Unlike the daily `grade` (see (2) above), these grades are per item and per
 * day, so they are read as-is. All three use 22's 70/40 boundaries.
 *
 * - `stressScore` points the wellbeing way, `100 × (10 − stressLevel) / 10`:
 *   high stress is a low score and `stressGrade` `DANGER`.
 * - `sleepMinutes` / `sleepScore` / `sleepGrade` are null for every day entered
 *   in the app — they derive from 취침·기상 시각, which no screen collects
 *   (backlog 29). The `demo` seed carries bedtimes, so it does show them.
 */
export type ItemTrend = {
  date: string;
  sleepMinutes: number | null;
  sleepScore: number | null;
  sleepGrade: Grade | null;
  waterIntake: string | null;
  waterScore: number | null;
  waterGrade: Grade | null;
  stressLevel: number | null;
  stressScore: number | null;
  stressGrade: Grade | null;
};

export type ItemMetric = 'sleep' | 'water' | 'stress';

const ITEM_FIELDS = {
  sleep: { score: 'sleepScore', grade: 'sleepGrade' },
  water: { score: 'waterScore', grade: 'waterGrade' },
  stress: { score: 'stressScore', grade: 'stressGrade' },
} as const;

/** One metric for one day, or `null` on a day with no row or no value. */
export function itemOf(
  row: ItemTrend | undefined,
  metric: ItemMetric,
): { score: number; grade: Grade | null } | null {
  const fields = ITEM_FIELDS[metric];
  const score = row?.[fields.score];
  if (row === undefined || score === null || score === undefined) return null;
  return { score, grade: row[fields.grade] };
}

/**
 * The seven days ending on `end` (oldest first) for one metric, plus the most
 * recent day in that window that has a value. A weekly card draws the seven as
 * bars and grades itself on `latest`.
 */
export function itemWeek(rows: ItemTrend[] | undefined, end: Date, metric: ItemMetric) {
  const byDay = byDate(rows, (row) => row.date);
  const days = Array.from({ length: 7 }, (_, index) =>
    itemOf(byDay.get(isoDate(addDays(end, index - 6))), metric),
  );
  const latest = [...days].reverse().find((day) => day !== null) ?? null;
  return { scores: days.map((day) => day?.score ?? null), latest };
}

/**
 * A 0–100 score as one of the weekly card's seven bar heights. Figma draws
 * exactly seven, so this is a straight quantisation — no threshold is being
 * chosen. `null` (no value that day) draws no bar.
 */
export function scoreBar(score: number | null): 1 | 2 | 3 | 4 | 5 | 6 | 7 | null {
  if (score === null) return null;
  return Math.min(7, Math.max(1, Math.ceil((score / 100) * 7))) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/** A grade's colour family — GOOD green, WARN amber, DANGER red. */
export function toneFor(grade: Grade | null | undefined): Tone | null {
  if (grade === 'GOOD') return 'good';
  if (grade === 'WARN') return 'warn';
  if (grade === 'DANGER') return 'danger';
  return null;
}

export function itemsPath(from: Date, to: Date): string {
  return `/api/scores/items?from=${isoDate(from)}&to=${isoDate(to)}`;
}

/**
 * The 70/40 boundaries the backend deployed for `grade` (backlog 22), applied
 * here rather than read off the response for the reason in (2) above: the
 * server's `grade` follows `displayTotal`, and every per-day surface in the app
 * — calendar cells, 지난 기록 faces — is asking about `dailyTotal`.
 */
export function gradeFor(score: number | null | undefined): Grade | null {
  if (score === null || score === undefined) return null;
  if (score >= 70) return 'GOOD';
  if (score >= 40) return 'WARN';
  return 'DANGER';
}

/**
 * Structurally `DateLevel` from `components/ui/date-cell`, redeclared so this
 * file stays free of component imports (same reason `diary-request.ts` keeps
 * its own `Level5`).
 */
type DayLevel = 'none' | 'low' | 'mid' | 'high';

/** A calendar cell's tint. Darker is better, and `none` means nothing recorded. */
export function dayLevelFor(dailyTotal: number | null | undefined): DayLevel {
  const grade = gradeFor(dailyTotal);
  if (grade === 'GOOD') return 'high';
  if (grade === 'WARN') return 'mid';
  if (grade === 'DANGER') return 'low';
  return 'none';
}

/** Inclusive range. Never build a single-date path — see (1) above. */
export function scoresPath(from: Date, to: Date): string {
  return `/api/scores?from=${isoDate(from)}&to=${isoDate(to)}`;
}

export function diariesPath(from: Date, to: Date): string {
  return `/api/diaries?from=${isoDate(from)}&to=${isoDate(to)}`;
}

/**
 * The response carries only days that have a row, and — until backlog 31 is
 * fixed — that includes days materialised by an earlier read. So absence means
 * "no data", but presence does **not** mean "has a diary": check `dailyTotal`.
 */
export function byDate<T>(rows: T[] | undefined, key: (row: T) => string): Map<string, T> {
  return new Map((rows ?? []).map((row) => [key(row), row]));
}
