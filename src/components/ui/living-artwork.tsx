import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MOTION } from '@/lib/motion';
import { scale } from '@/lib/scale';

/**
 * The orb and the DNA helix are the app's identity, so they are not allowed to
 * sit perfectly still. Everything here is transform-and-opacity only, driven on
 * the UI thread by Reanimated — no new dependency, and nothing that repaints
 * the artwork.
 *
 * Three rules the whole file obeys:
 *
 * - **Never call `scale()` inside a worklet.** It is an ordinary JS function,
 *   and a worklet reaching for one throws "Tried to synchronously call a
 *   non-worklet function on the UI thread" — which shows up as a red screen,
 *   not as a still animation. Convert Figma points to dp in the render body and
 *   let the worklet close over the number.
 * - **Stop when nobody is looking.** These are tab screens, so an unguarded
 *   `withRepeat(..., -1)` keeps running after you navigate away and quietly
 *   burns battery.
 * - **Honour Reduce Motion.** A permanently moving hero element is precisely
 *   what that setting exists for. Switched off, every value rests at 0, which
 *   renders exactly the static design.
 *
 * Tuning lives in `src/lib/motion.ts`.
 */
export function useMotionEnabled() {
  const focused = useIsFocused();
  const reduced = useReducedMotion();
  return focused && !reduced;
}

/** Figma-point box for an absolutely positioned piece of artwork. */
export type ArtworkFrame = { left: number; top: number; width: number; height: number };

type LivingArtworkProps = {
  source: ImageSourcePropType;
  frame: ArtworkFrame;
  /** Adds the shallow rotateY sway the helix uses. */
  tilt?: boolean;
  /** Sweeps a band of light through the artwork's own silhouette. */
  sheen?: boolean;
  accessibilityLabel: string;
};

export function LivingArtwork({
  source,
  frame,
  tilt = false,
  sheen = false,
  accessibilityLabel,
}: LivingArtworkProps) {
  const alive = useMotionEnabled();

  const breathe = useSharedValue(0);
  const driftX = useSharedValue(0);
  const driftY = useSharedValue(0);
  const sway = useSharedValue(0);
  const poke = useSharedValue(0);

  // Converted here, on the JS thread, so the worklet below only sees numbers.
  const drift = scale(MOTION.drift.amplitude);
  const width = scale(frame.width);
  const height = scale(frame.height);

  useEffect(() => {
    const loops = [
      { value: breathe, period: MOTION.breathe.period },
      { value: driftX, period: MOTION.drift.periodX },
      { value: driftY, period: MOTION.drift.periodY },
      { value: sway, period: MOTION.tilt.period },
    ];

    if (!alive) {
      for (const { value } of loops) {
        cancelAnimation(value);
        value.set(withTiming(0, { duration: MOTION.settle }));
      }
      return;
    }

    for (const { value, period } of loops) {
      value.set(
        withRepeat(
          withTiming(1, { duration: period, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        ),
      );
    }
  }, [alive, breathe, driftX, driftY, sway]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(driftX.get(), [0, 1], [-drift, drift]) },
      { translateY: interpolate(driftY.get(), [0, 1], [-drift, drift]) },
      { perspective: 600 },
      {
        rotateY: tilt
          ? `${interpolate(sway.get(), [0, 1], [-MOTION.tilt.degrees, MOTION.tilt.degrees])}deg`
          : '0deg',
      },
      // The poke spring undershoots past 0 on release, and that is where the
      // bounce back above 1 comes from — it is not a separate keyframe.
      {
        scale:
          (1 + breathe.get() * MOTION.breathe.amplitude) *
          interpolate(poke.get(), [0, 1], [1, MOTION.poke.squash]),
      },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        poke.set(
          withSpring(1, {
            damping: MOTION.poke.inDamping,
            stiffness: MOTION.poke.inStiffness,
          }),
        );
      }}
      onPressOut={() => {
        poke.set(
          withSpring(0, {
            damping: MOTION.poke.outDamping,
            stiffness: MOTION.poke.outStiffness,
          }),
        );
      }}
      style={{
        position: 'absolute',
        left: scale(frame.left),
        top: scale(frame.top),
        width,
        height,
      }}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Image
          source={source}
          style={{ width: '100%', height: '100%' }}
          // Figma fills the box exactly rather than fitting inside it.
          resizeMode="stretch"
        />
        {sheen ? <Sheen source={source} width={width} height={height} alive={alive} /> : null}
      </Animated.View>
    </Pressable>
  );
}

