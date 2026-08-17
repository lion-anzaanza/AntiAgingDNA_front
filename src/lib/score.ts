import { isoDate } from '@/lib/dates';

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
 * `GET /api/scores/items?from&to` — one row per recorded day with the sleep and
 * water atoms behind 나의 LifeDNA 정보's weekly cards (deployed 2026-08-18).
 *
 * `sleepMinutes`, `sleepScore` and `sleepGrade` are always null in practice:
 * they derive from 취침·기상 시각, which no screen can collect (backlog 29).
 * There is no stress equivalent at all, so 홈's third badge stays unresolved
 * (backlog 10).
 */
export type ItemTrend = {
  date: string;
  sleepMinutes: number | null;
  sleepScore: number | null;
  sleepGrade: Grade | null;
  waterIntake: string | null;
  waterScore: number | null;
  waterGrade: Grade | null;
};

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
