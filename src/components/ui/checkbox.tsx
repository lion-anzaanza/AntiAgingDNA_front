import { Pressable, Text } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type CheckboxProps = {
  checked: boolean;
  onPress: () => void;
};

/** Figma: 12×12, radius 3, white at rest and #E3D6FF once ticked. */
export function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: scale(12),
        height: scale(12),
        borderRadius: scale(3),
        backgroundColor: checked ? '#E3D6FF' : '#FFFFFF',
        boxShadow: SHADOW,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          fontSize: scale(7),
          lineHeight: scale(9),
          color: '#823FF6',
          opacity: checked ? 1 : 0,
        }}
        className="font-pretendard-bold">
        ✓
      </Text>
    </Pressable>
  );
}
