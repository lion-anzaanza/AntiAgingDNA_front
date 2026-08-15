import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View, type ImageSourcePropType } from 'react-native';

import { GRADIENT_SCORE, SHADOW_HAIRLINE, TONE_TEXT, type Tone } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `LifeDNA_WeeklyInfo_Card` (158×61) — one metric inside 나의 LifeDNA
 * 정보 on 홈. Icon chip and title on top, a progress bar under them, then a
 * week of score bars beside a sentence about the trend.
 *
 * Composed from three Figma sub-components: `_Word` (the 좋음/주의/위험 label),
 * `_ProgressBar` (Low/Mid/High) and `_ScoreBar` (seven fill levels).
 */
const WORD: Record<Tone, string> = { good: '좋음', warn: '주의', danger: '위험' };
const PROGRESS_FILL: Record<Level, number> = { low: 0.2606, mid: 0.5211, high: 0.7817 };

export type Level = 'low' | 'mid' | 'high';
/** A day's score, 1–7. Figma draws exactly seven fill heights. */
export type ScoreBarValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const BAR_HEIGHT = 16;
const BAR_WIDTH = 3;
const BAR_GAP = 1;

type WeeklyInfoCardProps = {
  title: string;
  icon: ImageSourcePropType;
  tone: Tone;
  level: Level;
  /** Seven days, oldest first. */
  scores: ScoreBarValue[];
  caption: string;
};

export function WeeklyInfoCard({
  title,
  icon,
  tone,
  level,
  scores,
  caption,
}: WeeklyInfoCardProps) {
  return (
    <View
      style={{
        borderRadius: scale(10),
        backgroundColor: '#F2F2F0',
        paddingTop: scale(7),
        paddingBottom: scale(6),
        paddingLeft: scale(7),
        paddingRight: scale(8),
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: scale(19),
            height: scale(19),
            borderRadius: scale(3),
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW_HAIRLINE,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={icon}
            style={{ width: scale(13), height: scale(13) }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{ fontSize: scale(8), lineHeight: scale(9), marginLeft: scale(6) }}
          className="font-pretendard-extrabold">
          {title}
        </Text>
        <Text
          style={{
            marginLeft: 'auto',
            marginRight: scale(4.5),
            fontSize: scale(5),
            lineHeight: scale(9),
            color: TONE_TEXT[tone],
          }}
          className="font-pretendard-bold">
          {WORD[tone]}
        </Text>
      </View>

      <View
        style={{
          height: scale(3),
          marginTop: scale(4),
          marginLeft: scale(1),
          borderRadius: scale(3),
          backgroundColor: '#FFFFFF',
          boxShadow: SHADOW_HAIRLINE,
        }}>
        <LinearGradient
          colors={[...GRADIENT_SCORE]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: `${PROGRESS_FILL[level] * 100}%`,
            height: '100%',
            borderRadius: scale(3),
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(6) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: scale(BAR_GAP),
            height: scale(BAR_HEIGHT),
          }}>
          {scores.map((score, index) => (
            <LinearGradient
              // Position is the identity here — the same day keeps its slot.
              key={index}
              colors={[...GRADIENT_SCORE]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: scale(BAR_WIDTH),
                // Figma steps the fill in eighths, starting at two.
                height: scale((BAR_HEIGHT * (score + 1)) / 8),
                borderTopLeftRadius: scale(2),
                borderTopRightRadius: scale(2),
              }}
            />
          ))}
        </View>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            marginLeft: scale(8),
            fontSize: scale(5),
            lineHeight: scale(9),
            color: '#7A7A7A',
          }}
          className="font-pretendard-semibold">
          {caption}
        </Text>
      </View>
    </View>
  );
}
