import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaDeltaCard, type AreaDeltas } from '@/components/ui/area-delta-card';
import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import { LivingArtwork } from '@/components/ui/living-artwork';
import { GrowthCurveCard } from '@/features/plan/components/growth-curve-card';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 사용자맞춤개선책/한달뒤내모습 — `523:490`. What 개선책 메인's locked
 * teaser opens.
 *
 * Note that Figma gives this frame `BottomBar4`, which lights MY rather than
 * 개선책. The bar here derives the active tab from the route, so it lights
 * 개선책; the mock is a slip.
 */
const CONTENT_INSET = 17;
const CARD_WIDTH = 184;
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

export default function ForecastScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(6), paddingBottom: scale(24) }}>
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center', ...COLUMN }}>
          <ButtonBack fallbackHref="/plan" />
          <Text
            style={{
              marginLeft: scale(9),
              fontSize: scale(12),
              lineHeight: scale(15),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            한 달 뒤 내 모습
          </Text>
        </View>

        <View style={{ marginTop: scale(5), ...COLUMN }}>
          <LinearGradient
            colors={['#FDF0FF', '#FFFFFF']}
            locations={[0.234, 0.984]}
            /* Same ramp as the teaser on 메인; see that file for why it is measured. */
            start={{ x: 0, y: 0.15 }}
            end={{ x: 1, y: 0.85 }}
            style={{
              height: scale(110),
              borderRadius: scale(10),
              boxShadow: SHADOW,
            }}>
            {/*
             * NOT IN FIGMA. `523:490` leaves the top 57.5pt of this card empty —
             * no orb node, no instance — while its own teaser on 개선책/메인
             * (`Frame 33`) does carry one, so the blank reads as the artwork
             * having been dropped from the frame rather than as a design.
             *
             * This is the unlocked forecast, so it takes the healthy orb the 홈
             * card uses rather than 메인's `?` variant, sized to the aspect of
             * 홈's own 90.28×89.92 box and centred in the empty band. Replace
             * both the asset and the geometry once the frame is fixed.
             */}
            <LivingArtwork
              source={require('@/assets/images/home/orb-nice.png')}
              frame={{ left: 69, top: 6, width: 46, height: 45.8 }}
              sheen
              accessibilityLabel="30일 뒤 예상 컨디션 오브"
            />
            <Text
              style={{
                marginTop: scale(57.5),
                textAlign: 'center',
                fontSize: scale(8),
                lineHeight: scale(9),
                letterSpacing: scale(-0.24),
                color: '#A07EAD',
              }}
              className="font-pretendard-semibold">
              30일 뒤 예상 컨디션
            </Text>

            {/* The 18pt score carries a 9pt leading in Figma; RN needs a box that fits. */}
            <View
              style={{
                marginTop: scale(3),
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: scale(18),
                  lineHeight: scale(21),
                  letterSpacing: scale(-0.24),
                  color: '#000000',
                }}
                className="font-pretendard-extrabold">
                81
              </Text>
              <Text
                style={{
                  marginLeft: scale(4),
                  fontSize: scale(10),
                  lineHeight: scale(12),
                  letterSpacing: scale(-0.24),
                  color: '#A07EAD',
                }}
                className="font-pretendard-medium">
                ← 현재 74
              </Text>
            </View>

            <Text
              style={{
                marginTop: scale(4),
                textAlign: 'center',
                fontSize: scale(8),
                lineHeight: scale(9),
                letterSpacing: scale(-0.24),
              }}
              className="font-pretendard-semibold">
              <Text style={{ color: '#000000' }} className="font-pretendard-semibold">
                최근 실천율 78% 유지기준{' '}
              </Text>
              <Text style={{ color: '#00A172' }} className="font-pretendard-semibold">
                +7점
              </Text>
            </Text>
          </LinearGradient>
        </View>

        <View style={{ marginTop: scale(6), ...COLUMN }}>
          <GrowthCurveCard />
        </View>

        <View style={{ marginTop: scale(6), ...COLUMN }}>
          <AreaDeltaCard heading="지난 주 대비 영역별 변화" deltas={DELTAS} />
        </View>

        <View
          style={{
            marginTop: scale(13),
            flexDirection: 'row',
            alignItems: 'flex-end',
            ...COLUMN,
          }}>
          <Text
            style={{ fontSize: scale(10), lineHeight: scale(15), color: '#00352C' }}
            className="font-pretendard-bold">
            다음 주 제안
          </Text>
          <Text
            style={{
              marginLeft: 'auto',
              marginBottom: scale(2),
              flexShrink: 1,
              textAlign: 'right',
              fontSize: scale(5),
              lineHeight: scale(9),
              letterSpacing: scale(-0.4),
              color: '#B4B2A8',
            }}
            className="font-pretendard">
            * 최근 기록 추세로 계산한 시뮬레이션이며, 실제 결과는 달라질 수 있어요.
          </Text>
        </View>

        <View style={{ marginTop: scale(4), flexDirection: 'row', gap: scale(8), ...COLUMN }}>
          <OptionCard label="지금처럼" score="81점" detail="실천율 78% 유지" />
          <OptionCard label="조금 더 열심히" score="88점" detail="실천율 90%로 ↑" highlighted />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * The two 다음 주 제안 outcomes. Figma gives the second a `#FAF1FF` fill and a
 * 0.3pt `#A100FF` border instead of the shadow the first carries.
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
  return (
    <View
      style={{
        width: scale(88),
        height: scale(46),
        borderRadius: scale(10),
        backgroundColor: highlighted ? '#FAF1FF' : '#FFFFFF',
        borderWidth: highlighted ? scale(0.3) : 0,
        borderColor: '#A100FF',
        boxShadow: highlighted ? 'none' : SHADOW,
        alignItems: 'center',
        paddingTop: scale(6.5),
      }}>
      {highlighted ? (
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(7), lineHeight: scale(9) }}
          className="font-pretendard-bold">
          {label}
        </GradientText>
      ) : (
        <Text
          style={{
            fontSize: scale(7),
            lineHeight: scale(9),
            letterSpacing: scale(-0.21),
            color: '#2C2C2A',
          }}
          className="font-pretendard-medium">
          {label}
        </Text>
      )}
      <Text
        style={{
          marginTop: scale(2),
          fontSize: scale(14),
          lineHeight: scale(17),
          letterSpacing: scale(-0.42),
          color: '#542173',
        }}
        className="font-pretendard-extrabold">
        {score}
      </Text>
      <Text
        style={{
          marginTop: scale(1),
          fontSize: scale(7),
          lineHeight: scale(9),
          letterSpacing: scale(-0.21),
          color: '#88877F',
        }}
        className="font-pretendard">
        {detail}
      </Text>
    </View>
  );
}
