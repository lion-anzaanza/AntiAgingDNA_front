import { Image, Text, View } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * `지난 주 대비 영역별 변화` — the six-area delta table. 주간 리포트 (`523:391`)
 * and 한 달 뒤 내 모습 (`523:921`) each carry one, and measured against their own
 * card origin the two are identical down to the point, so this is one component.
 *
 * The area icons are pasted screenshots rather than vectors, so each bitmap
 * brings its own near-white ground. Figma layers it over the `#F2F2F0` chip and
 * the two are close enough to read as one; that stacking is reproduced rather
 * than trying to key the ground out, which would eat the white highlights
 * inside the glyphs.
 */
const CARD_WIDTH = 184;
const CARD_HEIGHT = 79;

const AREA_ICONS = {
  body: { source: require('@/assets/images/plan/area-body.png'), width: 8, height: 8 },
  mind: { source: require('@/assets/images/plan/area-mind.png'), width: 11.545, height: 9 },
  emotion: { source: require('@/assets/images/plan/area-emotion.png'), width: 10, height: 9 },
  social: { source: require('@/assets/images/plan/area-social.png'), width: 10, height: 7 },
  environment: { source: require('@/assets/images/plan/area-environment.png'), width: 10, height: 9 },
  total: { source: require('@/assets/images/plan/area-total.png'), width: 10, height: 9 },
} as const;

export type AreaKey = keyof typeof AREA_ICONS;

const GAIN = '#00A172';
const LOSS = '#F53942';

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

/** Card-relative geometry, shared by both screens. */
const HEADING_CENTRE = 14;
const ROW_TOPS = [26, 43, 60];
const DIVIDERS = [40, 57];
const COLUMN_LEFT = [13, 100];
const LABEL_LEFT = [32, 118];
const VALUE_RIGHT = [81, 168];
const CHIP_WIDTH = 12;
const CHIP_HEIGHT = 11;

export type AreaDeltas = Record<AreaKey, number>;

export function AreaDeltaCard({ heading, deltas }: { heading: string; deltas: AreaDeltas }) {
  return (
    <View
      style={{
        width: scale(CARD_WIDTH),
        height: scale(CARD_HEIGHT),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <Text
        style={{
          position: 'absolute',
          left: scale(11),
          top: scale(HEADING_CENTRE - 4.5),
          fontSize: scale(8),
          lineHeight: scale(9),
          letterSpacing: scale(-0.24),
          color: '#000000',
        }}
        className="font-pretendard-extrabold">
        {heading}
      </Text>

      {DIVIDERS.map((top) => (
        <View
          key={top}
          style={{
            position: 'absolute',
            left: scale(11),
            top: scale(top),
            width: scale(165),
            height: scale(0.3),
            backgroundColor: '#D3D1C6',
          }}
        />
      ))}

      {ROWS.map((column, columnIndex) =>
        column.map((area, rowIndex) => {
          const icon = AREA_ICONS[area.key];
          const delta = deltas[area.key];
          const top = ROW_TOPS[rowIndex];
          return (
            <View key={area.key}>
              <View
                style={{
                  position: 'absolute',
                  left: scale(COLUMN_LEFT[columnIndex]),
                  top: scale(top),
                  width: scale(CHIP_WIDTH),
                  height: scale(CHIP_HEIGHT),
                  borderRadius: scale(5),
                  backgroundColor: '#F2F2F0',
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
                  left: scale(LABEL_LEFT[columnIndex]),
                  top: scale(top + 1),
                  fontSize: scale(7),
                  lineHeight: scale(9),
                  letterSpacing: scale(-0.21),
                  color: '#88877F',
                }}
                className="font-pretendard">
                {area.label}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  left: scale(VALUE_RIGHT[columnIndex] - 56),
                  top: scale(top + 1),
                  width: scale(56),
                  textAlign: 'right',
                  fontSize: scale(7),
                  lineHeight: scale(9),
                  letterSpacing: scale(-0.21),
                  color: delta < 0 ? LOSS : GAIN,
                }}
                className="font-pretendard-semibold">
                {delta > 0 ? `+${delta}` : String(delta)}
              </Text>
            </View>
          );
        }),
      )}
    </View>
  );
}
