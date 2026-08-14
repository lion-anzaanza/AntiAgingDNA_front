import { TextInput as RNTextInput, Text, View, type TextInputProps } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type TextInputFieldProps = TextInputProps & {
  label: string;
};

/**
 * Figma: TextInput — a 7pt Bold label sitting in a 10pt band directly above a
 * 23pt white field. The whole control is 34pt tall.
 */
export function TextInputField({ label, style, ...inputProps }: TextInputFieldProps) {
  return (
    <View>
      <Text
        style={{ fontSize: scale(7), lineHeight: scale(10), color: '#88877F' }}
        className="font-pretendard-bold">
        {label}
      </Text>
      <View
        style={{
          height: scale(23),
          marginTop: scale(1),
          borderRadius: scale(5),
          paddingHorizontal: scale(8),
          backgroundColor: '#FFFFFF',
          boxShadow: SHADOW,
          justifyContent: 'center',
        }}>
        <RNTextInput
          {...inputProps}
          placeholderTextColor="#B4B2A8"
          style={[{ fontSize: scale(7), color: '#00352C', padding: 0 }, style]}
          className="font-pretendard-medium"
        />
      </View>
    </View>
  );
}
