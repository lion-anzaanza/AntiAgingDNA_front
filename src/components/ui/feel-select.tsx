import { Image, Pressable, Text, View } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

import { CARD_SURFACE, CARD_TITLE } from './select-card';

/**
 * Figma: `SelectFeel5` (197.44×77.06 in v4) — a labelled white card holding
 * the five-face 컨디션 scale. The 일지 screens use it for 오늘의 컨디션 and
 * 수면 만족도.
 *
 * The faces come from one Figma spritesheet; `assets/images/journal/feel-*.png`
 * are the five crops, taken from `rawImages` so they keep their alpha
 * (AGENTS.md #7). v4 still uses the same sheet — re-cropped and compared
 * 2026-09-30, identical artwork.
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

/**
 * The unanswered state. v4 has no `SelectFeel5_NeedAnswer` — the v1 variant
 * is kept for its behaviour (오늘의 기록 marks and scrolls to a blank 컨디션),
 * still in the pure `red` the old design wrote, on the v4 card geometry.
 */
const ALERT = '#FF0000';
const ALERT_BG = '#FFF9F9';

/** Card padding and the gaps of v4's auto layout. */
const PAD_X = 5.769;
const PAD_Y = 6.731;
const GAP = 6.731;

type FeelSelectProps = {
  label: string;
  value: FeelValue | null;
  onChange: (value: FeelValue) => void;
  /** Read-only replay of an earlier day's answer — selected colours, not pressable. */
  history?: boolean;
  /** Red-tinted card plus the prompt below it — see `ALERT`. */
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
        style={[
          CARD_SURFACE,
          {
            backgroundColor: needAnswer ? ALERT_BG : COLOR.surface.card,
            borderWidth: needAnswer ? scale(0.3) : 0,
            borderColor: ALERT,
            paddingHorizontal: scale(PAD_X),
            paddingVertical: scale(PAD_Y),
            gap: scale(GAP),
          },
        ]}>
        <Text style={CARD_TITLE} className="font-plex-semibold">
          {label}
        </Text>
        <View style={{ flexDirection: 'row', gap: scale(5.769) }}>
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
            fontSize: scale(6.769),
            lineHeight: scale(9.026),
            marginTop: scale(1),
            color: ALERT,
            textAlign: 'right',
          }}
          className="font-plex">
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

/** `VeryBad`…`VeryGood`: 42.87 tall, face 16.92 at 6.77 from the top. */
function FeelButton({ label, face, selected, history, onPress }: FeelButtonProps) {
  // Same element tree every render — only style values change (AGENTS.md #3).
  // The selected face is the one v4 pill that carries the ambient shadow.
  return (
    <Pressable
      onPress={onPress}
      disabled={history}
      style={{
        flex: 1,
        height: scale(42.872),
        borderRadius: scale(4.808),
        alignItems: 'center',
        paddingTop: scale(6.77),
        backgroundColor: selected ? COLOR.brand.selected : COLOR.surface.chip,
        boxShadow: selected ? SHADOW_V4 : 'none',
      }}>
      <Image source={face} style={{ width: scale(16.92), height: scale(16.92) }} resizeMode="contain" />
      <Text
        numberOfLines={1}
        // At 1.0 this is Figma's size; at a phone's 1.1 font scale it shrinks
        // rather than truncating in its fixed-width cell (AGENTS rule 14).
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          marginTop: scale(4.45),
          color: selected ? COLOR.text.onPastel : COLOR.text.body,
        }}
        className="font-plex-semibold">
        {label}
      </Text>
    </Pressable>
  );
}
