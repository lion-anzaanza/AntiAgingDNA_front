import { Text, View } from 'react-native';

import { TONE_BG, TONE_TEXT, type Tone } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `DNAKind` — the 30×11 chip labelling one of the five 밸런스 areas on
 * 홈. `default` is the unselected look; the other three colour themselves from
 * the shared 좋음/주의/위험 trio.
 *
 * Its shadow is a 1pt hairline, not the ambient `SHADOW` every card carries.
 */
type DnaKindProps = {
  label: string;
  tone?: Tone | 'default';
};

export function DnaKind({ label, tone = 'default' }: DnaKindProps) {
  const isDefault = tone === 'default';

  return (
    <View
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
    </View>
  );
}
