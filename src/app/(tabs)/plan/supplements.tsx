import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import {
  GRADIENT_BRAND,
  GRADIENT_SELECT,
  GRADIENT_SELECT_STOPS,
  SHADOW,
} from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 사용자맞춤개선책/맞춤영양제 — `559:1295`.
 *
 * Three recommendations, each pairing the reason it was picked with the
 * evidence line beneath it. 담기 and 정기구독 have nowhere to go — there is no
 * cart, and the API has no commerce endpoints at all.
 */
const CONTENT_INSET = 17;
const CARD_WIDTH = 184;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

/** Card-relative, averaged over the three cards — Figma's differ by a point. */
const CARD_HEIGHT = 88;
const TILE_TOP = 9;
const NAME_TOP = 12.5;
const REASON_TOP = 24;
const BUY_TOP = 14;
const EVIDENCE_TOP = 43;
const PRICE_TOP = 69;

const SUPPLEMENTS: {
  name: string;
  reason: string;
  evidence: string;
  price: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
}[] = [
  {
    name: '마그네슘 · 테아닌',
    reason: '스트레스 누적형 · 수면 질 ↓',
    evidence: '마그네슘 · L-테아닌은 이완 · 수면 질 개선에 흔히 활용돼요.',
    price: '월 12,900원 / 30일분',
    icon: require('@/assets/images/plan/sup-magnesium.png'),
    iconWidth: 26,
    iconHeight: 24,
  },
  {
    name: '비타민 D',
    reason: '흐린날 컨디션 저하형',
    evidence: '일조량↓ · 실내 활동이 많을 때 보충을 고려해요.',
    price: '월 9,900원 / 30일분',
    icon: require('@/assets/images/plan/sup-vitamin-d.png'),
    iconWidth: 27,
    iconHeight: 26,
  },
  {
    name: '오메가3',
    reason: '잦은 패스트푸드 · 당분 ↑',
    evidence: '식습관 지표(패스트푸드·당분)가 높은 주에 보조로 먹어요.',
    price: '월 18,900원 / 30일분',
    icon: require('@/assets/images/plan/sup-omega3.png'),
    iconWidth: 26,
    iconHeight: 25,
  },
];

export default function SupplementsScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(7), paddingBottom: scale(24) }}>
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
            맞춤 영양제
          </Text>
        </View>

        <View style={{ marginTop: scale(5), ...COLUMN }}>
          <View
            style={{
              height: scale(33),
              borderRadius: scale(5),
              backgroundColor: '#F3E9FF',
              justifyContent: 'center',
              paddingLeft: scale(11),
            }}>
            {/*
             * Figma sets the 유형 in the brand gradient and the rest in plain
             * grey, on one wrapping paragraph. GradientText masks its own box,
             * so the two halves are separate and the line is rebuilt by hand.
             */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <GradientText
                colors={[...GRADIENT_BRAND]}
                style={{ fontSize: scale(7), lineHeight: scale(10) }}
                className="font-pretendard-extrabold">
                ‘올빼미 - 고민감 - 누적형’
              </GradientText>
              <Text
                style={{ fontSize: scale(7), lineHeight: scale(10), color: '#5F5E5B' }}
                className="font-pretendard">
                과 최근 일지를 바탕으로 골랐어요
              </Text>
            </View>
            <Text
              style={{ fontSize: scale(7), lineHeight: scale(10), color: '#5F5E5B' }}
              className="font-pretendard">
              각 성분의 근거를 함께 확인하세요
            </Text>
          </View>
        </View>

        <View style={{ marginTop: scale(5), gap: scale(6), ...COLUMN }}>
          {SUPPLEMENTS.map((supplement) => (
            <SupplementCard key={supplement.name} {...supplement} />
          ))}
        </View>

        <Text
          style={{
            marginTop: scale(11),
            textAlign: 'center',
            fontSize: scale(5),
            lineHeight: scale(9),
            color: '#88877F',
            ...COLUMN,
          }}
          className="font-pretendard">
          건강기능식품이며 의약품이 아닙니다. 질환·복용 중인 약이 있으면 전문가와 상담하세요.
        </Text>

        <View style={{ marginTop: scale(2), ...COLUMN }}>
          <Pressable>
            <LinearGradient
              colors={[...GRADIENT_BRAND]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: scale(26),
                borderRadius: scale(10),
                boxShadow: SHADOW,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ fontSize: scale(10), lineHeight: scale(15), color: '#FFFFFF' }}
                className="font-pretendard-extrabold">
                3종 정기구독으로 담기 →
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SupplementCard({
  name,
  reason,
  evidence,
  price,
  icon,
  iconWidth,
  iconHeight,
}: (typeof SUPPLEMENTS)[number]) {
  return (
    <View
      style={{
        height: scale(CARD_HEIGHT),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(11),
          top: scale(TILE_TOP),
          width: scale(28),
          height: scale(26),
          borderRadius: scale(5),
          backgroundColor: '#F2F2F0',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={icon}
          style={{ width: scale(iconWidth), height: scale(iconHeight) }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          position: 'absolute',
          left: scale(46),
          top: scale(NAME_TOP),
          fontSize: scale(8),
          lineHeight: scale(9),
          letterSpacing: scale(-0.24),
          color: '#000000',
        }}
        className="font-pretendard-extrabold">
        {name}
      </Text>
      <View style={{ position: 'absolute', left: scale(46), top: scale(REASON_TOP) }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(7), lineHeight: scale(9) }}
          className="font-pretendard-semibold">
          {reason}
        </GradientText>
      </View>

      <Pressable style={{ position: 'absolute', left: scale(149), top: scale(BUY_TOP) }}>
        <LinearGradient
          colors={[...GRADIENT_SELECT]}
          locations={[...GRADIENT_SELECT_STOPS]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: scale(27),
            height: scale(16),
            borderRadius: scale(5),
            boxShadow: SHADOW,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(7), lineHeight: scale(8), color: '#FFFFFF' }}
            className="font-pretendard-bold">
            담기
          </Text>
        </LinearGradient>
      </Pressable>

      <View
        style={{
          position: 'absolute',
          left: scale(11),
          top: scale(EVIDENCE_TOP),
          width: scale(165),
          height: scale(17),
          borderRadius: scale(5),
          backgroundColor: '#FBF4FF',
          justifyContent: 'center',
          paddingLeft: scale(7),
        }}>
        <Text
          style={{
            fontSize: scale(6),
            lineHeight: scale(8),
            letterSpacing: scale(-0.18),
            color: '#5F5E5B',
          }}
          className="font-pretendard">
          {evidence}
        </Text>
      </View>

      <Text
        style={{
          position: 'absolute',
          left: scale(15),
          top: scale(PRICE_TOP),
          fontSize: scale(8),
          lineHeight: scale(9),
          letterSpacing: scale(-0.24),
          color: '#000000',
        }}
        className="font-pretendard-extrabold">
        {price}
      </Text>
    </View>
  );
}
