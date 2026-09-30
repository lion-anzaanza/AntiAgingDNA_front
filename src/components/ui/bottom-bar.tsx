import { forwardRef } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v4: the tab bar drawn at the foot of every tab frame (`BottomBar2`,
 * `BottomBar3`, `Component 2`, and an unnamed copy on 홈). Ten of the eleven
 * are the same 220×39.42 white bar; 홈's is the un-rescaled 41-tall original.
 * Only the **icon** changes with the active tab — the label is Plex Regular
 * `text/body` in every state.
 *
 * Each icon has its own box per state, because the bitmaps pad their artwork
 * differently (MY's active icon fills more of its canvas than the inactive one,
 * so Figma draws it smaller). Sizes and tops are v4's, in Figma points.
 *
 * The four columns are even, inside Figma's inset: v4 centres the icons at
 * 31.5 / 83 / 135 / 187, a ~52pt pitch that leaves 5.5 on the left and ~7 on
 * the right, and the padding below lands every centre within 0.4pt of that.
 */
export type BottomBarTabName = 'home' | 'journal' | 'plan' | 'my';

type TabIcon = { source: number; size: number; top: number };

const TABS: Record<BottomBarTabName, { label: string; off: TabIcon; on: TabIcon }> = {
  home: {
    label: '홈',
    off: { source: require('@/assets/images/tabs/home-off.png'), size: 24.04, top: 3.85 },
    // Only 홈's un-rescaled bar lights 홈 (26 @ 4); this is that × 39.42/41.
    on: { source: require('@/assets/images/tabs/home-on.png'), size: 25, top: 3.85 },
  },
  journal: {
    label: '오늘의 일지',
    off: { source: require('@/assets/images/tabs/journal-off.png'), size: 26.92, top: 1.92 },
    on: { source: require('@/assets/images/tabs/journal-on.png'), size: 28.85, top: 0.96 },
  },
  plan: {
    label: '개선책',
    off: { source: require('@/assets/images/tabs/plan-off.png'), size: 25, top: 2.88 },
    // v4 `image 1104` — the violet bulb. The dark bulb-and-gear it replaces
    // (`image 1101`) is still stacked under the inactive icon in v4, unseen.
    on: { source: require('@/assets/images/tabs/plan-on.png'), size: 25, top: 2.88 },
  },
  my: {
    label: 'MY',
    off: { source: require('@/assets/images/tabs/my-off.png'), size: 26.92, top: 1.92 },
    on: { source: require('@/assets/images/tabs/my-on.png'), size: 23.08, top: 3.85 },
  },
};

const BAR_HEIGHT = 39.42;
const PADDING_LEFT = 5.5;
const PADDING_RIGHT = 7.5;
/**
 * Label line-box top. v4 draws 홈 / 오늘의 일지 / 개선책 at 25.05 and MY about
 * 1pt lower at 26.01; the three win.
 */
const LABEL_TOP = 25.05;

/**
 * The bar itself. Used as `<TabList asChild><BottomBar>…</BottomBar></TabList>`,
 * which hands it `flexDirection: 'row'` — so this *is* the row. Nesting another
 * View inside would collapse to zero width and stack every tab on top of the
 * others.
 */
export const BottomBar = forwardRef<View, ViewProps>(function BottomBar({ style, ...props }, ref) {
  const insets = useSafeAreaInsets();

  return (
    <View
      ref={ref}
      {...props}
      style={[
        {
          backgroundColor: '#FFFFFF',
          height: scale(BAR_HEIGHT) + insets.bottom,
          paddingBottom: insets.bottom,
          paddingLeft: scale(PADDING_LEFT),
          paddingRight: scale(PADDING_RIGHT),
        },
        style,
      ]}
    />
  );
});

type BottomBarButtonProps = Omit<PressableProps, 'style'> & {
  tab: BottomBarTabName;
  /** Supplied by `TabTrigger` from the route. */
  isFocused?: boolean;
  /** Narrowed from Pressable's union — its function form will not compose. */
  style?: StyleProp<ViewStyle>;
};

/**
 * One tab. Wrap it in a `TabTrigger asChild` to make it navigate.
 */
export const BottomBarButton = forwardRef<View, BottomBarButtonProps>(function BottomBarButton(
  { tab, isFocused = false, style, ...props },
  ref,
) {
  const { label, off, on } = TABS[tab];
  const icon = isFocused ? on : off;

  // The layout goes *after* the incoming style, which is the reverse of the
  // usual order: `TabTrigger` hands its child a hardcoded
  // `{flexDirection:'row', justifyContent:'space-between'}`, and letting that
  // win turns the column on its side and shoves the icon to the left edge.
  return (
    <Pressable
      ref={ref}
      {...props}
      style={[
        style,
        { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' },
      ]}>
      <Image
        source={icon.source}
        style={{ width: scale(icon.size), height: scale(icon.size), marginTop: scale(icon.top) }}
        resizeMode="contain"
      />
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          top: scale(LABEL_TOP),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {label}
      </Text>
    </Pressable>
  );
});
