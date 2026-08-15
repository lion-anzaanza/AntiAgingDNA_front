import { Stack } from 'expo-router';

import { SignUpFormProvider } from '@/lib/sign-up-form';

/**
 * Exists only to scope the signup draft. A nested `Stack` (rather than a
 * `Slot`) keeps each step its own entry in the history, so 뒤로가기 still walks
 * back through the steps; mounting the provider here means the draft is
 * discarded when the user leaves 회원가입 entirely.
 */
export default function SignUpLayout() {
  return (
    <SignUpFormProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SignUpFormProvider>
  );
}