/**
 * A band of light travelling through the artwork, clipped to its silhouette by
 * masking with the artwork itself — so the highlight looks like it is *inside*
 * the orb rather than laid over it. The soft alpha at the edge of the bitmap
 * makes the band fade out on its own.
 */
function Sheen({
  source,
  width,
  height,
  alive,
}: {
  source: ImageSourcePropType;
  width: number;
  height: number;
  alive: boolean;
}) {
  const sweep = useSharedValue(0);
  const band = width * MOTION.sheen.bandRatio;

  useEffect(() => {
    if (!alive) {
      cancelAnimation(sweep);
      sweep.set(0);
      return;
    }
    sweep.set(0);
    sweep.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: MOTION.sheen.sweep, easing: Easing.inOut(Easing.ease) }),
          // Park it off the far edge for a beat, then jump back to the near edge.
          withTiming(1, { duration: MOTION.sheen.rest }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [alive, sweep]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sweep.get(), [0, 1], [-band, width]) }],
  }));

  return (
    <MaskedView
      style={{ position: 'absolute', left: 0, top: 0, width, height }}
      pointerEvents="none"
      maskElement={<Image source={source} style={{ width, height }} resizeMode="stretch" />}>
      <Animated.View style={[{ width: band, height: '100%' }, bandStyle]}>
        {/*
         * The ramp has to run straight across the band, not corner to corner.
         * With a diagonal `start`/`end` the gradient finishes well before it has
         * crossed the band horizontally at most heights, so what you actually
         * see is the band's own rectangular edge — a hard vertical seam sweeping
         * over the orb, which reads as a broken screen rather than as light.
         * Horizontal, the fade always lands on the band's own edges.
         */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            `rgba(255,255,255,${MOTION.sheen.strength})`,
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </MaskedView>
  );
}

type TwinkleDotProps = {
  left: number;
  top: number;
  size: number;
  color: string;
  glow: string;
  /** Offsets and detunes this dot so the set never blinks in unison. */
  index: number;
};

/** One of the orb's highlights, glinting on its own schedule. */
export function TwinkleDot({ left, top, size, color, glow, index }: TwinkleDotProps) {
  const alive = useMotionEnabled();
  const t = useSharedValue(0);

  useEffect(() => {
    if (!alive) {
      cancelAnimation(t);
      t.set(withTiming(0, { duration: MOTION.settle }));
      return;
    }
    t.set(
      withRepeat(
        withTiming(1, {
          duration: MOTION.sparkle.period + index * MOTION.sparkle.detune,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, [alive, t, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.get(), [0, 1], [1, MOTION.sparkle.minOpacity]),
    transform: [{ scale: interpolate(t.get(), [0, 1], [1, MOTION.sparkle.maxScale]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: scale(left),
          top: scale(top),
          width: scale(size),
          height: scale(size),
          borderRadius: scale(size),
          backgroundColor: color,
          boxShadow: glow,
        },
        animatedStyle,
      ]}
    />
  );
}

/** One of the dashed rings behind the orb, turning slowly. */
export function SpinningRing({
  left,
  top,
  size,
  period,
  reverse = false,
}: {
  left: number;
  top: number;
  size: number;
  period: number;
  reverse?: boolean;
}) {
  const alive = useMotionEnabled();
  const spin = useSharedValue(0);
  const sweep = reverse ? -360 : 360;

  useEffect(() => {
    if (!alive) {
      cancelAnimation(spin);
      return;
    }
    spin.set(withRepeat(withTiming(1, { duration: period, easing: Easing.linear }), -1, false));
  }, [alive, spin, period]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.get() * sweep}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: scale(left),
          top: scale(top),
          width: scale(size),
          height: scale(size),
          borderRadius: scale(size),
          borderWidth: scale(1),
          borderColor: '#F1EFE7',
          borderStyle: 'dashed',
        },
        animatedStyle,
      ]}
    />
  );
}

/** Kept for anything that wants the ring without the motion. */
export function StaticRing({ left, top, size }: { left: number; top: number; size: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: scale(left),
        top: scale(top),
        width: scale(size),
        height: scale(size),
        borderRadius: scale(size),
        borderWidth: scale(1),
        borderColor: '#F1EFE7',
        borderStyle: 'dashed',
      }}
    />
  );
}
