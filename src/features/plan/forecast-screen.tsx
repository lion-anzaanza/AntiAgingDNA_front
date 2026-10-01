import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaDeltaCard, type AreaDeltas } from '@/components/ui/area-delta-card';
import { ButtonBack } from '@/components/ui/button-back';
import { LivingArtwork } from '@/components/ui/living-artwork';
import { GrowthCurveCard } from '@/features/plan/components/growth-curve-card';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 사용자맞춤개선책/한달뒤내모습 — `1318:1741` (v4 `1363:3134`, first
 * `523:490`). What 개선책 메인's locked teaser opens.
 *
 * v3's tab bar lights 개선책 here (v4's lit MY, a slip the code never copied).
 *
 * Positions are v3's ×220/390, frame y − 38.
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
 * v3's hero orb is the white-lavender pearl the 메인 teaser carries
 * (`Group 1362`, bitmap `Rectangle 3190` — v4 had 홈's pink `orb-better` here).
 * v3 serves this copy at 189 × 188 with a little more padding; it is the same
 * drawing, so `orb-pearl.png` (181 × 180, body px 20–160 × 12–151) is placed
 * with its body on v3's 74.6 × 74 body box at (138, 30.8).
 */
const ORB_FRAME = { left: 71.96, top: 13.8, width: 53.88, height: 53.58 };

/** v3's three highlight dots over the orb, card-relative. */
const SPARKLES = [
  { left: 89.19, top: 40.95, size: 1.194, color: '#FFFFFF', glow: '0px 0px 2.821px rgba(255,255,255,0.5)' },
  { left: 108.89, top: 26.63, size: 1.194, color: '#FFFFFF', glow: '0px 0px 2.821px rgba(255,255,255,0.5)' },
  {
    left: 101.72,
    top: 42.74,
    size: 1.791,
    color: 'rgba(255,255,255,0.75)',
    glow: '0px 0px 2.256px 0.564px rgba(255,255,255,0.25)',
  },
];

/** v3's `+7점` green — not the delta table's `#007D59`; drawn once. */
const GAIN = '#009469';

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
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(-0.72) }}>
            <ButtonBack fallbackHref="/plan" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.736),
              top: scale(10.3 - 18.051 / 2),
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
              source={require('@/assets/images/plan/orb-pearl.png')}
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
                  width: scale(sparkle.size),
                  height: scale(sparkle.size),
                  borderRadius: scale(sparkle.size),
                  backgroundColor: sparkle.color,
                  boxShadow: sparkle.glow,
                }}
              />
            ))}

            {/* v3 moved the caption from under the orb to the card's top-left corner. */}
            <Text
              style={{
                position: 'absolute',
                left: scale(40.05 - 30),
                top: scale(11.17 - 10.154 / 2),
                width: scale(60),
                textAlign: 'center',
                fontSize: scale(7.333),
                lineHeight: scale(10.154),
                color: COLOR.text.plum,
              }}
              className="font-plex-semibold">
              30일 뒤 예상 컨디션
            </Text>
            {/* Nested so the 18pt score and the 13.5pt "← 현재 74" share a baseline, as in v3. */}
            <Text
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scale(72.66 - 22.564 / 2),
                textAlign: 'center',
                fontSize: scale(13.538),
                lineHeight: scale(22.564),
                letterSpacing: scale(-0.2708),
                color: '#735A7C',
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
                top: scale(92.11 - 13.538 / 2),
                textAlign: 'center',
                fontSize: scale(8.462),
                lineHeight: scale(13.538),
                letterSpacing: scale(-0.0846),
                color: COLOR.text.strong,
              }}
              className="font-plex-semibold">
              최근 실천율 78% 유지기준 <Text style={{ color: GAIN }}>+7점</Text>
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
            rightColumn={{ chip: 107.07, valueRight: 181.72 }}
          />
        </View>

        {/* Delta card bottom 307.88 → option cards 339.02. */}
        <View style={{ height: scale(31.14) }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(10.55),
              top: scale(20.95 - 15.795 / 2),
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
          * v3 set this at 10pt (5.64) and ends it at 191.8, well inside the
          * column, right-aligned. At a larger system font it wraps; it is the
          * last thing on the screen.
          */}
        <Text
          style={{
            marginTop: scale(392.41 - 9.026 / 2 - (339.02 + OPTION_HEIGHT)),
            textAlign: 'right',
            fontSize: scale(5.641),
            lineHeight: scale(9.026),
            color: COLOR.text.body,
            paddingLeft: COLUMN.paddingLeft,
            paddingRight: scale(220 - 191.79),
          }}
          className="font-plex">
          * 최근 기록 추세로 계산한 시뮬레이션이며, 실제 결과는 달라질 수 있어요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * The two 다음 주 제안 outcomes. v3 gives the second a `surface/tint` fill and a
 * 0.288 `brand/violet` border instead of the shadow the first carries, and its
 * label in `brand/violet-text`. v3 shrank the score to 28 / 40 and the detail to
 * 10 / 16.
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
      {/* v3 tops are from the card's outer edge; absolute children start inside the 0.288 border. */}
      <Text
        style={{
          ...centred,
          top: scale(9.85 - 10.154 / 2) - scale(0.288),
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
          top: scale(23.47 - 22.564 / 2) - scale(0.288),
          fontSize: scale(15.795),
          lineHeight: scale(22.564),
          letterSpacing: scale(-0.316),
          color: COLOR.text.plum,
        }}
        className="font-plex-bold">
        {score}
      </Text>
      <Text
        style={{
          ...centred,
          top: scale(36.89 - 9.026 / 2) - scale(0.288),
          fontSize: scale(5.641),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {detail}
      </Text>
    </View>
  );
}
