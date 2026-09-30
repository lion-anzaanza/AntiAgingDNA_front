import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { COLOR, GRADIENT_BRAND, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';
import { areaPath, splinePath } from '@/lib/spline';

/**
 * `예상 성장 곡선` — v4 `1363:3152`. The same three-object construction as
 * before (gradient area fill, thin gradient stroke, dots), regenerated from the
 * points rather than traced.
 *
 * Where the points go, from v4: the two dots sit at (13.44, 53.84) and
 * (95.54, 41.34), and the stroke ends at (176.95, 25.76) — 82.1 and 81.4 apart,
 * i.e. evenly spaced. v4's stroke and area start ~8pt right of the first dot
 * (22.4 / 20.06); that is read as a slip and the curve starts at its dot.
 *
 * v4's middle dot sits ~3.5pt below where a straight 74→81 scale puts 78, so
 * its curve is less optimistic in the middle than the numbers beside it. The
 * linear scale is used, as it was before v4.
 */
const CHART_WIDTH = 197.436;
const CHART_HEIGHT = 75.962;
const PLOT_LEFT = 13.44;
const PLOT_RIGHT = 176.95;
const SCORE_TOP = 81;
const SCORE_BOTTOM = 74;
const Y_TOP = 25.76;
const Y_BOTTOM = 53.84;
/** Bottom of v4's area fill; its ramp starts 5.92 below the fill's top. */
const FILL_BASELINE = 59.61;
const FILL_RAMP_TOP = 33.8;

/** Figma's curve sits flat, eases into the rise, then flattens again. */
const FLAT = { flatEnds: true };

const CURVE = [
  { label: '오늘', score: 74 },
  { label: '15일', score: 78 },
  { label: '30일', score: 81 },
];

const SMALL_LINE = 9.026;
/** Score labels: centred 3.85 above a dotted point; the last, dotless one sits 1.74 above its end. */
const SCORE_LIFT = [3.85, 3.85, 1.74];
/** The first and last labels line up with the 오늘 / 30일 axis labels beneath them. */
const AXIS_LEFT = 8.77;
const AXIS_RIGHT = 188.29;
const LABEL_BOX = 30;

export function GrowthCurveCard() {
  const points = CURVE.map((point, index) => ({
    ...point,
    x: PLOT_LEFT + ((PLOT_RIGHT - PLOT_LEFT) / (CURVE.length - 1)) * index,
    y:
      Y_BOTTOM -
      ((point.score - SCORE_BOTTOM) / (SCORE_TOP - SCORE_BOTTOM)) * (Y_BOTTOM - Y_TOP),
  }));

  /** Left-, centre- and right-aligned boxes across the three columns. */
  const columnBox = (index: number) =>
    index === 0
      ? { left: scale(AXIS_LEFT), textAlign: 'left' as const }
      : index === CURVE.length - 1
        ? { left: scale(AXIS_RIGHT - LABEL_BOX), textAlign: 'right' as const }
        : { left: scale(points[index].x - LABEL_BOX / 2), textAlign: 'center' as const };

  const small = {
    position: 'absolute' as const,
    width: scale(LABEL_BOX),
    fontSize: scale(6.769),
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
          top: scale(11.39 - 13.538 / 2),
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
          top: scale(12.3 - SMALL_LINE / 2),
          textAlign: 'right',
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
          <SvgGradient id="growthDot" x1="0" y1="0" x2="1" y2="1">
            {GRADIENT_PASTEL.colors.map((color, i) => (
              <Stop key={color} offset={GRADIENT_PASTEL.locations[i]} stopColor={color} />
            ))}
          </SvgGradient>
        </Defs>
        <Path d={areaPath(points, FILL_BASELINE, FLAT)} fill="url(#growthArea)" />
        <Path
          d={splinePath(points, FLAT)}
          stroke="url(#growthStroke)"
          strokeWidth={0.481}
          fill="none"
        />
        {/* v4 draws a dot on the first two points only, in the pastel ramp. */}
        {points.slice(0, 2).map((point) => (
          <Circle key={point.label} cx={point.x} cy={point.y} r={0.962} fill="url(#growthDot)" />
        ))}
      </Svg>

      {points.map((point, index) => (
        <Text
          key={`score-${point.label}`}
          style={{
            ...small,
            ...columnBox(index),
            top: scale(point.y - SCORE_LIFT[index] - SMALL_LINE / 2),
          }}
          className="font-plex">
          {point.score}점
        </Text>
      ))}

      {points.map((point, index) => (
        <Text
          key={`axis-${point.label}`}
          style={{ ...small, ...columnBox(index), top: scale(66.15 - SMALL_LINE / 2) }}
          className="font-plex">
          {point.label}
        </Text>
      ))}
    </View>
  );
}
