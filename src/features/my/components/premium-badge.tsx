import { Image, Text, View } from 'react-native';

import { scale } from '@/lib/scale';

const WIDTH = 75.085;
const HEIGHT = 11.538;
/**
 * Figma's label ink starts at x 15.3 in the pill, just past the crown, and ends
 * at 71.1. It is left-aligned there and bounded by the pill's end, so at font
 * scale 1.1 it shrinks instead of running over the crown.
 */
const LABEL_LEFT = 15.3;

/**
 * v4 구독관리's `#FFF8D5` pill with the crown (`1363:3292` + `image 1123`).
 * Neither colour is a v4 token; both are the hex Figma draws.
 *
 * Figma sets the label's line box 2.5pt below the pill's middle, so its ink
 * sits on the bottom edge. It happens once, so the label is centred vertically.
 */
export function PremiumBadge() {
  return (
    <View
      style={{
        width: scale(WIDTH),
        height: scale(HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: '#FFF8D5',
        borderWidth: scale(0.192),
        borderColor: '#FFC800',
      }}>
      <Image
        source={require('@/assets/images/my/ic-crown.png')}
        style={{
          position: 'absolute',
          left: scale(4.51),
          top: 0,
          width: scale(10.897),
          height: scale(HEIGHT),
        }}
        resizeMode="contain"
      />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          position: 'absolute',
          left: scale(LABEL_LEFT),
          right: scale(1),
          top: scale((HEIGHT - 10.154) / 2),
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: '#774F00',
        }}
        className="font-plex-semibold">
        LifeDNA 프리미엄
      </Text>
    </View>
  );
}
