import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { areaPath, splinePath } from '@/lib/spline';
import { GradientText } from './gradient-text';

/**
 * Figma: `주간_컨디션_그래프` (`585:1436`) — a 184×95 card holding a seven-point
 * condition line, the same size as `주간_기록` and parked directly beneath
 * 일지/메인 on the canvas.
 *
 * This is the only card in 일지 that needs real vector drawing, which is why
 * `react-native-svg` exists in the project. It is bundled in Expo Go, so the dev
 * loop is unaffected.
 *
 * Figma draws the line as three separate objects — a gradient area fill
 * (`Vector 1811`), a 0.5pt gradient stroke (`Line 417`, expressed as a nearly
 * flat path that is then rotated -10.92° and skewed) and seven 2pt dots. All
 * three are regenerated here from the point values instead of being traced, so
 * the card is ready for real data; the mock values below round-trip to Figma's
 * exact dot positions.
 */
const CARD_WIDTH = 184;
const CARD_HEIGHT = 95;

/** The plot band: score 0 sits on PLOT_BOTTOM, score 100 on PLOT_TOP. */
const PLOT_LEFT = 19;
const PLOT_RIGHT = 168;
const PLOT_TOP = 29;
const PLOT_BOTTOM = 54;
/** The area fill closes 5pt below the lowest possible dot. */
const FILL_BASELINE = 59;
const DOT_RADIUS = 1;
/**
 * Figma floats each date 5.5–7.5pt above its dot with no discernible rule; 6.5
 * is the mode and is what every label uses here.
 */
const LABEL_LIFT = 6.5;

const AREA_TOP = '#FBEDFF';
const STROKE_WIDTH = 0.5;

export type ConditionPoint = {
  /** e.g. `8/15` */
  label: string;
  /** 0–100. */
  score: number;
};

type WeeklyConditionChartProps = {
  points: ConditionPoint[];
  /** The `#F3F1FE` strip along the bottom, e.g. `어제보다 수면 +40분 · 스트레스 −1`. */
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
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <Text
        style={{
          marginTop: scale(4.5),
          marginLeft: scale(12),
          fontSize: scale(8),
          lineHeight: scale(15),
          color: '#00352C',
        }}
        className="font-pretendard-bold">
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
            <Stop offset="1" stopColor="#FFFFFF" />
          </LinearGradient>
          <LinearGradient id="stroke" x1={PLOT_LEFT} y1="0" x2={PLOT_RIGHT} y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={GRADIENT_BRAND[0]} />
            <Stop offset="1" stopColor={GRADIENT_BRAND[1]} />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#area)" />
        <Path d={line} stroke="url(#stroke)" strokeWidth={STROKE_WIDTH} fill="none" />
        {plotted.map((point) => (
          <Circle key={point.label} cx={point.x} cy={point.y} r={DOT_RADIUS} fill="url(#stroke)" />
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
            color: '#88877F',
          }}
          className="font-pretendard-medium">
          {point.label}
        </Text>
      ))}

      <View
        style={{
          position: 'absolute',
          left: scale(12),
          top: scale(65),
          width: scale(161),
          height: scale(19),
          borderRadius: scale(5),
          backgroundColor: '#F3F1FE',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(7), lineHeight: scale(8) }}
          className="font-pretendard-semibold">
          {summary}
        </GradientText>
      </View>
    </View>
  );
}
