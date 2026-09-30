import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaDeltaCard, type AreaDeltas } from '@/components/ui/area-delta-card';
import { ButtonBack } from '@/components/ui/button-back';
import { LivingArtwork } from '@/components/ui/living-artwork';
import { GrowthCurveCard } from '@/features/plan/components/growth-curve-card';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4, TONE_TEXT } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 사용자맞춤개선책/한달뒤내모습 — `1363:3134` (was `523:490`). What
 * 개선책 메인's locked teaser opens.
 *
 * v4 still gives this frame a tab bar that lights MY rather than 개선책. The bar
 * here derives the active tab from the route, so it lights 개선책; the mock is a
 * slip.
 *
 * Positions are v4's, frame y − 38.
 */
const CONTENT_INSET = 11.28;
const CARD_WIDTH = 197.436;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

const DELTAS: AreaDeltas = {
  body: 5,
  mind: 1,
  emotion: 2,
  social: -1,
  environment: -3,
  total: 2,
};

const HERO_HEIGHT = 105.961;
const HERO_RAMP = cssGradientPoints(pastelAngle(CARD_WIDTH, HERO_HEIGHT), CARD_WIDTH, HERO_HEIGHT);

/**
 * v4 finally draws the hero's orb (`Rectangle 3190`, pre-v4 the band was empty
 * and the code borrowed 홈's `orb-nice`). It is 홈's `orb-better` picture —
 * pink to violet — but squashed: its opaque body is 44.2 × 40.3 (aspect 1.10)
 * where the file's is 1.01, the same sideways stretch as 홈's orb card
 * (결정 대기 9). Kept round, as there: `orb-better.png` with its body at v4's
 * height (40.3), centred on the card at v4's body centre y 31.38.
 *
 * The file's body spans px 20–160 × 12–151 of 181 × 180, centred on (90, 81.5).
 */
const ORB_K = 40.28 / 139;
const ORB_FRAME = {
  width: 181 * ORB_K,
  height: 180 * ORB_K,
  left: CARD_WIDTH / 2 - 90 * ORB_K,
  top: 31.38 - 81.5 * ORB_K,
};

/** v4's three highlight dots over the orb, card-relative. */
const SPARKLES = [
  { left: 88.32, top: 34.22, width: 1.28, height: 1.162, color: 'rgba(255,232,233,0.5)', glow: '0px 0px 5.014px rgba(255,255,255,0.5)' },
  { left: 109.44, top: 20.28, width: 1.28, height: 1.162, color: 'rgba(255,232,233,0.5)', glow: '0px 0px 5.014px rgba(255,255,255,0.5)' },
  { left: 101.76, top: 35.97, width: 1.92, height: 1.743, color: 'rgba(255,221,221,0.75)', glow: '0px 0px 4.011px 1.003px rgba(255,255,255,0.25)' },
];

const OPTION_WIDTH = 95.333;
const OPTION_HEIGHT = 44.231;

