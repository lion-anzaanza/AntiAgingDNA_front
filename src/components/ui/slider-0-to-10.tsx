import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Text,
  View,
} from 'react-native';

import { GRADIENT_PROGRESS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type Slider0To10Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /**
   * Renders `Select0To10_Card` (182×55) instead of the bare `Select0To10`
   * (186×43): white card chrome, a smaller heading and a smaller handle.
   */
  card?: boolean;
};

/** Figma draws a smaller handle inside the card than on the bare slider. */
const HANDLE = {
  bare: { width: 13, height: 12 },
  card: { width: 10, height: 10 },
};
/** Movement under this (dp) still counts as a tap rather than a drag. */
const TAP_SLOP = 4;

/**
 * Figma: Select0To10 / Select0To10_Card — like the step bar, the filled part of
 * the track is 5pt tall and the remainder only 3pt, with a white handle riding
 * the join.
 */
export function Slider0To10({ label, value, onChange, card = false }: Slider0To10Props) {
  const handle = card ? HANDLE.card : HANDLE.bare;
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = value / 10;

  function updateFromX(x: number) {
    if (trackWidth <= 0) return;
    const next = Math.min(Math.max(x / trackWidth, 0), 1);
    onChange(Math.round(next * 10));
  }

  // These sliders sit in a long ScrollView, so committing on touch-down would
  // let a finger that merely brushed the track while starting to scroll set the
  // answer. The gesture's own travel tells us which it was: commit once the drag
  // is clearly horizontal, or on release if the touch never really moved.
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
      if (Math.abs(gesture.dx) < TAP_SLOP) return;
      updateFromX(e.nativeEvent.locationX);
    },
    onPanResponderRelease: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
      if (Math.abs(gesture.dx) > TAP_SLOP || Math.abs(gesture.dy) > TAP_SLOP) return;
      updateFromX(e.nativeEvent.locationX);
    },
  });

  return (
    <View
      style={
        card
          ? {
              borderRadius: scale(10),
              backgroundColor: '#FFFFFF',
              boxShadow: SHADOW,
              paddingTop: scale(4.5),
              paddingBottom: scale(8),
              paddingLeft: scale(12),
              paddingRight: scale(10),
            }
          : undefined
      }>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: card ? 0 : scale(10),
        }}>
        <Text
          style={{
            fontSize: scale(card ? 8 : 10),
            lineHeight: scale(card ? 15 : 10),
            color: '#00352C',
          }}
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
        style={{
          height: scale(handle.height),
          marginTop: scale(card ? 5.5 : 9),
          justifyContent: 'center',
        }}>
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
            marginLeft: -scale(handle.width) / 2,
            width: scale(handle.width),
            height: scale(handle.height),
            borderRadius: scale(handle.height) / 2,
            borderWidth: scale(2),
            borderColor: '#823FF6',
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: scale(card ? 4 : 2),
        }}>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(card ? 8 : 10), color: '#5F5E5B' }}
          className="font-pretendard-medium">
          0 | 낮음
        </Text>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(card ? 8 : 10), color: '#5F5E5B' }}
          className="font-pretendard-medium">
          높음 | 10
        </Text>
      </View>
    </View>
  );
}
