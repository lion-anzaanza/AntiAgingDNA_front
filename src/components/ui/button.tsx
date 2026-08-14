import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** Figma: ButtonNextUI — 184×30, radius 10, ActiveButton gradient, ExtraBold 10. */
export function Button({ label, style, ...pressableProps }: ButtonProps) {
  return (
    <Pressable
      {...pressableProps}
      style={[{ height: scale(30), borderRadius: scale(10), boxShadow: SHADOW }, style]}>
      <LinearGradient
        colors={[...GRADIENT_SELECT]}
        locations={[...GRADIENT_SELECT_STOPS]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: scale(10),
        }}>
        <Text
          style={{ fontSize: scale(10), lineHeight: scale(15), color: '#FFFFFF' }}
          className="font-pretendard-extrabold">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
