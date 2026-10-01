import { Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

import { SelectButton, type SelectButtonState } from './select-button';

/**
 * The question every v4 selection card and group leads with: IBM Plex SemiBold
 * 9.59 on a 13.54 line, `text/heading`. Shared by the whole family.
 */
export const CARD_TITLE: TextStyle = {
  fontSize: scale(9.59),
  lineHeight: scale(13.538),
  letterSpacing: scale(-0.0959),
  color: COLOR.text.heading,
};

/** The white v4 card behind `SelectItem*_Card`, `SelectFeel5`, `Select0To10_Card`, `InputTime_Card`. */
export const CARD_SURFACE: ViewStyle = {
  borderRadius: scale(9.615),
  backgroundColor: COLOR.surface.card,
  boxShadow: SHADOW_V4,
};

/** v3's card rhythm: the title's line 6.31 down, the row 3.76 below it. */
export const CARD_PAD_TOP = 6.31;
export const ROW_UNDER_TITLE = 3.76;
/**
 * A caption's line box tucks under the title's; the row follows 4.38 below. v3's
 * line boxes say −1.22, but on Android the 6.77 Plex ink then lands 0.6 lower
 * than Figma's under its title, and every caption section comes out that much
 * long (the caffeine card, with two, drifted 1.3). −1.82 puts the ink back.
 */
export const CAPTION_TUCK = -1.82;
export const ROW_UNDER_CAPTION = 4.38;

/** A pill's share of its row: a v3 width when the row gives one, else equal. */
export function pillWidth(widths: readonly number[] | undefined, index: number): ViewStyle {
  return widths ? { width: scale(widths[index]), flexShrink: 1 } : { flex: 1 };
}

/** Where the title's text starts inside a card. */
export const CARD_TITLE_INSET = 8.71;
/** Where the pills (and most card content) start, left and right. */
export const CARD_INSET = 9.03;

/**
 * Figma's `SelectItem{3,4,6}[_Caption]_Card` family: a white card holding a
 * question, an optional caption line, and one row of `journal` pills. The 일지
 * screens are built almost entirely out of these.
 *
 * v4 made the three row geometries one: whether 3, 4 or 6 pills, they share
 * the row with a 4.51 gap and a 9.03 inset. The card is as wide as the screen's
 * column (197.44 in every instance), so it fills its parent.
 *
 * v3 (2026-10-01): title line 6.31 from the top, the row 3.76 under it (4.38
 * under a caption, which tucks under the title — see `CAPTION_TUCK`), pills 22.56. Some rows are
 * no longer even — v3 gives the pills of 잠들기까지, 식사 횟수, 걸은 시간 and the
 * like widths that follow their labels, identically on 오늘의기록 and 상세보기 —
 * so a card may pass `widths`; otherwise the row is shared equally.
 */
type SelectCardProps = {
  label: string;
  caption?: string;
  options: string[];
  /** Read-only replay of an earlier day's answer — see `SelectButtonState`. */
  history?: boolean;
  /** Per-pill widths in Figma points, summing to the 179.385 row with its gaps. */
  widths?: readonly number[];
} & (
  | { multiple?: false; value: string | null; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
);

export function SelectCard(props: SelectCardProps) {
  const { label, caption, options, history = false, widths } = props;

  function stateOf(option: string): SelectButtonState {
    const selected = props.multiple ? props.value.includes(option) : option === props.value;
    if (!selected) return 'inactive';
    return history ? 'history' : 'active';
  }

  function handlePress(option: string) {
    if (props.multiple) {
      props.onChange(
        props.value.includes(option)
          ? props.value.filter((v) => v !== option)
          : [...props.value, option],
      );
    } else {
      props.onChange(option);
    }
  }

  return (
    <View style={[CARD_SURFACE, { paddingTop: scale(CARD_PAD_TOP), paddingBottom: scale(9.03) }]}>
      <Text style={[CARD_TITLE, { marginLeft: scale(CARD_TITLE_INSET) }]} className="font-plex-semibold">
        {label}
      </Text>
      {caption ? (
        <Text
          style={{
            fontSize: scale(6.769),
            lineHeight: scale(9.026),
            // The caption's line box tucks under the title's (`CAPTION_TUCK`).
            marginTop: scale(CAPTION_TUCK),
            marginLeft: scale(8.5),
            color: COLOR.text.body,
          }}
          className="font-plex">
          {caption}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          gap: scale(4.513),
          paddingHorizontal: scale(CARD_INSET),
          marginTop: scale(caption ? ROW_UNDER_CAPTION : ROW_UNDER_TITLE),
        }}>
        {options.map((option, index) => (
          <SelectButton
            key={option}
            label={option}
            state={stateOf(option)}
            onPress={() => handlePress(option)}
            style={pillWidth(widths, index)}
          />
        ))}
      </View>
    </View>
  );
}
