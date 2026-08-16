import type { SignUpRequest } from './auth';
import type { SignUpForm } from './sign-up-form';

/**
 * The one place the screens' Korean labels become the server's enum constants.
 *
 * The screens deliberately never see a constant and this file never sees a
 * component: if Figma renames an option, only the left-hand column below moves.
 * Every table here is checked against `/v3/api-docs` — see
 * `docs/backend-api.md` for the same mapping in prose.
 */
export const SLEEP_TYPE = {
  아침형: 'MORNING',
  저녁형: 'EVENING',
  일반형: 'NORMAL',
  예민형: 'SENSITIVE',
} as const;

/** 수면의 질 is four independent booleans on the wire, not one enum. */
export const SLEEP_ISSUE = {
  '잠드는데 30분 이상 걸려요': 'sleepOnsetDelayed',
  '잠을 자도 개운하지 않아요': 'sleepUnrefreshed',
  '낮에 졸림이 잦아요': 'sleepDaytimeDrowsy',
  '자다가 자주 깨요': 'sleepNightAwakening',
} as const;

export const SENSITIVITY = {
  '전혀 아님': 'NONE',
  약간: 'SLIGHT',
  보통: 'MODERATE',
  매우: 'HIGH',
} as const;

export const EXERCISE_LEVEL = {
  '거의 안 함': 'NONE',
  '주 150분 미만': 'UNDER_150',
  '주 150 ~ 300분': 'FROM_150_TO_300',
  '300분 초과': 'OVER_300',
} as const;

/** 근무 형태 is likewise two booleans. */
export const WORK_STYLE = {
  '교대·야간근무': 'shiftWorker',
  '잦은 출장·시차': 'frequentTraveler',
} as const;

export const DRINK_FREQUENCY = {
  '전혀 안 마심': 'NEVER',
  '월 1회 이하': 'MONTHLY_OR_LESS',
  '월 2 ~ 4회': 'TWO_TO_FOUR_PER_MONTH',
  '주 2 ~ 3회': 'TWO_TO_THREE_PER_WEEK',
  '주 4회 이상': 'FOUR_OR_MORE_PER_WEEK',
} as const;

export const SMOKING_STATUS = {
  비흡연: 'NEVER',
  '과거 흡연': 'FORMER',
  '현재 가끔': 'CURRENT_OCCASIONAL',
  '현재 매일': 'CURRENT_DAILY',
} as const;

export const LIFE_RHYTHM = {
  '매우 규칙적이에요': 'VERY_REGULAR',
  '대체로 규칙적이에요': 'MOSTLY_REGULAR',
  '다소 불규칙해요': 'SOMEWHAT_IRREGULAR',
  '매우 불규칙해요': 'VERY_IRREGULAR',
} as const;

export const SOCIAL_CONTACT = {
  '거의 안 함': 'RARELY',
  '주 1~2회': 'ONE_TO_TWO_PER_WEEK',
  '주 3~4회': 'THREE_TO_FOUR_PER_WEEK',
  '거의 매일': 'ALMOST_DAILY',
} as const;

/**
 * The agreement keys are the server's enum constant names verbatim — not the
 * short `service`/`sensitive`/... the screen used to use (backlog item 1).
 */
export const AGREEMENT_KEYS = {
  service: 'TERMS_OF_SERVICE',
  sensitive: 'PRIVACY_SENSITIVE',
  marketing: 'MARKETING',
  age: 'AGE_OVER_14',
} as const;

function lookup<T extends Record<string, string>>(
  table: T,
  label: string | null,
): T[keyof T] | undefined {
  if (label === null) return undefined;
  return table[label as keyof T];
}

/**
 * Throws rather than guessing when a required answer is missing or a label has
 * drifted out of a table. The screens gate 다음 on the same fields, so reaching
 * this with a hole in it means the two disagree — which is worth a crash in
 * development, not a silently wrong signup.
 */
export function toSignUpRequest(form: SignUpForm): SignUpRequest {
  const sleepType = lookup(SLEEP_TYPE, form.sleepType);
  if (!sleepType) throw new Error(`수면 유형을 변환할 수 없습니다: ${form.sleepType}`);

  const sleepIssues = {
    sleepOnsetDelayed: false,
    sleepUnrefreshed: false,
    sleepDaytimeDrowsy: false,
    sleepNightAwakening: false,
  };
  for (const label of form.sleepQuality) {
    const key = SLEEP_ISSUE[label as keyof typeof SLEEP_ISSUE];
    if (key) sleepIssues[key] = true;
  }

  const workStyle = { shiftWorker: false, frequentTraveler: false };
  for (const label of form.workType) {
    const key = WORK_STYLE[label as keyof typeof WORK_STYLE];
    if (key) workStyle[key] = true;
  }

  const required = {
    sugarSensitivity: lookup(SENSITIVITY, form.sugarSensitivity),
    caffeineSensitivity: lookup(SENSITIVITY, form.caffeineSensitivity),
    stressSensitivity: lookup(SENSITIVITY, form.stressSensitivity),
    exerciseLevel: lookup(EXERCISE_LEVEL, form.exercise),
    drinkFrequency: lookup(DRINK_FREQUENCY, form.drink),
    smokingStatus: lookup(SMOKING_STATUS, form.smoking),
    lifeRhythm: lookup(LIFE_RHYTHM, form.lifeRhythm),
  };
  for (const [field, value] of Object.entries(required)) {
    if (!value) throw new Error(`${field}를 변환할 수 없습니다`);
  }

  // WHO-5 and 사회적 교류 are optional; send them only when answered.
  const who5 = Object.values(form.mood);
  const optional = {
    ...(form.socialFrequency
      ? { socialContactLevel: lookup(SOCIAL_CONTACT, form.socialFrequency) }
      : {}),
    ...(who5.length === 5
      ? {
          who5Q1: who5[0],
          who5Q2: who5[1],
          who5Q3: who5[2],
          who5Q4: who5[3],
          who5Q5: who5[4],
        }
      : {}),
  };

  return {
    loginId: form.loginId.trim(),
    email: form.email.trim(),
    password: form.password,
    nickname: form.nickname.trim(),
    birthYear: Number(form.birthYear),
    diagnosis: {
      sleepType,
      ...sleepIssues,
      ...workStyle,
      ...required,
      ...optional,
    },
    agreements: Object.fromEntries(
      Object.entries(AGREEMENT_KEYS).map(([formKey, wireKey]) => [
        wireKey,
        form.agreed[formKey] === true,
      ]),
    ),
  };
}
