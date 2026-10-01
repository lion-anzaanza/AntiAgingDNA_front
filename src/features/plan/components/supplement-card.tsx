import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * One 맞춤 영양제 card — v3 `1318:1662` / `1318:1663` / `1318:1661`.
 *
 * Card-relative, from the first card; the second agrees to within 0.9. The third
 * is drawn 1.07 taller with its contents about 0.5–1 lower — a one-off, so every
 * card uses the first's geometry.
 *
 * v3 changes from v4: the icon is a 28pt `Icon/*` glyph in `icon/primary` (was a
 * bitmap), 담기 grew to 64 × 32 with a smaller radius and a soft drop shadow,
 * and the evidence sentence is centred in its chip rather than flush left.
 *
 * 담기 does nothing: there is no cart, and the API has no commerce endpoints.
 */
const CARD_HEIGHT = 81.964;
const TILE = { left: 9.38, top: 8.65, width: 26.923, height: 25 };
const TEXT_LEFT = 47;
const ICON = 15.795;
const NAME_TOP = 17.036 - 13.538 / 2;
const REASON_TOP = 28.57 - 10.154 / 2;
const BUY = { left: 151.99, top: 12.128, width: 36.103, height: 18.051 };
const BUY_RAMP = cssGradientPoints(pastelAngle(BUY.width, BUY.height), BUY.width, BUY.height);
/** `drop-shadow 0 0 3.409px rgba(169,169,169,.25)` at 390. */
const BUY_SHADOW = '0px 0px 1.923px rgba(169, 169, 169, 0.25)';
const EVIDENCE = { left: 9.03, top: 41.35, width: 172.265, height: 16.346 };
const PRICE_TOP = 71.55 - 10.154 / 2;

export type Supplement = {
  name: string;
  reason: string;
  evidence: string;
  price: string;
  icon: IconName;
};

export function SupplementCard({
  name,
  reason,
  evidence,
  price,
  icon,
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
        {/* v3 draws each glyph within 0.9 of the tile's centre; centred. */}
        <Icon name={icon} size={scale(ICON)} color={COLOR.icon.primary} />
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
            borderRadius: scale(4.513),
            boxShadow: BUY_SHADOW,
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

      {/*
        * v3 makes the chip an auto-layout box (8pt side padding) and centres the
        * sentence in it. No `adjustsFontSizeToFit`: on Android it shrank this
        * line ~7% at font scale 1.0, where it visibly fits. At 1.1 the two
        * longer sentences end in "…" instead.
        */}
      <View
        style={{
          position: 'absolute',
          left: scale(EVIDENCE.left),
          top: scale(EVIDENCE.top),
          width: scale(EVIDENCE.width),
          height: scale(EVIDENCE.height),
          paddingHorizontal: scale(4.513),
          borderRadius: scale(4.513),
          backgroundColor: COLOR.surface.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: scale(6.769), lineHeight: scale(9.026), color: COLOR.text.body }}
          className="font-plex">
          {evidence}
        </Text>
      </View>

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
