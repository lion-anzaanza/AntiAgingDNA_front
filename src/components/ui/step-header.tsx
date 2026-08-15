import { LinearGradient } from 'expo-linear-gradient';
import { type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { GRADIENT_PROGRESS } from '@/lib/design';
import { scale } from '@/lib/scale';
import { ButtonBack } from './button-back';

/**
 * Figma draws the progress bar as one continuous gradient whose width covers
 * the steps completed so far, with the remaining segments left as thinner grey
 * bars. The three segments sit at 0–56, 60–118 and 121–179, and the fill runs
 * to 56 / 119 / 180 for steps 1–3.
 *
 * The bar is **180pt wide, not the width of the content column** — the three
 * step screens are 184 or 186 wide, so expressing these as percentages of the
 * parent stretched the whole bar past Figma's right edge.
 */
const BAR_WIDTH = 180;
const FILL_WIDTH = [56, 119, 180];
const SEGMENTS = [
  { left: 60, width: 58 },
  { left: 121, width: 58 },
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
  const fill = FILL_WIDTH[currentStep - 1] ?? 0;

  return (
    <View>
      {title ? (
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center' }}>
          <ButtonBack fallbackHref={backHref} />
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

      <View style={{ width: scale(BAR_WIDTH), height: scale(5), marginTop: scale(5) }}>
        <LinearGradient
          colors={[...GRADIENT_PROGRESS]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: scale(5),
            width: scale(fill),
            borderRadius: scale(3),
          }}
        />
        {SEGMENTS.filter((segment) => segment.left >= fill).map((segment) => (
          <View
            key={segment.left}
            style={{
              position: 'absolute',
              top: scale(1),
              left: scale(segment.left),
              width: scale(segment.width),
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
