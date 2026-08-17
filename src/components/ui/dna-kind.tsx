import { Pressable, Text } from 'react-native';

import { TONE_BG, TONE_TEXT, type Tone } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `DNAKind` — the 30×11 chip labelling one of the five 밸런스 areas on
 * 홈. `default` is the unselected look; the other three colour themselves from
 * the shared 좋음/주의/위험 trio.
 *
 * Its shadow is a 1pt hairline, not the ambient `SHADOW` every card carries.
 *
 * Since the 2026-08-17 re-pull these are also the **tab strip** on 나의 LifeDNA
 * 정보: pass `onPress` and the chip becomes selectable. Figma shows only the
 * selected chip in its own grade colour and leaves the rest `default`, so the
 * caller decides the tone — this component still just draws what it is told.
 */
type DnaKindProps = {
  label: string;
  tone?: Tone | 'default';
  onPress?: () => void;
};

export function DnaKind({ label, tone = 'default', onPress }: DnaKindProps) {
  const isDefault = tone === 'default';

  // Same element type every render — a Pressable with no handler is inert but
  // keeps the tree shape identical, which AGENTS.md #3 exists to protect.
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        width: scale(30),
        height: scale(11),
        borderRadius: scale(3),
        backgroundColor: isDefault ? '#FFFFFF' : TONE_BG[tone],
        boxShadow: '0px 0px 1px rgba(132, 132, 132, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        numberOfLines={1}
        style={{
          fontSize: scale(6),
          lineHeight: scale(9),
          color: isDefault ? '#7A7A7A' : TONE_TEXT[tone],
        }}
        className="font-pretendard-medium">
        {label}
      </Text>
    </Pressable>
  );
}
