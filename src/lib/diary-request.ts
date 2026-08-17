/**
 * The one place 일지's Korean labels become `DiaryRequest`'s enum constants —
 * the diary counterpart to `sign-up-request.ts`, and it keeps the same two
 * rules: the screen never sees a constant, this file never sees a component.
 *
 * Every table below is checked against `/v3/api-docs` (2026-08-17); the same
 * mapping is written out in prose in `docs/backend-api.md`.
 *
 * Unlike signup, **only `conditionLevel` is required**, so an unanswered
 * question is omitted rather than rejected — a half-filled 오늘의 기록 is a legal
 * payload. A label that is not in its table still throws: that means Figma
 * renamed an option and the answer would otherwise be dropped in silence.
 */

/** `FeelSelect`'s 1–5, kept as a number so `src/lib` stays free of components. */
type Level5 = 1 | 2 | 3 | 4 | 5;

export const SLEEP_LATENCY = {
  '5분 이내': 'WITHIN_5',
  '15분 이내': 'WITHIN_15',
  '30분 이내': 'WITHIN_30',
  '1시간 이상': 'OVER_60',
} as const;

/** 오늘 식사 횟수 is a plain int 0–5 on the wire, not an enum. */
export const MEAL_COUNT_VALUE = {
  '0끼': 0,
  '1끼': 1,
  '2끼': 2,
  '3끼': 3,
  '4끼': 4,
  '5끼 +': 5,
} as const;

export const SUGAR_INTAKE = {
  '0회': 'NONE',
  '1~2회': 'ONE_TO_TWO',
  '3회 이상': 'THREE_OR_MORE',
} as const;

export const CAFFEINE_CUPS_VALUE = {
  '0잔': 'NONE',
  '1~2잔': 'ONE_TO_TWO',
  '3~4잔': 'THREE_TO_FOUR',
  '5잔 이상': 'FIVE_OR_MORE',
} as const;

export const CAFFEINE_LAST_TIME = {
  '안 마심': 'NONE',
  오전: 'MORNING',
  '오후 (~5시)': 'AFTERNOON',
  '저녁 (6시 이후)': 'EVENING',
} as const;

export const WATER_INTAKE = {
  '2잔 이하': 'UNDER_2',
  '3~5잔': 'THREE_TO_FIVE',
  '6~7잔': 'SIX_TO_SEVEN',
  '8잔 이상': 'EIGHT_OR_MORE',
} as const;

/** 오늘 운동했나요 is a boolean, so it gets its own table rather than a lookup. */
export const EXERCISED = { 네: true, 아니요: false } as const;

export const EXERCISE_DURATION = {
  '15분 이하': 'UNDER_15',
  '30분': 'ABOUT_30',
  '1시간': 'ABOUT_60',
  '1시간 이상': 'OVER_60',
} as const;

export const EXERCISE_TYPE = {
  걷기: 'WALKING',
  유산소: 'AEROBIC',
  근력: 'STRENGTH',
  '근력+유산소': 'STRENGTH_AND_AEROBIC',
} as const;

export const WALK_DURATION = {
  '30분 이하': 'UNDER_30',
  '30분~1시간': 'THIRTY_TO_60',
  '1~2시간': 'ONE_TO_TWO_HOURS',
  '2시간 이상': 'OVER_2_HOURS',
} as const;

export const SITTING_HOURS = {
  '4시간 이하': 'UNDER_4',
  '4~8시간': 'FOUR_TO_EIGHT',
  '8~10시간': 'EIGHT_TO_TEN',
  '10시간 이상': 'OVER_10',
} as const;

export const SCREEN_TIME_VALUE = {
  '2시간 이하': 'UNDER_2',
  '2~4시간': 'TWO_TO_FOUR',
  '4~6시간': 'FOUR_TO_SIX',
  '6시간 이상': 'OVER_6',
} as const;

export const MOOD_RECOVERY_VALUE = {
  '안 함': 'NONE',
  잠깐: 'BRIEF',
  충분히: 'ENOUGH',
} as const;

export const SOCIAL_CONTACT_VALUE = {
  '거의 안 만남': 'RARELY',
  잠깐: 'BRIEF',
  '여러 번·길게': 'FREQUENT',
} as const;

