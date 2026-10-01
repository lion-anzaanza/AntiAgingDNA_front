import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';

import { COLOR, GRADIENT_PASTEL } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v3: a `Chip` in 일지/캘린더's `Chip Row`s (`1316:1911`) — one day, tinted by that
 * day's score. `none` is a day with no entry at all, which is why it is a
 * separate level rather than a fourth colour: v3 draws it white, on the white
 * card, so only the number shows. v3: 37.71×34 (21.27×19.18), radius 8 (4.51).
 *
 * Callers pass the level (`dayLevelFor` in `lib/score.ts`); nothing here
 * guesses it.
 */
export type DateLevel = 'none' | 'low' | 'mid' | 'high';

export const DATE_CELL_WIDTH = 21.27;
export const DATE_CELL_HEIGHT = 19.179;

/**
 * Every level is the same `LinearGradient → Text` tree — a flat fill is two
 * identical stops — so a cell whose level changes keeps its element type
 * (AGENTS.md rule 3).
 */
const FILL: Record<DateLevel, readonly [string, string, ...string[]]> = {
  none: [COLOR.surface.card, COLOR.surface.card],
  low: [COLOR.calendar.level1, COLOR.calendar.level1],
  mid: [COLOR.calendar.level2, COLOR.calendar.level2],
  high: GRADIENT_PASTEL.colors,
};

const TEXT: Record<DateLevel, string> = {
  none: COLOR.text.strong,
  low: COLOR.brand.violetText,
  mid: COLOR.text.plum,
  high: COLOR.text.onPastel,
};

/** v3 draws the pastel cell at 122.0°, which is `pastelAngle` of its own box. */
const RAMP = cssGradientPoints(
  pastelAngle(DATE_CELL_WIDTH, DATE_CELL_HEIGHT),
  DATE_CELL_WIDTH,
  DATE_CELL_HEIGHT,
);

type DateCellProps = {
  day: number;
  level: DateLevel;
  onPress?: () => void;
};

export function DateCell({ day, level, onPress }: DateCellProps) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[...FILL[level]]}
        locations={level === 'high' ? [...GRADIENT_PASTEL.locations] : [0, 1]}
        start={RAMP.start}
        end={RAMP.end}
        style={{
          width: scale(DATE_CELL_WIDTH),
          height: scale(DATE_CELL_HEIGHT),
          borderRadius: scale(4.513),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(8.462), lineHeight: scale(11.282), color: TEXT[level] }}
          className="font-plex-semibold">
          {day}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
