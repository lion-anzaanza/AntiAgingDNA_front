import { Pressable } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

type CheckboxProps = {
  checked: boolean;
  onPress: () => void;
};

/**
 * Figma v4 회원가입/3: an 11.28 circle, white at rest and `surface/tint-2` once
 * ticked. v4 draws no ✓ inside it — the row's label turning `text/heading`
 * is the other half of the checked state (see the inventory, 결정 대기).
 */
export function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: scale(11.282),
        height: scale(11.282),
        borderRadius: scale(5.641),
        backgroundColor: checked ? COLOR.surface.tint2 : COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}
    />
  );
}
