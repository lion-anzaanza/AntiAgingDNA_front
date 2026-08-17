import { describe, expect, it } from '@jest/globals';

import {
  addDays,
  endOfMonth,
  fromIsoDate,
  isoDate,
  lastDays,
  mondayFirstIndex,
  startOfMonth,
  WEEKDAYS_MON_FIRST,
  WEEKDAYS_SUN_FIRST,
} from './dates';

/**
 * The whole point of this module is that it never touches UTC. `toISOString()`
 * names the previous day in KST until 09:00, which filed every morning's diary
 * against yesterday — so the tests below are written against local calendar
 * fields and deliberately include times that would break under UTC.
 */
describe('isoDate', () => {
  it('formats local calendar fields, zero-padded', () => {
    expect(isoDate(new Date(2026, 7, 3))).toBe('2026-08-03');
    expect(isoDate(new Date(2026, 11, 25))).toBe('2026-12-25');
  });

  it('names the local day even just after local midnight', () => {
    // 00:30 local. `toISOString()` would say 2026-08-16 for a UTC+9 device.
    expect(isoDate(new Date(2026, 7, 17, 0, 30))).toBe('2026-08-17');
  });

  it('names the local day just before local midnight', () => {
    // 23:30 local. `toISOString()` would say 2026-08-18 for a UTC-3 device.
    expect(isoDate(new Date(2026, 7, 17, 23, 30))).toBe('2026-08-17');
  });

  it('never disagrees with the Date it was given', () => {
    for (let day = 1; day <= 28; day += 1) {
      const date = new Date(2026, 1, day, 6, 0);
      const [, , dd] = isoDate(date).split('-');
      expect(Number(dd)).toBe(date.getDate());
    }
  });
});

describe('fromIsoDate', () => {
  it('round-trips with isoDate', () => {
    for (const iso of ['2026-01-01', '2026-08-17', '2026-12-31', '2024-02-29']) {
      expect(isoDate(fromIsoDate(iso))).toBe(iso);
    }
  });

  it('builds a local midnight, not a UTC one', () => {
    const d = fromIsoDate('2026-08-17');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(17);
    expect(d.getHours()).toBe(0);
  });
});

describe('addDays', () => {
  it('moves forward and back', () => {
    expect(isoDate(addDays(fromIsoDate('2026-08-17'), 1))).toBe('2026-08-18');
    expect(isoDate(addDays(fromIsoDate('2026-08-17'), -1))).toBe('2026-08-16');
  });

  it('crosses month and year boundaries', () => {
    expect(isoDate(addDays(fromIsoDate('2026-08-31'), 1))).toBe('2026-09-01');
    expect(isoDate(addDays(fromIsoDate('2026-01-01'), -1))).toBe('2025-12-31');
  });

  it('handles a leap day', () => {
    expect(isoDate(addDays(fromIsoDate('2024-02-28'), 1))).toBe('2024-02-29');
    expect(isoDate(addDays(fromIsoDate('2026-02-28'), 1))).toBe('2026-03-01');
  });

  it('does not mutate its argument', () => {
    const start = fromIsoDate('2026-08-17');
    addDays(start, 5);
    expect(isoDate(start)).toBe('2026-08-17');
  });
});

describe('lastDays', () => {
  it('ends on the given day and runs oldest first', () => {
    const week = lastDays(fromIsoDate('2026-08-17'), 7).map(isoDate);
    expect(week).toEqual([
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
      '2026-08-17',
    ]);
  });

  it('returns exactly one day for a count of 1', () => {
    expect(lastDays(fromIsoDate('2026-08-17'), 1).map(isoDate)).toEqual(['2026-08-17']);
  });
});

describe('startOfMonth / endOfMonth', () => {
  it('brackets a 31-day month', () => {
    const d = fromIsoDate('2026-08-17');
    expect(isoDate(startOfMonth(d))).toBe('2026-08-01');
    expect(isoDate(endOfMonth(d))).toBe('2026-08-31');
  });

  it('brackets a 30-day month', () => {
    const d = fromIsoDate('2026-09-15');
    expect(isoDate(endOfMonth(d))).toBe('2026-09-30');
  });

  it('gets February right in and out of a leap year', () => {
    expect(isoDate(endOfMonth(fromIsoDate('2024-02-10')))).toBe('2024-02-29');
    expect(isoDate(endOfMonth(fromIsoDate('2026-02-10')))).toBe('2026-02-28');
  });
});

describe('weekday labels', () => {
  it('keeps the two orders genuinely different', () => {
    expect(WEEKDAYS_SUN_FIRST[0]).toBe('일');
    expect(WEEKDAYS_MON_FIRST[0]).toBe('월');
    expect(WEEKDAYS_SUN_FIRST).not.toEqual(WEEKDAYS_MON_FIRST);
    expect([...WEEKDAYS_SUN_FIRST].sort()).toEqual([...WEEKDAYS_MON_FIRST].sort());
  });

  it('labels a known date the same way under both schemes', () => {
    // 2026-08-17 is a Monday.
    const monday = fromIsoDate('2026-08-17');
    expect(WEEKDAYS_SUN_FIRST[monday.getDay()]).toBe('월');
    expect(WEEKDAYS_MON_FIRST[mondayFirstIndex(monday)]).toBe('월');
  });

  it('agrees for every day of one week', () => {
    for (const day of lastDays(fromIsoDate('2026-08-17'), 7)) {
      expect(WEEKDAYS_MON_FIRST[mondayFirstIndex(day)]).toBe(WEEKDAYS_SUN_FIRST[day.getDay()]);
    }
  });

  it('puts Sunday last on a Monday-first week', () => {
    const sunday = fromIsoDate('2026-08-16');
    expect(sunday.getDay()).toBe(0);
    expect(mondayFirstIndex(sunday)).toBe(6);
  });
});
