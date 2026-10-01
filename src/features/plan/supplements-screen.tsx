import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { SupplementCard, type Supplement } from '@/features/plan/components/supplement-card';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 사용자맞춤개선책/맞춤영양제 — `1318:1604` (v4 `1363:3003`, first `559:1295`).
 *
 * Three recommendations, each pairing the reason it was picked with the
 * evidence line beneath it. 담기 and 정기구독 have nowhere to go — there is no
 * cart, and the API has no commerce endpoints at all.
 *
 * Positions are v3's ×220/390, frame y − 38.
 */
const CONTENT_INSET = 11.28;
const CARD_WIDTH = 197.436;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

/** v3 icons: `Icon/pill`, `Icon/sun`, `Icon/drop`. */
const SUPPLEMENTS: Supplement[] = [
  {
    name: '마그네슘 · 테아닌',
    reason: '스트레스 누적형 · 수면 질 ↓',
    evidence: '마그네슘 · L-테아닌은 이완 · 수면 질 개선에 흔히 활용돼요.',
    price: '월 12,900원 / 30일분',
    icon: 'pill',
  },
  {
    name: '비타민 D',
    reason: '흐린날 컨디션 저하형',
    evidence: '일조량↓ · 실내 활동이 많을 때 보충을 고려해요.',
    price: '월 9,900원 / 30일분',
    icon: 'sun',
  },
  {
    name: '오메가3',
    reason: '잦은 패스트푸드 · 당분 ↑',
    evidence: '식습관 지표(패스트푸드·당분)가 높은 주에 보조로 먹어요.',
    price: '월 18,900원 / 30일분',
    icon: 'drop',
  },
];

const BANNER_LINES = [
  <>
    <Text style={{ color: COLOR.brand.violetText }}>‘올빼미 - 고민감 - 누적형’</Text>과 최근 일지를
    바탕으로 골랐어요
  </>,
  '각 성분의 근거를 함께 확인하세요',
];

export default function SupplementsScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(20) }}>
        {/* Header: the banner starts at 27.38. */}
        <View style={{ height: scale(27.38) }}>
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(0.25) }}>
            <ButtonBack fallbackHref="/plan" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.397),
              top: scale(11.2 - 18.051 / 2),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            맞춤 영양제
          </Text>
        </View>

        <View style={COLUMN}>
          <View
            style={{
              height: scale(31.731),
              borderRadius: scale(4.808),
              backgroundColor: COLOR.surface.tint2,
            }}>
            {/*
              * Two single-line boxes, as v4 breaks it after "골랐어요". The first
              * line nearly fills the banner, so at a system font scale of 1.1 it
              * shrinks rather than wrapping a third line out of the box.
              */}
            {BANNER_LINES.map((line, index) => (
              <Text
                key={index}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={{
                  position: 'absolute',
                  left: scale(8.73),
                  right: scale(8.73),
                  top: scale(11.903 - 10.154 / 2 + index * 10.154),
                  fontSize: scale(7.333),
                  lineHeight: scale(10.154),
                  color: COLOR.text.body,
                }}
                className="font-plex-semibold">
                {line}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ marginTop: scale(4.81), gap: scale(5.66), ...COLUMN }}>
          {SUPPLEMENTS.map((supplement) => (
            <SupplementCard key={supplement.name} {...supplement} />
          ))}
        </View>

        {/*
          * v3: Regular 10 / 12, two lines, 22.8 below the last card. That card is
          * 1.07 taller in v3 than the shared card geometry, so it is added here.
          */}
        <Text
          style={{
            marginTop: scale(12.873 + 1.076),
            textAlign: 'center',
            fontSize: scale(5.641),
            lineHeight: scale(6.769),
            color: COLOR.text.body,
            ...COLUMN,
          }}
          className="font-plex">
          건강기능식품이며 의약품이 아닙니다.{'\n'}질환·복용 중인 약이 있으면 전문가와 상담하세요.
        </Text>

        <View style={{ marginTop: scale(5.178), ...COLUMN }}>
          {/* The shared button (v3 draws it 48 tall, r16 — the component keeps the v4 decision); pressing it does nothing (no cart). */}
          <Button label="3종 정기구독으로 담기 →" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
