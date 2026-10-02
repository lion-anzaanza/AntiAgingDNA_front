import { isoDate } from '@/lib/dates';

/**
 * Reading `/api/scores`. The counterpart to `diary-request.ts`, which handles
 * the write side.
 *
 * Two server behaviours shape everything in this file:
 *
 * 1. **Scores are read by range only.** `GET /api/scores/{date}` used to
 *    *create* that date's row, permanently (verified 2026-08-17, backlog 31).
 *    The server fixed that (verified 2026-10-02), but `scoresPath` still only
 *    builds a range — a single day is a one-day window — so there is one read
 *    path, pinned by `score.test.ts`.
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
 * water and stress atoms behind 홈's metric badges and 신체 cards (sleep and
 * water deployed 2026-08-18, stress verified 2026-10-02 — backlog 10).
 *
 * `sleepMinutes`, `sleepScore` and `sleepGrade` are null for anything entered
 * in the app: they derive from 취침·기상 시각, which no screen can collect
 * (backlog 29). The `demo` seed has them, so check a fresh account too.
 *
 * `stressScore` runs the *wellbeing* way, `100 × (10 − level) / 10`: a stressful
 * day is a low score and `stressGrade` `DANGER`.
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

/**
 * 홈's 스트레스 `%`: the raw 0–10 answer, proportionally (backlog 26 — the
 * `%` means "how stressed", so higher is worse). `0` is a real answer since
 * backlog 7, and `null` is "not answered".
 */
export function stressPercent(level: number | null | undefined): number | null {
  if (level === null || level === undefined) return null;
  return Math.round(level * 10);
}

/** Structurally `Level` from `components/ui/weekly-info-card`. */
type ProgressLevel = 'low' | 'mid' | 'high';

/**
 * One value per day, in `days` order — `null` where the response has no row
 * for that day or `pick` finds nothing. The single place a ranged response is
 * slotted into days, so captions and bars cannot disagree about which day is
 * which.
 */
export function valuesFor<T extends { date: string }, V>(
  days: Date[],
  rows: T[] | undefined,
  pick: (row: T) => V | null,
): (V | null)[] {
  const rowByDate = byDate(rows, (row) => row.date);
  return days.map((day) => {
    const row = rowByDate.get(isoDate(day));
    return row ? pick(row) : null;
  });
}

/**
 * An area's score for one day, or `null` when the day has no diary. Today
 * always has a row (`displayTotal` falls back to the signup baseline), so
 * `dailyTotal` is the "was this recorded" test here as everywhere else —
 * without it an untouched today counts as a recorded day.
 */
export function recordedArea(row: DailyScore, key: keyof AreaScores['grades']): number | null {
  return row.dailyTotal === null ? null : row.areas[key];
}

/**
 * A weekly card's 7 bars and its headline, from one per-day score — an
 * `ItemTrend` metric or a `DailyScore` area.
 *
 * - `bars`: one per day, oldest first, on Figma's seven drawn heights (1–7,
 *   a straight 0–100 split). `null` where the day has no value — no bar.
 * - `grade`: the week's mean score on 22's 70/40 boundaries, the same rule
 *   every other surface uses. `null` when no day in the window has a value.
 * - `level`: the progress bar's Low/Mid/High (Figma's three fills), one per
 *   grade, so the bar and the 좋음/주의/위험 word never disagree.
 */
export function weeklyTrend<T extends { date: string }>(
  days: Date[],
  rows: T[] | undefined,
  score: (row: T) => number | null,
): {
  values: (number | null)[];
  bars: (number | null)[];
  grade: Grade | null;
  level: ProgressLevel | null;
} {
  const values = valuesFor(days, rows, score);
  const bars = values.map((value) =>
    value === null ? null : 1 + Math.round((Math.min(Math.max(value, 0), 100) / 100) * 6),
  );
  const present = values.filter((value): value is number => value !== null);
  const grade = present.length
    ? gradeFor(present.reduce((sum, value) => sum + value, 0) / present.length)
    : null;
  const level = grade === 'GOOD' ? 'high' : grade === 'WARN' ? 'mid' : grade === 'DANGER' ? 'low' : null;
  return { values, bars, grade, level };
}

/** Inclusive range. Never build a single-date path — see (1) above. */
export function scoresPath(from: Date, to: Date): string {
  return `/api/scores?from=${isoDate(from)}&to=${isoDate(to)}`;
}

export function diariesPath(from: Date, to: Date): string {
  return `/api/diaries?from=${isoDate(from)}&to=${isoDate(to)}`;
}

/**
 * The response carries only days that have a row. Absence means "no data", but
 * presence does **not** mean "has a diary" — today always has a row, and rows
 * materialised by reads before backlog 31 was fixed remain: check `dailyTotal`.
 */
export function byDate<T>(rows: T[] | undefined, key: (row: T) => string): Map<string, T> {
  return new Map((rows ?? []).map((row) => [key(row), row]));
}
