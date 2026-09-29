import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * The icon + title + caption row that 05_사용자_맞춤_개선책 is built out of:
 * 더 알아보기 on 메인 (v4 `1363:2945`, `1363:2953`), and the 인사이트 / 제안 cards
 * on 주간 리포트 (`1363:3122`, `1363:3128`, `1363:3116`).
 *
 * v4 draws both families 197.436 × 46.154, but a few points apart inside: 메인
 * puts the tile at 9.73 / 9.61 with the text at 47.6 and a trailing `→` chip,
 * 리포트 puts the tile at 9.03 / 10.1 with the text at 41.65 and no arrow. Each
 * family is consistent across its own cards, so the two are kept as layouts
 * rather than averaged. The icon is centred in its tile in every v4 card.
 */
const LAYOUT = {
  link: { tileLeft: 9.73, tileTop: 9.61, textLeft: 47.6 },
  insight: { tileLeft: 9.03, tileTop: 10.1, textLeft: 41.65 },
} as const;

const CARD_HEIGHT = 46.154;
const TILE = 25.962;
/** Line-box tops: v4 centres the title at 17.14–17.23 and the caption at 28.87–28.92. */
const TITLE_TOP = 17.18 - 13.538 / 2;
const CAPTION_TOP = 28.89 - 10.154 / 2;
/** `→` chip: 19.231 round at x 168.66, centred on the card (v4 13.46; the second card's copy is 14.42). */
const ARROW_LEFT = 168.66;
const ARROW_SIZE = 19.231;

type PlanCardProps = {
  icon: ImageSourcePropType;
  iconWidth?: number;
  iconHeight?: number;
  title: string;
  caption: string;
  layout: keyof typeof LAYOUT;
  arrow?: boolean;
  onPress?: () => void;
};

export function PlanCard({
  icon,
  iconWidth = 24.038,
  iconHeight = 24.038,
  title,
  caption,
  layout,
  arrow = false,
  onPress,
}: PlanCardProps) {
  const { tileLeft, tileTop, textLeft } = LAYOUT[layout];
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: scale(CARD_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(tileLeft),
          top: scale(tileTop),
          width: scale(TILE),
          height: scale(TILE),
          borderRadius: scale(7.692),
          backgroundColor: COLOR.surface.chip,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={icon}
          style={{ width: scale(iconWidth), height: scale(iconHeight) }}
          resizeMode="contain"
        />
      </View>

      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          left: scale(textLeft),
          top: scale(TITLE_TOP),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {title}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          left: scale(textLeft),
          top: scale(CAPTION_TOP),
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: COLOR.text.body,
        }}
        className="font-plex-semibold">
        {caption}
      </Text>

      {arrow ? (
        <View
          style={{
            position: 'absolute',
            left: scale(ARROW_LEFT),
            top: scale((CARD_HEIGHT - ARROW_SIZE) / 2),
            width: scale(ARROW_SIZE),
            height: scale(ARROW_SIZE),
            borderRadius: scale(ARROW_SIZE),
            backgroundColor: COLOR.surface.chip,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(9.026), lineHeight: scale(9.026), color: COLOR.text.body }}
            className="font-pretendard-semibold">
            →
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
