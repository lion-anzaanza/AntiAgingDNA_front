import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * The 회원가입 draft, shared across the three steps.
 *
 * Each step used to keep its own `useState`, so nothing reached 약관 동의 and the
 * flow could not have submitted anything even with a backend attached. This is
 * the one place the answers live now; the provider is mounted by the sign-up
 * stack, so the draft is thrown away when the user leaves the flow — which is
 * the behaviour we want for a half-finished signup.
 *
 * **Values are stored exactly as the screens collect them** — Korean option
 * labels, 0–10 slider positions, `년/월/일` as separate strings. Converting to
 * `SignUpRequest` is deliberately *not* done here: the enum boundaries for the
 * three sensitivity sliders belong to the server's scoring logic, and the
 * identifier field is still unsettled. See `docs/backend-backlog.md` items 2,
 * 6 and 18. Add the mapping when those are answered, not before.
 */
export type SignUpForm = {
  // STEP 1 · 개인정보
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string | null;
  job: string | null;

  // STEP 2 · 초기 진단
  sleepType: string | null;
  sleepQuality: string[];
  sugarSensitivity: number;
  caffeineSensitivity: number;
  stressSensitivity: number;
  exercise: string | null;
  workType: string[];
  drink: string | null;
  smoking: string | null;
  lifeRhythm: string | null;
  socialFrequency: string | null;
  /** WHO-5 statements, keyed by the statement text. */
  mood: Record<string, number>;

  // STEP 3 · 약관 동의
  agreed: Record<string, boolean>;
};

const EMPTY_FORM: SignUpForm = {
  nickname: '',
  email: '',
  password: '',
  passwordConfirm: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  gender: null,
  job: null,

  sleepType: null,
  sleepQuality: [],
  // 0 is the slider's resting position, not an answer — see the "sliders cannot
  // tell 0 from unanswered" item in AGENTS.md.
  sugarSensitivity: 0,
  caffeineSensitivity: 0,
  stressSensitivity: 0,
  exercise: null,
  workType: [],
  drink: null,
  smoking: null,
  lifeRhythm: null,
  socialFrequency: null,
  mood: {},

  agreed: {},
};

type SignUpFormValue = {
  form: SignUpForm;
  /** Shallow merge — pass only the fields that changed. */
  update: (patch: Partial<SignUpForm>) => void;
  reset: () => void;
};

const SignUpFormContext = createContext<SignUpFormValue | null>(null);

export function SignUpFormProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<SignUpForm>(EMPTY_FORM);

  const update = useCallback((patch: Partial<SignUpForm>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  }, []);

  const reset = useCallback(() => setForm(EMPTY_FORM), []);

  const value = useMemo(() => ({ form, update, reset }), [form, update, reset]);

  return <SignUpFormContext.Provider value={value}>{children}</SignUpFormContext.Provider>;
}

export function useSignUpForm() {
  const value = useContext(SignUpFormContext);
  if (!value) {
    throw new Error('useSignUpForm must be called inside the 회원가입 stack');
  }
  return value;
}

/**
 * Whether a step may advance.
 *
 * There is nowhere to *explain* a problem — Figma gives `TextInput` no error
 * variant and the screens have no space for a message — so the only honest
 * enforcement available is the one 약관 동의 already uses: keep 다음 disabled
 * until the step is answerable. Nothing new is invented, and nothing silently
 * wrong is submitted.
 *
 * "Required" is taken from the API, not from taste: these are exactly the
 * fields `SignUpRequest` and `DiagnosisRequest` mark as required.
 */
export function isPersonalInfoComplete(form: SignUpForm): boolean {
  return (
    form.nickname.trim().length > 0 &&
    isEmailish(form.email) &&
    form.password.length > 0 &&
    // Cannot check strength: the server documents no password rule at all
    // (docs/backend-backlog.md item 19). Matching is ours to check regardless.
    form.password === form.passwordConfirm &&
    isRealDate(form.birthYear, form.birthMonth, form.birthDay)
  );
}

export function isDiagnosisComplete(form: SignUpForm): boolean {
  return (
    form.sleepType !== null &&
    // Both lists end in 해당없음, so "nothing picked" is genuinely unanswered
    // rather than a negative answer.
    form.sleepQuality.length > 0 &&
    form.workType.length > 0 &&
    form.exercise !== null &&
    form.drink !== null &&
    form.smoking !== null &&
    form.lifeRhythm !== null
    // The three sensitivity sliders are required by the API but deliberately
    // not gated: a slider at 0 is indistinguishable from an untouched one, so
    // any check here would either block a legitimate 0 or pass an unanswered
    // question. Blocked on the unanswered-slider design (see AGENTS.md).
    // socialContactLevel and WHO-5 are optional in the spec.
  );
}

/** Not RFC-correct on purpose — just enough to catch a typo before submitting. */
function isEmailish(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/** Rejects 2월 31일 and the like, which the three-box input happily accepts. */
function isRealDate(year: string, month: string, day: string): boolean {
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day)) return false;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  // The API's own floor; the ceiling is just "not in the future".
  if (y < 1900 || y > new Date().getFullYear()) return false;
  if (m < 1 || m > 12) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
