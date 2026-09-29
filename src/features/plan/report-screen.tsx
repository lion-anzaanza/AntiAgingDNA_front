import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaDeltaCard, type AreaDeltas } from '@/components/ui/area-delta-card';
import { ButtonBack } from '@/components/ui/button-back';
import { PlanCard } from '@/components/ui/plan-card';
import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 사용자맞춤개선책/주간리포트 — `559:1294`.
 *
 * Static like the rest of the section. The deltas, the two 인사이트 rows and the
 * 제안 row are Figma's; where they come from is a backend question — the API has
 * no weekly aggregate yet.
 */
const CONTENT_INSET = 17;
const COLUMN = { paddingLeft: scale(CONTENT_INSET), paddingRight: scale(220 - CONTENT_INSET - 184) };

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

export default function WeeklyReportScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(7), paddingBottom: scale(24) }}>
        <View
          style={{ height: scale(22), flexDirection: 'row', alignItems: 'center', ...COLUMN }}>
          <ButtonBack fallbackHref="/plan" />
          <Text
            style={{
              marginLeft: scale(9),
              fontSize: scale(12),
              lineHeight: scale(15),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            주간 리포트
          </Text>
        </View>

        <View style={{ marginTop: scale(5), ...COLUMN }}>
          <View
            style={{
              height: scale(55),
              borderRadius: scale(10),
              backgroundColor: '#FFFFFF',
              boxShadow: SHADOW,
              flexDirection: 'row',
            }}>
            <View
              style={{
                marginLeft: scale(10),
                marginTop: scale(10),
                width: scale(36),
                height: scale(36),
                borderRadius: scale(8),
                backgroundColor: '#F2F2F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('@/assets/images/plan/ic-report.png')}
                style={{ width: scale(32.463), height: scale(30) }}
                resizeMode="contain"
              />
            </View>
            <View style={{ marginLeft: scale(8), marginTop: scale(9.5), flexShrink: 1 }}>
              <Text
                style={{
                  fontSize: scale(8),
                  lineHeight: scale(9),
                  letterSpacing: scale(-0.24),
                  color: '#000000',
                }}
                className="font-pretendard-extrabold">
                이번 주 평균 79점   ▲3
              </Text>
              <Text
                style={{
                  marginTop: scale(4),
                  fontSize: scale(7),
                  lineHeight: scale(9),
                  letterSpacing: scale(-0.21),
                  color: '#9C9C9C',
                }}
                className="font-pretendard">
                수면 리듬과 스트레스 회복이 좋아지고{'\n'}사회 교류는 조금 줄었어요.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: scale(6.8), ...COLUMN }}>
          <AreaDeltaCard heading="지난 주 대비 영역별 변화" deltas={DELTAS} />
        </View>

        <SectionHeading top={19.5}>이번 주 인사이트</SectionHeading>
        <View style={{ marginTop: scale(3), gap: scale(5), paddingLeft: scale(18) }}>
          {INSIGHTS.map((insight) => (
            <PlanCard key={insight.title} {...insight} />
          ))}
        </View>

        <SectionHeading top={13}>다음 주 제안</SectionHeading>
        <View style={{ marginTop: scale(3), paddingLeft: scale(18) }}>
          <PlanCard
            title="취침 30분 앞당기기"
            caption="가장 큰 효과로 나타나요"
            icon={require('@/assets/images/plan/ic-sleep-plan.png')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** The 10pt Bold section headings sit at x=18, a point inside the cards' column. */
function SectionHeading({ children, top }: { children: string; top: number }) {
  return (
    <Text
      style={{
        marginTop: scale(top),
        paddingLeft: scale(18),
        fontSize: scale(10),
        lineHeight: scale(15),
        color: '#00352C',
      }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}
