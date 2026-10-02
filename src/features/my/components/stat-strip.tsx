import { Text, View } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma's three were mock values (31일 · 13축 · 암호화). Only 기록한 날 has data
 * behind it — counted from `/api/diaries` by the caller. "13축" is defined
 * nowhere and "암호화" is a claim about server storage nobody has confirmed, so
 * both read `—` until they are (frontend-status 45).
 */
const CELLS = [
  { label: '기록한 날', centre: 32.718 },
  { label: '분석 항목', centre: 98.718 },
  { label: '저장 방식', centre: 164.436 },
];

export const STAT_STRIP_HEIGHT = 30.769;
const CELL = 60;

/**
 * v3 `Card/Rectangle 3825` — three centred stats. v3 dropped the two vertical
 * rules v4 drew at the card's inner edges. Values are Plex SemiBold 15, labels
 * Regular 12 `text/muted`. v3 sets 31일 3px higher than the other two values;
 * the two win.
 */
export function StatStrip({ recordedDays }: { recordedDays: string }) {
  const values = [recordedDays, '—', '—'];
  return (
    <View
      style={{
        height: scale(STAT_STRIP_HEIGHT),
        borderRadius: scale(5.769),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      {CELLS.map((stat, index) => (
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
              marginTop: scale(6.143),
              fontSize: scale(8.462),
              lineHeight: scale(9.026),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            {values[index]}
          </Text>
          <Text
            style={{
              marginTop: scale(18.204 - 6.143 - 9.026),
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
