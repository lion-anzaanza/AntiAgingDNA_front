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
import { COLOR, GRADIENT_PASTEL } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 마이페이지/구독관리 (`1318:1876`).
 *
 * **Nothing here transacts.** There is no commerce domain in the API at all
 * (backlog 15 and 24), so the plan cards only move a local selection and the
 * CTA does nothing. Wiring it means a payment SDK, not an endpoint.
 *
 * v3 fixed two of v4's slips — the monthly plan's suffix reads `/ 월`, and each
 * plan has its own subtitle instead of the profile type label — and kept one,
 * reproduced here and worth a designer's eye:
 *
 * - **The 광고 row is X for 무료 플랜 and ✓ for 프리미엄**, i.e. it says the paid
 *   plan is the one with ads. Every other row uses ✓ for "included".
 *
 * Every element sits at Figma's own y (×220/390) less the 38pt PhoneHeader mock.
 */
const COLUMN = { left: scale(11.28), width: scale(197.436) };

const PLANS = [
  {
    key: 'yearly',
    title: '연간',
    subtitle: '월 2,417원 꼴 · 12개월 한 번에 결제',
    price: '29,000원',
    per: '/ 년',
    top: 93.73,
  },
  {
    key: 'monthly',
    title: '월간',
    subtitle: '매월 결제 · 언제든 해지 가능',
    price: '3,900원',
    per: '/ 월',
    top: 126.42,
  },
];

/** `38% 할인! 가장 인기` — a pastel pill riding over the yearly card's top edge. */
const DEAL = { left: 134.85, top: 89.03, width: 65.327, height: 10.72 };
const DEAL_RAMP = cssGradientPoints(pastelAngle(DEAL.width, DEAL.height), DEAL.width, DEAL.height);

const CTA_RAMP = cssGradientPoints(166.3186, 197.436, 27.077);
/** v3's `drop-shadow(0 0 3.409px …)` on the pastel buttons, at 220. */
const BUTTON_SHADOW = '0px 0px 1.923px rgba(169, 169, 169, 0.25)';

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
      <ScrollView contentContainerStyle={{ paddingBottom: scale(16.64) }}>
        <View style={{ height: scale(417.59) }}>
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(6.99) }}>
            <ButtonBack fallbackHref="/my" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.657),
              top: scale(9.0),
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
          <View style={{ position: 'absolute', top: scale(51.65), left: 0, right: 0 }}>
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
            * than the shared `Button`'s Bold 11.28 (결정 대기 14), and v3 draws it
            * at radius 16 (9.03) — so it is drawn here. It does nothing.
            */}
          <Pressable style={{ position: 'absolute', top: scale(383.29), ...COLUMN }}>
            <LinearGradient
              colors={[...GRADIENT_PASTEL.colors]}
              locations={[...GRADIENT_PASTEL.locations]}
              start={CTA_RAMP.start}
              end={CTA_RAMP.end}
              style={{
                height: scale(27.077),
                borderRadius: scale(9.026),
                boxShadow: BUTTON_SHADOW,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
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
          * links down instead of drawing over them. v3 sets the paragraph in 10px
          * (5.64) and breaks it by hand after "전까지"; it gets 4pt from either
          * screen edge so Android's ~2% wider Plex does not add a third line.
          */}
        <Text style={FINE_PRINT} className="font-plex">
          이후 월 3,900원 청구 · 언제든 해지 가능
        </Text>
        <Text
          style={{
            marginTop: scale(451.34 - 417.59 - 9.026),
            marginHorizontal: scale(4),
            ...FINE_PRINT,
            fontSize: scale(5.641),
          }}
          className="font-plex">
          {'무료 체험 후 선택한 기간마다 자동 갱신되며, 갱신 24시간 전까지\n마이페이지에서 해지할 수 있어요. 결제는 앱스토어 계정으로 청구됩니다.'}
        </Text>
        <Text
          style={{ marginTop: scale(479.55 - 451.34 - 2 * 9.026), ...FINE_PRINT }}
          className="font-plex">
          {'구매 복원   |   이용 약관   |   개인정보처리방침'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
