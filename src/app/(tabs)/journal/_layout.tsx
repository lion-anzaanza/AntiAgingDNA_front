import { Stack } from 'expo-router';

/**
 * 일지 is a tab with a stack inside it: 메인 is the root, and 오늘의 기록,
 * 캘린더 and a past day's 상세보기 push on top. The tab trigger points at
 * `/journal`, which resolves to `index`.
 */
export default function JournalLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
