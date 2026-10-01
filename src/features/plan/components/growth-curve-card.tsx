import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { COLOR, GRADIENT_BRAND, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';
import { areaPath, splinePath } from '@/lib/spline';

/**
 * `예상 성장 곡선` — v3 `1318:1819`. The same construction as before (gradient
 * area fill, thin gradient stroke), regenerated from the points rather than
 * traced.
 *
 * Where the points go, from v3: the area's top edge starts at (13.54, 53.64)
 * and ends at (181.64, 28.10), and the stroke spans the same width. v3 dropped
 * the two dots v4 drew on the curve.
 *
 * v3's curve passes its middle ~1.8pt below where a straight 74→81 scale puts
 * 78, so it is less optimistic in the middle than the numbers beside it. The
 * linear scale is used, as before.
 */
const CHART_WIDTH = 197.436;
const CHART_HEIGHT = 75.962;
const PLOT_LEFT = 13.538;
const PLOT_RIGHT = 181.64;
const SCORE_TOP = 81;
const SCORE_BOTTOM = 74;
const Y_TOP = 28.1;
const Y_BOTTOM = 53.64;
/** Bottom of v3's area fill; its ramp starts 5.89 below the fill's top. */
const FILL_BASELINE = 59.64;
const FILL_RAMP_TOP = 33.94;

/** Figma's curve sits flat, eases into the rise, then flattens again. */
const FLAT = { flatEnds: true };

const CURVE = [
  { label: '오늘', score: 74 },
  { label: '15일', score: 78 },
  { label: '30일', score: 81 },
];

const SMALL_LINE = 9.026;
const LABEL_BOX = 30;
/** v3 centres each score label (Regular 10 / 16) on its own point. */
const SCORE_LABELS = [
  { x: 15.94, y: 48.81 },
  { x: 96.24, y: 34.61 },
  { x: 182.66, y: 23.41 },
];
/** Axis labels: 오늘 starts at 8.77, 15일 is centred on 99.46, 30일 ends at 188.96. */
const AXIS_LEFT = 8.77;
const AXIS_MIDDLE = 99.46;
const AXIS_RIGHT = 188.96;

export function GrowthCurveCard() {
  const points = CURVE.map((point, index) => ({
    ...point,
    x: PLOT_LEFT + ((PLOT_RIGHT - PLOT_LEFT) / (CURVE.length - 1)) * index,
    y:
      Y_BOTTOM -
      ((point.score - SCORE_BOTTOM) / (SCORE_TOP - SCORE_BOTTOM)) * (Y_BOTTOM - Y_TOP),
  }));

  /** Left-, centre- and right-aligned boxes across the three axis columns. */
  const axisBox = (index: number) =>
    index === 0
      ? { left: scale(AXIS_LEFT), textAlign: 'left' as const }
      : index === CURVE.length - 1
        ? { left: scale(AXIS_RIGHT - LABEL_BOX), textAlign: 'right' as const }
        : { left: scale(AXIS_MIDDLE - LABEL_BOX / 2), textAlign: 'center' as const };

  const small = {
    position: 'absolute' as const,
    width: scale(LABEL_BOX),
    lineHeight: scale(SMALL_LINE),
    color: COLOR.text.body,
  };

  return (
    <View
      style={{
        height: scale(CHART_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <Text
        style={{
          position: 'absolute',
          left: scale(8.69),
          top: scale(12.16 - 13.538 / 2),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        예상 성장 곡선
      </Text>
      <Text
        style={{
          ...small,
          left: scale(AXIS_RIGHT - 60),
          width: scale(60),
          top: scale(12.82 - SMALL_LINE / 2),
          textAlign: 'right',
          fontSize: scale(6.769),
        }}
        className="font-plex">
        앞으로 30일
      </Text>

      <Svg
        style={{ position: 'absolute', left: 0, top: 0 }}
        width={scale(CHART_WIDTH)}
        height={scale(CHART_HEIGHT)}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Defs>
          <SvgGradient
            id="growthArea"
            x1="0"
            y1={FILL_RAMP_TOP}
            x2="0"
            y2={FILL_BASELINE}
            gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FCE6F5" />
            <Stop offset="0.55" stopColor="#EFE4FA" />
            <Stop offset="1" stopColor="#E3E6FA" />
          </SvgGradient>
          <SvgGradient
            id="growthStroke"
            x1={PLOT_LEFT}
            y1="0"
            x2={PLOT_RIGHT}
            y2="0"
            gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={GRADIENT_BRAND[0]} />
            <Stop offset="1" stopColor={GRADIENT_BRAND[1]} />
          </SvgGradient>
        </Defs>
        <Path d={areaPath(points, FILL_BASELINE, FLAT)} fill="url(#growthArea)" />
        <Path
          d={splinePath(points, FLAT)}
          stroke="url(#growthStroke)"
          strokeWidth={0.481}
          fill="none"
        />
      </Svg>

      {points.map((point, index) => (
        <Text
          key={`score-${point.label}`}
          style={{
            ...small,
            left: scale(SCORE_LABELS[index].x - LABEL_BOX / 2),
            top: scale(SCORE_LABELS[index].y - SMALL_LINE / 2),
            textAlign: 'center',
            fontSize: scale(5.641),
          }}
          className="font-plex">
          {point.score}점
        </Text>
      ))}

      {points.map((point, index) => (
        <Text
          key={`axis-${point.label}`}
          style={{ ...small, ...axisBox(index), top: scale(66.65 - SMALL_LINE / 2), fontSize: scale(6.769) }}
          className="font-plex">
          {point.label}
        </Text>
      ))}
    </View>
  );
}
