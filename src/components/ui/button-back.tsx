import { router, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { SHADOW } from '@/lib/design';
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

/** Figma: `ButtonBack` — a 14×13 white chip carrying a grey arrow. */
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
  );
}