export default function ForecastScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(20) }}>
        {/* Header: the hero starts at 26.42 (this frame sits ~1pt higher than its siblings). */}
        <View style={{ height: scale(26.42) }}>
          <View style={{ position: 'absolute', left: scale(CONTENT_INSET), top: scale(4.31) }}>
            <ButtonBack fallbackHref="/plan" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.51),
              top: scale(10.78 - 18.051 / 2),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            한 달 뒤 내 모습
          </Text>
        </View>

        <View style={COLUMN}>
          <LinearGradient
            colors={[...GRADIENT_PASTEL.colors]}
            locations={[...GRADIENT_PASTEL.locations]}
            start={HERO_RAMP.start}
            end={HERO_RAMP.end}
            style={{ height: scale(HERO_HEIGHT), borderRadius: scale(9.615), boxShadow: SHADOW_V4 }}>
            <LivingArtwork
              source={require('@/assets/images/home/orb-better.png')}
              frame={ORB_FRAME}
              sheen
              accessibilityLabel="30일 뒤 예상 컨디션 오브"
            />
            {SPARKLES.map((sparkle) => (
              <View
                key={`${sparkle.left}-${sparkle.top}`}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: scale(sparkle.left),
                  top: scale(sparkle.top),
                  width: scale(sparkle.width),
                  height: scale(sparkle.height),
                  borderRadius: scale(sparkle.width),
                  backgroundColor: sparkle.color,
                  boxShadow: sparkle.glow,
                }}
              />
            ))}

            <Text
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scale(62.52 - 10.154 / 2),
                textAlign: 'center',
                fontSize: scale(7.333),
                lineHeight: scale(10.154),
                color: COLOR.text.plum,
              }}
              className="font-plex-semibold">
              30일 뒤 예상 컨디션
            </Text>
            {/* Nested so the 18pt score and the 13.5pt "← 현재 74" share a baseline, as in v4. */}
            <Text
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scale(74.57 - 22.564 / 2),
                textAlign: 'center',
                fontSize: scale(13.538),
                lineHeight: scale(22.564),
                letterSpacing: scale(-0.2708),
                color: '#A07EAD',
              }}
              className="font-plex-bold">
              <Text
                style={{
                  fontSize: scale(18.051),
                  letterSpacing: scale(-0.361),
                  color: COLOR.text.strong,
                }}>
                81
              </Text>{' '}
              ← 현재 74
            </Text>
            <Text
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scale(89.09 - 13.538 / 2),
                textAlign: 'center',
                fontSize: scale(9.59),
                lineHeight: scale(13.538),
                letterSpacing: scale(-0.0959),
                color: COLOR.text.strong,
              }}
              className="font-plex-semibold">
              최근 실천율 78% 유지기준 <Text style={{ color: TONE_TEXT.good }}>+7점</Text>
            </Text>
          </LinearGradient>
        </View>

        <View style={{ marginTop: scale(5.77), ...COLUMN }}>
          <GrowthCurveCard />
        </View>

        <View style={{ marginTop: scale(5.77), ...COLUMN }}>
          <AreaDeltaCard
            heading="지난 주 대비 영역별 변화"
            deltas={DELTAS}
            rightColumn={{ chip: 107.07, label: 126.6, valueRight: 181.6 }}
          />
        </View>

        {/* Delta card bottom 295.84 → option cards 326.61. */}
        <View style={{ height: scale(30.77) }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(10.55),
              top: scale(19.67 - 15.795 / 2),
              fontSize: scale(11.282),
              lineHeight: scale(15.795),
              letterSpacing: scale(-0.1128),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            다음 주 제안
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', ...COLUMN }}>
          <OptionCard label="지금처럼" score="81점" detail="실천율 78% 유지" />
          <OptionCard label="조금 더 열심히" score="88점" detail="실천율 90%로 ↑" highlighted />
        </View>

        {/*
          * v4 ends this at 208.8, the column's edge, on one line 196.5 wide —
          * all but the whole column. Android sets Plex ~2% wider than Figma, so
          * inside the column it wrapped its last word at font scale 1.0; the box
          * is let out to the left instead (right-aligned, so the text does not
          * move). At a larger system font it wraps; it is the last thing on the
          * screen.
          */}
        <Text
          style={{
            marginTop: scale(381.56 - 9.026 / 2 - (326.61 + OPTION_HEIGHT)),
            textAlign: 'right',
            fontSize: scale(6.769),
            lineHeight: scale(9.026),
            color: COLOR.text.body,
            paddingLeft: scale(4),
            paddingRight: COLUMN.paddingRight,
          }}
          className="font-plex">
          * 최근 기록 추세로 계산한 시뮬레이션이며, 실제 결과는 달라질 수 있어요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * The two 다음 주 제안 outcomes. v4 gives the second a `surface/tint` fill and a
 * 0.288 `brand/violet` border instead of the shadow the first carries, and its
 * label in `brand/violet-text` (was the gradient text).
 */
function OptionCard({
  label,
  score,
  detail,
  highlighted = false,
}: {
  label: string;
  score: string;
  detail: string;
  highlighted?: boolean;
}) {
  const centred = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    textAlign: 'center' as const,
  };
  return (
    <View
      style={{
        width: scale(OPTION_WIDTH),
        height: scale(OPTION_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: highlighted ? COLOR.surface.tint : COLOR.surface.card,
        borderWidth: scale(0.288),
        borderColor: highlighted ? COLOR.brand.violet : 'transparent',
        boxShadow: highlighted ? 'none' : SHADOW_V4,
      }}>
      {/* v4 tops are from the card's outer edge; absolute children start inside the 0.288 border. */}
      <Text
        style={{
          ...centred,
          top: scale(10.28 - 10.154 / 2) - scale(0.288),
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: highlighted ? COLOR.brand.violetText : COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {label}
      </Text>
      <Text
        style={{
          ...centred,
          top: scale(23.69 - 22.564 / 2) - scale(0.288),
          fontSize: scale(18.051),
          lineHeight: scale(22.564),
          letterSpacing: scale(-0.361),
          color: COLOR.text.plum,
        }}
        className="font-plex-bold">
        {score}
      </Text>
      <Text
        style={{
          ...centred,
          top: scale(34.69 - 9.026 / 2) - scale(0.288),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {detail}
      </Text>
    </View>
  );
}
