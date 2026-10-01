import { describe, expect, it } from '@jest/globals';

import { fromIsoDate } from './dates';
import {
  byDate,
  dayLevelFor,
  diariesPath,
  gradeFor,
  itemsPath,
  itemWeek,
  scoreBar,
  scoresPath,
  toneFor,
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

/** A row as `/api/scores/items` returns it; only the named fields are set. */
function item(date: string, fields: Partial<ItemTrend>): ItemTrend {
  return {
    date,
    sleepMinutes: null,
    sleepScore: null,
    sleepGrade: null,
    waterIntake: null,
    waterScore: null,
    waterGrade: null,
    stressLevel: null,
    stressScore: null,
    stressGrade: null,
    ...fields,
  };
}

describe('itemsPath', () => {
  it('builds a range, like every other score path', () => {
    expect(itemsPath(fromIsoDate('2026-09-26'), fromIsoDate('2026-10-02'))).toBe(
      '/api/scores/items?from=2026-09-26&to=2026-10-02',
    );
  });
});

describe('itemWeek', () => {
  const end = fromIsoDate('2026-10-02');

  it('lays out the seven days ending on `end`, oldest first, with gaps as null', () => {
    const rows = [
      item('2026-09-26', { waterScore: 60, waterGrade: 'WARN' }),
      item('2026-09-29', { waterScore: 100, waterGrade: 'GOOD' }),
      // Outside the window — must not leak in.
      item('2026-09-25', { waterScore: 10, waterGrade: 'DANGER' }),
    ];
    expect(itemWeek(rows, end, 'water').scores).toEqual([60, null, null, 100, null, null, null]);
  });

  it('grades on the most recent day that has a value, not on today', () => {
    const rows = [
      item('2026-09-30', { stressScore: 30, stressGrade: 'DANGER' }),
      item('2026-10-01', { stressScore: 70, stressGrade: 'GOOD' }),
      // Today has a row, but no stress answer.
      item('2026-10-02', { waterScore: 85, waterGrade: 'GOOD' }),
    ];
    expect(itemWeek(rows, end, 'stress').latest).toEqual({ score: 70, grade: 'GOOD' });
  });

  it('keeps a metric to its own fields', () => {
    const rows = [item('2026-10-02', { waterScore: 85, waterGrade: 'GOOD' })];
    expect(itemWeek(rows, end, 'sleep')).toEqual({ scores: Array(7).fill(null), latest: null });
  });

  it('treats a missing response as an empty week', () => {
    expect(itemWeek(undefined, end, 'water').latest).toBeNull();
  });
});

describe('scoreBar', () => {
  it('maps 0–100 onto the seven bar heights Figma draws', () => {
    expect([0, 1, 14, 15, 50, 85, 86, 100].map(scoreBar)).toEqual([1, 1, 1, 2, 4, 6, 7, 7]);
  });

  it('draws no bar on a day with no value', () => {
    expect(scoreBar(null)).toBeNull();
  });
});

describe('toneFor', () => {
  it('follows the grade, and has no tone without one', () => {
    expect(['GOOD', 'WARN', 'DANGER', null].map((grade) => toneFor(grade as never))).toEqual([
      'good',
      'warn',
      'danger',
      null,
    ]);
  });
});
