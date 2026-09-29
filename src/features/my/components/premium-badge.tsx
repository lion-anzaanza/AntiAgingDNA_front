import { Image, Text, View } from 'react-native';

import { scale } from '@/lib/scale';

/** `Rectangle 3825` — the `#FFF8D5` pill with the crown. */
export function PremiumBadge() {
  return (
    <View
      style={{
        width: scale(62),
        height: scale(12),
        borderRadius: scale(10),
        backgroundColor: '#FFF8D5',
        borderWidth: scale(0.2),
        borderColor: '#FFC800',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scale(4),
      }}>
      <Image
        source={require('@/assets/images/my/ic-crown.png')}
        style={{ width: scale(11), height: scale(12) }}
        resizeMode="contain"
      />
      <Text
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: scale(5),
          lineHeight: scale(12),
          letterSpacing: scale(-0.05),
          color: '#774F00',
        }}
        className="font-pretendard-semibold">
        LifeDNA 프리미엄
      </Text>
    </View>
  );
}
