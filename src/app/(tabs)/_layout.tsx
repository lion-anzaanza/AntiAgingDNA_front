import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

import { BottomBar, BottomBarButton } from '@/components/ui/bottom-bar';

/**
 * The headless tabs API, because Figma's bar is a custom design that the
 * native tab bar cannot be styled into. `TabTrigger` inside `TabList` is what
 * declares a route, so 개선책 and MY — which have no screens yet — are rendered
 * as bare buttons: visible exactly as Figma draws them, and inert.
 *
 * `(tabs)/explore.tsx` is leftover template. It no longer has a tab, but it is
 * still reachable at `/explore`.
 */
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
          <BottomBarButton tab="plan" />
          <BottomBarButton tab="my" />
        </BottomBar>
      </TabList>
    </Tabs>
  );
}
