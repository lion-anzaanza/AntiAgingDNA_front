import { Image, Text, View } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/** Figma v4 마이페이지/메인 `Card/Rectangle 3709` — 197.4×38.5. */
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
          left: scale(9.01),
          top: scale(7.69),
          width: scale(23.077),
          height: scale(23.077),
          borderRadius: scale(11.538),
          backgroundColor: COLOR.surface.tint2,
        }}>
        {/* Figma sits the figure 1pt above the circle's centre; kept as drawn. */}
        <Image
          source={require('@/assets/images/my/avatar.png')}
          style={{
            position: 'absolute',
            left: scale(5.75),
            top: scale(3.85),
            width: scale(11.151),
            height: scale(13.462),
          }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          position: 'absolute',
          left: scale(45.41),
          top: scale(7.07),
          // Stops short of the streak chip's leftmost edge (197.4 − 10.8 − 43.9).
          maxWidth: scale(92),
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
          left: scale(45.48),
          top: scale(18.99),
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
          right: scale(10.79),
          top: scale(5.77),
          minWidth: scale(43.933),
          height: scale(10.577),
          paddingHorizontal: scale(3),
          borderRadius: scale(4.808),
          backgroundColor: COLOR.surface.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            // Figma's line box sits 0.5pt below the chip's middle.
            transform: [{ translateY: scale(0.47) }],
            fontSize: scale(7.333),
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
