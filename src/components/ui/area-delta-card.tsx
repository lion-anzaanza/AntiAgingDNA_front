import { Image, Text, View } from 'react-native';

import { COLOR, SHADOW_V4, TONE_TEXT } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * `지난 주 대비 영역별 변화` — the six-area delta table. 주간 리포트 (v4
 * `1363:3075`) and 한 달 뒤 내 모습 (`1363:3166`) each carry one.
 *
 * Before v4 the two copies were identical to the point. In v4 the left column
 * and every row still agree, but the **right column** does not: 리포트 puts its
 * chips at 111.17 and ends the values at 188.4, 한달뒤 at 107.07 and 181.6. That
 * is 4pt and visible, so the right column is a prop and each screen passes its
 * own frame's numbers.
 *
 * The area icons are pasted screenshots rather than vectors, so each bitmap
 * brings its own near-white ground over the chip — reproduced rather than keyed
 * out, which would eat the white highlights inside the glyphs. v4's bitmaps are
 * the same six pictures as `assets/images/plan/area-*.png` (compared side by
 * side), only drawn in slightly smaller boxes.
 */
const CARD_HEIGHT = 75.962;

const AREA_ICONS = {
  body: { source: require('@/assets/images/plan/area-body.png'), width: 7.871, height: 7.692 },
  mind: { source: require('@/assets/images/plan/area-mind.png'), width: 11.101, height: 8.654 },
  emotion: { source: require('@/assets/images/plan/area-emotion.png'), width: 10.096, height: 8.654 },
  social: { source: require('@/assets/images/plan/area-social.png'), width: 9.124, height: 6.731 },
  environment: {
    source: require('@/assets/images/plan/area-environment.png'),
    width: 9.959,
    height: 8.654,
  },
  total: { source: require('@/assets/images/plan/area-total.png'), width: 9.692, height: 8.654 },
} as const;

export type AreaKey = keyof typeof AREA_ICONS;

/** Rows read down the left column, then down the right. */
const ROWS: { key: AreaKey; label: string }[][] = [
  [
    { key: 'body', label: '신체' },
    { key: 'emotion', label: '감정' },
    { key: 'environment', label: '환경' },
  ],
  [
    { key: 'mind', label: '정신' },
    { key: 'social', label: '사회' },
    { key: 'total', label: '전체' },
  ],
];

/** Card-relative, from v4. Chip tops; the label sits 0.6 and the value 1.1 below the chip's centre. */
const CHIP_TOPS = [25, 41.35, 57.69];
const CHIP_WIDTH = 11.538;
const CHIP_HEIGHT = 10.577;
const DIVIDERS = [38.46, 54.81];
const LABEL_LINE = 12.41;
const VALUE_LINE = 10.154;

/** Where one column's chip starts, its label starts, and its values end. */
export type DeltaColumn = { chip: number; label: number; valueRight: number };

/** Both v4 copies agree on the left column to within 0.2. */
const LEFT_COLUMN: DeltaColumn = { chip: 9.4, label: 30.1, valueRight: 84.0 };

export type AreaDeltas = Record<AreaKey, number>;

export function AreaDeltaCard({
  heading,
  deltas,
  rightColumn,
}: {
  heading: string;
  deltas: AreaDeltas;
  rightColumn: DeltaColumn;
}) {
  const columns = [LEFT_COLUMN, rightColumn];
  return (
    <View
      style={{
        height: scale(CARD_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <Text
        style={{
          position: 'absolute',
          left: scale(8.63),
          top: scale(13.32 - 13.538 / 2),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {heading}
      </Text>

      {DIVIDERS.map((top) => (
        <View
          key={top}
          style={{
            position: 'absolute',
            left: scale(9.03),
            right: scale(9.03),
            top: scale(top - 0.144),
            height: scale(0.288),
            backgroundColor: COLOR.border.soft,
          }}
        />
      ))}

      {ROWS.map((column, columnIndex) =>
        column.map((area, rowIndex) => {
          const icon = AREA_ICONS[area.key];
          const delta = deltas[area.key];
          const { chip, label, valueRight } = columns[columnIndex];
          const top = CHIP_TOPS[rowIndex];
          const centre = top + CHIP_HEIGHT / 2;
          return (
            <View key={area.key}>
              <View
                style={{
                  position: 'absolute',
                  left: scale(chip),
                  top: scale(top),
                  width: scale(CHIP_WIDTH),
                  height: scale(CHIP_HEIGHT),
                  borderRadius: scale(4.808),
                  backgroundColor: COLOR.surface.chip,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icon.source}
                  style={{ width: scale(icon.width), height: scale(icon.height) }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  position: 'absolute',
                  left: scale(label),
                  top: scale(centre + 0.6 - LABEL_LINE / 2),
                  fontSize: scale(8.462),
                  lineHeight: scale(LABEL_LINE),
                  color: COLOR.text.body,
                }}
                className="font-plex">
                {area.label}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  left: scale(valueRight - 30),
                  top: scale(centre + 1.1 - VALUE_LINE / 2),
                  width: scale(30),
                  textAlign: 'right',
                  fontSize: scale(7.333),
                  lineHeight: scale(VALUE_LINE),
                  color: delta < 0 ? TONE_TEXT.danger : TONE_TEXT.good,
                }}
                className="font-plex-semibold">
                {delta > 0 ? `+${delta}` : String(delta)}
              </Text>
            </View>
          );
        }),
      )}
    </View>
  );
}
