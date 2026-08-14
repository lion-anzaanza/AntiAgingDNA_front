import { Redirect } from 'expo-router';

/**
 * The app opens on the auth flow. Once sign-up completes, 약관 동의 replaces the
 * stack with the tab navigator, so nothing returns here.
 */
export default function Index() {
  return <Redirect href="/(auth)/sign-in" />;
}
