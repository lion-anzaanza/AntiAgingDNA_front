import { Pressable, Text, View } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

import { CARD_INSET, CARD_SURFACE, CARD_TITLE, CARD_TITLE_INSET } from './select-card';

/**
 * Figma: `InputTime_Card` (197.44×57.69 in v4) — a start/end time pair with a
 * duration badge in the corner. 일지 uses it for 취침 · 기상 시각.
 *
 * There is no picker behind it yet; like the rest of the app the fields are
 * display-only and the screen decides what tapping one does.
 */
type InputTimeCardProps = {
  label: string;
  startLabel: string;
  endLabel: string;
  /** Preformatted, e.g. `오전 00:00` — this component does no time maths. */
  start: string;
  end: string;
  /** The corner badge, e.g. `7시간 20분`. Hidden when absent. */
  duration?: string;
  onPressStart?: () => void;
  onPressEnd?: () => void;
};

/** The gap between the two fields, which the `→` sits centred in. */
const ARROW_WIDTH = 27.82;

export function InputTimeCard({
  label,
  startLabel,
  endLabel,
  start,
  end,
  duration,
  onPressStart,
  onPressEnd,
}: InputTimeCardProps) {
  return (
    <View
      style={[
        CARD_SURFACE,
        { paddingTop: scale(4.08), paddingBottom: scale(6.96), paddingHorizontal: scale(CARD_INSET) },
      ]}>
      <Text
        style={[CARD_TITLE, { marginLeft: scale(CARD_TITLE_INSET - CARD_INSET) }]}
        className="font-plex-semibold">
        {label}
      </Text>
      {duration ? (
        // Figma places the badge on its own, 0.7pt lower than the title's
        // centre, so it is absolute rather than a flex sibling (rule 14).
        <View
          style={{
            position: 'absolute',
            top: scale(6.73),
            right: scale(CARD_INSET),
            height: scale(9.615),
            borderRadius: scale(9.615),
            paddingHorizontal: scale(1),
            backgroundColor: COLOR.surface.tint2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.brand.violetText }}
            className="font-plex-semibold">
            {duration}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', marginTop: scale(4.28) }}>
        <FieldLabel>{startLabel}</FieldLabel>
        <View style={{ width: scale(ARROW_WIDTH) }} />
        <FieldLabel>{endLabel}</FieldLabel>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(1.53) }}>
        <TimeField value={start} onPress={onPressStart} />
        <Text
          style={{
            width: scale(ARROW_WIDTH),
            fontSize: scale(9.026),
            lineHeight: scale(9.026),
            textAlign: 'center',
            color: COLOR.text.body,
          }}
          className="font-pretendard-light">
          →
        </Text>
        <TimeField value={end} onPress={onPressEnd} />
      </View>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{ flex: 1, fontSize: scale(6.769), lineHeight: scale(9.026), color: COLOR.text.body }}
      className="font-plex">
      {children}
    </Text>
  );
}

function TimeField({ value, onPress }: { value: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: scale(18.27),
        borderRadius: scale(4.808),
        borderWidth: scale(0.673),
        borderColor: COLOR.border.soft,
        backgroundColor: COLOR.surface.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.text.strong }}
        className="font-plex-semibold">
        {value}
      </Text>
    </Pressable>
  );
}
