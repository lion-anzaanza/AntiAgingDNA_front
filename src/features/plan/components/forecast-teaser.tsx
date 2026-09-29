import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { LivingArtwork } from '@/components/ui/living-artwork';
import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * `Frame 33` (`677:1083`) — the locked forecast. The orb is deliberately
 * unreadable: a grey "?" sits over it and the score reads `??`, because the
 * forecast itself lives behind 한 달 뒤 내 모습.
 */
export function ForecastTeaser({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={['#FDF0FF', '#FFFFFF']}
        locations={[0.234, 0.984]}
        /*
         * Figma states 151.2°, but converting that angle through the card's
         * 184×52 aspect gives a near-vertical ramp, which is not what the file
         * renders. Taken from the export's own corners instead: pink at the top
         * left, white at the bottom right, and more horizontal than diagonal.
         */
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={{
          height: scale(52),
          borderRadius: scale(10),
          boxShadow: SHADOW,
          overflow: 'hidden',
        }}>
        {/* The bitmap overhangs its 37.3×35 box — the glow — so it is drawn larger. */}
        <LivingArtwork
          source={require('@/assets/images/plan/orb-unknown.png')}
          frame={{ left: 13.06, top: 2.0, width: 57.157, height: 55 }}
          accessibilityLabel="한 달 뒤 예상 컨디션 오브"
        />
        {SPARKLES.map((sparkle) => (
          <View
            key={`${sparkle.left}-${sparkle.top}`}
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
          style={{
            position: 'absolute',
            left: scale(23),
            top: scale(14.5),
            width: scale(37),
            textAlign: 'center',
            fontSize: scale(18),
            lineHeight: scale(21),
            color: '#CFCFCF',
            textShadowColor: '#858585',
            textShadowOffset: { width: 0, height: scale(4) },
            textShadowRadius: scale(3),
          }}
          className="font-pretendard-extrabold">
          ?
        </Text>

        <Text
          style={{
            position: 'absolute',
            left: scale(63),
            top: scale(13),
            width: scale(120),
            textAlign: 'center',
            fontSize: scale(8),
            lineHeight: scale(9),
            letterSpacing: scale(-0.24),
            color: '#A07EAD',
          }}
          className="font-pretendard-semibold">
          한달 뒤 내 모습 예상하기
        </Text>
        <View
          style={{
            position: 'absolute',
            left: scale(83),
            top: scale(23),
            width: scale(83),
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: scale(18),
              lineHeight: scale(21),
              letterSpacing: scale(-0.24),
              color: '#542173',
            }}
            className="font-pretendard-extrabold">
            ??
          </Text>
          <Text
            style={{
              marginLeft: scale(3),
              fontSize: scale(10),
              lineHeight: scale(12),
              letterSpacing: scale(-0.24),
              color: '#A07EAD',
            }}
            className="font-pretendard">
            ← 현재 74
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Card-relative, and the same near-white treatment the 홈 orb uses. */
const SPARKLES = [
  { left: 33.05, top: 27.77, size: 1.06, color: 'rgba(251,232,255,0.5)', glow: '0px 0px 5px rgba(255,255,255,0.5)' },
  { left: 50.49, top: 15.76, size: 1.06, color: 'rgba(251,232,255,0.5)', glow: '0px 0px 5px rgba(255,255,255,0.5)' },
  { left: 44.15, top: 29.27, size: 1.59, color: 'rgba(231,221,255,0.75)', glow: '0px 0px 4px 1px rgba(255,255,255,0.25)' },
];
