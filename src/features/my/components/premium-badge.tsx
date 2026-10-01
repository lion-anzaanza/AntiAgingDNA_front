import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

const WIDTH = 75.085;
const HEIGHT = 11.538;
/**
 * v3 centres the 11px label on x 47.2 of the pill (83.7 of 133.1 at 390). It is
 * centred there in a box that starts past the crown and stops at the pill's end,
 * so at font scale 1.1 it shrinks instead of running over the crown.
 */
const LABEL_CENTRE = 47.19;
const LABEL_LEFT = 15.3;

/**
 * v3 구독관리's `#FFF8D5` pill (`1318:1897`) with `Icon/crown` in
 * `icon/primary`, which replaced v4's bitmap crown. Neither pill colour is a
 * token; both are the hex Figma draws. The crown's 24pt box pokes 1pt above
 * the pill, as drawn.
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
      <View style={{ position: 'absolute', left: scale(4.321), top: scale(-1.038) }}>
        <Icon name="crown" size={scale(13.538)} color={COLOR.icon.primary} />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          position: 'absolute',
          left: scale(LABEL_LEFT),
          width: scale(2 * (LABEL_CENTRE - LABEL_LEFT)),
          textAlign: 'center',
          top: scale((HEIGHT - 10.154) / 2),
          fontSize: scale(6.205),
          lineHeight: scale(10.154),
          color: '#774F00',
        }}
        className="font-plex-semibold">
        LifeDNA 프리미엄
      </Text>
    </View>
  );
}
