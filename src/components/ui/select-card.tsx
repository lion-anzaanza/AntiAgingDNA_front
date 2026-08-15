import { Text, View } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

import { SelectButton, type SelectButtonLevel, type SelectButtonState } from './select-button';

/** Every SelectItem*_Card / SelectFeel5 instance in Figma is 182pt wide. */
const CARD_WIDTH = 182;

/**
 * Figma's `SelectItem{3,4,6}[_Caption]_Card` family: a 182pt white card holding
 * a Bold label, an optional grey caption line, and one row of pills. The 일지
 * screens are built almost entirely out of these.
 *
 * This is the carded sibling of `PillGroup`, which is the same idea without the
 * card and wraps onto several rows. They keep separate geometry because Figma
 * gives them different content widths (182 vs 186) and insets.
 *
 * Pill count picks the whole row geometry — Figma only draws 3, 4 and 6.
 */
type Columns = 3 | 4 | 6;

const PILL: Record<Columns, { level: SelectButtonLevel; gap: number; inset: number }> = {
  3: { level: 2, gap: 8, inset: 11 },
  4: { level: 3, gap: 5, inset: 9.5 },
  6: { level: 5, gap: 4, inset: 9 },
};

/** Distance from the caption's baseline box down to the pill row. */
const GAP_ABOVE_PILLS: Record<Columns, number> = { 3: 1.5, 4: 1.5, 6: 2.5 };
const PAD_BOTTOM: Record<Columns, number> = { 3: 7, 4: 8, 6: 9 };

/**
 * `SelectItem4_Card` is the only captionless member, and Figma draws it a point
 * tighter top and bottom than the captioned ones, so it gets its own numbers.
 */
const NO_CAPTION = { paddingTop: 5.5, gapAbovePills: 2.5, paddingBottom: 7 };

function columnsFor(count: number): Columns {
  return count === 3 || count === 6 ? count : 4;
}

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
  const columns = columnsFor(options.length);
  const { level, gap, inset } = PILL[columns];

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
    <View
      style={{
        // Figma draws every card in this family 182 wide; the 일지 screens' own
        // column is 184, so filling the parent made each card 2pt too wide.
        width: scale(CARD_WIDTH),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(caption ? 4.5 : NO_CAPTION.paddingTop),
        paddingBottom: scale(caption ? PAD_BOTTOM[columns] : NO_CAPTION.paddingBottom),
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
      {caption ? (
        <Text
          style={{
            fontSize: scale(5),
            lineHeight: scale(8),
            marginTop: scale(-1),
            marginLeft: scale(12),
            color: '#88877F',
          }}
          className="font-pretendard">
          {caption}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          gap: scale(gap),
          paddingHorizontal: scale(inset),
          marginTop: scale(caption ? GAP_ABOVE_PILLS[columns] : NO_CAPTION.gapAbovePills),
        }}>
        {options.map((option) => (
          <SelectButton
            key={option}
            label={option}
            state={stateOf(option)}
            onPress={() => handlePress(option)}
            level={level}
            tone="gray"
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </View>
  );
}
