import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * The icon + title + caption row that 05_사용자_맞춤_개선책 is built out of:
 * 더 알아보기 on 메인 (`225:392`, `225:403`), and the 인사이트 / 제안 cards on
 * 주간 리포트 (`559:1290`–`559:1292`).
 *
 * Figma draws the two families a point or two apart — 184 wide with the tile at
 * 13 and a trailing arrow on 메인, 183 wide with the tile at 11 and no arrow on
 * 리포트 — so those are props rather than a single averaged card.
 */
type PlanCardProps = {
  icon: ImageSourcePropType;
  /** Figma sizes a few of these off-square; width is always 25. */
  iconHeight?: number;
  title: string;
  caption: string;
  width?: number;
  tileInset?: number;
  arrow?: boolean;
  onPress?: () => void;
};

export function PlanCard({
  icon,
  iconHeight = 25,
  title,
  caption,
  width = 183,
  tileInset = 11,
  arrow = false,
  onPress,
}: PlanCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: scale(width),
        height: scale(48),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          marginLeft: scale(tileInset),
          width: scale(27),
          height: scale(27),
          borderRadius: scale(8),
          backgroundColor: '#F2F2F0',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={icon}
          style={{ width: scale(25), height: scale(iconHeight) }}
          resizeMode="contain"
        />
      </View>

      <View style={{ marginLeft: scale(7), flexShrink: 1 }}>
        <Text
          style={{
            fontSize: scale(8),
            lineHeight: scale(9),
            letterSpacing: scale(-0.24),
            color: '#000000',
          }}
          className="font-pretendard-extrabold">
          {title}
        </Text>
        <Text
          style={{
            marginTop: scale(2.5),
            fontSize: scale(7),
            lineHeight: scale(9),
            letterSpacing: scale(-0.21),
            color: '#9C9C9C',
          }}
          className="font-pretendard-semibold">
          {caption}
        </Text>
      </View>

      {arrow ? (
        <View
          style={{
            marginLeft: 'auto',
            marginRight: scale(10),
            width: scale(20),
            height: scale(20),
            borderRadius: scale(500),
            backgroundColor: '#F2F2F0',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(9), lineHeight: scale(9), color: '#696969' }}
            className="font-pretendard-semibold">
            →
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
