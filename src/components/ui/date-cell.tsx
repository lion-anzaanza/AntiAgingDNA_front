import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { GRADIENT_BRAND } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `Date` (`603:1881`) — one day in 일지/캘린더, tinted by that day's
 * score. `none` is a day with no entry at all, which is why it is a separate
 * level rather than a fourth colour.
 *
 * **Which score maps to which level is not settled** — the API returns a
 * number and no thresholds (docs/backend-backlog.md item 22). Callers pass the
 * level; nothing here guesses it.
 */
export type DateLevel = 'none' | 'low' | 'mid' | 'high';

const FILL: Record<Exclude<DateLevel, 'high'>, string> = {
  none: '#FFFFFF',
  low: '#DACEFF',
  mid: '#B19CFF',
};

type DateCellProps = {
  day: number;
  level: DateLevel;
  onPress?: () => void;
};

export function DateCell({ day, level, onPress }: DateCellProps) {
  const label = (
    <Text
      style={{
        fontSize: scale(6.5),
        lineHeight: scale(8),
        letterSpacing: scale(-0.065),
        color: level === 'none' ? '#0E0E12' : '#FFFFFF',
      }}
      className="font-pretendard-medium">
      {day}
    </Text>
  );

  const box = {
    width: scale(19),
    height: scale(17),
    borderRadius: scale(5),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <Pressable onPress={onPress}>
      {level === 'high' ? (
        <LinearGradient
          colors={[...GRADIENT_BRAND]}
          locations={[0.0956, 0.917]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={box}>
          {label}
        </LinearGradient>
      ) : (
        <View style={[box, { backgroundColor: FILL[level] }]}>{label}</View>
      )}
    </Pressable>
  );
}
