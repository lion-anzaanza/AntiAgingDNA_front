import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
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

const INK = '#00352C';
const TEXT = '#2C2C2A';
const FREE_COL = '#A4A4A4';
const PREMIUM = '#A100FF';
const BOTH_TICK = '#0B9456';

/** Table rows, top to bottom. `free`/`premium` are the two answer columns. */
const FEATURES: { label: string; free: string; premium: string; bothTick?: boolean }[] = [
  { label: '매일 기록 · 오늘 점수', free: '✓', premium: '✓', bothTick: true },
  { label: '오늘의 일지 상세 저장 · 조회', free: '최근 7일', premium: '무제한' },
  { label: '주간 리포트 제공', free: 'X', premium: '✓' },
  { label: '한 달 뒤 내 모습 확인', free: 'X', premium: '✓' },
  { label: '일간 컨디션 요약', free: 'X', premium: '✓' },
  { label: '오늘의 일지 캘린더', free: 'X', premium: '✓' },
  { label: '웨어러블 기기 연동', free: 'X', premium: '✓' },
  // Figma has this one backwards; see the note above.
  { label: '광고', free: 'X', premium: '✓' },
];

const PLANS = [
  { key: 'yearly', title: '연간', price: '29,000원', per: '/ 년', badge: '38% 할인! 가장 인기' },
  { key: 'monthly', title: '연간', price: '3,900원', per: '/ 년' },
];

/** Both cards carry this in Figma — it is the 마이페이지 profile label, not a plan. */
const PLAN_SUBTITLE = '올빼미 - 고민감 - 누적형';

const ROW_HEIGHT = 24;

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
              <PlanCard
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

/** `Rectangle 3825` — the `#FFF8D5` pill with the crown. */
function PremiumBadge() {
  return (
    <View
      style={{
        width: scale(62),
        height: scale(12),
        borderRadius: scale(10),
        backgroundColor: '#FFF8D5',
        borderWidth: scale(0.2),
        borderColor: '#FFC800',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scale(4),
      }}>
      <Image
        source={require('@/assets/images/my/ic-crown.png')}
        style={{ width: scale(11), height: scale(12) }}
        resizeMode="contain"
      />
      <Text
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: scale(5),
          lineHeight: scale(12),
          letterSpacing: scale(-0.05),
          color: '#774F00',
        }}
        className="font-pretendard-semibold">
        LifeDNA 프리미엄
      </Text>
    </View>
  );
}

function PlanCard({
  title,
  price,
  per,
  badge,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  per: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          height: scale(30),
          borderRadius: scale(7),
          // Same element tree either way — only the values change (AGENTS.md #3).
          backgroundColor: selected ? '#F7F1FF' : '#FFFFFF',
          borderWidth: selected ? scale(0.4) : scale(0.3),
          borderColor: selected ? PREMIUM : '#DDDDDD',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: scale(11),
        }}>
        {/* `Rectangle 3091` / `3797` — a 10pt radio with a 4pt dot when chosen. */}
        <View
          style={{
            width: scale(10),
            height: scale(10),
            borderRadius: scale(5),
            borderWidth: scale(0.6),
            borderColor: selected ? PREMIUM : '#C9C9C9',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: scale(4),
              height: scale(4),
              borderRadius: scale(2),
              backgroundColor: selected ? PREMIUM : 'transparent',
            }}
          />
        </View>

        <View style={{ marginLeft: scale(9), flexShrink: 1 }}>
          <Text
            style={{ fontSize: scale(8), lineHeight: scale(11), color: INK }}
            className="font-pretendard-bold">
            {title}
          </Text>
          <Text
            style={{
              fontSize: scale(6),
              lineHeight: scale(9),
              letterSpacing: scale(-0.18),
              color: '#676767',
            }}
            className="font-pretendard">
            {PLAN_SUBTITLE}
          </Text>
        </View>

        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{ fontSize: scale(9), lineHeight: scale(15), color: INK }}
            className="font-pretendard-bold">
            {price}
          </Text>
          <Text
            style={{
              marginLeft: scale(3),
              fontSize: scale(5),
              lineHeight: scale(9),
              letterSpacing: scale(-0.15),
              color: '#868686',
            }}
            className="font-pretendard">
            {per}
          </Text>
        </View>
      </View>

      {badge ? (
        <LinearGradient
          colors={[...GRADIENT_BRAND]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            right: scale(8),
            top: scale(-4),
            width: scale(44),
            height: scale(9),
            borderRadius: scale(5),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: scale(4),
              lineHeight: scale(9),
              letterSpacing: scale(-0.04),
              color: '#FFFFFF',
            }}
            className="font-pretendard-semibold">
            {badge}
          </Text>
        </LinearGradient>
      ) : null}
    </Pressable>
  );
}

function FeatureTable() {
  return (
    <View
      style={{
        borderRadius: scale(6),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        overflow: 'hidden',
      }}>
      <View
        style={{
          height: scale(24),
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F7F1FF',
        }}>
        <HeadCell label="기능" color="#88877F" align="left" />
        <HeadCell label="무료 플랜" color={FREE_COL} align="center" />
        <HeadCell label="프리미엄" color={PREMIUM} align="center" />
      </View>

      {FEATURES.map((feature) => (
        <View
          key={feature.label}
          style={{
            height: scale(ROW_HEIGHT),
            flexDirection: 'row',
            alignItems: 'center',
            borderTopWidth: scale(0.3),
            borderTopColor: '#EDEDED',
          }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1.75,
              paddingLeft: scale(12),
              fontSize: scale(7),
              lineHeight: scale(9),
              letterSpacing: scale(-0.21),
              color: TEXT,
            }}
            className="font-pretendard">
            {feature.label}
          </Text>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: scale(7),
              lineHeight: scale(9),
              letterSpacing: scale(-0.21),
              color: feature.bothTick ? BOTH_TICK : FREE_COL,
            }}
            className={feature.bothTick ? 'font-pretendard-bold' : 'font-pretendard-semibold'}>
            {feature.free}
          </Text>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: scale(7),
              lineHeight: scale(9),
              letterSpacing: scale(-0.21),
              color: feature.bothTick ? BOTH_TICK : PREMIUM,
            }}
            className={feature.bothTick ? 'font-pretendard-bold' : 'font-pretendard-semibold'}>
            {feature.premium}
          </Text>
        </View>
      ))}
    </View>
  );
}

function HeadCell({
  label,
  color,
  align,
}: {
  label: string;
  color: string;
  align: 'left' | 'center';
}) {
  return (
    <Text
      style={{
        flex: align === 'left' ? 1.75 : 1,
        paddingLeft: align === 'left' ? scale(12) : 0,
        textAlign: align,
        fontSize: scale(7),
        lineHeight: scale(9),
        letterSpacing: scale(-0.21),
        color,
      }}
      className="font-pretendard-semibold">
      {label}
    </Text>
  );
}