/** What 오늘의 기록 holds once 컨디션 is answered and it may be submitted. */
export type DiaryAnswers = {
  condition: Level5;
  sleepOnset: string | null;
  sleepFeel: Level5 | null;
  meals: string | null;
  junkFood: string | null;
  caffeineCups: string | null;
  caffeineTime: string | null;
  water: string | null;
  didExercise: string | null;
  exerciseMinutes: string | null;
  exerciseKind: string | null;
  walked: string | null;
  sat: string | null;
  /** `Slider0To10`'s position — see `stressLevel` below. */
  stress: number;
  screenTime: string | null;
  moodRecovery: string | null;
  metPeople: string | null;
};

/**
 * `PUT /api/diaries/{date}`. Everything but `conditionLevel` is optional.
 *
 * `sleepStartedAt` / `sleepEndedAt` (`"HH:mm"`) are deliberately absent:
 * `InputTime_Card` has no picker behind it in Figma or in code, so 취침·기상
 * 시각 is not collected at all and there is nothing to send. Backlog item 29.
 */
export type DiaryRequest = {
  conditionLevel: Level5;
  sleepLatency?: string;
  sleepSatisfaction?: Level5;
  mealCount?: number;
  sugarIntake?: string;
  caffeineCups?: string;
  caffeineLastTime?: string;
  waterIntake?: string;
  exercised?: boolean;
  exerciseDuration?: string;
  exerciseType?: string;
  walkDuration?: string;
  sittingHours?: string;
  stressLevel?: number;
  screenTime?: string;
  moodRecovery?: string;
  socialContact?: string;
};

function lookup<T extends Record<string, string | number | boolean>>(
  field: string,
  table: T,
  label: string | null,
): T[keyof T] | undefined {
  if (label === null) return undefined;
  const value = table[label as keyof T];
  if (value === undefined) throw new Error(`${field}를 변환할 수 없습니다: ${label}`);
  return value;
}

/** Drops the keys whose answer is missing, so they never reach the wire. */
function defined<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function toDiaryRequest(answers: DiaryAnswers): DiaryRequest {
  return {
    conditionLevel: answers.condition,
    ...defined({
      sleepLatency: lookup('잠들기까지 걸린 시간', SLEEP_LATENCY, answers.sleepOnset),
      sleepSatisfaction: answers.sleepFeel ?? undefined,
      mealCount: lookup('오늘 식사 횟수', MEAL_COUNT_VALUE, answers.meals),
      sugarIntake: lookup('페스트푸드·단 음식', SUGAR_INTAKE, answers.junkFood),
      caffeineCups: lookup('카페인 섭취', CAFFEINE_CUPS_VALUE, answers.caffeineCups),
      caffeineLastTime: lookup('마지막 섭취 시각', CAFFEINE_LAST_TIME, answers.caffeineTime),
      waterIntake: lookup('수분 섭취량', WATER_INTAKE, answers.water),
      exercised: lookup('오늘 운동했나요', EXERCISED, answers.didExercise),
      exerciseDuration: lookup('운동 시간', EXERCISE_DURATION, answers.exerciseMinutes),
      exerciseType: lookup('운동 종류', EXERCISE_TYPE, answers.exerciseKind),
      walkDuration: lookup('오늘 걸은 시간', WALK_DURATION, answers.walked),
      sittingHours: lookup('앉아 있던 시간', SITTING_HOURS, answers.sat),
      /*
       * The slider runs 0–10 and the server takes 1–10, and there is no
       * "unanswered" position to tell 0 apart from untouched (backlog item 7,
       * still 🟣 기획). Omitting 0 is the half the backend has already settled —
       * "미응답 시 필드 생략" — and it is also the only reading that cannot post
       * a value the server rejects.
       */
      stressLevel: answers.stress === 0 ? undefined : answers.stress,
      screenTime: lookup('스크린타임', SCREEN_TIME_VALUE, answers.screenTime),
      moodRecovery: lookup('기분 전환·회복 활동', MOOD_RECOVERY_VALUE, answers.moodRecovery),
      socialContact: lookup('오늘 사람을 만났나요', SOCIAL_CONTACT_VALUE, answers.metPeople),
    }),
  };
}

