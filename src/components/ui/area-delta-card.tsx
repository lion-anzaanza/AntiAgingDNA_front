import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR, SHADOW_V4, TONE_TEXT } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * `지난 주 대비 영역별 변화` — the six-area delta table. 주간 리포트 (v3
 * `1318:1739`) and 한 달 뒤 내 모습 (`1318:1820`) each carry one.
 *
 * v3 redrew it 156 tall (88 at 220, was 75.96) with rows 36 apart, and swapped
 * the pasted area bitmaps for 24pt `Icon/*` glyphs in `icon/primary`. The icons
 * and labels sit at the same x on both screens; what still differs is where the
 * **chips** behind the icons start and where the values end — 리포트 puts the
 * right chips at 111.17 and ends the values at 188.6, 한달뒤 at 107.07 and 181.7,
 * so on 한달뒤 the right-hand glyphs overhang their chips. That is drawn, so the
 * right column's chip and value edge are a prop and each screen passes its own.
 */
const CARD_HEIGHT = 88.0;

const AREA_ICONS = {
  body: 'heart',
  mind: 'mind',
  emotion: 'smile',
  social: 'users',
  environment: 'leaf',
  total: 'star',
} as const satisfies Record<string, IconName>;

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

/** Card-relative, from v3. Both copies agree on all of these. */
const CHIP_TOPS = [27.077, 47.385, 67.692];
const CHIP_WIDTH = 11.538;
const CHIP_HEIGHT = 10.577;
const DIVIDERS = [42.308, 63.179];
const ICON_SIZE = 13.538;
const ICON_LEFT = [9.026, 110.564];
/** The right column's first glyph (정신) sits 0.56 higher than the left's. */
const ICON_TOPS = [
  [26.513, 46.256, 66.564],
  [25.949, 46.256, 66.564],
];
const LABEL_LEFT = [28.205, 129.744];
/** Line-box centres; 사회 sits 0.56 below 감정. */
const LABEL_CENTRES = [
  [32.718, 53.026, 73.333],
  [32.718, 53.59, 73.333],
];
const VALUE_CENTRES = [33.282, 53.59, 73.897];
const LABEL_LINE = 12.41;
const VALUE_LINE = 10.154;
/** v3's red on this table only — 홈's grades keep `TONE_TEXT.danger`. */
const VALUE_DOWN = '#CF3038';

/** Where one column's chip starts and its values end. */
export type DeltaColumn = { chip: number; valueRight: number };

/** The two v3 copies put the left chips at 9.30 / 9.50 and end the values at 84.2 / 84.4. */
const LEFT_COLUMN: DeltaColumn = { chip: 9.4, valueRight: 84.3 };

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
          top: scale(14.103 - 13.538 / 2),
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
          const delta = deltas[area.key];
          const { chip, valueRight } = columns[columnIndex];
          return (
            <View key={area.key}>
              <Text
                style={{
                  position: 'absolute',
                  left: scale(LABEL_LEFT[columnIndex]),
                  top: scale(LABEL_CENTRES[columnIndex][rowIndex] - LABEL_LINE / 2),
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
                  top: scale(VALUE_CENTRES[rowIndex] - VALUE_LINE / 2),
                  width: scale(30),
                  textAlign: 'right',
                  fontSize: scale(7.333),
                  lineHeight: scale(VALUE_LINE),
                  color: delta < 0 ? VALUE_DOWN : TONE_TEXT.good,
                }}
                className="font-plex-semibold">
                {delta > 0 ? `+${delta}` : String(delta)}
              </Text>
              {/* Chip, then glyph over it — v3's paint order. */}
              <View
                style={{
                  position: 'absolute',
                  left: scale(chip),
                  top: scale(CHIP_TOPS[rowIndex]),
                  width: scale(CHIP_WIDTH),
                  height: scale(CHIP_HEIGHT),
                  borderRadius: scale(4.808),
                  backgroundColor: COLOR.surface.chip,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: scale(ICON_LEFT[columnIndex]),
                  top: scale(ICON_TOPS[columnIndex][rowIndex]),
                }}>
                <Icon name={AREA_ICONS[area.key]} size={scale(ICON_SIZE)} color={COLOR.icon.primary} />
              </View>
            </View>
          );
        }),
      )}
    </View>
  );
}
