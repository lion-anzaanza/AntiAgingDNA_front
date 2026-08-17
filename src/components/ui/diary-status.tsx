import { Image, View } from 'react-native';

import { scale } from '@/lib/scale';

/**
 * Figma: `Diary_Status` (`725:1813`) — the 17×7 face beside a score in
 * 일지/메인's 지난 기록 list, with a variant per grade.
 *
 * These used to be literal kaomoji text (`ദ്ദി ˃ ᴗ ˂ )` and friends), which is
 * exactly the sort of string that renders differently on every device: the
 * glyphs come from whatever fallback font happens to cover Malayalam, Thai and
 * combining diacritics. Figma now ships them as a component backed by three
 * bitmaps, so they are exported assets here and the rendering is fixed.
 *
 * Each variant is cropped differently inside the 17×7 box; the percentages are
 * Figma's own and are reproduced rather than averaged.
 */
export type DiaryStatusKind = 'good' | 'warn' | 'danger';

const BOX_WIDTH = 17;
const BOX_HEIGHT = 7;

const VARIANTS: Record<
  DiaryStatusKind,
  { source: number; left: number; top: number; width: number; height: number }
> = {
  good: {
    source: require('@/assets/images/journal/status-good.png'),
    left: 2.79,
    top: 8.32,
    width: 93.33,
    height: 84.3,
  },
  warn: {
    source: require('@/assets/images/journal/status-warn.png'),
    left: 3.14,
    top: -0.15,
    width: 93.33,
    height: 100.29,
  },
  danger: {
    source: require('@/assets/images/journal/status-danger.png'),
    left: 0,
    top: 7.64,
    width: 100,
    height: 85.66,
  },
};

export function DiaryStatus({ kind }: { kind: DiaryStatusKind }) {
  const variant = VARIANTS[kind];
  return (
    <View style={{ width: scale(BOX_WIDTH), height: scale(BOX_HEIGHT) }}>
      <Image
        source={variant.source}
        style={{
          position: 'absolute',
          left: `${variant.left}%`,
          top: `${variant.top}%`,
          width: `${variant.width}%`,
          height: `${variant.height}%`,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
