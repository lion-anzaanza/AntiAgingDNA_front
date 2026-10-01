import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';
import { areaPath, splinePath } from '@/lib/spline';

/**
 * The condition line for the recorded days among the last seven, on the page
 * that swipes in beside `주간_기록` on 일지/메인. The pre-v4 design drew it as
 * `주간_컨디션_그래프` (`585:1436`), a card parked beneath that frame.
 *
 * This is the only card in 일지 that needs real vector drawing, which is why
 * `react-native-svg` exists in the project. It is bundled in Expo Go, so the dev
 * loop is unaffected.
 *
 * The area fill, the line (Catmull-Rom through the points) and the dots are all
 * generated from the scores rather than traced, so the card draws real data.
 * Whatever points it is given are spread evenly across the 18.89 → 178.3 band —
 * the span of 주간_기록's first and last day circles. With seven points they sit
 * under those seven columns; with fewer they do not line up with any weekday
 * (see 결정 대기 in `docs/redesign-v4-inventory.md`).
 *
 * **v4 has no frame for this card** — `99_개선안_v4` parks nothing beside or
 * under 일지/메인. So it follows the card it shares a swipe slot with,
 * `주간_기록` (`1363:2176`): the same 197.436×91.346 white card, `SHADOW_V4`,
 * the same 9.59 SemiBold title, and the summary in the same `surface/tint`
 * strip as 월간 보기. v4 has no gradient text or strokes, so the line, dots
 * and summary are solid `brand/violet-text`.
 *
 * v3 has no frame for it either; it follows v3's 주간_기록 (title line 13.08,
 * strip radius 4.51, first and last day centres 18.72 / 178.31).
 */
const CARD_WIDTH = 197.436;
const CARD_HEIGHT = 91.346;

/** The plot band: score 0 sits on PLOT_BOTTOM, score 100 on PLOT_TOP. */
const PLOT_LEFT = 18.72;
const PLOT_RIGHT = 178.31;
const PLOT_TOP = 30;
const PLOT_BOTTOM = 52;
/** The area fill closes 5pt below the lowest possible dot. */
const FILL_BASELINE = 57;
const DOT_RADIUS = 1;
/**
 * Figma floats each date 5.5–7.5pt above its dot with no discernible rule; 6.5
 * is the mode and is what every label uses here.
 */
const LABEL_LIFT = 6.5;

const AREA_TOP = COLOR.surface.tint;
const LINE = COLOR.brand.violetText;
const STROKE_WIDTH = 0.5;

export type ConditionPoint = {
  /** e.g. `8/15` */
  label: string;
  /** 0–100. */
  score: number;
};

type WeeklyConditionChartProps = {
  points: ConditionPoint[];
  /** The `surface/tint` strip along the bottom, e.g. `어제보다 수면 +40분 · 스트레스 −1`. */
  summary: string;
};

function plot(points: ConditionPoint[]) {
  const step = points.length > 1 ? (PLOT_RIGHT - PLOT_LEFT) / (points.length - 1) : 0;
  return points.map((point, index) => ({
    ...point,
    x: PLOT_LEFT + step * index,
    y: PLOT_BOTTOM - (Math.max(0, Math.min(100, point.score)) / 100) * (PLOT_BOTTOM - PLOT_TOP),
  }));
}

export function WeeklyConditionChart({ points, summary }: WeeklyConditionChartProps) {
  const plotted = plot(points);
  const line = splinePath(plotted);
  const area = areaPath(plotted, FILL_BASELINE);

  return (
    <View
      style={{
        width: scale(CARD_WIDTH),
        height: scale(CARD_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <Text
        style={{
          position: 'absolute',
          left: scale(8.7),
          top: scale(13.08 - 13.538 / 2),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.heading,
        }}
        className="font-plex-semibold">
        최근 7일 컨디션
      </Text>

      <Svg
        style={{ position: 'absolute', left: 0, top: 0 }}
        width={scale(CARD_WIDTH)}
        height={scale(CARD_HEIGHT)}
        viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
        <Defs>
          <LinearGradient id="area" x1="0" y1={PLOT_TOP} x2="0" y2={FILL_BASELINE} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={AREA_TOP} />
            <Stop offset="1" stopColor={COLOR.surface.card} />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#area)" />
        <Path d={line} stroke={LINE} strokeWidth={STROKE_WIDTH} fill="none" />
        {plotted.map((point) => (
          <Circle key={point.label} cx={point.x} cy={point.y} r={DOT_RADIUS} fill={LINE} />
        ))}
      </Svg>

      {plotted.map((point) => (
        <Text
          key={point.label}
          style={{
            position: 'absolute',
            left: scale(point.x - 12),
            top: scale(point.y - LABEL_LIFT - 4),
            width: scale(24),
            textAlign: 'center',
            fontSize: scale(5),
            lineHeight: scale(8),
            color: COLOR.text.muted,
          }}
          className="font-plex">
          {point.label}
        </Text>
      ))}

      <View
        style={{
          position: 'absolute',
          left: scale(9.03),
          top: scale(63.46),
          width: scale(179.385),
          height: scale(18.269),
          borderRadius: scale(4.513),
          backgroundColor: COLOR.surface.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.brand.violetText }}
          className="font-plex-semibold">
          {summary}
        </Text>
      </View>
    </View>
  );
}
