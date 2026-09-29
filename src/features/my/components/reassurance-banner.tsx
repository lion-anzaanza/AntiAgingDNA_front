import { Image, Text, View } from 'react-native';

import { scale } from '@/lib/scale';

/** `Rectangle 3709` — the `#F7F1FF` card that opens the screen. */
export function ReassuranceBanner({ nickname }: { nickname: string }) {
  return (
    <View
      style={{
        height: scale(31),
        borderRadius: scale(5),
        backgroundColor: '#F7F1FF',
        borderWidth: scale(0.3),
        borderColor: '#DBDBDB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scale(11),
      }}>
      <Image
        source={require('@/assets/images/my/ic-shield-lock.png')}
        style={{ width: scale(18), height: scale(19) }}
        resizeMode="contain"
      />
      <View style={{ marginLeft: scale(6), flexShrink: 1 }}>
        <Text style={{ fontSize: scale(8), lineHeight: scale(11), color: '#00352C' }}>
          <Text style={{ color: '#6D3CFA' }} className="font-pretendard-bold">
            {nickname}
          </Text>
          <Text className="font-pretendard-bold"> 님의 건강 데이터는 안전해요</Text>
        </Text>
        <Text
          style={{
            fontSize: scale(5),
            lineHeight: scale(9),
            letterSpacing: scale(-0.15),
            color: '#676767',
          }}
          className="font-pretendard">
          모든 기록은 암호화되어 저장되고, 동의 없이 제3자에게 제공되지 않아요.
        </Text>
      </View>
    </View>
  );
}
