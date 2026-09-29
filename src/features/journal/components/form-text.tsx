import { Text } from 'react-native';

import { HEADING_GAP, SECTION_GAP } from '@/features/journal/journal-options';
import { scale } from '@/lib/scale';

/**
 * `firstGap` marks the screen's first heading and replaces the section gap
 * above it. Each screen passes its own value — 오늘의 기록 and 상세보기 space
 * their first heading differently; see their `FIRST_HEADING_GAP`.
 */
export function SectionHeading({ children, firstGap }: { children: string; firstGap?: number }) {
  return (
    <Text
      style={{
        fontSize: scale(10),
        lineHeight: scale(14),
        marginTop: scale(firstGap ?? SECTION_GAP),
        marginBottom: scale(HEADING_GAP),
        color: '#00352C',
      }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}

/** The Bold 8 heading the hand-built cards share with `SelectCard`. */
export function CardTitle({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(8), lineHeight: scale(15), color: '#00352C' }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}

/** Grey Medium 5 note under a card title. */
export function CardCaption({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(8), marginTop: scale(-1), color: '#88877F' }}
      className="font-pretendard-medium">
      {children}
    </Text>
  );
}

/** 운동 습관 labels its two pill rows in a darker Bold 5 instead. */
export function FieldCaption({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(8), marginTop: scale(5.5), color: '#5F5E5B' }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}
