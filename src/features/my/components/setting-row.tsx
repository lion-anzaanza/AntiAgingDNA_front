import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/** v4's switch track when off — a bare hex, not a token. */
const TRACK_OFF = '#DADADA';

/** Trailing marks share one box at the right of the row: x 168.9..188.4 of 197.4. */
const TRAIL_LEFT = 169.05;
const TRAIL_WIDTH = 19.314;
const TRAIL_HEIGHT = 9.615;
const TRAIL_TOP = 5.77;
const KNOB = 7.692;
/** Knob inset from the track's ends: 1.49 off, 10.12 from the left on. */
const KNOB_OFF = 1.49;
const KNOB_ON = TRAIL_WIDTH - KNOB - 1.5;

export type ToggleKey =
  | 'analysis'
  | 'stats'
  | 'wearable'
  | 'marketing'
  | 'appLock'
  | 'download'
  | 'backup';

export type Row = {
  label: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
  /** Figma places each icon absolutely in its row, not centred. */
  iconTop: number;
  /** A switch, a `>` chevron, or a small violet pill. */
  toggle?: ToggleKey;
  chevron?: boolean;
  pill?: string;
  caption?: string;
  captionLeft?: number;
};

/**
 * One row of a v4 데이터개인정보 card — the same grid as 마이페이지/메인's
 * `MenuRow`: icon at x 9.1, label Plex 6.77 `text/strong`, 0.288 `border/soft`
 * dividers. The switch is drawn, not the platform `Switch`: v4's is a 19.3×9.6
 * `brand/violet` track (grey when off) with a flat white knob, and Android's
 * cannot be made to look like that.
 */
export function SettingRow({
  row,
  height,
  first,
  value,
  onToggle,
}: {
  row: Row;
  height: number;
  first: boolean;
  value: boolean;
  onToggle?: (next: boolean) => void;
}) {
  return (
    <View
      style={{
        height: scale(height),
        justifyContent: 'center',
        borderTopWidth: first ? 0 : scale(0.288),
        borderTopColor: COLOR.border.soft,
      }}>
      <Image
        source={row.icon}
        style={{
          position: 'absolute',
          left: scale(9.1),
          top: scale(row.iconTop),
          width: scale(row.iconWidth),
          height: scale(row.iconHeight),
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          position: 'absolute',
          left: scale(29.5),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.text.strong,
        }}
        className="font-plex">
        {row.label}
      </Text>
      {row.caption ? (
        <Text
          numberOfLines={1}
          style={{
            position: 'absolute',
            left: scale(row.captionLeft ?? 0),
            // Up to the `>` glyph (x ≈ 184) — the 위험 caption needs 85.5pt.
            right: scale(14),
            // Both captions sit 1–1.5pt below their row's middle in Figma.
            transform: [{ translateY: scale(1.25) }],
            fontSize: scale(6.769),
            lineHeight: scale(9.026),
            color: COLOR.text.body,
          }}
          className="font-plex">
          {row.caption}
        </Text>
      ) : null}

      {row.toggle ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={row.label}
          accessibilityState={{ checked: value }}
          hitSlop={scale(6)}
          onPress={() => onToggle?.(!value)}
          style={{
            position: 'absolute',
            left: scale(TRAIL_LEFT),
            top: scale(TRAIL_TOP),
            width: scale(TRAIL_WIDTH),
            height: scale(TRAIL_HEIGHT),
            borderRadius: scale(TRAIL_HEIGHT / 2),
            // Same element tree either way — only the values change (AGENTS.md #3).
            backgroundColor: value ? COLOR.brand.violet : TRACK_OFF,
          }}>
          <View
            style={{
              position: 'absolute',
              left: scale(value ? KNOB_ON : KNOB_OFF),
              top: scale((TRAIL_HEIGHT - KNOB) / 2),
              width: scale(KNOB),
              height: scale(KNOB),
              borderRadius: scale(KNOB / 2),
              backgroundColor: COLOR.surface.card,
            }}
          />
        </Pressable>
      ) : row.pill ? (
        <View
          style={{
            position: 'absolute',
            left: scale(TRAIL_LEFT - 0.1),
            top: scale(TRAIL_TOP),
            width: scale(TRAIL_WIDTH),
            height: scale(TRAIL_HEIGHT),
            borderRadius: scale(TRAIL_HEIGHT / 2),
            backgroundColor: COLOR.surface.tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: scale(7.333),
              lineHeight: scale(10.154),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            {row.pill}
          </Text>
        </View>
      ) : (
        <Text
          style={{
            position: 'absolute',
            right: scale(7.96),
            // Figma's `>` centres 1.44pt below the row's middle.
            transform: [{ translateY: scale(1.44) }],
            fontSize: scale(11.282),
            lineHeight: scale(20.308),
            letterSpacing: scale(-0.1128),
            color: COLOR.text.body,
          }}
          className="font-pretendard-light">
          {'>'}
        </Text>
      )}
    </View>
  );
}
