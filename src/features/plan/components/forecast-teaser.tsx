import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';

import { LivingArtwork } from '@/components/ui/living-artwork';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * v4 `1363:2996` — the locked forecast. The orb is deliberately unreadable: a
 * white "?" sits over the dark orb and the score reads `??`, because the
 * forecast itself lives behind 한 달 뒤 내 모습.
 *
 * v4's orb bitmap (`Rectangle 3190`) is the same picture as `orb-unknown.png`
 * (compared side by side; opaque-body aspect 1.060 vs 1.058). v4 dropped the
 * three highlight dots the old teaser carried.
 */
const WIDTH = 197.436;
const HEIGHT = 50;
const RAMP = cssGradientPoints(pastelAngle(WIDTH, HEIGHT), WIDTH, HEIGHT);

/** Centred text boxes: v4 centres the title on 115.4 and the score on 127.05. */
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
          // No clip: v4's Frame 33 has clipsContent off, and the orb's glow
          // hangs ~5.6pt below the card.
        }}>
        {/*
          * v4 sizes the orb's body 36.1 × 33.9 at (24.68, 8.15) and lets the
          * bitmap overhang it (the glow) to 55.36 × 53.27 at (15.05, 2.34).
          */}
        <LivingArtwork
          source={require('@/assets/images/plan/orb-unknown.png')}
          frame={{ left: 15.05, top: 2.34, width: 55.36, height: 53.27 }}
          accessibilityLabel="한 달 뒤 예상 컨디션 오브"
        />
        <Text
          style={{
            position: 'absolute',
            left: scale(42.34 - 15),
            top: scale(21.47 - 22.564 / 2),
            width: scale(30),
            textAlign: 'center',
            fontSize: scale(18.051),
            lineHeight: scale(22.564),
            letterSpacing: scale(-0.361),
            color: '#FFFFFF',
            textShadowColor: '#858585',
            textShadowOffset: { width: 0, height: scale(4.513) },
            textShadowRadius: scale(3.385),
          }}
          className="font-plex-bold">
          ?
        </Text>

        <Text
          style={{
            position: 'absolute',
            left: scale(115.4 - TEXT_BOX / 2),
            top: scale(16.04 - 13.538 / 2),
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
            left: scale(127.05 - TEXT_BOX / 2),
            top: scale(31.56 - 18.051 / 2),
            width: scale(TEXT_BOX),
            textAlign: 'center',
            fontSize: scale(13.538),
            lineHeight: scale(18.051),
            letterSpacing: scale(-0.2708),
            color: '#A07EAD',
          }}
          className="font-plex-bold">
          <Text style={{ color: COLOR.text.plum }}>??</Text> ← 현재 74
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
