import { Icon, type IconName } from '@/components/ui/icon';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `Diary_Status` — the face beside a score in 일지/메인's 지난 기록 list,
 * one per grade. v3 replaced the three bitmaps (and the kaomoji text before
 * them) with the `Icon/Mood-*` line faces: 20pt (11.28 at 220), `icon/primary`.
 * Good → `Mood-Good`, warn → `Mood-Normal`, danger → `Mood-Bad`, as v3's mock
 * rows (84 · 79 · 56 · 21 · 8) pair them.
 */
export type DiaryStatusKind = 'good' | 'warn' | 'danger';

const FACE: Record<DiaryStatusKind, IconName> = {
  good: 'mood-good',
  warn: 'mood-normal',
  danger: 'mood-bad',
};

export const DIARY_STATUS_SIZE = 11.282;

export function DiaryStatus({ kind }: { kind: DiaryStatusKind }) {
  return <Icon name={FACE[kind]} size={scale(DIARY_STATUS_SIZE)} color={COLOR.icon.primary} />;
}
