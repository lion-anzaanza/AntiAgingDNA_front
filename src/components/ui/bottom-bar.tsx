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

import { scale } from '@/lib/scale';

/**
 * Figma: `BottomBar0`–`BottomBar4` (`457:820`) — the app's tab bar. The five
 * nodes are the same bar with a different tab active; only the **icon**
 * changes, the label stays `#B4B2A8` throughout.
 *
 * Figma hand-places the four columns slightly off centre (31.5 / 83.5 / 135.5 /
 * 187.5 rather than even quarters). They are laid out evenly here — the intent
 * is plainly a four-up bar, and even columns also survive a change of device
 * width.
 */
export type BottomBarTabName = 'home' | 'journal' | 'plan' | 'my';

const TABS: Record<
  BottomBarTabName,
  { label: string; size: number; top: number; off: number; on: number }
> = {
  home: {
    label: '홈',
    size: 25,
    top: 5,
    off: require('@/assets/images/tabs/home-off.png'),
    on: require('@/assets/images/tabs/home-on.png'),
  },
  journal: {
    label: '오늘의 일지',
    size: 28,
    top: 3,
    off: require('@/assets/images/tabs/journal-off.png'),
    on: require('@/assets/images/tabs/journal-on.png'),
  },
  plan: {
    label: '개선책',
    size: 26,
    top: 4,
    off: require('@/assets/images/tabs/plan-off.png'),
    on: require('@/assets/images/tabs/plan-on.png'),
  },
  my: {
    label: 'MY',
    size: 28,
    top: 3,
    off: require('@/assets/images/tabs/my-off.png'),
    on: require('@/assets/images/tabs/my-on.png'),
  },
};

const BAR_HEIGHT = 41;

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
        },
        style,
      ]}
    />
  );
});

type BottomBarButtonProps = Omit<PressableProps, 'style'> & {
  tab: BottomBarTabName;
  /** Supplied by `TabTrigger`; absent on the tabs that have no screen yet. */
  isFocused?: boolean;
  /** Narrowed from Pressable's union — its function form will not compose. */
  style?: StyleProp<ViewStyle>;
};

/**
 * One tab. Wrap it in a `TabTrigger asChild` to make it navigate; rendered bare
 * it is inert, which is how 개선책 and MY sit until those screens exist.
 */
export const BottomBarButton = forwardRef<View, BottomBarButtonProps>(function BottomBarButton(
  { tab, isFocused = false, style, ...props },
  ref,
) {
  const { label, size, top, off, on } = TABS[tab];

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
        source={isFocused ? on : off}
        style={{ width: scale(size), height: scale(size), marginTop: scale(top) }}
        resizeMode="contain"
      />
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          bottom: scale(4.5),
          fontSize: scale(7),
          lineHeight: scale(9),
          color: '#B4B2A8',
        }}
        className="font-pretendard">
        {label}
      </Text>
    </Pressable>
  );
});
