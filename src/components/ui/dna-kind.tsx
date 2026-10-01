import { Pressable, Text } from 'react-native';

import { COLOR, TONE_BG, TONE_TEXT, type Tone } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `DNAKind` — v3 `DNAKind/<영역>` on 홈 (`1312:1636`…), 34.06×20.31
 * (v4 was 12.13 tall),
 * labelling one of the five 밸런스 areas. `default` is the unselected look
 * (white, `text/body`); the other three colour themselves from the shared
 * 좋음/주의/위험 trio.
 *
 * Its shadow is a 1.1pt hairline, not the ambient `SHADOW` every card carries.
 *
 * These are also the **tab strip** on 나의 LifeDNA 정보: pass `onPress` and the
 * chip becomes selectable. Figma shows only the selected chip in its own grade
 * colour and leaves the rest `default`, so the caller decides the tone — this
 * component still just draws what it is told.
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
        width: scale(34.06),
        height: scale(20.308),
        borderRadius: scale(3.309),
        backgroundColor: isDefault ? COLOR.surface.card : TONE_BG[tone],
        boxShadow: '0px 0px 1.103px rgba(132, 132, 132, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        numberOfLines={1}
        style={{
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: isDefault ? COLOR.text.body : TONE_TEXT[tone],
        }}
        className="font-plex-semibold">
        {label}
      </Text>
    </Pressable>
  );
}
