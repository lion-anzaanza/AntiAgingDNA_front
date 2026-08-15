import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { GradientText } from './gradient-text';

/**
 * Figma: `일간_컨디션_요약` (`585:1377`) — the card that opens when a day is
 * tapped in 일지/캘린더. It summarises that day and hands off to the full
 * 상세보기 through 입력 기록 보기.
 *
 * Figma parks it directly beneath the 캘린더 frame on the canvas rather than
 * inside it, which is how it belongs to that screen.
 */
const TILE_ICONS: Record<string, ImageSourcePropType> = {
  sleep: require('@/assets/images/home/ic-sleep.png'),
  water: require('@/assets/images/home/ic-water.png'),
  stress: require('@/assets/images/home/ic-stress.png'),
};

/** The 기분 tile shows the 만족도 face for that day's condition. */
const FEEL_FACES: ImageSourcePropType[] = [
  require('@/assets/images/journal/feel-very-bad.png'),
  require('@/assets/images/journal/feel-bad.png'),
  require('@/assets/images/journal/feel-normal.png'),
  require('@/assets/images/journal/feel-good.png'),
  require('@/assets/images/journal/feel-very-good.png'),
];

export type DailySummary = {
  /** e.g. `7월 19일 (금)` */
  dateLabel: string;
  score: number;
  /** The `#F3E9FF` pill above the tiles, e.g. `컨디션 좋음`. */
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
        height: scale(150),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(8.5),
        paddingHorizontal: scale(15),
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View>
          <Text
            style={{ fontSize: scale(8), lineHeight: scale(15), color: '#00352C' }}
            className="font-pretendard-bold">
            {summary.dateLabel}
          </Text>
          <View
            style={{
              width: scale(36),
              height: scale(10),
              marginTop: scale(3.5),
              borderRadius: scale(10),
              backgroundColor: '#F3E9FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <GradientText
              colors={[...GRADIENT_BRAND]}
              style={{ fontSize: scale(5), lineHeight: scale(10) }}
              className="font-pretendard-medium">
              {summary.grade}
            </GradientText>
          </View>
        </View>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'flex-end' }}>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(20), lineHeight: scale(24) }}
            className="font-pretendard-bold">
            {String(summary.score)}
          </GradientText>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(8), lineHeight: scale(15) }}
            className="font-pretendard-bold">
            점
          </GradientText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(9) }}>
        <Tile icon={TILE_ICONS.sleep} label="수면" value={summary.sleep} />
        <Tile icon={TILE_ICONS.water} label="수분" value={summary.water} />
        <Tile icon={TILE_ICONS.stress} label="스트레스" value={summary.stress} />
        <Tile
          icon={FEEL_FACES[summary.condition - 1]}
          label="기분"
          value={summary.conditionLabel}
        />
      </View>

      <Text
        style={{
          marginTop: scale(6),
          textAlign: 'center',
          fontSize: scale(6),
          lineHeight: scale(8),
          color: '#2C2C2A',
        }}
        className="font-pretendard">
        {summary.comment}
      </Text>

      <Pressable onPress={onOpenDetail} style={{ marginTop: 'auto', marginBottom: scale(12) }}>
        <LinearGradient
          colors={[...GRADIENT_BRAND]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            height: scale(20),
            borderRadius: scale(5),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{ fontSize: scale(8), lineHeight: scale(8), color: '#FFFFFF' }}
            className="font-pretendard-semibold">
            입력 기록 보기
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: ImageSourcePropType;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        width: scale(37),
        height: scale(42),
        borderRadius: scale(5),
        backgroundColor: '#FBF4FF',
        alignItems: 'center',
        paddingTop: scale(3),
      }}>
      <Image source={icon} style={{ width: scale(16), height: scale(16) }} resizeMode="contain" />
      <Text
        style={{ fontSize: scale(5), lineHeight: scale(9), color: '#88877F' }}
        className="font-pretendard">
        {label}
      </Text>
      <Text
        style={{ fontSize: scale(8), lineHeight: scale(9), color: '#000000' }}
        className="font-pretendard-extrabold">
        {value}
      </Text>
    </View>
  );
}
