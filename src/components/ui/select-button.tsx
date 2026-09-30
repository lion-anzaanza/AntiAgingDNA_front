import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * v4 draws the select pill (`SelectButton1…5`, `_White`) in one colour scheme
 * everywhere — `surface/chip` at rest, `brand/selected` with `text/on-pastel`
 * when chosen — so the old level number and grey/white tone no longer change
 * anything; the width comes from the container. What does change is the
 * **context**, and it does so consistently:
 *
 * - `journal` — every pill inside a 일지 card: 18.05 tall, radius 4.81.
 * - `signup` — 회원가입/2's questions: 24.82 tall, radius 5.64.
 * - `likert` — 회원가입/2's 0–5 WHO-5 row: 14 tall with a larger 8.46 digit.
 */
export type SelectButtonSize = 'journal' | 'signup' | 'likert';

/**
 * `history` is the read-only replay of an earlier day's answer. v4 dropped the
 * old slate colour for it — 상세보기 draws the recorded answer exactly like a
 * selected pill — so it only differs from `active` by not being pressable.
 */
export type SelectButtonState = 'inactive' | 'active' | 'history';

const SIZE: Record<
  SelectButtonSize,
  { height: number; radius: number; fontSize: number; lineHeight: number }
> = {
  journal: { height: 18.051, radius: 4.808, fontSize: 7.333, lineHeight: 10.154 },
  signup: { height: 24.821, radius: 5.641, fontSize: 7.333, lineHeight: 10.154 },
  likert: { height: 14, radius: 5.641, fontSize: 8.462, lineHeight: 11.282 },
};

type SelectButtonProps = {
  label: string;
  state: SelectButtonState;
  /** Omitted in the `history` state, which is not pressable. */
  onPress?: () => void;
  size?: SelectButtonSize;
  style?: StyleProp<ViewStyle>;
};

export function SelectButton({
  label,
  state,
  onPress,
  size = 'journal',
  style,
}: SelectButtonProps) {
  const selected = state !== 'inactive';
  const { height, radius, fontSize, lineHeight } = SIZE[size];

  // Same element tree every render; only style values change (AGENTS.md #3).
  return (
    <Pressable
      onPress={onPress}
      disabled={state === 'history'}
      style={[
        {
          height: scale(height),
          borderRadius: scale(radius),
          backgroundColor: selected ? COLOR.brand.selected : COLOR.surface.chip,
          alignItems: 'center',
          justifyContent: 'center',
          // No inner padding: v4 puts "10시간 이상" (37pt) in a 41.46 pill.
          paddingHorizontal: 0,
        },
        style,
      ]}>
      <Text
        numberOfLines={1}
        // At 1.0 this is Figma's size; at a phone's 1.1 font scale it shrinks
        // rather than truncating in its fixed-width cell (AGENTS rule 14).
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          fontSize: scale(fontSize),
          lineHeight: scale(lineHeight),
          color: selected ? COLOR.text.onPastel : COLOR.text.body,
          textAlign: 'center',
        }}
        className="font-plex-semibold">
        {label}
      </Text>
    </Pressable>
  );
}
