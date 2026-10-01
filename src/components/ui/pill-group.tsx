import { Text, View } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

import { CARD_TITLE } from './select-card';
import { SelectButton, type SelectButtonState } from './select-button';

/**
 * The SelectItem family on 회원가입/2 (`SelectItem3_1`, `4_1`, `4_2`, `5_1`): a
 * SemiBold question over a grid of `signup`-size pills.
 *
 * v4 draws every one of them 179.385 wide with the pills flush to both edges
 * and a 4.513 gap across and down, so the pill width follows from the column
 * count alone. The white card each group sits in (`카드/…`, 9.03 inset) belongs
 * to the screen, not to this component.
 */
const CONTENT_WIDTH = 179.385;
const GAP = 4.513;
/** Question → pills. */
const LABEL_GAP = 6.769;

function pillWidth(columns: number) {
  return (CONTENT_WIDTH - GAP * (columns - 1)) / columns;
}

function rowsOf(options: string[], columns: number) {
  const rows: string[][] = [];
  for (let i = 0; i < options.length; i += columns) rows.push(options.slice(i, i + columns));
  return rows;
}

type PillGroupProps = {
  label?: string;
  /** A second line under the question (평소 운동량의 "중강도 기준으로 답해주세요"). */
  caption?: string;
  options: string[];
  columns?: 1 | 2 | 3 | 4;
  /** Question → pills, when a card draws it tighter than the family's 6.77. */
  labelGap?: number;
  /** Read-only replay of an earlier answer — see `SelectButtonState`. */
  history?: boolean;
} & (
  | { multiple?: false; value: string | null; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
);

export function PillGroup(props: PillGroupProps) {
  const {
    label,
    caption,
    options,
    columns = 2,
    labelGap = LABEL_GAP,
    history = false,
  } = props;
  const width = scale(pillWidth(columns));

  function isSelected(option: string) {
    return props.multiple ? props.value.includes(option) : option === props.value;
  }

  function stateOf(option: string): SelectButtonState {
    if (!isSelected(option)) return 'inactive';
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
    <View style={{ width: scale(CONTENT_WIDTH) }}>
      {label ? (
        <Text style={CARD_TITLE} className="font-plex-semibold">
          {label}
        </Text>
      ) : null}
      {caption ? (
        // v4 lets the caption's line box ride 2.2pt up into the question's.
        <Text
          style={{
            fontSize: scale(8.462),
            lineHeight: scale(12.41),
            marginTop: scale(-2.22),
            color: COLOR.text.body,
          }}
          className="font-plex">
          {caption}
        </Text>
      ) : null}
      {/*
        Explicit rows rather than flexWrap: the pills fill the row exactly, and
        a rounding hair over the width would wrap the last one onto its own row.
        */}
      <View style={{ gap: scale(GAP), marginTop: label ? scale(caption ? 3.69 : labelGap) : 0 }}>
        {rowsOf(options, columns).map((row) => (
          <View key={row[0]} style={{ flexDirection: 'row', gap: scale(GAP) }}>
            {row.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={stateOf(option)}
                onPress={() => handlePress(option)}
                size="signup"
                style={{ width }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
