import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { LivingArtwork } from '@/components/ui/living-artwork';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * v3 `1318:1582` — the locked forecast. The orb is deliberately unreadable: a
 * black "?" sits over it and the score reads `??`, because the forecast itself
 * lives behind 한 달 뒤 내 모습.
 *
 * v3 swapped the dark orb for a white-lavender pearl (`Group 1362`, its bitmap
 * `Rectangle 3190`) and gave it three highlight dots again; the "?" lost its
 * white fill and drop shadow. `orb-pearl.png` is that bitmap as Figma serves
 * it, alpha intact — same 181 × 180 canvas as 홈's orbs, body at px 20–160.
 */
const WIDTH = 197.436;
const HEIGHT = 50;
const RAMP = cssGradientPoints(pastelAngle(WIDTH, HEIGHT), WIDTH, HEIGHT);

/** v3's body box 70.5 × 69.92 at (41, 8.93), with the bitmap's own overhang. */
const ORB_FRAME = { left: 17.553, top: 1.653, width: 50.93, height: 50.727 };

const SPARKLES = [
  { left: 33.846, top: 27.319, size: 1.128, color: '#FFFFFF', glow: '0px 0px 2.821px rgba(255,255,255,0.5)' },
  { left: 52.462, top: 13.781, size: 1.128, color: '#FFFFFF', glow: '0px 0px 2.821px rgba(255,255,255,0.5)' },
  {
    left: 45.692,
    top: 29.012,
    size: 1.692,
    color: 'rgba(255,255,255,0.75)',
    glow: '0px 0px 2.256px 0.564px rgba(255,255,255,0.25)',
  },
];

/** Centred text boxes: v3 centres the title on 116.22 and the score on 127.71. */
const TEXT_BOX = 110;

export function ForecastTeaser({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[...GRADIENT_PASTEL.colors]}
        locations={[...GRADIENT_PASTEL.locations]}
        start={RAMP.start}
        end={RAMP.end}
        style={{
          height: scale(HEIGHT),
          borderRadius: scale(9.615),
          boxShadow: SHADOW_V4,
          // No clip: the orb's glow hangs ~5pt below the card, as in v3.
        }}>
        <Text
          style={{
            position: 'absolute',
            left: scale(116.22 - TEXT_BOX / 2),
            top: scale(16.81 - 13.538 / 2),
            width: scale(TEXT_BOX),
            textAlign: 'center',
            fontSize: scale(9.59),
            lineHeight: scale(13.538),
            letterSpacing: scale(-0.0959),
            color: COLOR.text.plum,
          }}
          className="font-plex-semibold">
          한달 뒤 내 모습 예상하기
        </Text>
        <Text
          style={{
            position: 'absolute',
            left: scale(127.71 - TEXT_BOX / 2),
            top: scale(31.09 - 18.051 / 2),
            width: scale(TEXT_BOX),
            textAlign: 'center',
            fontSize: scale(13.538),
            lineHeight: scale(18.051),
            letterSpacing: scale(-0.2708),
            color: '#93749F',
          }}
          className="font-plex-bold">
          <Text style={{ color: COLOR.text.plum }}>??</Text> ← 현재 74
        </Text>

        <LivingArtwork
          source={require('@/assets/images/plan/orb-pearl.png')}
          frame={ORB_FRAME}
          accessibilityLabel="한 달 뒤 예상 컨디션 오브"
        />
        {SPARKLES.map((sparkle) => (
          <View
            key={`${sparkle.left}-${sparkle.top}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: scale(sparkle.left),
              top: scale(sparkle.top),
              width: scale(sparkle.size),
              height: scale(sparkle.size),
              borderRadius: scale(sparkle.size),
              backgroundColor: sparkle.color,
              boxShadow: sparkle.glow,
            }}
          />
        ))}
        <Text
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: scale(42.85 - 15),
            top: scale(24.07 - 22.564 / 2),
            width: scale(30),
            textAlign: 'center',
            fontSize: scale(18.051),
            lineHeight: scale(22.564),
            letterSpacing: scale(-0.361),
            color: '#000000',
          }}
          className="font-plex-bold">
          ?
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
