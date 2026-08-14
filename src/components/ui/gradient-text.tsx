import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, type TextProps } from 'react-native';

type GradientTextProps = TextProps & {
  colors: [string, string, ...string[]];
};

export function GradientText({ colors, style, children, ...textProps }: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text {...textProps} style={style}>{children}</Text>}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text {...textProps} style={[style, { opacity: 0 }]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
