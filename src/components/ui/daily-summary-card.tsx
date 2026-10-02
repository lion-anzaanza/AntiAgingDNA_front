import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';

import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';
import { Button } from './button';

/**
 * Figma: `일간_컨디션_요약` (`585:1377`) — the card that opens when a day is
 * tapped in 일지/캘린더. It summarises that day and hands off to the full
 * 상세보기 through 입력 기록 보기.
 *
 * The old design parked it directly beneath the 캘린더 frame on the canvas.
 * **v4 has no counterpart** — `04_일지` in `99_개선안_v4` holds only the four
 * frames, nothing parked beside or under them. So the card keeps its old
 * layout and only takes on what v4 applies everywhere: the 197.436 column,
 * white `surface/card` at radius 9.615 with `SHADOW_V4`, IBM Plex, colour
 * tokens instead of hex, solid `brand/violet-text` where there was gradient
 * text, `surface/tint` tiles (the `surface/tint` strip is 캘린더's own summary
 * colour family), and the shared `Button` for 입력 기록 보기.
 *
 * v3 has no counterpart either; it takes v3's icons — the line moon / drop /
 * flame of 홈's stat cards and the `Icon/Mood-*` faces, all `icon/primary` —
 * in place of the bitmaps.
 */
const TILE_ICONS: Record<'sleep' | 'water' | 'stress', IconName> = {
  sleep: 'moon',
  water: 'drop',
  stress: 'flame',
};

/** The 기분 tile shows the 만족도 face for that day's condition. */
const FEEL_FACES: IconName[] = [
  'mood-very-bad',
  'mood-bad',
  'mood-normal',
  'mood-good',
  'mood-very-good',
];

/** Card padding: 9.03 like every v4 card row in 일지. */
const PAD = 9.03;

export type DailySummary = {
  /** e.g. `7월 19일 (금)` */
  dateLabel: string;
  score: number;
  /** The pill under the date, e.g. `컨디션 좋음`. */
  grade: string;
  sleep: string;
  water: string;
  stress: string;
  /** 1–5, picks both the 기분 label and its face. */
  condition: 1 | 2 | 3 | 4 | 5;
  conditionLabel: string;
  comment: string;
};

type DailySummaryCardProps = {
  summary: DailySummary;
  onOpenDetail: () => void;
};

export function DailySummaryCard({ summary, onOpenDetail }: DailySummaryCardProps) {
  return (
    <View
      style={{
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
        paddingTop: scale(7),
        paddingBottom: scale(PAD),
        paddingHorizontal: scale(PAD),
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View>
          <Text
            style={{
              fontSize: scale(9.59),
              lineHeight: scale(13.538),
              letterSpacing: scale(-0.0959),
              color: COLOR.text.heading,
            }}
            className="font-plex-semibold">
            {summary.dateLabel}
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              height: scale(12),
              marginTop: scale(2.5),
              paddingHorizontal: scale(5),
              borderRadius: scale(6),
              backgroundColor: COLOR.surface.tint2,
              justifyContent: 'center',
            }}>
            <Text
              style={{ fontSize: scale(6.769), lineHeight: scale(9.026), color: COLOR.brand.violetText }}
              className="font-plex-semibold">
              {summary.grade}
            </Text>
          </View>
        </View>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{ fontSize: scale(20), lineHeight: scale(26), color: COLOR.brand.violetText }}
            className="font-plex-bold">
            {String(summary.score)}
          </Text>
          <Text
            style={{ fontSize: scale(8.462), lineHeight: scale(12.41), color: COLOR.brand.violetText }}
            className="font-plex-semibold">
            점
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: scale(4.513), marginTop: scale(8) }}>
        <Tile icon={TILE_ICONS.sleep} label="수면" value={summary.sleep} />
        <Tile icon={TILE_ICONS.water} label="수분" value={summary.water} />
        <Tile icon={TILE_ICONS.stress} label="스트레스" value={summary.stress} />
        <Tile
          icon={FEEL_FACES[summary.condition - 1]}
          label="기분"
          value={summary.conditionLabel}
        />
      </View>

      {/* Facts-only sentence from `lib/facts` (backlog 27 — the server writes
          none); empty on a day with nothing to compare. */}
      {summary.comment === '' ? null : (
        <Text
          style={{
            marginTop: scale(6),
            textAlign: 'center',
            fontSize: scale(7.333),
            lineHeight: scale(10.154),
            color: COLOR.text.body,
          }}
          className="font-plex">
          {summary.comment}
        </Text>
      )}

      <Button label="입력 기록 보기" onPress={onOpenDetail} style={{ marginTop: scale(9) }} />
    </View>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        height: scale(46),
        borderRadius: scale(4.808),
        backgroundColor: COLOR.surface.tint,
        alignItems: 'center',
        paddingTop: scale(4),
      }}>
      <Icon name={icon} size={scale(15)} color={COLOR.icon.primary} />
      <Text
        style={{ fontSize: scale(6.769), lineHeight: scale(9.026), color: COLOR.text.body }}
        className="font-plex">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{ fontSize: scale(8.462), lineHeight: scale(12.41), color: COLOR.text.strong }}
        className="font-plex-bold">
        {value}
      </Text>
    </View>
  );
}
