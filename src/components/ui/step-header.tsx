import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GRADIENT_PROGRESS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma draws the progress bar as one continuous gradient whose width covers
 * the steps completed so far, with the remaining segments left as thinner grey
 * bars. Measured against the 180pt bar: the three segments sit at 0–56, 60–118
 * and 121–179, and the fill runs to 56 / 119 / 180 for steps 1–3.
 */
const FILL_RATIO = [56 / 180, 119 / 180, 1];
const SEGMENTS = [
  { left: 60 / 180, width: 58 / 180 },
  { left: 121 / 180, width: 58 / 180 },
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
  const fill = FILL_RATIO[currentStep - 1] ?? 0;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else if (backHref) {
      router.replace(backHref);
    }
  }

  return (
    <View>
      {title ? (
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={handleBack}
            style={{
              width: scale(14),
              height: scale(13),
              borderRadius: scale(3),
              backgroundColor: '#FFFFFF',
              boxShadow: SHADOW,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{ fontSize: scale(7), lineHeight: scale(10), color: '#696969' }}
              className="font-pretendard-semibold">
              ←
            </Text>
          </Pressable>
          <Text
            style={{
              fontSize: scale(12),
              lineHeight: scale(15),
              marginLeft: scale(9),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            {title}
          </Text>
        </View>
      ) : null}

      <View style={{ height: scale(5), marginTop: scale(5) }}>
        <LinearGradient
          colors={[...GRADIENT_PROGRESS]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: scale(5),
            width: `${fill * 100}%`,
            borderRadius: scale(3),
          }}
        />
        {SEGMENTS.filter((segment) => segment.left >= fill).map((segment) => (
          <View
            key={segment.left}
            style={{
              position: 'absolute',
              top: scale(1),
              left: `${segment.left * 100}%`,
              width: `${segment.width * 100}%`,
              height: scale(3),
              borderRadius: scale(3),
              backgroundColor: '#D3D1C6',
            }}
          />
        ))}
      </View>

      <Text
        style={{
          fontSize: scale(7),
          lineHeight: scale(10),
          marginTop: scale(5),
          color: '#4B52F6',
        }}
        className="font-pretendard-extrabold">
        {stepLabel}
      </Text>
    </View>
  );
}
