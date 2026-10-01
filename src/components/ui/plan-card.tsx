import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * The icon + title + caption row that 05_사용자_맞춤_개선책 is built out of:
 * 더 알아보기 on 메인 (v3 `1318:1602`, `1318:1603`), and the 인사이트 / 제안 cards
 * on 주간 리포트 (`1319:1536`, `1319:1537`, `1319:1535`).
 *
 * v3 draws both families 350 × 81.818 (197.436 × 46.154), but a few points apart
 * inside: 메인 puts the tile at 17.25 / 17.05 with the text at 84.3 and a
 * trailing `→` chip, 리포트 puts the tile at 16 / 17.9 with the text at 73.8 and
 * no arrow. Each family is consistent across its own cards, so the two are kept
 * as layouts rather than averaged. Title and caption rows agree across all five.
 *
 * The icon is v3's 28pt `Icon/*` line glyph in `icon/primary`, centred in its
 * tile (all five sit within 0.3 of the tile's centre).
 */
const LAYOUT = {
  link: { tileLeft: 9.73, tileTop: 9.61, textLeft: 47.6 },
  insight: { tileLeft: 9.03, tileTop: 10.1, textLeft: 41.65 },
} as const;

const CARD_HEIGHT = 46.154;
const TILE = 25.962;
const ICON = 15.795;
/** Line-box centres: v3 puts the title at 31.76–31.91 and the caption at 50.43–50.52 of 81.818. */
const TITLE_TOP = 17.95 - 13.538 / 2;
const CAPTION_TOP = 28.47 - 10.154 / 2;
/** `→` chip: 19.231 round at x 168.66, centred on the card (v3 13.46; the second card's copy is 14.42). */
const ARROW_LEFT = 168.66;
const ARROW_SIZE = 19.231;

type PlanCardProps = {
  icon: IconName;
  title: string;
  caption: string;
  layout: keyof typeof LAYOUT;
  arrow?: boolean;
  onPress?: () => void;
};

export function PlanCard({ icon, title, caption, layout, arrow = false, onPress }: PlanCardProps) {
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
        <Icon name={icon} size={scale(ICON)} color={COLOR.icon.primary} />
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
