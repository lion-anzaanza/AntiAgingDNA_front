import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

export type MenuItem = {
  label: string;
  icon: IconName;
  /**
   * v3 draws 마이페이지/메인's menu icons thinner than the same icons elsewhere:
   * 1.44 in their 24pt box, the watch 1.33.
   */
  iconStroke: number;
  value?: string;
  href?: string;
};

/** v3 rows are 48pt (27.08 at 220), split by 0.288 `border/soft` rules. */
export const MENU_ROW_HEIGHT = 27.077;

/**
 * Labels and the trailing chevron centre 1.5pt (0.85 at 220) below the row's
 * middle in three of v3's five rows; the other two sit 1pt higher. The three win.
 */
const DROP = 0.846;

/**
 * One row of v3 마이페이지/메인's `Card/Rectangle 3822`: a 24pt `Icon/*` in
 * `icon/primary` at x 16, a Plex Regular 15 label at x 50, an optional `text/body`
 * value, and the `Icon/Chevron-Right` at x 314 on every row.
 */
export function MenuRow({ label, icon, iconStroke, value, href, first }: MenuItem & { first: boolean }) {
  return (
    <Pressable
      onPress={href ? () => router.push(href as never) : undefined}
      style={{
        height: scale(MENU_ROW_HEIGHT),
        justifyContent: 'center',
        borderTopWidth: first ? 0 : scale(0.288),
        borderTopColor: COLOR.border.soft,
      }}>
      <View style={{ position: 'absolute', left: scale(9.026), top: scale(6.769) }}>
        <Icon name={icon} size={scale(13.538)} color={COLOR.icon.primary} strokeWidth={iconStroke} />
      </View>
      <Text
        style={{
          position: 'absolute',
          left: scale(28.205),
          transform: [{ translateY: scale(DROP) }],
          fontSize: scale(8.462),
          lineHeight: scale(12.41),
          color: COLOR.text.strong,
        }}
        className="font-plex">
        {label}
      </Text>

      {value ? (
        <Text
          style={{
            position: 'absolute',
            // 애플워치 ends at x 310 of the 350 card and 무료 at 312; split.
            right: scale(22),
            transform: [{ translateY: scale(0.6) }],
            fontSize: scale(8.462),
            lineHeight: scale(12.41),
            color: COLOR.text.body,
          }}
          className="font-plex">
          {value}
        </Text>
      ) : null}
      <View
        style={{
          position: 'absolute',
          left: scale(177.128),
          top: scale((MENU_ROW_HEIGHT - 11.282) / 2 + DROP),
        }}>
        <Icon name="chevron-right" size={scale(11.282)} color={COLOR.text.muted} />
      </View>
    </Pressable>
  );
}
