import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v3 마이페이지/메인 `Card/Rectangle 3709` — 350×68 (197.4×38.5 at 220).
 * v3 swapped the avatar bitmap for a 44pt `surface/tint-2` circle carrying the
 * 24pt `Icon/user`, and moved the name and type label in to x 72.
 */
export function ProfileCard({ nickname, streakDays }: { nickname: string; streakDays: number }) {
  return (
    <View
      style={{
        height: scale(38.462),
        borderRadius: scale(4.808),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(9.026),
          top: scale(6.769),
          width: scale(24.821),
          height: scale(24.821),
          borderRadius: scale(12.41),
          backgroundColor: COLOR.surface.tint2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name="user" size={scale(13.538)} color={COLOR.icon.primary} />
      </View>

      <Text
        style={{
          position: 'absolute',
          left: scale(40.615),
          top: scale(7.847),
          // Stops short of the streak chip's leftmost edge (197.4 − 10.8 − 43.9).
          maxWidth: scale(96),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.heading,
        }}
        className="font-plex-semibold"
        numberOfLines={1}>
        {nickname}
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: scale(40.615),
          top: scale(23.449),
          fontSize: scale(6.769),
          lineHeight: scale(9.026),
          color: COLOR.brand.violetText,
        }}
        className="font-plex">
        올빼미 - 고민감 - 누적형
      </Text>

      {/*
        * Anchored on the right with a minimum width rather than Figma's fixed
        * 43.9, so a three-digit streak or a 1.1 font scale grows the chip
        * leftwards instead of clipping it (AGENTS.md rule 14).
        */}
      <View
        style={{
          position: 'absolute',
          right: scale(10.797),
          top: scale(5.77),
          minWidth: scale(43.933),
          height: scale(10.577),
          paddingHorizontal: scale(3),
          borderRadius: scale(4.808),
          backgroundColor: COLOR.surface.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* v3 shrank the label from 13 to 9px (5.08 at 220). */}
        <Text
          style={{
            fontSize: scale(5.077),
            lineHeight: scale(10.154),
            color: COLOR.brand.violetText,
          }}
          className="font-plex-semibold">
          연속 기록 {streakDays}일째
        </Text>
      </View>
    </View>
  );
}
