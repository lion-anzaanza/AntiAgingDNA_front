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
 * labels, `년/월/일` as separate strings. `lib/sign-up-request.ts` turns them
 * into the wire format; keeping the two apart means the screens never have to
 * know an enum constant.
 */
export type SignUpForm = {
  // STEP 1 · 개인정보
  loginId: string;
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
  /**
   * Four levels, not the mock's 0–10 slider: 기획 settled on a 4-point scale and
   * the API only ever had `NONE`/`SLIGHT`/`MODERATE`/`HIGH` (backlog item 6).
   */
  sugarSensitivity: string | null;
  caffeineSensitivity: string | null;
  stressSensitivity: string | null;
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
  loginId: '',
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
  sugarSensitivity: null,
  caffeineSensitivity: null,
  stressSensitivity: null,
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
    // 4–32 characters of letters, digits and underscore — the server's rule, and
    // still provisional (backlog item 2).
    /^[A-Za-z0-9_]{4,32}$/.test(form.loginId.trim()) &&
    form.nickname.trim().length > 0 &&
    isEmailish(form.email) &&
    form.password.length > 0 &&
    // Cannot check strength: the server documents no password rule at all
    // (docs/backend-backlog.md item 19). Matching is ours to check regardless.
    form.password === form.passwordConfirm &&
    isBirthYear(form.birthYear)
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
    form.lifeRhythm !== null &&
    // Now gateable: as four pills these are genuinely unanswered until picked,
    // which the 0–10 slider could never express.
    form.sugarSensitivity !== null &&
    form.caffeineSensitivity !== null &&
    form.stressSensitivity !== null
    // socialContactLevel and WHO-5 are optional in the spec.
  );
}

/** Not RFC-correct on purpose — just enough to catch a typo before submitting. */
export function isEmailish(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * 1900 is the API's own floor and the ceiling is just "not in the future".
 * Being under 14 is rejected by the server (backlog item 20) rather than here —
 * it is a moving target, and the server's message is the one worth showing.
 */
function isBirthYear(value: string): boolean {
  if (!/^\d{4}$/.test(value)) return false;
  const year = Number(value);
  return year >= 1900 && year <= new Date().getFullYear();
}
