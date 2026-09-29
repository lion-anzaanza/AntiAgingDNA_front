import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  style?: StyleProp<ViewStyle>;
};

// The CSS angle depends on the box's aspect, so it is resolved against the
// Figma box once; the button keeps that aspect wherever it is placed.
const RAMP = cssGradientPoints(GRADIENT_PASTEL.angle, 197.436, 27.077);

/**
 * Figma v4: ButtonNextUI — 197.4×27.1, radius 9.6, pastel ramp,
 * SemiBold 9.6 in `text/on-pastel`.
 */
export function Button({ label, style, ...pressableProps }: ButtonProps) {
  return (
    <Pressable
      {...pressableProps}
      style={[{ height: scale(27.077), borderRadius: scale(9.615), boxShadow: SHADOW_V4 }, style]}>
      <LinearGradient
        colors={[...GRADIENT_PASTEL.colors]}
        locations={[...GRADIENT_PASTEL.locations]}
        start={RAMP.start}
        end={RAMP.end}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: scale(9.615),
        }}>
        <Text
          style={{
            fontSize: scale(9.59),
            lineHeight: scale(13.538),
            letterSpacing: scale(-0.0959),
            color: COLOR.text.onPastel,
          }}
          className="font-plex-semibold">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
