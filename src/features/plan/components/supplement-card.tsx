import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { GradientText } from '@/components/ui/gradient-text';
import {
  GRADIENT_BRAND,
  GRADIENT_SELECT,
  GRADIENT_SELECT_STOPS,
  SHADOW,
} from '@/lib/design';
import { scale } from '@/lib/scale';

/** Card-relative, averaged over the three cards — Figma's differ by a point. */
const CARD_HEIGHT = 88;
const TILE_TOP = 9;
const NAME_TOP = 12.5;
const REASON_TOP = 24;
const BUY_TOP = 14;
const EVIDENCE_TOP = 43;
const PRICE_TOP = 69;

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
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(11),
          top: scale(TILE_TOP),
          width: scale(28),
          height: scale(26),
          borderRadius: scale(5),
          backgroundColor: '#F2F2F0',
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
          left: scale(46),
          top: scale(NAME_TOP),
          fontSize: scale(8),
          lineHeight: scale(9),
          letterSpacing: scale(-0.24),
          color: '#000000',
        }}
        className="font-pretendard-extrabold">
        {name}
      </Text>
      <View style={{ position: 'absolute', left: scale(46), top: scale(REASON_TOP) }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(7), lineHeight: scale(9) }}
          className="font-pretendard-semibold">
          {reason}
        </GradientText>
      </View>

      <Pressable style={{ position: 'absolute', left: scale(149), top: scale(BUY_TOP) }}>
        <LinearGradient
          colors={[...GRADIENT_SELECT]}
          locations={[...GRADIENT_SELECT_STOPS]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: scale(27),
            height: scale(16),
            borderRadius: scale(5),
            boxShadow: SHADOW,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(7), lineHeight: scale(8), color: '#FFFFFF' }}
            className="font-pretendard-bold">
            담기
          </Text>
        </LinearGradient>
      </Pressable>

      <View
        style={{
          position: 'absolute',
          left: scale(11),
          top: scale(EVIDENCE_TOP),
          width: scale(165),
          height: scale(17),
          borderRadius: scale(5),
          backgroundColor: '#FBF4FF',
          justifyContent: 'center',
          paddingLeft: scale(7),
        }}>
        <Text
          style={{
            fontSize: scale(6),
            lineHeight: scale(8),
            letterSpacing: scale(-0.18),
            color: '#5F5E5B',
          }}
          className="font-pretendard">
          {evidence}
        </Text>
      </View>

      <Text
        style={{
          position: 'absolute',
          left: scale(15),
          top: scale(PRICE_TOP),
          fontSize: scale(8),
          lineHeight: scale(9),
          letterSpacing: scale(-0.24),
          color: '#000000',
        }}
        className="font-pretendard-extrabold">
        {price}
      </Text>
    </View>
  );
}
