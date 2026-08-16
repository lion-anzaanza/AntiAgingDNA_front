import { Stack } from 'expo-router';

/**
 * 05_사용자_맞춤_개선책. 메인 is the tab root; 맞춤 영양제, 주간 리포트 and
 * 한 달 뒤 내 모습 push on top of it, the same shape as the 일지 tab.
 */
export default function PlanLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
