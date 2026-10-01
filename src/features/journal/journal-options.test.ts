import { describe, expect, it } from '@jest/globals';

import {
  CAFFEINE_CUPS_VALUE,
  CAFFEINE_LAST_TIME,
  EXERCISED,
  EXERCISE_DURATION,
  EXERCISE_TYPE,
  MEAL_COUNT_VALUE,
  MOOD_RECOVERY_VALUE,
  SCREEN_TIME_VALUE,
  SITTING_HOURS,
  SLEEP_LATENCY,
  SOCIAL_CONTACT_VALUE,
  SUGAR_INTAKE,
  WALK_DURATION,
  WATER_INTAKE,
} from '@/lib/diary-request';

import {
  CAFFEINE_CUPS,
  CAFFEINE_TIME,
  CAFFEINE_TIME_WIDTHS,
  DID_EXERCISE,
  EXERCISE_KIND,
  EXERCISE_MINUTES,
  EXERCISE_MINUTES_WIDTHS,
  JUNK_FOOD,
  MEAL_COUNT,
  MEAL_COUNT_WIDTHS,
  MET_PEOPLE,
  MOOD_RECOVERY,
  SAT,
  SAT_WIDTHS,
  SCREEN_TIME,
  SCREEN_TIME_WIDTHS,
  SLEEP_ONSET,
  SLEEP_ONSET_WIDTHS,
  WALKED,
  WALKED_WIDTHS,
  WATER,
} from './journal-options';

/**
 * The pills draw `journal-options`; the payload maps the same strings through
 * `diary-request`'s tables. A label edited on one side only — a typo fixed, a
 * pill relabelled — either throws on save (pill without a key) or leaves an
 * answer the screen can never show (key without a pill). Both directions.
 */
const PAIRS: [string, readonly string[], Record<string, unknown>][] = [
  ['SLEEP_ONSET', SLEEP_ONSET, SLEEP_LATENCY],
  ['MEAL_COUNT', MEAL_COUNT, MEAL_COUNT_VALUE],
  ['JUNK_FOOD', JUNK_FOOD, SUGAR_INTAKE],
  ['CAFFEINE_CUPS', CAFFEINE_CUPS, CAFFEINE_CUPS_VALUE],
  ['CAFFEINE_TIME', CAFFEINE_TIME, CAFFEINE_LAST_TIME],
  ['WATER', WATER, WATER_INTAKE],
  ['DID_EXERCISE', DID_EXERCISE, EXERCISED],
  ['EXERCISE_MINUTES', EXERCISE_MINUTES, EXERCISE_DURATION],
  ['EXERCISE_KIND', EXERCISE_KIND, EXERCISE_TYPE],
  ['WALKED', WALKED, WALK_DURATION],
  ['SAT', SAT, SITTING_HOURS],
  ['SCREEN_TIME', SCREEN_TIME, SCREEN_TIME_VALUE],
  ['MOOD_RECOVERY', MOOD_RECOVERY, MOOD_RECOVERY_VALUE],
  ['MET_PEOPLE', MET_PEOPLE, SOCIAL_CONTACT_VALUE],
];

describe('journal options ↔ diary request tables', () => {
  it.each(PAIRS)('%s: every pill has a key and every key a pill', (_, options, table) => {
    expect([...options].sort()).toEqual(Object.keys(table).sort());
  });
});

describe('v3 pill widths', () => {
  const ROW = 179.385;
  const GAP = 4.513;
  const ROWS: [string, readonly string[], readonly number[]][] = [
    ['SLEEP_ONSET', SLEEP_ONSET, SLEEP_ONSET_WIDTHS],
    ['MEAL_COUNT', MEAL_COUNT, MEAL_COUNT_WIDTHS],
    ['CAFFEINE_TIME', CAFFEINE_TIME, CAFFEINE_TIME_WIDTHS],
    ['EXERCISE_MINUTES', EXERCISE_MINUTES, EXERCISE_MINUTES_WIDTHS],
    ['WALKED', WALKED, WALKED_WIDTHS],
    ['SAT', SAT, SAT_WIDTHS],
    ['SCREEN_TIME', SCREEN_TIME, SCREEN_TIME_WIDTHS],
  ];
  it.each(ROWS)('%s: one width per pill, filling the row', (_, options, widths) => {
    expect(widths).toHaveLength(options.length);
    const total = widths.reduce((sum, w) => sum + w, 0) + GAP * (widths.length - 1);
    expect(total).toBeCloseTo(ROW, 0);
  });
});
