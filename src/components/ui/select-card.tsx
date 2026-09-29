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
 * the row equally with a 4.51 gap and a 9.03 inset. The card is as wide as the
 * screen's column (197.44 in every v4 instance), so it fills its parent.
 */
type SelectCardProps = {
  label: string;
  caption?: string;
  options: string[];
  /** Read-only replay of an earlier day's answer — see `SelectButtonState`. */
  history?: boolean;
} & (
  | { multiple?: false; value: string | null; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
);

export function SelectCard(props: SelectCardProps) {
  const { label, caption, options, history = false } = props;

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
    <View style={[CARD_SURFACE, { paddingTop: scale(5.54), paddingBottom: scale(9.03) }]}>
      <Text style={[CARD_TITLE, { marginLeft: scale(CARD_TITLE_INSET) }]} className="font-plex-semibold">
        {label}
      </Text>
      {caption ? (
        <Text
          style={{
            fontSize: scale(6.769),
            lineHeight: scale(9.026),
            // The caption's line box tucks ~1pt under the title's.
            marginTop: scale(-0.96),
            marginLeft: scale(8.6),
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
          marginTop: scale(caption ? 4.89 : 4.45),
        }}>
        {options.map((option) => (
          <SelectButton
            key={option}
            label={option}
            state={stateOf(option)}
            onPress={() => handlePress(option)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </View>
  );
}
