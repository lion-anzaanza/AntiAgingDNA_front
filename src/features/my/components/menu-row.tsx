import { router } from 'expo-router';
import { Image, Pressable, Text, type ImageSourcePropType } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

export type MenuItem = {
  label: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
  /** Figma places each icon absolutely, not centred — up to 1.5pt high. */
  iconTop: number;
  value?: string;
  href?: string;
};

/**
 * One row of v4 마이페이지/메인's `Card/Rectangle 3822`. Figma draws two kinds
 * of trailing mark: a plain row carries a Pretendard Light 11.3 `>`, while a
 * row with a value writes `값  >` as one IBM Plex 8.5 string — both reproduced.
 */
export function MenuRow({
  label,
  icon,
  iconWidth,
  iconHeight,
  iconTop,
  value,
  href,
  height,
  first,
}: MenuItem & { height: number; first: boolean }) {
  return (
    <Pressable
      onPress={href ? () => router.push(href as never) : undefined}
      style={{
        height: scale(height),
        justifyContent: 'center',
        borderTopWidth: first ? 0 : scale(0.288),
        borderTopColor: COLOR.border.soft,
      }}>
      <Image
        source={icon}
        style={{
          position: 'absolute',
          left: scale(9.1),
          top: scale(iconTop),
          width: scale(iconWidth),
          height: scale(iconHeight),
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          position: 'absolute',
          left: scale(29),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.strong,
        }}
        className="font-plex">
        {label}
      </Text>

      {value ? (
        <Text
          style={{
            position: 'absolute',
            right: scale(9.5),
            // Both value rows in Figma sit 3.2pt below their row's middle.
            transform: [{ translateY: scale(3.2) }],
            fontSize: scale(8.462),
            lineHeight: scale(12.41),
            color: COLOR.text.body,
          }}
          className="font-plex">
          {`${value}  >`}
        </Text>
      ) : (
        <Text
          style={{
            position: 'absolute',
            right: scale(8),
            transform: [{ translateY: scale(0.6) }],
            fontSize: scale(11.282),
            lineHeight: scale(20.308),
            letterSpacing: scale(-0.1128),
            color: COLOR.text.body,
          }}
          className="font-pretendard-light">
          {'>'}
        </Text>
      )}
    </Pressable>
  );
}
