import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { scale } from '@/lib/scale';

/**
 * A row is either still open or done, which greys and strikes the label and
 * puts a check in its box.
 *
 * Figma replaced the old `#E9F0FF` 완료! pill with a plain 13×13 checkbox
 * (`Rectangle 3091`–`3795`, re-pulled 2026-08-17): pale `#F2E4FF` while open,
 * grey `#B3B3B3` with a `∨` once done.
 */
export type Action = { label: string; done: boolean };

/** Row pitch inside the 오늘의 실천 card, measured off the boxes. */
const ROW_PITCH = 20;

/** `Rectangle 3091` sits at x=172, 13×13, inside a card that ends at 202. */
const CHECKBOX_SIZE = 13;
const CHECKBOX_RIGHT = 202 - 172 - CHECKBOX_SIZE;
const CHECKBOX_OPEN = '#F2E4FF';
const CHECKBOX_DONE = '#B3B3B3';
const CHECK_STROKE = '#686868';

export function ActionRow({ action, onComplete }: { action: Action; onComplete: () => void }) {
  return (
    <View style={{ height: scale(ROW_PITCH), flexDirection: 'row', alignItems: 'center' }}>
      <Text
        style={{
          marginLeft: scale(20),
          flexShrink: 1,
          fontSize: scale(7),
          lineHeight: scale(15),
          color: action.done ? '#B4B2A8' : '#2C2C2A',
          /*
           * The strike used to be a hand-drawn 0.5pt View at `top: '50%'` of the
           * label box, which landed *under* the glyphs rather than through them:
           * with `lineHeight` 15 on a 7pt font the ink sits in the upper part of
           * the line box, so the box's geometric middle is below the text and it
           * read as an underline. `textDecorationLine` is positioned from the
           * font's own metrics, so it cannot drift.
           */
          textDecorationLine: action.done ? 'line-through' : 'none',
        }}
        className="font-pretendard-medium">
        {action.label}
      </Text>

      <Pressable
        onPress={action.done ? undefined : onComplete}
        disabled={action.done}
        style={{
          marginLeft: 'auto',
          marginRight: scale(CHECKBOX_RIGHT),
          width: scale(CHECKBOX_SIZE),
          height: scale(CHECKBOX_SIZE),
          borderRadius: scale(3),
          backgroundColor: action.done ? CHECKBOX_DONE : CHECKBOX_OPEN,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {action.done ? (
          <Svg width={scale(4.33)} height={scale(3.25)} viewBox="0 0 5.33 4.25">
            <Path d="M0.5 0.5L2.667 3.75" stroke={CHECK_STROKE} strokeLinecap="round" />
            <Path d="M4.833 0.5L2.667 3.75" stroke={CHECK_STROKE} strokeLinecap="round" />
          </Svg>
        ) : null}
      </Pressable>
    </View>
  );
}
