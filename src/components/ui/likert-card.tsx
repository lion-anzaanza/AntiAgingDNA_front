import { Text, View } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { SelectButton } from './select-button';

const SCALE_VALUES = [0, 1, 2, 3, 4, 5];

type LikertCardProps = {
  statement: string;
  value: number | null;
  onChange: (value: number) => void;
};

/**
 * Figma: SelectItem6_Card — a 47pt white card holding an 8pt Bold statement
 * above six SelectButton5 pills.
 */
export function LikertCard({ statement, value, onChange }: LikertCardProps) {
  return (
    <View
      style={{
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(7),
        paddingBottom: scale(9),
        paddingHorizontal: scale(9),
      }}>
      <Text
        style={{
          fontSize: scale(8),
          lineHeight: scale(10),
          marginLeft: scale(3),
          color: '#00352C',
        }}
        className="font-pretendard-bold">
        {statement}
      </Text>
      <View style={{ flexDirection: 'row', gap: scale(4), marginTop: scale(7) }}>
        {SCALE_VALUES.map((n) => (
          <SelectButton
            key={n}
            label={String(n)}
            selected={n === value}
            onPress={() => onChange(n)}
            level={5}
            tone="gray"
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </View>
  );
}
