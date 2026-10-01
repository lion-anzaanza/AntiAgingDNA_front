import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Icon, type IconName } from '@/components/ui/icon';
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

export type Level = 'low' | 'mid' | 'high';
/** Figma's `_ProgressBar` Low / Mid / High, as a share of the track. */
export const LEVEL_FILL: Record<Level, number> = { low: 0.2606, mid: 0.5211, high: 0.7817 };
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

/**
 * v3's two drawn icons for 신체's cards, as Figma exports them. They sit on the
 * card, not centred in the chip: the moon (`Group 1175`, a yellow disc cut by a
 * white one, plus three `#FFDD00` Z's) and the drop (`Ellipse 24`). Boxes are
 * card-relative, ×220/390.
 */
export type WeeklyGlyph = 'sleep' | 'water';

function isGlyph(icon: IconName | WeeklyGlyph): icon is WeeklyGlyph {
  return icon === 'sleep' || icon === 'water';
}

function Glyph({ name }: { name: WeeklyGlyph }) {
  if (name === 'sleep') {
    return (
      <Svg
        width={scale(15.231)}
        height={scale(14.667)}
        viewBox="0 0 27 26"
        style={{ position: 'absolute', left: scale(12.708), top: scale(9.693) }}>
        <Circle cx={10.035} cy={15.8046} r={10.035} fill="#FFDD00" />
        <Circle cx={16.7284} cy={10.4525} r={10.035} fill="#FFFFFF" />
        <Path d="M9.956 12.562V11.9547L11.9326 9.29639H9.96173V8.41409H13.319V9.02139L11.3425 11.6797H13.3133V12.562H9.956Z" fill="#FFDD00" />
        <Path d="M21.4331 13H14.6341V11.466L19.3271 5.447H14.8681V3.926H21.3031V5.46L16.5971 11.479H21.4331V13Z" fill="#FFDD00" />
        <Path d="M14.0478 17.0522V16.2425L16.6833 12.6981H14.0555V11.5217H18.5319V12.3314L15.8965 15.8759H18.5242V17.0522H14.0478Z" fill="#FFDD00" />
      </Svg>
    );
  }
  return (
    <Svg
      width={scale(6.769)}
      height={scale(11.282)}
      viewBox="0 0 12 20"
      style={{ position: 'absolute', left: scale(15.992), top: scale(12.134) }}>
      <Path
        d="M11.7333 14.0399C11.7333 17.5499 9.10674 19.5556 5.86667 19.5556C2.6266 19.5556 0 17.5499 0 14.0399C2.13333 4.0114 5.33333 0 5.86667 0C6.4 0 9.6 4.0114 11.7333 14.0399Z"
        fill="#9CD6FF"
      />
    </Svg>
  );
}

type WeeklyInfoCardProps = {
  title: string;
  /**
   * The area's line icon centred in the chip, or one of v3's drawn 신체 glyphs.
   * v3 draws only 신체's cards; the other areas take the `Icon/*` glyph v3 uses
   * for that area on 개선책, so one area never shows two icon styles.
   */
  icon: IconName | WeeklyGlyph;
  /** `null` when there is nothing to grade — the word is left out. */
  tone: Tone | null;
  /** Share of the progress track to fill, 0–1 (`LEVEL_FILL` for Figma's three). */
  fill: number;
  /** Seven days, oldest first. `null` is a day with no value and draws no bar. */
  scores: (ScoreBarValue | null)[];
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
  fill,
  scores,
  caption,
}: WeeklyInfoCardProps) {
  const fillWidth = PROGRESS_WIDTH * Math.min(1, Math.max(0, fill));

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
        {isGlyph(icon) ? null : (
          <Icon name={icon} size={scale(13.538)} color={COLOR.icon.primary} />
        )}
      </View>
      {isGlyph(icon) ? <Glyph name={icon} /> : null}
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
          color: tone ? TONE_TEXT[tone] : COLOR.text.muted,
        }}
        className="font-plex-semibold">
        {tone ? WORD[tone] : ''}
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
        if (score === null) return null;
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
