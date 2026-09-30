import { TextInput as RNTextInput, Text, View, type TextInputProps } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

type TextInputFieldProps = TextInputProps & {
  label: string;
};

/**
 * Figma v4: TextInput — a SemiBold 9.6 label on a 13.5 line box, then a
 * 27.1-tall white field with a `border/soft` hairline. Figma draws the label
 * box 6pt above the component's own top edge; this renders from the label's
 * line box down, so place the control by the label, not by the field.
 *
 * v4 only draws the filled state, so the placeholder colour is `text/muted`
 * by choice, not from the design.
 */
export function TextInputField({ label, style, ...inputProps }: TextInputFieldProps) {
  return (
    <View>
      <Text
        style={{
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.body,
        }}
        className="font-plex-semibold">
        {label}
      </Text>
      <View
        style={{
          height: scale(27.077),
          marginTop: scale(2.5),
          borderRadius: scale(6.769),
          borderWidth: scale(0.564),
          borderColor: COLOR.border.soft,
          paddingHorizontal: scale(9.4),
          backgroundColor: COLOR.surface.card,
          boxShadow: SHADOW_V4,
          justifyContent: 'center',
        }}>
        <RNTextInput
          {...inputProps}
          placeholderTextColor={COLOR.text.muted}
          style={[{ fontSize: scale(6.769), color: COLOR.text.body, padding: 0 }, style]}
          className="font-plex"
        />
      </View>
    </View>
  );
}
