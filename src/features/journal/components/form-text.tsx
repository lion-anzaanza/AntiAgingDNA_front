import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import {
  captionStyle,
  CARD_INSET,
  CARD_PAD_TOP,
  CARD_SURFACE,
  CARD_TITLE,
  CARD_TITLE_INSET,
} from '@/components/ui/select-card';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * The pieces 오늘의 기록 and 상세보기 share outside the `components/ui` family:
 * section headings, and the chrome of the three cards v4 draws as loose shapes
 * rather than as `SelectItem*_Card` (카페인 섭취, 운동 습관, 오늘 날씨).
 */

/**
 * v4 section heading ("오늘의 컨디션", "수면습관" …): Plex Bold 11.28 on a 15.8
 * line, `text/heading`. v4 spaces every section a little differently (8.7–11.5
 * above, 3.5–5.3 below) and the two 일지 frames agree on it section by section,
 * so each screen passes the gaps it measured rather than sharing one constant.
 */
export function SectionHeading({
  children,
  above,
  below,
}: {
  children: string;
  above: number;
  below: number;
}) {
  return (
    <Text
      style={{
        fontSize: scale(11.282),
        lineHeight: scale(15.795),
        letterSpacing: scale(-0.1128),
        marginTop: scale(above),
        marginBottom: scale(below),
        color: COLOR.text.heading,
      }}
      className="font-plex-bold">
      {children}
    </Text>
  );
}

/** The question heading of a hand-built card — the same as `SelectCard`'s. */
export function CardTitle({ children, marginTop = 0 }: { children: string; marginTop?: number }) {
  return (
    <Text
      style={[CARD_TITLE, { marginLeft: scale(CARD_TITLE_INSET), marginTop: scale(marginTop) }]}
      className="font-plex-semibold">
      {children}
    </Text>
  );
}

/**
 * Plex Regular 6.77 note under a card title, tucked under its line box like
 * `SelectCard`'s; `history` takes 상세보기's smaller, lower caption.
 */
export function CardCaption({ children, history = false }: { children: string; history?: boolean }) {
  return (
    <Text style={[captionStyle(history), { marginLeft: scale(8.6) }]} className="font-plex">
      {children}
    </Text>
  );
}

/** 운동 습관 labels its two lower pill rows in Plex SemiBold 7.33 `text/body`. */
export function FieldCaption({ children, marginTop }: { children: string; marginTop: number }) {
  return (
    <Text
      style={{
        fontSize: scale(7.333),
        lineHeight: scale(10.154),
        marginTop: scale(marginTop),
        marginLeft: scale(8.78),
        color: COLOR.text.body,
      }}
      className="font-plex-semibold">
      {children}
    </Text>
  );
}

/** A white card with `SelectCard`'s top and bottom padding. */
export function LooseCard({ children }: { children: ReactNode }) {
  return (
    <View style={[CARD_SURFACE, { paddingTop: scale(CARD_PAD_TOP), paddingBottom: scale(9.03) }]}>
      {children}
    </View>
  );
}

/**
 * One row of `journal` pills — gap 4.51, inset 9.03, like `SelectCard`'s. The
 * pills size themselves with `pillWidth` (equal, or v3's label-following widths).
 */
export function PillRow({ children, marginTop }: { children: ReactNode; marginTop: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: scale(4.513),
        paddingHorizontal: scale(CARD_INSET),
        marginTop: scale(marginTop),
      }}>
      {children}
    </View>
  );
}

/**
 * v3 `Card/Rectangle 3437` — 오늘 날씨 under 자동 기록: `surface/chip` with a
 * 0.29 `border/soft` hairline and no shadow, a white "자동 기록됨" chip in the
 * corner. `value` is the line under the title.
 */
export function WeatherCard({ value }: { value: string }) {
  return (
    <View
      style={{
        height: scale(38.688),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.chip,
        borderWidth: scale(0.288),
        borderColor: COLOR.border.soft,
      }}>
      <CardTitle marginTop={CARD_PAD_TOP}>오늘 날씨</CardTitle>
      <Text
        style={{
          position: 'absolute',
          left: scale(CARD_INSET),
          top: scale(21.93),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {value}
      </Text>
      <View
        style={{
          position: 'absolute',
          top: scale(8.64),
          right: scale(CARD_INSET),
          width: scale(39.857),
          height: scale(9.626),
          borderRadius: scale(9.615),
          backgroundColor: COLOR.surface.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(6.769), lineHeight: scale(9.026), color: COLOR.text.body }}
          className="font-plex">
          자동 기록됨
        </Text>
      </View>
    </View>
  );
}
