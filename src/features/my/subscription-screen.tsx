import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import { FeatureTable } from '@/features/my/components/feature-table';
import { PremiumBadge } from '@/features/my/components/premium-badge';
import { SubscriptionPlanCard } from '@/features/my/components/subscription-plan-card';
import { INK } from '@/features/my/components/subscription-tokens';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 마이페이지/구독관리 — `585:1399`. Until 2026-08-17 this frame was a
 * title over an empty box; it is now a full paywall and this is the port.
 *
 * **Nothing here transacts.** There is no commerce domain in the API at all
 * (backlog 15 and 24), so the plan cards only move a local selection and the
 * CTA does nothing. Wiring it means a payment SDK, not an endpoint.
 *
 * Three slips reproduced rather than corrected — all worth a designer's eye:
 *
 * - **Both plan cards say `연간` and both price suffixes say `/ 년`**, so the
 *   3,900원 plan reads as a second yearly plan rather than the monthly one the
 *   CTA's fine print ("이후 월 3,900원 청구") clearly means.
 * - **Both plan subtitles read `올빼미 - 고민감 - 누적형`**, which is the profile
 *   type label from 마이페이지/메인 — a placeholder left in.
 * - **The 광고 row is X for 무료 플랜 and ✓ for 프리미엄**, i.e. it says the paid
 *   plan is the one with ads. Every other row uses ✓ for "included".
 */
const CONTENT_INSET = 17;
const CARD_WIDTH = 186;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

const PLANS = [
  { key: 'yearly', title: '연간', price: '29,000원', per: '/ 년', badge: '38% 할인! 가장 인기' },
  { key: 'monthly', title: '연간', price: '3,900원', per: '/ 년' },
];

export default function SubscriptionScreen() {
  const [selected, setSelected] = useState('yearly');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(6), paddingBottom: scale(24) }}>
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center', ...COLUMN }}>
          <ButtonBack fallbackHref="/my" />
          <Text
            style={{
              marginLeft: scale(9),
              fontSize: scale(12),
              lineHeight: scale(15),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            구독관리
          </Text>
        </View>

        <View style={{ marginTop: scale(15), alignItems: 'center' }}>
          <PremiumBadge />
        </View>

        <View style={{ marginTop: scale(12), alignItems: 'center' }}>
          <Text
            style={{ fontSize: scale(12), lineHeight: scale(13), color: INK, textAlign: 'center' }}
            className="font-pretendard-bold">
            한 달 무료 플랜으로
          </Text>
          <View style={{ flexDirection: 'row', marginTop: scale(1) }}>
            <GradientText
              colors={[...GRADIENT_BRAND]}
              style={{ fontSize: scale(12), lineHeight: scale(13) }}
              className="font-pretendard-bold">
              더 깊은 나를
            </GradientText>
            <Text
              style={{ fontSize: scale(12), lineHeight: scale(13), color: INK }}
              className="font-pretendard-bold">
              {' '}
              만나보세요!
            </Text>
          </View>
        </View>

        <View style={{ marginTop: scale(14), ...COLUMN }}>
          {PLANS.map(({ key, ...plan }, index) => (
            <View key={key} style={{ marginTop: index === 0 ? 0 : scale(4) }}>
              <SubscriptionPlanCard
                {...plan}
                selected={selected === key}
                onPress={() => setSelected(key)}
              />
            </View>
          ))}
        </View>

        <View style={{ marginTop: scale(11), ...COLUMN }}>
          <FeatureTable />
        </View>

        <View style={{ marginTop: scale(11), paddingHorizontal: scale(18) }}>
          <Pressable>
            <LinearGradient
              colors={[...GRADIENT_BRAND]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: scale(34.4),
                borderRadius: scale(10),
                boxShadow: SHADOW,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ fontSize: scale(9), lineHeight: scale(15), color: '#FFFFFF' }}
                className="font-pretendard-bold">
                한 달 무료체험 시작하기
              </Text>
              <Text
                style={{
                  fontSize: scale(6),
                  lineHeight: scale(9),
                  letterSpacing: scale(-0.18),
                  color: '#FFFFFF',
                }}
                className="font-pretendard-light">
                이후 월 3,900원 청구 · 언제든 해지 가능
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ marginTop: scale(11), paddingHorizontal: scale(18) }}>
          <Text
            style={{
              fontSize: scale(5),
              lineHeight: scale(8),
              letterSpacing: scale(-0.15),
              color: '#868686',
            }}
            className="font-pretendard">
            무료 체험 후 선택한 기간마다 자동 갱신되며, 갱신 24시간 전까지 마이페이지에서 해지할 수
            있어요. 결제는 앱스토어 계정으로 청구됩니다.
          </Text>
          <Text
            style={{
              marginTop: scale(6),
              fontSize: scale(5),
              lineHeight: scale(8),
              letterSpacing: scale(-0.15),
              color: '#868686',
            }}
            className="font-pretendard">
            구매 복원 | 이용 약관 | 개인정보처리방침
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
