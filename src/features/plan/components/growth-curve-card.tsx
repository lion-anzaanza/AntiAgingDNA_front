import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { areaPath, splinePath } from '@/lib/spline';

/**
 * `예상 성장 곡선` — the same three-object construction as 일지's weekly chart
 * (gradient area fill, thin gradient stroke, dots), regenerated from the points.
 *
 * Figma's own middle point sits about 2pt above where a straight 74→81 scale
 * puts it, so its curve is a little more optimistic in the middle than the
 * numbers are. The linear scale is used here.
 */
const CHART_WIDTH = 184;
const CHART_HEIGHT = 79;
const PLOT_LEFT = 18;
const PLOT_RIGHT = 168;
const SCORE_TOP = 81;
const SCORE_BOTTOM = 74;
const Y_TOP = 29;
const Y_BOTTOM = 55;
const FILL_BASELINE = 62;

/** Figma's curve sits flat, eases into the rise, then flattens again. */
const FLAT = { flatEnds: true };

const CURVE = [
  { label: '오늘', score: 74, axis: '오늘' },
  { label: '15일', score: 78, axis: '15일' },
  { label: '30일', score: 81, axis: '30일' },
];

export function GrowthCurveCard() {
  const points = CURVE.map((point, index) => ({
    ...point,
    x: PLOT_LEFT + ((PLOT_RIGHT - PLOT_LEFT) / (CURVE.length - 1)) * index,
    y:
      Y_BOTTOM -
      ((point.score - SCORE_BOTTOM) / (SCORE_TOP - SCORE_BOTTOM)) * (Y_BOTTOM - Y_TOP),
  }));

  return (
    <View
      style={{
        height: scale(CHART_HEIGHT),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <View style={{ flexDirection: 'row', marginTop: scale(7.5), marginHorizontal: scale(10) }}>
        <Text
          style={{
            fontSize: scale(8),
            lineHeight: scale(9),
            letterSpacing: scale(-0.24),
            color: '#000000',
          }}
          className="font-pretendard-extrabold">
          예상 성장 곡선
        </Text>
        <Text
          style={{
            marginLeft: 'auto',
            fontSize: scale(6),
            lineHeight: scale(9),
            letterSpacing: scale(-0.18),
            color: '#88877F',
          }}
          className="font-pretendard">
          앞으로 30일
        </Text>
      </View>

      <Svg
        style={{ position: 'absolute', left: 0, top: 0 }}
        width={scale(CHART_WIDTH)}
        height={scale(CHART_HEIGHT)}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Defs>
          <SvgGradient id="growthArea" x1="0" y1={Y_TOP} x2="0" y2={FILL_BASELINE} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FBEDFF" />
            <Stop offset="1" stopColor="#FFFFFF" />
          </SvgGradient>
          <SvgGradient id="growthStroke" x1={PLOT_LEFT} y1="0" x2={PLOT_RIGHT} y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={GRADIENT_BRAND[0]} />
            <Stop offset="1" stopColor={GRADIENT_BRAND[1]} />
          </SvgGradient>
        </Defs>
        <Path d={areaPath(points, FILL_BASELINE, FLAT)} fill="url(#growthArea)" />
        <Path d={splinePath(points, FLAT)} stroke="url(#growthStroke)" strokeWidth={0.5} fill="none" />
        {/* Figma draws a dot on the first two points only. */}
        {points.slice(0, 2).map((point) => (
          <Circle key={point.label} cx={point.x} cy={point.y} r={1} fill="url(#growthStroke)" />
        ))}
      </Svg>

      {points.map((point) => (
        <Text
          key={`score-${point.label}`}
          style={{
            position: 'absolute',
            left: scale(point.x - 9.5),
            top: scale(point.y - 9),
            width: scale(19),
            textAlign: 'center',
            fontSize: scale(5),
            lineHeight: scale(9),
            letterSpacing: scale(-0.15),
            color: '#B4B2A8',
          }}
          className="font-pretendard">
          {point.score}점
        </Text>
      ))}

      {points.map((point, index) => (
        <Text
          key={`axis-${point.label}`}
          style={{
            position: 'absolute',
            left: scale(index === 2 ? 153 : point.x - (index === 0 ? 6 : 9.5)),
            top: scale(64),
            width: scale(19),
            textAlign: index === 2 ? 'right' : index === 0 ? 'left' : 'center',
            fontSize: scale(6),
            lineHeight: scale(9),
            letterSpacing: scale(-0.18),
            color: '#88877F',
          }}
          className="font-pretendard">
          {point.axis}
        </Text>
      ))}
    </View>
  );
}
