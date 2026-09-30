import { router, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { COLOR, SHADOW_V4 } from '@/lib/design';
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
 * Figma v4: `ButtonBack` — a 13.46×12.5 white chip, radius 2.88, carrying a
 * Pretendard `←`. v4 draws 15 of these by hand and they disagree; this is the
 * majority (see docs/redesign-v4-inventory.md, 결정).
 */
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
        width: scale(13.46),
        height: scale(12.5),
        borderRadius: scale(2.885),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{ fontSize: scale(7.333), lineHeight: scale(10.476), color: COLOR.text.body }}
        className="font-pretendard-semibold">
        ←
      </Text>
    </Pressable>
  );
}
