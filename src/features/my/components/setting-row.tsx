import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/** v3 frames are 390 wide; every value in this file is read off them in v3 points. */
const V3 = 220 / 390;
const at = (v3Points: number) => scale(v3Points * V3);

/** v3's switch track when off — a bare hex, not a token. */
const TRACK_OFF = '#DADADA';
const TRACK = { left: 292, width: 44, height: 26 };
const KNOB = 22;

export type ToggleKey = 'analysis' | 'stats' | 'wearable' | 'marketing' | 'appLock';

export type Row = {
  label: string;
  icon: IconName;
  /**
   * Where this row's pieces sit inside its card, in v3 points from the card's
   * top. v3 places every row by hand: icons on a 48pt pitch, labels a point
   * either side of it, and the dividers wherever they landed (47 / 95 / 145 on
   * the first card). Reproduced as drawn rather than snapped to a grid.
   */
  iconTop: number;
  labelCentre: number;
  /** A switch (its track top), a chevron (its box top), or a small violet pill. */
  toggle?: { key: ToggleKey; top: number };
  chevronTop?: number;
  pill?: { text: string; top: number };
  caption?: string;
};

/**
 * One row of a v3 데이터개인정보 card — the same grid as 마이페이지/메인's
 * `MenuRow`: a 24pt `Icon/*` in `icon/primary` at x 16, a Plex Regular 15 label
 * at x 50, and a trailing switch, chevron or pill. The switch is drawn, not the
 * platform `Switch`: v3's is a 44×26 `brand/accent` track (grey when off) with a
 * flat 22pt white knob, and Android's cannot be made to look like that.
 */
export function SettingRow({
  row,
  value,
  onToggle,
}: {
  row: Row;
  value: boolean;
  onToggle?: (next: boolean) => void;
}) {
  return (
    <>
      <View style={{ position: 'absolute', left: at(16), top: at(row.iconTop) }}>
        <Icon name={row.icon} size={at(24)} color={COLOR.icon.primary} />
      </View>
      <Text
        style={{
          position: 'absolute',
          left: at(50),
          top: at(row.labelCentre - 11),
          fontSize: at(15),
          lineHeight: at(22),
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
            left: at(190.36),
            // Stops where the chevron's stroke starts (box 314 + 7.5): at font
            // scale 1.1 the unbounded caption ran underneath it. v3's own text
            // box (123 wide) is too tight for Android's glyph widths at 1.0.
            width: at(321.5 - 190.36),
            top: at(row.labelCentre - 8),
            fontSize: at(12),
            lineHeight: at(16),
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
          hitSlop={scale(4)}
          onPress={() => onToggle?.(!value)}
          style={{
            position: 'absolute',
            left: at(TRACK.left),
            top: at(row.toggle.top),
            width: at(TRACK.width),
            height: at(TRACK.height),
            borderRadius: at(TRACK.height / 2),
            // Same element tree either way — only the values change (AGENTS.md #3).
            backgroundColor: value ? COLOR.brand.accent : TRACK_OFF,
          }}>
          <View
            style={{
              position: 'absolute',
              left: at(value ? TRACK.width - KNOB - 2 : 2),
              top: at(2),
              width: at(KNOB),
              height: at(KNOB),
              borderRadius: at(KNOB / 2),
              backgroundColor: COLOR.surface.card,
            }}
          />
        </Pressable>
      ) : null}
      {row.chevronTop !== undefined ? (
        <View style={{ position: 'absolute', left: at(314), top: at(row.chevronTop) }}>
          <Icon name="chevron-right" size={at(20)} color={COLOR.text.muted} />
        </View>
      ) : null}
      {row.pill ? (
        <View
          style={{
            position: 'absolute',
            left: at(299.48),
            top: at(row.pill.top),
            width: at(34.239),
            height: at(17.045),
            borderRadius: at(8.523),
            backgroundColor: COLOR.surface.tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: at(12), lineHeight: at(16), color: COLOR.brand.violetText }}
            className="font-plex">
            {row.pill.text}
          </Text>
        </View>
      ) : null}
    </>
  );
}
