import { Pressable } from 'react-native';

import { COLOR, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type CheckboxProps = {
  checked: boolean;
  onPress: () => void;
};

/**
 * Figma v3 회원가입/3: a 24pt circle (13.54 at 220), white with the 4px ambient
 * shadow at rest and a flat `#8169A2` once ticked — v3's own hex, not one of the
 * colour tokens. Still no ✓ inside; the row's label turning `text/heading` is
 * the other half of the checked state.
 */
export function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: scale(13.538),
        height: scale(13.538),
        borderRadius: scale(6.769),
        backgroundColor: checked ? '#8169A2' : COLOR.surface.card,
        boxShadow: checked ? 'none' : SHADOW,
      }}
    />
  );
}
