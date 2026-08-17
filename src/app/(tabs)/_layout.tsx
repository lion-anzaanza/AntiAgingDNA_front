import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

import { BottomBar, BottomBarButton } from '@/components/ui/bottom-bar';

/**
 * The headless tabs API, because Figma's bar is a custom design that the
 * native tab bar cannot be styled into. `TabTrigger` inside `TabList` is what
 * declares a route, so every tab in the bar is a real route now.
 */
/**
 * Pin the tab group's anchor, for the same reason the root layout pins its own:
 * without it the group reopens on whichever tab was last focused, so signing in
 * dropped the user on MY instead of 홈.
 */
export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <BottomBar>
          <TabTrigger name="home" href="/home" asChild>
            <BottomBarButton tab="home" />
          </TabTrigger>
          <TabTrigger name="journal" href="/journal" asChild>
            <BottomBarButton tab="journal" />
          </TabTrigger>
          <TabTrigger name="plan" href="/plan" asChild>
            <BottomBarButton tab="plan" />
          </TabTrigger>
          <TabTrigger name="my" href="/my" asChild>
            <BottomBarButton tab="my" />
          </TabTrigger>
        </BottomBar>
      </TabList>
    </Tabs>
  );
}
