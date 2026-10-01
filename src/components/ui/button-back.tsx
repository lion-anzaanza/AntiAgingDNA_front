import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

type ButtonBackProps = {
  /**
   * Where to go when there is nothing to pop — opening a screen straight from a
   * deep link leaves the stack empty, and an unguarded `router.back()` there
   * fails with an unhandled GO_BACK action that Metro surfaces as a blank red
   * toast (AGENTS.md #4).
   */
  fallbackHref?: Href;
};

/**
 * Figma v3: `ButtonBack` — a 40×40 white tile, radius 12 (`radius/md`), soft
 * violet shadow, carrying the 24pt `Icon/Arrow-Left` in `text/heading`. All 15
 * copies agree. At 220 that is 22.56 square, radius 6.77, icon 13.54 inset 4.51.
 */
const SHADOW_BACK = '0px 1.128px 3.385px rgba(74, 56, 128, 0.08)';

export function ButtonBack({ fallbackHref }: ButtonBackProps) {
  function handlePress() {
    if (router.canGoBack()) {
      router.back();
    } else if (fallbackHref) {
      router.replace(fallbackHref);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: scale(22.564),
        height: scale(22.564),
        borderRadius: scale(6.769),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_BACK,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name="arrow-left" size={scale(13.538)} color={COLOR.text.heading} />
    </Pressable>
  );
}
