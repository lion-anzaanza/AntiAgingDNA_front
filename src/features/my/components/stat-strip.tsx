import { Text, View } from 'react-native';

import { GradientText } from '@/components/ui/gradient-text';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/** Figma's own mock numbers — there is no endpoint behind any of the three. */
const STATS = [
  { value: '31일', label: '기록한 날' },
  { value: '13축', label: '분석 항목' },
  { value: '암호화', label: '저장 방식' },
];

/** `Rectangle 3825` — three columns split by two 26pt vertical rules. */
export function StatStrip() {
  return (
    <View
      style={{
        height: scale(32),
        borderRadius: scale(6),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {STATS.map((stat, index) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            alignItems: 'center',
            borderLeftWidth: index === 0 ? 0 : scale(0.3),
            borderLeftColor: '#DBDBDB',
          }}>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(11), lineHeight: scale(13), letterSpacing: scale(-0.33) }}
            className="font-pretendard-bold">
            {stat.value}
          </GradientText>
          <Text
            style={{
              marginTop: scale(1),
              fontSize: scale(5.5),
              lineHeight: scale(9),
              letterSpacing: scale(-0.165),
              color: '#8C8C8C',
            }}
            className="font-pretendard">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
