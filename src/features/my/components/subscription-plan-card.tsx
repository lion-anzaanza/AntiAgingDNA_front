import { Pressable, Text } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/** Both cards carry this in Figma — it is the 마이페이지 profile label, not a plan. */
const PLAN_SUBTITLE = '올빼미 - 고민감 - 누적형';

export const PLAN_CARD_HEIGHT = 28.846;

/**
 * v4 구독관리 `Card/Rectangle 3823` / `3824`. v4 dropped the radio: the chosen
 * plan is a `surface/tint` card with a 0.385 `brand/violet` border, the other a
 * white card with a 0.288 `border/soft` one. Everything inside sits where Figma
 * puts it; the two cards agree to 0.15pt, so they share one set of positions.
 */
export function SubscriptionPlanCard({
  title,
  price,
  per,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  per: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        height: scale(PLAN_CARD_HEIGHT),
        borderRadius: scale(6.731),
        // Same element tree either way — only the values change (AGENTS.md #3).
        backgroundColor: selected ? COLOR.surface.tint : COLOR.surface.card,
        borderWidth: scale(selected ? 0.385 : 0.288),
        borderColor: selected ? COLOR.brand.violet : COLOR.border.soft,
      }}>
      <Text
        style={{
          position: 'absolute',
          left: scale(8.6),
          top: scale(9.66 - 13.538 / 2),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.heading,
        }}
        className="font-plex-semibold">
        {title}
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: scale(8.77),
          top: scale(19.26 - 9.026 / 2),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {PLAN_SUBTITLE}
      </Text>
      {/* Right-aligned to x 170.4 of the 197.4 card. */}
      <Text
        style={{
          position: 'absolute',
          right: scale(197.436 - 170.44),
          top: scale(13.89 - 13.538 / 2),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.heading,
        }}
        className="font-plex-semibold">
        {price}
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: scale(178.9),
          top: scale(16.09 - 9.026 / 2),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {per}
      </Text>
    </Pressable>
  );
}
