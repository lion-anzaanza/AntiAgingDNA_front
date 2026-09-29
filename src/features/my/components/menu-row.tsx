import { router } from 'expo-router';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { scale } from '@/lib/scale';

const ROW_PITCH = 22.25;

export type MenuItem = {
  label: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
  value?: string;
  href?: string;
};

export function MenuRow({
  label,
  icon,
  iconWidth,
  iconHeight,
  value,
  href,
  first,
}: MenuItem & { first: boolean }) {
  return (
    <Pressable
      onPress={href ? () => router.push(href as never) : undefined}
      style={{
        height: scale(ROW_PITCH),
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: first ? 0 : scale(0.3),
        borderTopColor: '#F1EFE7',
      }}>
      <View
        style={{
          width: scale(21),
          marginLeft: scale(7),
          alignItems: 'center',
        }}>
        <Image
          source={icon}
          style={{ width: scale(iconWidth), height: scale(iconHeight) }}
          resizeMode="contain"
        />
      </View>
      <Text
        style={{
          marginLeft: scale(5),
          fontSize: scale(7),
          lineHeight: scale(9),
          letterSpacing: scale(-0.21),
          color: '#2C2C2A',
        }}
        className="font-pretendard">
        {label}
      </Text>

      <View style={{ marginLeft: 'auto', marginRight: scale(10), flexDirection: 'row', alignItems: 'center' }}>
        {value ? (
          <Text
            style={{
              marginRight: scale(3),
              fontSize: scale(6),
              lineHeight: scale(18),
              letterSpacing: scale(-0.1),
              color: '#B4B2A8',
            }}
            className="font-pretendard-light">
            {value}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: scale(10),
            lineHeight: scale(18),
            letterSpacing: scale(-0.1),
            color: '#B4B2A8',
          }}
          className="font-pretendard-light">
          {'>'}
        </Text>
      </View>
    </Pressable>
  );
}
