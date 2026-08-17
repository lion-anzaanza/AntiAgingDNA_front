import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View } from 'react-native';

import { GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/** Every SelectItem*_Card / SelectFeel5 instance in Figma is 182pt wide. */
const CARD_WIDTH = 182;

/**
 * Figma: `SelectFeel5` (182×66) and `SelectFeel5_NeedAnswer` (182×76) — a
 * labelled white card holding the five-face 컨디션 scale. The 일지 screens use
 * it for 오늘의 컨디션 and 수면 만족도.
 *
 * The faces come from one Figma spritesheet; `assets/images/journal/feel-*.png`
 * are the five crops, taken from `rawImages` so they keep their alpha
 * (AGENTS.md #7 — a plain node export would bake the canvas colour in, and
 * these sit on a gradient when active).
 */
export type FeelValue = 1 | 2 | 3 | 4 | 5;

/** 1–5 → 매우나쁨…매우좋음, indexed by `value - 1`. */
export const FEEL_LABELS = ['매우나쁨', '나쁨', '보통', '좋음', '매우좋음'] as const;

const FEELS: { value: FeelValue; label: string; face: number }[] = [
  { value: 1, label: FEEL_LABELS[0], face: require('@/assets/images/journal/feel-very-bad.png') },
  { value: 2, label: FEEL_LABELS[1], face: require('@/assets/images/journal/feel-bad.png') },
  { value: 3, label: FEEL_LABELS[2], face: require('@/assets/images/journal/feel-normal.png') },
  { value: 4, label: FEEL_LABELS[3], face: require('@/assets/images/journal/feel-good.png') },
  { value: 5, label: FEEL_LABELS[4], face: require('@/assets/images/journal/feel-very-good.png') },
];

/** Matches the `SelectButton*_History` slate; only the text differs (#F1F1F1 vs #F7F8FA). */
const HISTORY_BG = '#7786A8';
const HISTORY_TEXT = '#F1F1F1';
const INACTIVE_BG = '#F2F2F0';

/** Figma writes the unanswered state as pure `red` on a `#FFF9F9` card. */
const ALERT = '#FF0000';
const ALERT_BG = '#FFF9F9';

type FeelSelectProps = {
  label: string;
  value: FeelValue | null;
  onChange: (value: FeelValue) => void;
  /** Read-only replay of an earlier day's answer. */
  history?: boolean;
  /** Renders `SelectFeel5_NeedAnswer`: red-tinted card plus the prompt below it. */
  needAnswer?: boolean;
};

export function FeelSelect({
  label,
  value,
  onChange,
  history = false,
  needAnswer = false,
}: FeelSelectProps) {
  return (
    <View>
      <View
        style={{
          width: scale(CARD_WIDTH),
          borderRadius: scale(10),
          backgroundColor: needAnswer ? ALERT_BG : '#FFFFFF',
          borderWidth: needAnswer ? scale(0.3) : 0,
          borderColor: ALERT,
          boxShadow: SHADOW,
          paddingTop: scale(4.5),
          paddingBottom: scale(9),
        }}>
        <Text
          style={{
            fontSize: scale(8),
            lineHeight: scale(15),
            marginLeft: scale(12),
            color: '#00352C',
          }}
          className="font-pretendard-bold">
          {label}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // Figma insets the row 12 on the left but only 8 on the right.
            paddingLeft: scale(12),
            paddingRight: scale(8),
            marginTop: scale(4.5),
          }}>
          {FEELS.map((feel) => (
            <FeelButton
              key={feel.value}
              {...feel}
              selected={feel.value === value}
              history={history}
              onPress={() => onChange(feel.value)}
            />
          ))}
        </View>
      </View>
      {needAnswer ? (
        <Text
          style={{
            fontSize: scale(5),
            lineHeight: scale(8),
            marginTop: scale(1),
            color: ALERT,
            textAlign: 'right',
          }}
          className="font-pretendard">
          아직 응답하지 않았어요
        </Text>
      ) : null}
    </View>
  );
}

type FeelButtonProps = {
  label: string;
  face: number;
  selected: boolean;
  history: boolean;
  onPress: () => void;
};

function FeelButton({ label, face, selected, history, onPress }: FeelButtonProps) {
  const active = selected && !history;
  const past = selected && history;

  // Same element tree every render — only the gradient's colours change
  // (AGENTS.md #3). A solid fill is two identical stops.
  const fill: [string, string] = active
    ? [...GRADIENT_SELECT]
    : past
      ? [HISTORY_BG, HISTORY_BG]
      : [INACTIVE_BG, INACTIVE_BG];

  return (
    <Pressable
      onPress={onPress}
      disabled={history}
      style={{ width: scale(28), height: scale(33), borderRadius: scale(5), boxShadow: SHADOW }}>
      <LinearGradient
        colors={fill}
        locations={active ? [...GRADIENT_SELECT_STOPS] : undefined}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, alignItems: 'center', paddingTop: scale(5), borderRadius: scale(5) }}>
        <Image
          source={face}
          style={{ width: scale(16), height: scale(16) }}
          resizeMode="contain"
        />
        <Text
          numberOfLines={1}
          style={{
            fontSize: scale(6),
            lineHeight: scale(8),
            marginTop: scale(1),
            color: active ? '#FFFFFF' : past ? HISTORY_TEXT : '#5F5E5B',
          }}
          className="font-pretendard-medium">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
