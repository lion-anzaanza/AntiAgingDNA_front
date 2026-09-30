import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Text,
  View,
} from 'react-native';

import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';

import { CARD_INSET, CARD_SURFACE, CARD_TITLE } from './select-card';

type Slider0To10Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /**
   * Renders `Select0To10_Card` (197.44×52.88) — the white card chrome. Without
   * it the same contents render bare. Nothing uses the bare form today: v4 still
   * draws bare sliders for 회원가입/2's 민감도 questions, but those were settled
   * as four pills (backlog 6).
   */
  card?: boolean;
  /**
   * `Select0To10_History` — the read-only replay of an earlier day. Implies
   * `card`. v4 keeps the pastel fill; only the handle ring turns slate and the
   * badge text darkens, and the control stops responding.
   */
  history?: boolean;
};

/** The handle ring of `Select0To10_History`. */
const HISTORY_RING = '#7C85A5';

/** 9.615 circle with a 1.923 ring; the fill and track are centred on it. */
const HANDLE = 9.615;
const FILL_HEIGHT = 4.808;
const TRACK_HEIGHT = 2.885;
/** The fill's CSS angle in v4 (176.26–176.37 across the three instances). */
const FILL_ANGLE = 176.37;
/** Movement under this (dp) still counts as a tap rather than a drag. */
const TAP_SLOP = 4;

/**
 * Figma: Select0To10 / Select0To10_Card — a pastel bar up to the handle, and a
 * thinner `surface/track` remainder after it, both carrying the ambient shadow.
 */
export function Slider0To10({
  label,
  value,
  onChange,
  card = false,
  history = false,
}: Slider0To10Props) {
  const carded = card || history;
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

  // Figma's 176° pastel ramp is measured in pixels, so its direction depends on
  // the bar's own (value-dependent) width — AGENTS/skill: never map it 0→1.
  const fillWidth = Math.max(trackWidth * ratio, 1);
  const ramp = cssGradientPoints(FILL_ANGLE, fillWidth, scale(FILL_HEIGHT));

  return (
    <View
      style={[
        carded ? CARD_SURFACE : undefined,
        {
          paddingTop: scale(carded ? 4.65 : 0),
          paddingBottom: scale(carded ? 4.71 : 0),
          paddingHorizontal: scale(carded ? CARD_INSET : 0),
        },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={CARD_TITLE} className="font-plex-semibold">
          {label}
        </Text>
        <View
          style={{
            height: scale(9.615),
            borderRadius: scale(9.615),
            paddingHorizontal: scale(1),
            backgroundColor: COLOR.surface.tint2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: scale(7.333),
              lineHeight: scale(10.154),
              color: history ? COLOR.text.strong : COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            현재 선택 : {value}
          </Text>
        </View>
      </View>

      <View
        {...(history ? {} : panResponder.panHandlers)}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{ height: scale(HANDLE), marginTop: scale(5.6), justifyContent: 'center' }}>
        {/*
          The bars and handle must not take touches: `updateFromX` reads
          `locationX`, which is relative to whichever view was hit, and the
          remainder bar starts at the handle.
          */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${ratio * 100}%`,
            right: 0,
            height: scale(TRACK_HEIGHT),
            borderRadius: scale(TRACK_HEIGHT),
            backgroundColor: COLOR.surface.track,
            boxShadow: SHADOW_V4,
          }}
        />
        <LinearGradient
          colors={[...GRADIENT_PASTEL.colors]}
          locations={[...GRADIENT_PASTEL.locations]}
          start={ramp.start}
          end={ramp.end}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            width: `${ratio * 100}%`,
            height: scale(FILL_HEIGHT),
            borderRadius: scale(TRACK_HEIGHT),
            boxShadow: SHADOW_V4,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${ratio * 100}%`,
            marginLeft: -scale(HANDLE) / 2,
            width: scale(HANDLE),
            height: scale(HANDLE),
            borderRadius: scale(HANDLE) / 2,
            borderWidth: scale(1.923),
            borderColor: history ? HISTORY_RING : COLOR.brand.violet,
            backgroundColor: COLOR.surface.card,
          }}
        />
      </View>

      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(2.35) }}>
        <Text style={SCALE_LABEL} className="font-plex">
          0 | 낮음
        </Text>
        <Text style={SCALE_LABEL} className="font-plex">
          높음 | 10
        </Text>
      </View>
    </View>
  );
}

const SCALE_LABEL = { fontSize: scale(8.462), lineHeight: scale(12.41), color: COLOR.text.body };
