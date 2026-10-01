import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { COLOR, GRADIENT_PASTEL, SHADOW } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * v3 `Journal banner` (`1312:1713`), 197.436×86. Everything inside is placed
 * absolutely, as Figma does — the title's two lines, the caption and the white
 * button each sit at their own y (AGENTS rule 14).
 *
 * Two 1×1 dots each carry a 20pt blur and a 10pt spread — so what you see is a
 * soft bloom about 40pt across, not a dot. Easy to dismiss by their size and
 * then wonder why the card looks flat.
 */
const WIDTH = 197.436;
const HEIGHT = 86;
const CTA_GLOWS = [
  { left: 175.17, top: 19 },
  { left: 187.41, top: 78 },
];
// Figma writes 142.29° for this box; `pastelAngle` gives the same.
const POINTS = cssGradientPoints(pastelAngle(WIDTH, HEIGHT), WIDTH, HEIGHT);

export function JournalCta() {
  return (
    <LinearGradient
      colors={[...GRADIENT_PASTEL.colors]}
      locations={[...GRADIENT_PASTEL.locations]}
      start={POINTS.start}
      end={POINTS.end}
      style={{
        height: scale(HEIGHT),
        borderRadius: scale(11.282),
        boxShadow: SHADOW,
        // Keeps the two blooms below from spilling past the rounded corners.
        overflow: 'hidden',
      }}>
      {CTA_GLOWS.map((glow) => (
        <View
          key={`${glow.left}-${glow.top}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: scale(glow.left),
            top: scale(glow.top),
            width: scale(1),
            height: scale(1),
            borderRadius: scale(1),
            backgroundColor: COLOR.brand.violet,
            boxShadow: `0px 0px ${scale(20)}px ${scale(10)}px rgba(255, 255, 255, 0.25)`,
          }}
        />
      ))}
      <Text
        style={{
          position: 'absolute',
          left: scale(8.65),
          top: scale(7.265),
          fontSize: scale(11.282),
          lineHeight: scale(15.795),
          letterSpacing: scale(-0.1128),
          color: COLOR.text.onPastel,
        }}
        className="font-plex-bold">
        오늘 변화가 있었던 DNA,{'\n'}딱 30초만 기록해요
      </Text>
      <Text
        style={{
          position: 'absolute',
          left: scale(8.38),
          top: scale(39.44),
          // v3 set the caption down from 15 to 13 (Figma), keeping the 22 line.
          fontSize: scale(7.333),
          lineHeight: scale(12.41),
          color: COLOR.text.plum,
        }}
        className="font-plex">
        기록할수록 나의 LifeDNA가 더 정교해져요
      </Text>
      <Pressable
        onPress={() => router.push('/journal/today')}
        style={{
          position: 'absolute',
          left: scale(9.03),
          top: scale(55),
          width: scale(67.835),
          height: scale(20),
          // v3 `Chip` (`1401:1972`): radius/sm 8 and a lighter 3.5px drop shadow.
          borderRadius: scale(4.513),
          backgroundColor: COLOR.surface.card,
          boxShadow: '0px 0px 2px rgba(169, 169, 169, 0.25)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: scale(7.333),
            lineHeight: scale(10.154),
            color: COLOR.brand.violetText,
          }}
          className="font-plex-semibold">
          오늘 기록하기 →
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
