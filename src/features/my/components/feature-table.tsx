import { Text, View } from 'react-native';

import { PREMIUM } from '@/features/my/components/subscription-tokens';
import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

const TEXT = '#2C2C2A';
const FREE_COL = '#A4A4A4';
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
  // Figma has this one backwards; see the note in subscription-screen.tsx.
  { label: '광고', free: 'X', premium: '✓' },
];

const ROW_HEIGHT = 24;

export function FeatureTable() {
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
