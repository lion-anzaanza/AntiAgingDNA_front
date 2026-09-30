import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * One 맞춤 영양제 card — v4 `1363:3014` / `3025` / `3036`.
 *
 * Card-relative, from the first two cards, which agree to within 0.8. The third
 * is drawn 1.07 taller with its contents about 0.5–1 lower — a one-off, so every
 * card uses the first two's geometry.
 *
 * 담기 does nothing: there is no cart, and the API has no commerce endpoints.
 */
const CARD_HEIGHT = 81.964;
const TILE = { left: 9.38, top: 8.65, width: 26.923, height: 25 };
const TEXT_LEFT = 47;
const NAME_TOP = 16.2 - 13.538 / 2;
const REASON_TOP = 28.8 - 10.154 / 2;
const BUY = { left: 159.12, top: 13.46, width: 28.972, height: 15.385 };
const BUY_RAMP = cssGradientPoints(pastelAngle(BUY.width, BUY.height), BUY.width, BUY.height);
const EVIDENCE = { left: 9.03, top: 41.35, width: 172.265, height: 16.346 };
const PRICE_TOP = 71.97 - 10.154 / 2;

export type Supplement = {
  name: string;
  reason: string;
  evidence: string;
  price: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
};

export function SupplementCard({
  name,
  reason,
  evidence,
  price,
  icon,
  iconWidth,
  iconHeight,
}: Supplement) {
  return (
    <View
      style={{
        height: scale(CARD_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(TILE.left),
          top: scale(TILE.top),
          width: scale(TILE.width),
          height: scale(TILE.height),
          borderRadius: scale(4.808),
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
        style={{
          position: 'absolute',
          left: scale(TEXT_LEFT),
          top: scale(NAME_TOP),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {name}
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: scale(TEXT_LEFT),
          top: scale(REASON_TOP),
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: COLOR.brand.violetText,
        }}
        className="font-plex-semibold">
        {reason}
      </Text>

      <Pressable style={{ position: 'absolute', left: scale(BUY.left), top: scale(BUY.top) }}>
        <LinearGradient
          colors={[...GRADIENT_PASTEL.colors]}
          locations={[...GRADIENT_PASTEL.locations]}
          start={BUY_RAMP.start}
          end={BUY_RAMP.end}
          style={{
            width: scale(BUY.width),
            height: scale(BUY.height),
            borderRadius: scale(4.808),
            boxShadow: SHADOW_V4,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.text.onPastel }}
            className="font-plex-semibold">
            담기
          </Text>
        </LinearGradient>
      </Pressable>

      <View
        style={{
          position: 'absolute',
          left: scale(EVIDENCE.left),
          top: scale(EVIDENCE.top),
          width: scale(EVIDENCE.width),
          height: scale(EVIDENCE.height),
          borderRadius: scale(4.808),
          backgroundColor: COLOR.surface.tint,
        }}
      />
      {/*
        * v4 starts the sentence at 8.57 — flush with the box's own left edge
        * (9.03), no inset — in all three cards, so it is reproduced. It is its
        * own node, not the box's child, so it is placed on the card.
        */}
      {/*
        * No `adjustsFontSizeToFit` here: on Android it shrank this line ~7% at
        * font scale 1.0, where it visibly fits (cause not pinned down — the
        * banner's autosize, with `left` + `right` rather than `maxWidth`, does
        * not). At 1.1 the two longer sentences end in "…" instead.
        */}
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          left: scale(8.57),
          top: scale(49.4 - 9.026 / 2),
          maxWidth: scale(EVIDENCE.width + 0.46),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {evidence}
      </Text>

      <Text
        style={{
          position: 'absolute',
          left: scale(8.77),
          top: scale(PRICE_TOP),
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {price}
      </Text>
    </View>
  );
}
