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
 * Figma v4: ButtonNextUI — 197.4×27.1, pastel ramp, Bold 11.3 in
 * `text/on-pastel`. v4 draws it two ways (로그인·회원가입/1: SemiBold 9.6;
 * 회원가입/2·3·일지/메인: Bold 11.3); each property takes its own majority.
 *
 * v3 (final): radius 16 on 6 of its 8 copies (12 on 회원가입/2·3) — 9.026 at
 * 220. Ramp and shadow are unchanged; the text weight is still a 3-to-3 tie.
 */
export function Button({ label, style, ...pressableProps }: ButtonProps) {
  return (
    <Pressable
      {...pressableProps}
      style={[{ height: scale(27.077), borderRadius: scale(9.026), boxShadow: SHADOW_V4 }, style]}>
      <LinearGradient
        colors={[...GRADIENT_PASTEL.colors]}
        locations={[...GRADIENT_PASTEL.locations]}
        start={RAMP.start}
        end={RAMP.end}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: scale(9.026),
        }}>
        <Text
          style={{
            fontSize: scale(11.282),
            lineHeight: scale(15.795),
            letterSpacing: scale(-0.1128),
            color: COLOR.text.onPastel,
          }}
          className="font-plex-bold">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