/* ------------------------------------------------------------------------- *
 * Reading a saved entry back into the form.
 *
 * `PUT /api/diaries/{date}` **replaces** the entry rather than merging into it
 * — verified against the server on 2026-08-17: writing `{conditionLevel: 2}`
 * over a filled day nulls every other field. So 오늘의 기록 must open with the
 * day's existing answers already in it; otherwise a second save on the same day
 * silently destroys the first one.
 * ------------------------------------------------------------------------- */

/** The form before 컨디션 is answered — what the screen actually holds. */
export type DiaryDraft = Omit<DiaryAnswers, 'condition'> & { condition: Level5 | null };

/** The `DiaryResponse` fields the form can restore. */
export type DiaryFields = {
  conditionLevel?: number | null;
  sleepLatency?: string | null;
  sleepSatisfaction?: number | null;
  mealCount?: number | null;
  sugarIntake?: string | null;
  caffeineCups?: string | null;
  caffeineLastTime?: string | null;
  waterIntake?: string | null;
  exercised?: boolean | null;
  exerciseDuration?: string | null;
  exerciseType?: string | null;
  walkDuration?: string | null;
  sittingHours?: string | null;
  stressLevel?: number | null;
  screenTime?: string | null;
  moodRecovery?: string | null;
  socialContact?: string | null;
};

/**
 * A row of `GET /api/diaries?from&to`. The list keys the day as `logDate`,
 * not `date` — the scores endpoint uses `date`, and the two do not match.
 */
export type DiaryRow = DiaryFields & { logDate: string };

/** Constant → label, derived from the tables above so the two cannot drift. */
function invert(table: Record<string, string | number | boolean>) {
  return new Map(Object.entries(table).map(([label, value]) => [String(value), label]));
}

const REVERSE = {
  sleepLatency: invert(SLEEP_LATENCY),
  mealCount: invert(MEAL_COUNT_VALUE),
  sugarIntake: invert(SUGAR_INTAKE),
  caffeineCups: invert(CAFFEINE_CUPS_VALUE),
  caffeineLastTime: invert(CAFFEINE_LAST_TIME),
  waterIntake: invert(WATER_INTAKE),
  exercised: invert(EXERCISED),
  exerciseDuration: invert(EXERCISE_DURATION),
  exerciseType: invert(EXERCISE_TYPE),
  walkDuration: invert(WALK_DURATION),
  sittingHours: invert(SITTING_HOURS),
  screenTime: invert(SCREEN_TIME_VALUE),
  moodRecovery: invert(MOOD_RECOVERY_VALUE),
  socialContact: invert(SOCIAL_CONTACT_VALUE),
};

function label(
  table: Map<string, string>,
  value: string | number | boolean | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  return table.get(String(value)) ?? null;
}

/** An out-of-range or absent 1–5 reads as unanswered rather than throwing. */
function level5(value: number | null | undefined): Level5 | null {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : null;
}

export function toDiaryDraft(saved: DiaryFields): DiaryDraft {
  return {
    condition: level5(saved.conditionLevel),
    sleepOnset: label(REVERSE.sleepLatency, saved.sleepLatency),
    sleepFeel: level5(saved.sleepSatisfaction),
    meals: label(REVERSE.mealCount, saved.mealCount),
    junkFood: label(REVERSE.sugarIntake, saved.sugarIntake),
    caffeineCups: label(REVERSE.caffeineCups, saved.caffeineCups),
    caffeineTime: label(REVERSE.caffeineLastTime, saved.caffeineLastTime),
    water: label(REVERSE.waterIntake, saved.waterIntake),
    didExercise: label(REVERSE.exercised, saved.exercised),
    exerciseMinutes: label(REVERSE.exerciseDuration, saved.exerciseDuration),
    exerciseKind: label(REVERSE.exerciseType, saved.exerciseType),
    walked: label(REVERSE.walkDuration, saved.walkDuration),
    sat: label(REVERSE.sittingHours, saved.sittingHours),
    // The slider has no unanswered position, so a null score rests at 0 and is
    // omitted again on the next save (see `stressLevel` above).
    stress: saved.stressLevel ?? 0,
    screenTime: label(REVERSE.screenTime, saved.screenTime),
    moodRecovery: label(REVERSE.moodRecovery, saved.moodRecovery),
    metPeople: label(REVERSE.socialContact, saved.socialContact),
  };
}
