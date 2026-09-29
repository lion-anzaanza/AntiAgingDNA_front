import { Image, Pressable, Switch, Text, View, type ImageSourcePropType } from 'react-native';

import { scale } from '@/lib/scale';

/** Row pitch inside a card, measured off the dividers (192 → 214 → 237). */
const ROW_HEIGHT = 22;

const TEXT = '#2C2C2A';
const SUBTLE = '#A6A6A6';
const TRACK_ON = '#A100FF';
const TRACK_OFF = '#DADADA';
const PILL_BG = '#F8EBFF';

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
  /** A switch, a `>` chevron, or a small violet pill. */
  toggle?: ToggleKey;
  chevron?: boolean;
  pill?: string;
  caption?: string;
};

export function SettingRow({
  row,
  first,
  value,
  onToggle,
}: {
  row: Row;
  first: boolean;
  value: boolean;
  onToggle?: (next: boolean) => void;
}) {
  return (
    <Pressable
      disabled={!row.chevron}
      style={{
        height: scale(ROW_HEIGHT),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(7),
        borderTopWidth: first ? 0 : scale(0.3),
        borderTopColor: '#DBDBDB',
      }}>
      <View style={{ width: scale(21), alignItems: 'center' }}>
        <Image
          source={row.icon}
          style={{ width: scale(row.iconWidth), height: scale(row.iconHeight) }}
          resizeMode="contain"
        />
      </View>
      <Text
        style={{
          marginLeft: scale(5),
          fontSize: scale(7),
          lineHeight: scale(9),
          letterSpacing: scale(-0.21),
          color: TEXT,
        }}
        className="font-pretendard">
        {row.label}
      </Text>
      {row.caption ? (
        <Text
          numberOfLines={1}
          style={{
            marginLeft: scale(6),
            flexShrink: 1,
            fontSize: scale(6),
            lineHeight: scale(9),
            letterSpacing: scale(-0.18),
            color: SUBTLE,
          }}
          className="font-pretendard">
          {row.caption}
        </Text>
      ) : null}

      <View style={{ marginLeft: 'auto' }}>
        {row.toggle ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ true: TRACK_ON, false: TRACK_OFF }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scale: scale(18) / 52 }] }}
          />
        ) : row.pill ? (
          <View
            style={{
              width: scale(18),
              height: scale(10),
              borderRadius: scale(5),
              backgroundColor: PILL_BG,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: scale(5),
                lineHeight: scale(10),
                letterSpacing: scale(-0.05),
                color: TRACK_ON,
              }}
              className="font-pretendard-semibold">
              {row.pill}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              width: scale(18),
              textAlign: 'right',
              fontSize: scale(10),
              lineHeight: scale(18),
              letterSpacing: scale(-0.1),
              color: '#B4B2A8',
            }}
            className="font-pretendard-light">
            &gt;
          </Text>
        )}
      </View>
    </Pressable>
  );
}
