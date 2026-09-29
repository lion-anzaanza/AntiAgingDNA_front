import { Image, Text, View } from 'react-native';

import { GradientText } from '@/components/ui/gradient-text';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

export function ProfileCard({ nickname, streakDays }: { nickname: string; streakDays: number }) {
  return (
    <View
      style={{
        height: scale(40),
        borderRadius: scale(5),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(8),
          top: scale(8),
          width: scale(24),
          height: scale(24),
          borderRadius: scale(12),
          backgroundColor: '#EEEDFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={require('@/assets/images/my/avatar.png')}
          style={{ width: scale(12), height: scale(14) }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          position: 'absolute',
          left: scale(42),
          top: scale(7.5),
          fontSize: scale(9),
          lineHeight: scale(15),
          color: '#00352C',
        }}
        className="font-pretendard-bold">
        {nickname}
      </Text>
      <View style={{ position: 'absolute', left: scale(42), top: scale(22) }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(6), lineHeight: scale(9) }}
          className="font-pretendard-semibold">
          올빼미 - 고민감 - 누적형
        </GradientText>
      </View>

      <View
        style={{
          position: 'absolute',
          left: scale(136),
          top: scale(6),
          width: scale(41),
          height: scale(11),
          borderRadius: scale(5),
          backgroundColor: '#F7F1FF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(5), lineHeight: scale(9) }}
          className="font-pretendard">
          연속 기록 {streakDays}일째
        </GradientText>
      </View>
    </View>
  );
}
