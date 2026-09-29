import { Text, View } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/** The one v4 colour in this card that is not a token: 매일 기록's two green ticks. */
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

/**
 * Row bands of v4 `Card/Rectangle 3827`, read off its dividers (23.08 → 46.15 →
 * … → 161.54 → 183.65). The seventh is a point shorter, as Figma draws it.
 */
const HEADER_HEIGHT = 23.077;
const ROW_HEIGHTS = [23.07, 23.08, 23.08, 23.08, 23.07, 23.08, 22.11, 23.08];
export const FEATURE_TABLE_HEIGHT = 206.731;

/**
 * Column centres. Figma centres its Pretendard marks (✓ / X) on one axis and
 * its Plex words on another, a point or four to the left — each kind keeps its
 * own, since every mark in a column agrees with the others to 0.2pt.
 */
const FREE_MARK = 128.55;
const PREMIUM_MARK = 179.36;
const FREE_WORD = 126.6;
const HEAD_PREMIUM = 174.78;
const BODY_PREMIUM_WORD = 178.32;
const CELL = 60;

export function FeatureTable() {
  return (
    <View
      style={{
        height: scale(FEATURE_TABLE_HEIGHT),
        borderRadius: scale(5.769),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
        overflow: 'hidden',
      }}>
      <View style={{ height: scale(HEADER_HEIGHT), backgroundColor: COLOR.surface.tint }}>
        <Cell text="기능" left={8.58} color={COLOR.text.body} head />
        <Cell text="무료 플랜" centre={FREE_WORD} color={COLOR.text.body} head />
        <Cell text="프리미엄" centre={HEAD_PREMIUM} color={COLOR.brand.violetText} head />
      </View>

      {FEATURES.map((feature, index) => {
        const isMark = (value: string) => value === '✓' || value === 'X';
        return (
          <View
            key={feature.label}
            style={{
              height: scale(ROW_HEIGHTS[index]),
              borderTopWidth: scale(0.288),
              borderTopColor: COLOR.border.soft,
            }}>
            <Cell text={feature.label} left={8.77} color={COLOR.text.strong} />
            <Cell
              text={feature.free}
              centre={isMark(feature.free) ? FREE_MARK : FREE_WORD}
              color={feature.bothTick ? BOTH_TICK : COLOR.text.body}
              mark={isMark(feature.free)}
              bold={feature.bothTick}
            />
            <Cell
              text={feature.premium}
              centre={isMark(feature.premium) ? PREMIUM_MARK : BODY_PREMIUM_WORD}
              color={feature.bothTick ? BOTH_TICK : COLOR.brand.violetText}
              mark={isMark(feature.premium)}
              bold={feature.bothTick}
            />
          </View>
        );
      })}
    </View>
  );
}

/**
 * One label, vertically centred in its row and placed either from the left
 * (the 기능 column) or on a column centre. Header and answer words are Plex
 * SemiBold 7.33; row labels Plex Regular 6.77; ✓ / X Pretendard SemiBold 7.33
 * (Bold for the green pair).
 */
function Cell({
  text,
  left,
  centre,
  color,
  head,
  mark,
  bold,
}: {
  text: string;
  left?: number;
  centre?: number;
  color: string;
  head?: boolean;
  mark?: boolean;
  bold?: boolean;
}) {
  const label = left !== undefined && !head;
  const lineHeight = mark ? 9.429 : label ? 9.026 : 10.154;
  const className = mark
    ? bold
      ? 'font-pretendard-bold'
      : 'font-pretendard-semibold'
    : label
      ? 'font-plex'
      : 'font-plex-semibold';
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        ...(centre !== undefined
          ? { left: scale(centre - CELL / 2), width: scale(CELL), alignItems: 'center' }
          : { left: scale(left ?? 0) }),
      }}>
      <Text
        style={{
          fontSize: scale(label ? 6.769 : 7.333),
          lineHeight: scale(lineHeight),
          letterSpacing: mark ? scale(-0.22) : 0,
          // All three header words sit 1.5pt below the band's middle in Figma.
          transform: [{ translateY: head ? scale(1.5) : 0 }],
          color,
        }}
        className={className}>
        {text}
      </Text>
    </View>
  );
}
