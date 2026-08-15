import { Text, View } from 'react-native';

import { scale } from '@/lib/scale';
import {
  SelectButton,
  type SelectButtonLevel,
  type SelectButtonState,
  type SelectButtonTone,
} from './select-button';

/**
 * The SelectItem family from Figma: a Bold label over a grid of select pills.
 * Figma insets the pills 12pt from the item's edges and sizes them so the row
 * exactly fills the rest, which is what the tables below encode.
 *
 * **The content column is not the same width on every screen.** 회원가입/2 places
 * its SelectItems at x=17 w=186, but 회원가입/1 places 성별 at x=18 w=172 — so
 * the pill width follows from the container, not from a global constant. Pass
 * `contentWidth` when a screen departs from 186; the pills come out at Figma's
 * width either way (186 → 75pt at 2 columns, 184 → 48pt at 3).
 */
const DEFAULT_CONTENT_WIDTH = 186;
const INNER_INSET = 12;
const COLUMN_GAP: Record<number, number> = { 1: 0, 2: 12, 3: 8, 4: 5 };
const ROW_GAP = 6;

function pillWidth(columns: number, contentWidth: number) {
  const gap = COLUMN_GAP[columns] ?? 6;
  return (contentWidth - INNER_INSET * 2 - gap * (columns - 1)) / columns;
}

/**
 * Figma labels these groups two ways: SelectItem3_1/4/5_1 head a section with a
 * 10pt Bold heading, while SelectItem3_2/5_2 sit in a form and reuse the small
 * grey field label that 닉네임 and 생년월일 use.
 */
type LabelTone = 'section' | 'field';

const LABEL_STYLE: Record<LabelTone, { fontSize: number; lineHeight: number; color: string }> = {
  section: { fontSize: 10, lineHeight: 14, color: '#00352C' },
  field: { fontSize: 7, lineHeight: 10, color: '#88877F' },
};
const LABEL_GAP: Record<LabelTone, number> = { section: 4, field: 0 };

type PillGroupProps = {
  label?: string;
  labelTone?: LabelTone;
  caption?: string;
  options: string[];
  columns?: 1 | 2 | 3 | 4;
  /** Width of the column this group sits in, when it is not Figma's usual 186. */
  contentWidth?: number;
  level?: SelectButtonLevel;
  tone?: SelectButtonTone;
  /** Read-only replay of an earlier day's answer — see `SelectButtonState`. */
  history?: boolean;
} & (
  | { multiple?: false; value: string | null; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
);

export function PillGroup(props: PillGroupProps) {
  const {
    label,
    labelTone = 'section',
    caption,
    options,
    columns = 2,
    contentWidth = DEFAULT_CONTENT_WIDTH,
    level = 2,
    tone = 'white',
    history = false,
  } = props;
  const width = scale(pillWidth(columns, contentWidth));
  const labelStyle = LABEL_STYLE[labelTone];

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
    <View>
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6) }}>
          <Text
            style={{
              fontSize: scale(labelStyle.fontSize),
              lineHeight: scale(labelStyle.lineHeight),
              color: labelStyle.color,
            }}
            className="font-pretendard-bold">
            {label}
          </Text>
          {caption ? (
            <Text
              style={{ fontSize: scale(5), lineHeight: scale(8), color: '#88877F' }}
              className="font-pretendard-medium">
              {caption}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: scale(COLUMN_GAP[columns] ?? 6),
          rowGap: scale(ROW_GAP),
          paddingHorizontal: scale(INNER_INSET),
          marginTop: label ? scale(LABEL_GAP[labelTone]) : 0,
        }}>
        {options.map((option) => (
          <SelectButton
            key={option}
            label={option}
            state={stateOf(option)}
            onPress={() => handlePress(option)}
            level={level}
            tone={tone}
            style={{ width }}
          />
        ))}
      </View>
    </View>
  );
}
