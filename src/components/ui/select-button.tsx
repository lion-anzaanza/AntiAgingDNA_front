import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { GRADIENT_BRAND, GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma ships five sizes of select pill (SelectButton1…5), each in a grey and a
 * white flavour. They differ only in height, text size, whether the resting
 * state carries a shadow, and — for level 4 — which gradient the active state
 * uses. Everything else is shared.
 */
export type SelectButtonLevel = 1 | 2 | 3 | 4 | 5;
export type SelectButtonTone = 'gray' | 'white';

/**
 * `history` is the read-only rendering the 일지 screens use to show an answer
 * that was recorded on an earlier day: slate fill, no press target. It exists
 * on all five grey levels; the white tone only has active/inactive.
 */
export type SelectButtonState = 'inactive' | 'active' | 'history';

const HISTORY_BG = '#7786A8';
const HISTORY_TEXT = '#F7F8FA';

const HEIGHT: Record<SelectButtonLevel, number> = { 1: 19, 2: 17, 3: 16, 4: 15, 5: 14 };
const FONT_SIZE: Record<SelectButtonLevel, number> = { 1: 6, 2: 6, 3: 6, 4: 5, 5: 5 };
/** Only SelectButton3 and SelectButton4 keep their shadow while unselected. */
const RESTING_SHADOW: Record<SelectButtonLevel, boolean> = {
  1: false,
  2: false,
  3: true,
  4: true,
  5: false,
};
const TONE_BG: Record<SelectButtonTone, string> = { gray: '#F2F2F0', white: '#FFFFFF' };

type SelectButtonProps = {
  label: string;
  state: SelectButtonState;
  /** Omitted in the `history` state, which is not pressable. */
  onPress?: () => void;
  level?: SelectButtonLevel;
  tone?: SelectButtonTone;
  style?: StyleProp<ViewStyle>;
};

export function SelectButton({
  label,
  state,
  onPress,
  level = 2,
  tone = 'white',
  style,
}: SelectButtonProps) {
  const active = state === 'active';
  const history = state === 'history';
  const gradient = level === 4 ? GRADIENT_BRAND : GRADIENT_SELECT;

  // One element type every render — swapping the tree or a className remounts
  // the subtree mid-press and corrupts the navigation context (AGENTS.md #3).
  // A solid fill is just a gradient whose two stops are the same colour.
  const fill: [string, string] = active
    ? [...gradient]
    : history
      ? [HISTORY_BG, HISTORY_BG]
      : [TONE_BG[tone], TONE_BG[tone]];

  return (
    <Pressable
      onPress={onPress}
      disabled={history}
      style={[
        {
          height: scale(HEIGHT[level]),
          borderRadius: scale(5),
          boxShadow: active || history || RESTING_SHADOW[level] ? SHADOW : 'none',
        },
        style,
      ]}>
      <LinearGradient
        colors={fill}
        locations={active && level !== 4 ? [...GRADIENT_SELECT_STOPS] : undefined}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: scale(4),
          borderRadius: scale(5),
        }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: scale(FONT_SIZE[level]),
            lineHeight: scale(8),
            color: active ? '#FFFFFF' : history ? HISTORY_TEXT : '#5F5E5B',
          }}
          className="font-pretendard-medium">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
