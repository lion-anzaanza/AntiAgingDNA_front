import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLOR, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { type Grade } from '@/lib/score';

/**
 * v3's three metric icons (`icon-moon`, `icon-drop`, `icon-flame`): 28pt line
 * glyphs, a 2.1 `icon/primary` stroke, no fill — the v4 1pt grey strokes,
 * redrawn larger in violet. The paths are Figma's own SVG export (28 viewBox).
 *
 * Each icon keeps its own place in the card, as Figma has it (in 220 units):
 * the moon sits 2.6 right of centre and the three tops differ.
 */
const ICONS = {
  sleep: {
    left: 25.38,
    top: 5.97,
    d: 'M23.9159 15.4002C23.6357 17.2104 22.8596 18.9078 21.6736 20.3038C20.4877 21.6999 18.9381 22.7402 17.197 23.3094C15.4558 23.8785 13.591 23.9543 11.8094 23.5282C10.0278 23.1021 8.39905 22.1909 7.10374 20.8956C5.80844 19.6003 4.89723 17.9716 4.47118 16.19C4.04512 14.4084 4.12086 12.5436 4.69001 10.8024C5.25915 9.06124 6.29946 7.51173 7.69555 6.32575C9.09163 5.13977 10.7889 4.36366 12.5992 4.0835C11.5607 5.65389 11.0966 7.53489 11.2856 9.40813C11.4746 11.2814 12.305 13.0318 13.6363 14.3631C14.9676 15.6944 16.718 16.5248 18.5913 16.7138C20.4645 16.9028 22.3455 16.4387 23.9159 15.4002Z',
  },
  water: {
    left: 22.19,
    top: 8.23,
    d: 'M14 3.7334C14 3.7334 7 11.3167 7 16.1001C7 17.9566 7.7375 19.7371 9.05025 21.0498C10.363 22.3626 12.1435 23.1001 14 23.1001C15.8565 23.1001 17.637 22.3626 18.9497 21.0498C20.2625 19.7371 21 17.9566 21 16.1001C21 11.3167 14 3.7334 14 3.7334Z',
  },
  stress: {
    left: 22.94,
    top: 7.67,
    d: 'M14 2.9165C14.9333 6.4165 14.35 9.33317 13.0667 11.6665C12.1333 10.4998 11.0833 9.5665 9.56667 8.98317C10.3833 11.8998 7 13.9998 7 17.4998C7 19.3564 7.7375 21.1368 9.05025 22.4496C10.363 23.7623 12.1435 24.4998 14 24.4998C15.8565 24.4998 17.637 23.7623 18.9497 22.4496C20.2625 21.1368 21 19.3564 21 17.4998C21 11.6665 16.3333 7.58317 14 2.9165Z',
  },
} as const;
const ICON_SIZE = 15.795;

/**
 * The badge under each value, from the day's `sleepGrade` / `waterGrade` /
 * `stressGrade` (`/api/scores/items`, backlog 10).
 *
 * The colours are Figma's three badge fills, one per grade. The **words are
 * the app's grade words** — 좋음 · 주의 · 위험, as on every 나의 LifeDNA 정보
 * card — not Figma's mock 좋아요 · 조금 부족 · 높음: those were one example
 * per card, there is no full set to pick from, and 높음 on a stress card would
 * have to mean the *bad* end while the grade runs the wellbeing way. A grade
 * the server does not give (no answer that day, 수면 without 취침 시각 —
 * backlog 29) reads `—`.
 */
const BADGE: Record<Grade, { word: string; bg: string; fg: string }> = {
  GOOD: { word: '좋음', bg: '#E6F4EE', fg: '#3A775D' },
  WARN: { word: '주의', bg: '#FBF2E1', fg: '#C57100' },
  DANGER: { word: '위험', bg: '#F9E9E8', fg: '#F53942' },
};
const NO_BADGE = { word: '—', bg: COLOR.surface.chip, fg: COLOR.text.body };

/**
 * The three metric cards. `HomeScreen` always fills `value` and `grade` from
 * the day, so the defaults here are the empty state, not Figma's mock.
 */
export const STATS: {
  label: string;
  value: string;
  grade: Grade | null;
  icon: keyof typeof ICONS;
}[] = [
  {
    label: '수면',
    value: '—',
    grade: null,
    icon: 'sleep',
  },
  {
    label: '수분',
    /*
     * The band, not a litre figure. `waterIntake` is a cup range on the wire
     * (`THREE_TO_FIVE`), and there is no cup→mL factor anywhere in the data —
     * inventing one to print `1.6L` would be exactly the kind of made-up
     * constant this project refuses elsewhere. Backlog item 26; the backend
     * settled it this way on 2026-08-17.
     */
    value: '—',
    grade: null,
    icon: 'water',
  },
  {
    label: '스트레스',
    value: '—',
    grade: null,
    icon: 'stress',
  },
];

type StatCardProps = (typeof STATS)[number];

/**
 * v3 `Group 1316`–`1318` (`1312:1546`…): 61.3×78. The icon is placed
 * absolutely; the value, label and badge follow in a centred column at v3's
 * line-box tops (24.74 / 40.58 / 57).
 */
export function StatCard({ label, value, grade, icon }: StatCardProps) {
  const glyph = ICONS[icon];
  const badge = grade === null ? NO_BADGE : BADGE[grade];
  return (
    <View
      style={{
        flex: 1,
        height: scale(78),
        borderRadius: scale(10),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW,
        alignItems: 'center',
        paddingTop: scale(24.74),
      }}>
      <Svg
        width={scale(ICON_SIZE)}
        height={scale(ICON_SIZE)}
        viewBox="0 0 28 28"
        style={{ position: 'absolute', left: scale(glyph.left), top: scale(glyph.top) }}>
        <Path
          d={glyph.d}
          stroke={COLOR.icon.primary}
          strokeWidth={2.1}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
      <Text
        numberOfLines={1}
        style={{
          fontSize: scale(11.282),
          lineHeight: scale(15.795),
          letterSpacing: scale(-0.1128),
          color: COLOR.text.strong,
        }}
        className="font-plex-bold">
        {value}
      </Text>
      <Text
        style={{
          fontSize: scale(6.769),
          lineHeight: scale(12.41),
          // The label's line box starts 0.06 above the value's bottom.
          marginTop: scale(40.58 - 24.74 - 15.795),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {label}
      </Text>
      <View
        style={{
          width: scale(37),
          height: scale(12),
          marginTop: scale(57 - 40.58 - 12.41),
          borderRadius: scale(10),
          backgroundColor: badge.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: scale(6.769), lineHeight: scale(10.154), color: badge.fg }}
          className="font-plex-semibold">
          {badge.word}
        </Text>
      </View>
    </View>
  );
}
