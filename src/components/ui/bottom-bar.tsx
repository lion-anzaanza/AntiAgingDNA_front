import { forwardRef } from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v3: `TabBar` — a 390×70 white bar (39.49 at 220) with a soft upward
 * shadow, four equal 92pt columns inset 10 left / 12 right. The active tab sits
 * on a 56×34 `brand/selected` pill and turns its icon and label `violet-text`;
 * the rest are `text/muted`. The icons are `Icon/Tab-*` vectors now, one box size
 * in both states, replacing v4's per-state bitmaps.
 *
 * Values below are v3's ×220/390.
 */
export type BottomBarTabName = 'home' | 'journal' | 'plan' | 'my';

const TABS: Record<BottomBarTabName, { label: string; icon: IconName }> = {
  home: { label: '홈', icon: 'tab-home' },
  journal: { label: '오늘의 일지', icon: 'tab-journal' },
  plan: { label: '개선책', icon: 'tab-bulb' },
  my: { label: 'MY', icon: 'tab-user' },
};

const BAR_HEIGHT = 39.487;
const PADDING_LEFT = 5.641;
const PADDING_RIGHT = 6.769;
const PILL = { width: 31.59, height: 19.179, top: 2.821, radius: 9.59 };
const ICON = { size: 14.667, top: 5.077 };
const LABEL_TOP = 22.564;
/** `0px -2px 12px rgba(74,56,128,0.06)` at 220. */
const BAR_SHADOW = '0px -1.128px 6.769px rgba(74, 56, 128, 0.06)';

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
          backgroundColor: COLOR.surface.card,
          boxShadow: BAR_SHADOW,
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
  const { label, icon } = TABS[tab];
  const color = isFocused ? COLOR.brand.violetText : COLOR.text.muted;

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
      {/* Always rendered, only its opacity changes (AGENTS.md #3). Toggling the
          colour from `transparent` instead left Android drawing a square pill on
          a tab that gained focus later — the radius was not reapplied. */}
      <View
        style={{
          position: 'absolute',
          top: scale(PILL.top),
          width: scale(PILL.width),
          height: scale(PILL.height),
          borderRadius: scale(PILL.radius),
          backgroundColor: COLOR.brand.selected,
          opacity: isFocused ? 1 : 0,
        }}
      />
      <View style={{ marginTop: scale(ICON.top) }}>
        <Icon name={icon} size={scale(ICON.size)} color={color} />
      </View>
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          top: scale(LABEL_TOP),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color,
        }}
        className="font-plex">
        {label}
      </Text>
    </Pressable>
  );
});
