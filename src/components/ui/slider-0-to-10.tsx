import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { GestureResponderEvent, PanResponder, Text, View } from 'react-native';

import { GRADIENT_PROGRESS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type Slider0To10Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

const HANDLE_WIDTH = 13;
const HANDLE_HEIGHT = 12;

/**
 * Figma: Select0To10 — like the step bar, the filled part of the track is 5pt
 * tall and the remainder only 3pt, with a white 13×12 handle riding the join.
 */
export function Slider0To10({ label, value, onChange }: Slider0To10Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = value / 10;

  function updateFromX(x: number) {
    if (trackWidth <= 0) return;
    const next = Math.min(Math.max(x / trackWidth, 0), 1);
    onChange(Math.round(next * 10));
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => updateFromX(e.nativeEvent.locationX),
    onPanResponderMove: (e: GestureResponderEvent) => updateFromX(e.nativeEvent.locationX),
  });

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: scale(10),
        }}>
        <Text
          style={{ fontSize: scale(10), lineHeight: scale(10), color: '#00352C' }}
          className="font-pretendard-bold">
          {label}
        </Text>
        <View
          style={{
            minWidth: scale(35),
            height: scale(10),
            borderRadius: scale(10),
            paddingHorizontal: scale(3),
            backgroundColor: '#E9F0FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(5), lineHeight: scale(10), color: '#4800FF' }}
            className="font-pretendard-medium">
            현재 선택 : {value}
          </Text>
        </View>
      </View>

      <View
        {...panResponder.panHandlers}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{ height: scale(HANDLE_HEIGHT), marginTop: scale(9), justifyContent: 'center' }}>
        <View
          style={{
            height: scale(3),
            borderRadius: scale(3),
            backgroundColor: '#D3D1C6',
          }}
        />
        <LinearGradient
          colors={[...GRADIENT_PROGRESS]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            left: 0,
            width: `${ratio * 100}%`,
            height: scale(5),
            borderRadius: scale(3),
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${ratio * 100}%`,
            marginLeft: -scale(HANDLE_WIDTH) / 2,
            width: scale(HANDLE_WIDTH),
            height: scale(HANDLE_HEIGHT),
            borderRadius: scale(HANDLE_HEIGHT) / 2,
            borderWidth: scale(2),
            borderColor: '#823FF6',
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(2) }}>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(10), color: '#5F5E5B' }}
          className="font-pretendard-medium">
          0 | 낮음
        </Text>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(10), color: '#5F5E5B' }}
          className="font-pretendard-medium">
          높음 | 10
        </Text>
      </View>
    </View>
  );
}
