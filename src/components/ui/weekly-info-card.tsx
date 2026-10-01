import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View, type ImageSourcePropType } from 'react-native';

import { COLOR, GRADIENT_PROGRESS, TONE_TEXT, type Tone } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma: `LifeDNA_WeeklyInfo_Card` — v3 179.385×67.291 (`1312:1651`), one
 * metric inside 나의 LifeDNA 정보 on 홈. Icon chip and title on top, a progress
 * bar under them, then a week of score bars beside a sentence about the trend.
 *
 * Every piece is placed absolutely at Figma's own coordinates, because the card
 * is a fixed box in v4 and the caption now wraps to two lines inside it.
 *
 * Composed from Figma sub-components: `_Status` (the 좋음/주의/위험 word),
 * `_ProgressBar` (Low/Mid/High) and `_ScoreBar` (seven fill levels). v3 fills
 * the progress bar with `GRADIENT_PROGRESS` and the score bars with solid
 * `text/on-pastel` (v4 had the pastel ramp on both).
 */
const WORD: Record<Tone, string> = { good: '좋음', warn: '주의', danger: '위험' };
const PROGRESS_FILL: Record<Level, number> = { low: 0.2606, mid: 0.5211, high: 0.7817 };

export type Level = 'low' | 'mid' | 'high';
/** A day's score, 1–7. Figma draws exactly seven fill heights. */
export type ScoreBarValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const CARD_HEIGHT = 67.291;
const PROGRESS_WIDTH = 161.219;
const PROGRESS_HEIGHT = 3.309;
const BAR_HEIGHT = 17.65;
const BAR_WIDTH = 3.309;
const BAR_PITCH = 4.538;
/** v4's hairline on the icon chip, progress bar and score bars. */
const HAIRLINE = '0px 0px 1.103px rgba(148, 148, 148, 0.25)';

type WeeklyInfoCardProps = {
  title: string;
  icon: ImageSourcePropType;
  tone: Tone;
  level: Level;
  /** Seven days, oldest first. */
  scores: ScoreBarValue[];
  caption: string;
};

function progressRamp(width: number, height: number) {
  return {
    colors: [...GRADIENT_PROGRESS.colors] as const,
    locations: [...GRADIENT_PROGRESS.locations] as const,
    ...cssGradientPoints(pastelAngle(width, height), width, height),
  };
}

export function WeeklyInfoCard({
  title,
  icon,
  tone,
  level,
  scores,
  caption,
}: WeeklyInfoCardProps) {
  const fillWidth = PROGRESS_WIDTH * PROGRESS_FILL[level];

  return (
    <View
      style={{
        height: scale(CARD_HEIGHT),
        borderRadius: scale(11.031),
        backgroundColor: COLOR.surface.chip,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(8.25),
          top: scale(7.725),
          width: scale(20.95),
          height: scale(20.95),
          borderRadius: scale(3.309),
          backgroundColor: COLOR.surface.card,
          boxShadow: HAIRLINE,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* v4's slot is the hidden 14.34 `IconHere` placeholder, centred. */}
        <Image
          source={icon}
          style={{ width: scale(14.34), height: scale(14.34) }}
          resizeMode="contain"
        />
      </View>
      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          left: scale(36.68),
          top: scale(11.46),
          maxWidth: scale(105),
          fontSize: scale(9.59),
          lineHeight: scale(13.538),
          letterSpacing: scale(-0.0959),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {title}
      </Text>
      <Text
        style={{
          position: 'absolute',
          // v3 centres the word at x 156.09, y 17.96 (mean of the two cards).
          left: scale(156.09 - 10),
          top: scale(17.96 - 5.077),
          width: scale(20),
          textAlign: 'center',
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: TONE_TEXT[tone],
        }}
        className="font-plex-semibold">
        {WORD[tone]}
      </Text>

      <View
        style={{
          position: 'absolute',
          left: scale(9.08),
          top: scale(33.09),
          width: scale(PROGRESS_WIDTH),
          height: scale(PROGRESS_HEIGHT),
          borderRadius: scale(3.309),
          backgroundColor: COLOR.surface.card,
          boxShadow: HAIRLINE,
        }}>
        <LinearGradient
          {...progressRamp(fillWidth, PROGRESS_HEIGHT)}
          style={{
            width: scale(fillWidth),
            height: '100%',
            borderTopLeftRadius: scale(3.309),
            borderBottomLeftRadius: scale(3.309),
            boxShadow: HAIRLINE,
          }}
        />
      </View>

      {scores.map((score, index) => {
        // Figma steps the fill in eighths, starting at two.
        const height = (BAR_HEIGHT * (score + 1)) / 8;
        return (
          <View
            // Position is the identity here — the same day keeps its slot.
            key={index}
            style={{
              position: 'absolute',
              left: scale(9.13 + index * BAR_PITCH),
              top: scale(43.02 + BAR_HEIGHT - height),
              width: scale(BAR_WIDTH),
              height: scale(height),
              borderTopLeftRadius: scale(2.206),
              borderTopRightRadius: scale(2.206),
              backgroundColor: COLOR.text.onPastel,
              boxShadow: HAIRLINE,
            }}
          />
        );
      })}
      <View
        style={{
          position: 'absolute',
          left: scale(46.21),
          top: scale(39.29),
          width: scale(123.9),
          height: scale(21),
          justifyContent: 'center',
        }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.text.body }}
          className="font-plex-semibold">
          {caption}
        </Text>
      </View>
    </View>
  );
}
