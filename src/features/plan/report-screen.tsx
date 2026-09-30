import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaDeltaCard, type AreaDeltas } from '@/components/ui/area-delta-card';
import { ButtonBack } from '@/components/ui/button-back';
import { PlanCard } from '@/components/ui/plan-card';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 사용자맞춤개선책/주간리포트 — `1363:3061` (was `559:1294`).
 *
 * Static like the rest of the section. The deltas, the two 인사이트 rows and the
 * 제안 row are Figma's; where they come from is a backend question — the API has
 * no weekly aggregate yet.
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

const INSIGHTS = [
  {
    title: '수면 7시간 → 컨디션 +6점',
    caption: '마그네슘 테아닌 외 2종',
    icon: require('@/assets/images/plan/ic-sleep-plan.png'),
  },
  {
    title: '당분 3회 → 컨디션 -8점',
    caption: '수면 리듬 +9% 스트레스 회복 +5%',
    icon: require('@/assets/images/plan/ic-sugar.png'),
  },
];

const SECTION_LINE = 15.795;

export default function WeeklyReportScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(20) }}>
        {/* Header: the summary card starts at 27.38. */}
        <View style={{ height: scale(27.38) }}>
          <View style={{ position: 'absolute', left: scale(CONTENT_INSET), top: scale(5.27) }}>
            <ButtonBack fallbackHref="/plan" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.44),
              top: scale(11.81 - 18.051 / 2),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            주간 리포트
          </Text>
        </View>

        <View style={COLUMN}>
          <View
            style={{
              height: scale(52.885),
              borderRadius: scale(9.615),
              backgroundColor: COLOR.surface.card,
              boxShadow: SHADOW_V4,
            }}>
            <View
              style={{
                position: 'absolute',
                left: scale(11.86),
                top: scale(9.62),
                width: scale(34.615),
                height: scale(34.615),
                borderRadius: scale(7.692),
                backgroundColor: COLOR.surface.chip,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('@/assets/images/plan/ic-report.png')}
                style={{ width: scale(31.214), height: scale(28.846) }}
                resizeMode="contain"
              />
            </View>
            {/*
              * v4 starts the headline at 70.9 and the two-line caption at 81.96 —
              * 24 and 35 past the tile, and not on one edge. Reproduced as drawn.
              */}
            <Text
              style={{
                position: 'absolute',
                left: scale(70.9),
                top: scale(13.3 - 13.538 / 2),
                fontSize: scale(9.59),
                lineHeight: scale(13.538),
                letterSpacing: scale(-0.0959),
                color: COLOR.text.strong,
              }}
              className="font-plex-semibold">
              이번 주 평균 79점   ▲3
            </Text>
            {/* At font scale 1.1 the first line ends just inside the card's edge. */}
            <Text
              style={{
                position: 'absolute',
                left: scale(81.96),
                top: scale(34.51 - 9.026),
                fontSize: scale(6.769),
                lineHeight: scale(9.026),
                color: COLOR.text.body,
              }}
              className="font-plex">
              수면 리듬과 스트레스 회복이 좋아지고{'\n'}사회 교류는 조금 줄었어요.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: scale(5.77), ...COLUMN }}>
          <AreaDeltaCard
            heading="지난 주 대비 영역별 변화"
            deltas={DELTAS}
            rightColumn={{ chip: 111.17, label: 131.5, valueRight: 188.36 }}
          />
        </View>

        {/* Delta card bottom 162.0 → first insight 197.58. */}
        <SectionHeading height={35.58} centre={25.44} left={10.71}>
          이번 주 인사이트
        </SectionHeading>
        <View style={{ gap: scale(4.806), ...COLUMN }}>
          {INSIGHTS.map((insight) => (
            <PlanCard key={insight.title} layout="insight" {...insight} />
          ))}
        </View>

        {/* Last insight bottom 294.69 → proposal 324.5. */}
        <SectionHeading height={29.81} centre={19.67} left={10.55}>
          다음 주 제안
        </SectionHeading>
        <View style={COLUMN}>
          <PlanCard
            layout="insight"
            title="취침 30분 앞당기기"
            caption="가장 큰 효과로 나타나요"
            icon={require('@/assets/images/plan/ic-sleep-plan.png')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** A v4 section heading (Plex Bold 11.282, `text/heading`) in the gap above its cards. */
function SectionHeading({
  children,
  height,
  centre,
  left,
}: {
  children: string;
  height: number;
  centre: number;
  left: number;
}) {
  return (
    <View style={{ height: scale(height) }}>
      <Text
        style={{
          position: 'absolute',
          left: scale(left),
          top: scale(centre - SECTION_LINE / 2),
          fontSize: scale(11.282),
          lineHeight: scale(SECTION_LINE),
          letterSpacing: scale(-0.1128),
          color: COLOR.text.heading,
        }}
        className="font-plex-bold">
        {children}
      </Text>
    </View>
  );
}
