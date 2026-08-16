import { Stack } from 'expo-router';

/**
 * 06_마이페이지. 마이페이지 is the tab root and 웨어러블 연동 pushes on top —
 * the only other frame in the section that is actually designed.
 */
export default function MyLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
