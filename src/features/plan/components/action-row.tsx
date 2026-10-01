import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * One 오늘의 실천 row: open, or done — which greys the label, strikes it and
 * puts a check in its box. Local state only (see main-screen.tsx).
 *
 * v3 (`1318:1601`): open rows are `text/plum` beside a 24pt `surface/chip` box
 * with a 1.5 `border/soft` edge; the done row is Gray 400 `#88877F`, struck in
 * Gray 600 `#5F5E5B`, beside a borderless `brand/selected` box carrying an
 * `on-pastel` `∨` (`Group 1379`). v4's grey box and grey check are gone.
 */
export type Action = { label: string; done: boolean };

/** v3 steps the boxes 48 apart (27.077 at 220). */
const ROW_PITCH = 27.077;
/** 24pt box with a 1.5 border, 8 radius, at x 311 of a 350 card. */
const CHECKBOX_SIZE = 13.538;
const CHECKBOX_RIGHT = 197.436 - 175.436 - CHECKBOX_SIZE;
const LABEL_DONE = '#88877F';
const STRIKE = '#5F5E5B';
const LABEL_LEFT = 8.7;
const LABEL_LINE = 12.41;
/** v3 centres each label on its box. */
const LABEL_TOP = (CHECKBOX_SIZE - LABEL_LINE) / 2;
/**
 * The strike is drawn, not `textDecorationLine`: v3 draws it in Gray 600, a
 * different colour from the label, and Android cannot colour a text decoration.
 * v3 puts its 1pt line on the label's line-box centre, from 0.57 in to the end
 * of the text — so it hangs off a box that is as wide as the text.
 */
const STRIKE_HEIGHT = 0.564;
const STRIKE_TOP = LABEL_LINE / 2 - STRIKE_HEIGHT / 2;

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
            color: action.done ? LABEL_DONE : COLOR.text.plum,
          }}
          className="font-plex">
          {action.label}
        </Text>
        <View
          style={{
            position: 'absolute',
            left: scale(0.32),
            right: 0,
            top: scale(STRIKE_TOP),
            height: scale(STRIKE_HEIGHT),
            backgroundColor: STRIKE,
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
          borderRadius: scale(4.513),
          // Same width in both states so the box never changes size; the done
          // box only hides its edge.
          borderWidth: scale(0.846),
          borderColor: action.done ? 'transparent' : COLOR.border.soft,
          backgroundColor: action.done ? COLOR.brand.selected : COLOR.surface.chip,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Same tree in both states (rule 3) — the check is hidden, not unmounted. */}
        {/* Figma's export box: the 7.39 × 5.54 check plus half a stroke on every side for the round caps. */}
        <Svg
          width={scale(5.129)}
          height={scale(4.087)}
          viewBox="-0.852 -0.852 9.092 7.245"
          style={{ opacity: action.done ? 1 : 0 }}>
          <Path
            d="M0 0L3.693 5.54M7.387 0L3.694 5.54"
            stroke={COLOR.text.onPastel}
            strokeWidth={1.70455}
            strokeLinecap="round"
          />
        </Svg>
      </Pressable>
    </View>
  );
}
