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
