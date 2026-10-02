import { describe, expect, it } from '@jest/globals';

import { fromIsoDate, isoDate, lastDays } from './dates';
import {
  byDate,
  dayLevelFor,
  diariesPath,
  gradeFor,
  recordedArea,
  scoresPath,
  stressPercent,
  valuesFor,
  weeklyTrend,
  type DailyScore,
  type ItemTrend,
} from './score';

/**
 * Two server behaviours are baked into this module and both have bitten us, so
 * they are asserted rather than assumed:
 *
 * - a day with no diary still answers with `displayTotal` and `grade`, so
 *   `dailyTotal` is the only "was this recorded" test;
 * - a single-date score path *writes* a row on the server, so no builder here
 *   may ever produce one.
 */
describe('gradeFor', () => {
  it('uses 22번의 70/40 경계', () => {
    expect(gradeFor(100)).toBe('GOOD');
    expect(gradeFor(70)).toBe('GOOD');
    expect(gradeFor(69.99)).toBe('WARN');
    expect(gradeFor(40)).toBe('WARN');
    expect(gradeFor(39.99)).toBe('DANGER');
    expect(gradeFor(0)).toBe('DANGER');
  });

  it('treats 0 as a real score, not as missing', () => {
    expect(gradeFor(0)).toBe('DANGER');
  });

  it('returns null for a missing score', () => {
    expect(gradeFor(null)).toBeNull();
    expect(gradeFor(undefined)).toBeNull();
  });

  it('agrees with the seeded days the screens were verified against', () => {
    expect(gradeFor(92.15)).toBe('GOOD');
    expect(gradeFor(94.73)).toBe('GOOD');
    expect(gradeFor(51.27)).toBe('WARN');
    expect(gradeFor(16.32)).toBe('DANGER');
    expect(gradeFor(13.74)).toBe('DANGER');
  });
});

describe('dayLevelFor', () => {
  it('maps grades onto the calendar cell tints, darkest is best', () => {
    expect(dayLevelFor(92)).toBe('high');
    expect(dayLevelFor(51)).toBe('mid');
    expect(dayLevelFor(16)).toBe('low');
  });

  it('is `none` only when there is no daily total', () => {
    expect(dayLevelFor(null)).toBe('none');
    expect(dayLevelFor(undefined)).toBe('none');
    // A real 0 is a recorded, terrible day — not an empty cell.
    expect(dayLevelFor(0)).toBe('low');
  });
});

describe('scoresPath / diariesPath', () => {
  const from = fromIsoDate('2026-08-04');
  const to = fromIsoDate('2026-08-17');

  it('builds inclusive ranges from local dates', () => {
    expect(scoresPath(from, to)).toBe('/api/scores?from=2026-08-04&to=2026-08-17');
    expect(diariesPath(from, to)).toBe('/api/diaries?from=2026-08-04&to=2026-08-17');
  });

  it('never builds a single-date score path, even for one day', () => {
    // Backlog 31: `GET /api/scores/{date}` creates that date's row, permanently.
    const oneDay = scoresPath(to, to);
    expect(oneDay).toBe('/api/scores?from=2026-08-17&to=2026-08-17');
    expect(oneDay).toContain('?from=');
    expect(oneDay).not.toMatch(/^\/api\/scores\/[^?]+$/);
  });
});

describe('byDate', () => {
  const rows: Pick<DailyScore, 'date' | 'dailyTotal'>[] = [
    { date: '2026-08-16', dailyTotal: 51.27 },
    { date: '2026-08-17', dailyTotal: 92.15 },
  ];

  it('indexes rows by their key', () => {
    const map = byDate(rows, (row) => row.date);
    expect(map.get('2026-08-17')?.dailyTotal).toBe(92.15);
  });

  it('reports an absent day as undefined rather than throwing', () => {
    const map = byDate(rows, (row) => row.date);
    expect(map.get('2026-08-14')).toBeUndefined();
  });

  it('survives an undefined response', () => {
    expect(byDate(undefined, (row: { date: string }) => row.date).size).toBe(0);
  });

  it('keys diaries by logDate, which is not the same field as scores use', () => {
    const diaries = [{ logDate: '2026-08-16' }, { logDate: '2026-08-17' }];
    const map = byDate(diaries, (row) => row.logDate);
    expect(map.has('2026-08-16')).toBe(true);
  });
});

