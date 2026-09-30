import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * One 오늘의 실천 row: open, or done — which greys the label, strikes it and
 * puts a check in its box. Local state only (see main-screen.tsx).
 *
 * v4 (`1363:2971`): open rows are `text/plum` beside a `surface/tint-2` box;
 * the done row is `text/body` beside a `#B3B3B3` box with a `#686868` `∨`
 * (`Group 1379`), and carries a 0.564pt `surface/track` strike.
 */
export type Action = { label: string; done: boolean };

/** Box tops step 21.435 down the card (9.59, 31.03, … 116.77). */
export const ROW_PITCH = 21.435;
const CHECKBOX_SIZE = 12.41;
/** Box at x 176 in a 197.436 card. */
const CHECKBOX_RIGHT = 197.436 - 176 - CHECKBOX_SIZE;
const CHECKBOX_DONE = '#B3B3B3';
const CHECK_STROKE = '#686868';
const LABEL_LEFT = 8.7;
const LABEL_LINE = 12.41;
/** v4 centres each label 6.3 below its box top — 0.1 below the box's own centre. */
const LABEL_TOP = 6.3 - LABEL_LINE / 2;
/**
 * The strike is drawn, not `textDecorationLine`: v4 draws it in `surface/track`,
 * a different colour from the label, and Android cannot colour a text
 * decoration. v4 puts it 0.18 below the label's line-box centre, from 0.33 in
 * to the end of the text — so it hangs off a box that is as wide as the text.
 * (The old 7pt Pretendard strike failed at the line box's middle because its
 * 15pt line box put the ink high; Plex at 12.41 sits centred, as v4 shows.)
 */
const STRIKE_TOP = LABEL_LINE / 2 + 0.18 - 0.282;

export function ActionRow({ action, onComplete }: { action: Action; onComplete: () => void }) {
  return (
    <View style={{ height: scale(ROW_PITCH) }}>
      <View
        style={{
          position: 'absolute',
          left: scale(LABEL_LEFT),
          top: scale(LABEL_TOP),
          maxWidth: scale(197.436 - CHECKBOX_RIGHT - CHECKBOX_SIZE - LABEL_LEFT - 4),
        }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: scale(8.462),
            lineHeight: scale(LABEL_LINE),
            color: action.done ? COLOR.text.body : COLOR.text.plum,
          }}
          className="font-plex">
          {action.label}
        </Text>
        <View
          style={{
            position: 'absolute',
            left: scale(0.33),
            right: 0,
            top: scale(STRIKE_TOP),
            height: scale(0.564),
            backgroundColor: COLOR.surface.track,
            boxShadow: SHADOW_V4,
            opacity: action.done ? 1 : 0,
          }}
        />
      </View>

      <Pressable
        onPress={action.done ? undefined : onComplete}
        disabled={action.done}
        hitSlop={scale(4)}
        style={{
          position: 'absolute',
          right: scale(CHECKBOX_RIGHT),
          top: 0,
          width: scale(CHECKBOX_SIZE),
          height: scale(CHECKBOX_SIZE),
          borderRadius: scale(2.885),
          backgroundColor: action.done ? CHECKBOX_DONE : COLOR.surface.tint2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Same tree in both states (rule 3) — the check is hidden, not unmounted. */}
        <Svg
          width={scale(5.129)}
          height={scale(4.087)}
          viewBox="0 0 5.12851 4.08664"
          style={{ opacity: action.done ? 1 : 0 }}>
          <Path
            d="M0.48082 0.48082L2.56415 3.60582"
            stroke={CHECK_STROKE}
            strokeWidth={0.961538}
            strokeLinecap="round"
          />
          <Path
            d="M4.64769 0.48082L2.56435 3.60582"
            stroke={CHECK_STROKE}
            strokeWidth={0.961538}
            strokeLinecap="round"
          />
        </Svg>
      </Pressable>
    </View>
  );
}
