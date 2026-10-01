import { LinearGradient } from 'expo-linear-gradient';
import { type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { COLOR, GRADIENT_PROGRESS, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';
import { ButtonBack } from './button-back';

/**
 * Figma v3 회원가입/1·2·3: back chip + title, a three-segment progress bar, and
 * the "STEP n" label.
 *
 * v3 grew the back chip to a 22.56 tile that sits 2.26 left of the column
 * (x 9.03 against 11.28), so the row is the chip's height and the title follows
 * it 3.93 later, centred on it. The bar starts 4.56 below the chip — the same
 * 7.12 below the title's line box as v4. The fill took a stronger ramp of its
 * own (`#F6B8DF → #C7B2F3 → #A8C0F2`, all three frames).
 *
 * The bar spans the 197.44 column. The filled part is one pastel ramp covering
 * the steps done so far; the segments still to come are thinner `surface/track`
 * bars centred on it. Every value is 회원가입/1's — the only frame whose header
 * was rescaled with the rest of v4 (2 and 3 still carry the 5 / 3 / r3 / 4px
 * shadow of the old 220 file, the same leftover as their 14×13 back chip).
 *
 * The ramp's CSS angle is measured in pixels, so it differs with the fill's
 * width; each step keeps the angle v4 gives for that width.
 */
const BAR_WIDTH = 197.44;
const BACK_OUTSET = 2.256;
const FILL_HEIGHT = 4.81;
const TRACK_HEIGHT = 2.88;
const RADIUS = 2.885;
const STEPS = [
  { fill: 61.77, angle: 172.13 },
  { fill: 130.53, angle: 176.11 },
  { fill: 197.44, angle: 177.43 },
];
const SEGMENTS = [
  { left: 66.18, width: 63.97 },
  { left: 133.46, width: 63.97 },
];

type StepHeaderProps = {
  /** Screens that show a back button and a page title pass one; 약관 동의 does not. */
  title?: string;
  /**
   * Where the back button goes when there is nothing to pop — opening a step
   * straight from a deep link leaves the stack empty, and an unguarded
   * `router.back()` there fails with an unhandled GO_BACK action.
   */
  backHref?: Href;
  stepLabel: string;
  currentStep: number;
};

export function StepHeader({ title, backHref, stepLabel, currentStep }: StepHeaderProps) {
  const step = STEPS[currentStep - 1];
  const fill = step?.fill ?? 0;
  const ramp = step ? cssGradientPoints(step.angle, step.fill, FILL_HEIGHT) : null;

  return (
    <View>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: scale(-BACK_OUTSET) }}>
          <ButtonBack fallbackHref={backHref} />
          <Text
            style={{
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.271),
              marginLeft: scale(3.93),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            {title}
          </Text>
        </View>
      ) : null}

      <View style={{ width: scale(BAR_WIDTH), height: scale(FILL_HEIGHT), marginTop: scale(title ? 4.56 : 7.12) }}>
        {ramp ? (
          <LinearGradient
            colors={[...GRADIENT_PROGRESS.colors]}
            locations={[...GRADIENT_PROGRESS.locations]}
            start={ramp.start}
            end={ramp.end}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: scale(FILL_HEIGHT),
              width: scale(fill),
              borderRadius: scale(RADIUS),
              boxShadow: SHADOW_V4,
            }}
          />
        ) : null}
        {SEGMENTS.filter((segment) => segment.left >= fill).map((segment) => (
          <View
            key={segment.left}
            style={{
              position: 'absolute',
              top: scale((FILL_HEIGHT - TRACK_HEIGHT) / 2),
              left: scale(segment.left),
              width: scale(segment.width),
              height: scale(TRACK_HEIGHT),
              borderRadius: scale(RADIUS),
              backgroundColor: COLOR.surface.track,
              boxShadow: SHADOW_V4,
            }}
          />
        ))}
      </View>

      <Text
        style={{
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          marginTop: scale(5.05),
          color: COLOR.brand.violetText,
        }}
        className="font-plex-semibold">
        {stepLabel}
      </Text>
    </View>
  );
}
