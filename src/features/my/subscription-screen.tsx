import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { FeatureTable, FEATURE_TABLE_HEIGHT } from '@/features/my/components/feature-table';
import { PremiumBadge } from '@/features/my/components/premium-badge';
import {
  PLAN_CARD_HEIGHT,
  SubscriptionPlanCard,
} from '@/features/my/components/subscription-plan-card';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 마이페이지/구독관리 (`1363:3269`).
 *
 * **Nothing here transacts.** There is no commerce domain in the API at all
 * (backlog 15 and 24), so the plan cards only move a local selection and the
 * CTA does nothing. Wiring it means a payment SDK, not an endpoint.
 *
 * v4 fixed one of the older frame's slips — the second plan is titled `월간`
 * now — and kept three, reproduced here and all worth a designer's eye:
 *
 * - **Both price suffixes still say `/ 년`**, so the 3,900원 plan reads as a
 *   yearly price although the CTA's fine print says "이후 월 3,900원 청구".
 * - **Both plan subtitles read `올빼미 - 고민감 - 누적형`**, which is the profile
 *   type label from 마이페이지/메인 — a placeholder left in.
 * - **The 광고 row is X for 무료 플랜 and ✓ for 프리미엄**, i.e. it says the paid
 *   plan is the one with ads. Every other row uses ✓ for "included".
 *
 * Every element sits at Figma's own y less the 38pt PhoneHeader mock.
 */
const COLUMN = { left: scale(11.28), width: scale(197.436) };

const PLANS = [
  { key: 'yearly', title: '연간', price: '29,000원', per: '/ 년', top: 93.73 },
  { key: 'monthly', title: '월간', price: '3,900원', per: '/ 년', top: 126.42 },
];

/** `38% 할인! 가장 인기` — a pastel pill riding over the yearly card's top edge. */
const DEAL = { left: 134.85, top: 89.03, width: 65.327, height: 10.72 };
const DEAL_RAMP = cssGradientPoints(pastelAngle(DEAL.width, DEAL.height), DEAL.width, DEAL.height);

const CTA_RAMP = cssGradientPoints(GRADIENT_PASTEL.angle, 197.436, 27.077);

const HEADLINE = {
  fontSize: scale(11.282),
  lineHeight: scale(15.795),
  letterSpacing: scale(-0.1128),
};

const FINE_PRINT = {
  fontSize: scale(6.769),
  lineHeight: scale(9.026),
  color: COLOR.text.muted,
  textAlign: 'center' as const,
};

export default function SubscriptionScreen() {
  const [selected, setSelected] = useState('yearly');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(24) }}>
        <View style={{ height: scale(417.08) }}>
          <View style={{ position: 'absolute', left: scale(11.28), top: scale(12) }}>
            <ButtonBack fallbackHref="/my" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.44),
              top: scale(9.47),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            구독관리
          </Text>

          <View style={{ position: 'absolute', top: scale(34.12), left: 0, right: 0, alignItems: 'center' }}>
            <PremiumBadge />
          </View>

          {/*
            * Figma centres the two lines on x 109.3 — 0.7pt left of the middle,
            * once — so they are centred. "를" is `text/strong` and the rest
            * `text/heading`, as drawn; the two are all but the same ink.
            */}
          <View style={{ position: 'absolute', top: scale(50.86), left: 0, right: 0 }}>
            <Text
              style={{ ...HEADLINE, color: COLOR.text.heading, textAlign: 'center' }}
              className="font-plex-bold">
              한 달 무료 플랜으로
            </Text>
            <Text style={{ ...HEADLINE, textAlign: 'center' }} className="font-plex-bold">
              <Text style={{ color: COLOR.brand.violetText }}>더 깊은 나</Text>
              <Text style={{ color: COLOR.text.strong }}>를</Text>
              <Text style={{ color: COLOR.text.heading }}> 만나보세요!</Text>
            </Text>
          </View>

          {PLANS.map(({ key, top, ...plan }) => (
            <View
              key={key}
              style={{ position: 'absolute', top: scale(top), height: scale(PLAN_CARD_HEIGHT), ...COLUMN }}>
              <SubscriptionPlanCard
                {...plan}
                selected={selected === key}
                onPress={() => setSelected(key)}
              />
            </View>
          ))}

          {/* Drawn after both cards: it overlaps the yearly one. */}
          <LinearGradient
            pointerEvents="none"
            colors={[...GRADIENT_PASTEL.colors]}
            locations={[...GRADIENT_PASTEL.locations]}
            start={DEAL_RAMP.start}
            end={DEAL_RAMP.end}
            style={{
              position: 'absolute',
              left: scale(DEAL.left),
              top: scale(DEAL.top),
              width: scale(DEAL.width),
              height: scale(DEAL.height),
              borderRadius: scale(4.808),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{ fontSize: scale(6.769), lineHeight: scale(9.026), color: COLOR.text.onPastel }}
              className="font-plex">
              38% 할인! 가장 인기
            </Text>
          </LinearGradient>

          <View
            style={{
              position: 'absolute',
              top: scale(165.85),
              height: scale(FEATURE_TABLE_HEIGHT),
              ...COLUMN,
            }}>
            <FeatureTable />
          </View>

          {/*
            * The pastel ButtonNextUI box, but its label is SemiBold 9.59 rather
            * than the shared `Button`'s Bold 11.28 (결정 대기 14), and it sits
            * 1.17pt above the middle — so it is drawn here. It does nothing.
            */}
          <Pressable style={{ position: 'absolute', top: scale(383.29), ...COLUMN }}>
            <LinearGradient
              colors={[...GRADIENT_PASTEL.colors]}
              locations={[...GRADIENT_PASTEL.locations]}
              start={CTA_RAMP.start}
              end={CTA_RAMP.end}
              style={{ height: scale(27.077), borderRadius: scale(9.615), boxShadow: SHADOW_V4 }}>
              <Text
                style={{
                  position: 'absolute',
                  top: scale(12.37 - 13.538 / 2),
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: scale(9.59),
                  lineHeight: scale(13.538),
                  letterSpacing: scale(-0.0959),
                  color: COLOR.text.onPastel,
                }}
                className="font-plex-semibold">
                한 달 무료체험 시작하기
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/*
          * The fine print is in normal flow, not absolute, so a wrap pushes the
          * links down instead of drawing over them. Figma breaks the paragraph
          * by hand after "전까지" and its second line fills the 197.4 column;
          * Android's Plex runs ~2% wider, so in the column "다." wrapped to a
          * third line. The paragraph gets 4pt from either screen edge, which
          * fits at font scale 1.0; at 1.1 it wraps to three lines. (Shrinking
          * with `adjustsFontSizeToFit` was tried: it shrank ~9% even at 1.0.)
          */}
        <Text style={FINE_PRINT} className="font-plex">
          이후 월 3,900원 청구 · 언제든 해지 가능
        </Text>
        <Text
          style={{ marginTop: scale(434.42 - 417.08 - 9.026), marginHorizontal: scale(4), ...FINE_PRINT }}
          className="font-plex">
          {'무료 체험 후 선택한 기간마다 자동 갱신되며, 갱신 24시간 전까지\n마이페이지에서 해지할 수 있어요. 결제는 앱스토어 계정으로 청구됩니다.'}
        </Text>
        <Text
          style={{ marginTop: scale(456.98 - 434.42 - 2 * 9.026), ...FINE_PRINT }}
          className="font-plex">
          {'구매 복원   |   이용 약관   |   개인정보처리방침'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