describe('presence in a ranged response does not mean the day was recorded', () => {
  it('separates a scored-but-empty day from a recorded one', () => {
    // Both shapes come back from `/api/scores?from&to`; only the second is a
    // day the user actually wrote (backlog 32).
    const empty = { dailyTotal: null, displayTotal: 83.67, grade: 'GOOD' as const };
    const recorded = { dailyTotal: 16.32, displayTotal: 77.14, grade: 'GOOD' as const };

    expect(dayLevelFor(empty.dailyTotal)).toBe('none');
    expect(dayLevelFor(recorded.dailyTotal)).toBe('low');

    // The server's own `grade` says GOOD for both, which is why nothing uses it.
    expect(empty.grade).toBe('GOOD');
    expect(recorded.grade).toBe('GOOD');
    expect(gradeFor(recorded.dailyTotal)).toBe('DANGER');
  });
});

describe('stressPercent', () => {
  it('maps the 0–10 answer straight onto 0–100', () => {
    expect(stressPercent(10)).toBe(100);
    expect(stressPercent(7)).toBe(70);
    expect(stressPercent(1)).toBe(10);
  });

  it('shows a recorded 0 as 0%, never negative', () => {
    // Backlog 7 opened 0; the old (x − 1) / 9 formula printed it as −11%.
    expect(stressPercent(0)).toBe(0);
  });

  it('keeps unanswered apart from 0', () => {
    expect(stressPercent(null)).toBeNull();
    expect(stressPercent(undefined)).toBeNull();
  });
});

describe('weeklyTrend', () => {
  const week = lastDays(fromIsoDate('2026-10-02'), 7);
  const row = (date: string, waterScore: number | null): ItemTrend => ({
    date,
    sleepMinutes: null,
    sleepScore: null,
    sleepGrade: null,
    waterIntake: null,
    waterScore,
    waterGrade: null,
    stressLevel: null,
    stressScore: null,
    stressGrade: null,
  });

  it('puts each day in its own slot, oldest first, and leaves gaps empty', () => {
    const { bars } = weeklyTrend(
      week,
      [row('2026-10-02', 100), row('2026-09-26', 0), row('2026-09-29', 50)],
      (r) => r.waterScore,
    );
    expect(bars).toEqual([1, null, null, 4, null, null, 7]);
  });

  it('treats a row whose metric is null as no bar', () => {
    const { bars, grade, level } = weeklyTrend(week, [row('2026-10-01', null)], (r) => r.waterScore);
    expect(bars.every((bar) => bar === null)).toBe(true);
    expect(grade).toBeNull();
    expect(level).toBeNull();
  });

  it('grades the mean of the days that have a value, on 70/40', () => {
    // demo account, 2026-09-26..10-02: 85 100 60 85 100 85 100 → 87.9
    const scores = [85, 100, 60, 85, 100, 85, 100];
    const rows = week.map((day, i) => row(isoDate(day), scores[i]));
    const trend = weeklyTrend(week, rows, (r) => r.waterScore);
    expect(trend.grade).toBe('GOOD');
    expect(trend.level).toBe('high');
    // Two days at 50 and one gap is still WARN — the gap does not count as 0.
    const sparse = weeklyTrend(week, [row('2026-10-01', 50), row('2026-10-02', 50)], (r) => r.waterScore);
    expect(sparse.grade).toBe('WARN');
    expect(sparse.level).toBe('mid');
  });

  it('agrees with the progress bar on DANGER', () => {
    expect(weeklyTrend(week, [row('2026-10-02', 30)], (r) => r.waterScore).level).toBe('low');
  });
});

describe('valuesFor', () => {
  const days = lastDays(fromIsoDate('2026-10-02'), 3);

  it('slots rows by date, oldest first, null where a day has no row', () => {
    const rows = [
      { date: '2026-10-02', v: 3 },
      { date: '2026-09-30', v: 1 },
    ];
    expect(valuesFor(days, rows, (r) => r.v)).toEqual([1, null, 3]);
  });

  it('keeps a picked null distinct from a value', () => {
    expect(valuesFor(days, [{ date: '2026-10-01', v: null }], (r) => r.v)).toEqual([null, null, null]);
    expect(valuesFor(days, undefined, () => 1)).toEqual([null, null, null]);
  });
});

describe('recordedArea', () => {
  const areas = {
    physical: 80,
    mental: 60,
    emotion: null,
    social: 90,
    environment: null,
    grades: { physical: 'GOOD', mental: 'WARN', emotion: null, social: 'GOOD', environment: null },
  } as const;
  const row = (dailyTotal: number | null): DailyScore => ({
    date: '2026-10-02',
    areas: { ...areas, grades: { ...areas.grades } },
    dailyTotal,
    displayTotal: 75,
    grade: 'GOOD',
    orbState: 'GOOD_LOW',
    scoringVersion: 'v1',
  });

  it('reads the area on a recorded day', () => {
    expect(recordedArea(row(73), 'mental')).toBe(60);
  });

  it('ignores the baseline areas of an unrecorded today', () => {
    // Today always has a row; only dailyTotal says whether it was written.
    expect(recordedArea(row(null), 'mental')).toBeNull();
  });
});
