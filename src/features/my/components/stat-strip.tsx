import { Text, View } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/** Figma's own mock numbers — there is no endpoint behind any of the three. */
const STATS = [
  { value: '31일', label: '기록한 날', centre: 32.75 },
  { value: '13축', label: '분석 항목', centre: 98.56 },
  { value: '암호화', label: '저장 방식', centre: 163.56 },
];

export const STAT_STRIP_HEIGHT = 30.769;
const CELL = 60;

/**
 * v4 `Card/Rectangle 3825` — three centred stats. The older frame split them
 * with two rules between the columns; v4 moved both rules to the card's inner
 * edges (x 9.03 and 188.41, 27.9 tall from the top) and they are drawn there.
 * Worth a designer's eye — see the inventory.
 */
export function StatStrip() {
  return (
    <View
      style={{
        height: scale(STAT_STRIP_HEIGHT),
        borderRadius: scale(5.769),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      {[9.03, 188.41].map((x) => (
        <View
          key={x}
          style={{
            position: 'absolute',
            left: scale(x - 0.144),
            top: 0,
            width: scale(0.288),
            height: scale(27.899),
            backgroundColor: COLOR.border.soft,
          }}
        />
      ))}
      {STATS.map((stat) => (
        <View
          key={stat.label}
          style={{
            position: 'absolute',
            left: scale(stat.centre - CELL / 2),
            width: scale(CELL),
            alignItems: 'center',
          }}>
          <Text
            style={{
              marginTop: scale(3.54),
              fontSize: scale(9.59),
              lineHeight: scale(13.538),
              letterSpacing: scale(-0.0959),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            {stat.value}
          </Text>
          <Text
            style={{
              marginTop: scale(18.2 - 3.54 - 13.538),
              fontSize: scale(6.769),
              lineHeight: scale(9.026),
              color: COLOR.text.muted,
            }}
            className="font-plex">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
