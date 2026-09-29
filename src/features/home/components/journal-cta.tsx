import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Two 1×1 dots on the 오늘의 일지 card, each carrying a 20pt blur and a 10pt
 * spread — so what you see is a soft bloom about 40pt across, not a dot. Easy to
 * dismiss by their size and then wonder why the card looks flat.
 */
const CTA_GLOWS = [
  { left: 156, top: 19 },
  { left: 175, top: 78 },
];

export function JournalCta() {
  return (
    <LinearGradient
      colors={['#4252F6', '#844BF7']}
      locations={[0.039, 0.687]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{
        height: scale(86),
        borderRadius: scale(10),
        boxShadow: SHADOW,
        // Against the 86pt card: 9 · title 26 · 4.5 · caption 9 · 6.5 · button
        // 20 · 11. The gaps are load-bearing — the card looks top-heavy if the
        // content creeps up and leaves the slack at the bottom.
        paddingTop: scale(9),
        paddingLeft: scale(12),
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
            backgroundColor: '#9463F8',
            boxShadow: `0px 0px ${scale(20)}px ${scale(10)}px rgba(255, 255, 255, 0.25)`,
          }}
        />
      ))}
      <Text
        style={{ fontSize: scale(10), lineHeight: scale(13), color: '#FFFFFF' }}
        className="font-pretendard-extrabold">
        오늘 변화가 있었던 DNA,{'\n'}딱 30초만 기록해요
      </Text>
      <Text
        style={{
          fontSize: scale(7),
          lineHeight: scale(9),
          marginTop: scale(4.5),
          color: '#E7D7FF',
        }}
        className="font-pretendard-medium">
        기록할수록 나의 LifeDNA가 더 정교해져요
      </Text>
      <Pressable
        onPress={() => router.push('/journal/today')}
        style={{
          width: scale(62),
          height: scale(20),
          marginTop: scale(6.5),
          borderRadius: scale(7),
          backgroundColor: '#FFFFFF',
          boxShadow: SHADOW,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(13), color: '#844BF7' }}
          className="font-pretendard-black">
          오늘 기록하기 →
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
