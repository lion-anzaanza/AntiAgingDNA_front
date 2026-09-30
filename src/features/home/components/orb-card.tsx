import { LinearGradient } from 'expo-linear-gradient';
import { Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  LivingArtwork,
  SpinningRing,
  TwinkleDot,
  type ArtworkFrame,
} from '@/components/ui/living-artwork';
import { COLOR, GRADIENT_PASTEL, SHADOW } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { MOTION } from '@/lib/motion';
import { scale } from '@/lib/scale';

/** v4 `오브 카드` (`1363:2005`) — the full 197.436 content column. */
export const CARD_WIDTH = 197.436;

/**
 * The orb's highlights are two stacked sets, and the stacking is the whole
 * point. Three violet dots belong to the card and sit **under** the artwork,
 * which all but hides them; three near-white ones belong to `NiceGene` itself
 * and sit **over** it, 1.5pt lower. Those are the ones you actually see.
 *
 * Draw only the violet set, or put either set above the artwork, and the
 * highlights read purple instead of white.
 *
 * Positions are card-relative; each carries its own white glow.
 */
type Sparkle = { left: number; top: number; size: number; color: string; glow: string };

const GLOW_SMALL = '0px 0px 5px rgba(255, 255, 255, 0.5)';
const GLOW_LARGE = '0px 0px 4px 1px rgba(255, 255, 255, 0.25)';

const ORB_SPARKLES_UNDER: Sparkle[] = [
  { left: 74, top: 86, size: 2, color: 'rgba(191, 145, 255, 0.5)', glow: GLOW_SMALL },
  { left: 107, top: 62, size: 2, color: 'rgba(191, 145, 255, 0.5)', glow: GLOW_SMALL },
  { left: 95, top: 89, size: 3, color: 'rgba(237, 221, 255, 0.75)', glow: GLOW_LARGE },
];

const ORB_SPARKLES_OVER: Sparkle[] = [
  { left: 74, top: 87.5, size: 2, color: 'rgba(253, 237, 255, 0.5)', glow: GLOW_SMALL },
  { left: 107, top: 63.5, size: 2, color: 'rgba(253, 237, 255, 0.5)', glow: GLOW_SMALL },
  { left: 95, top: 90.5, size: 3, color: 'rgba(255, 221, 245, 0.75)', glow: GLOW_LARGE },
];

/**
 * The orb has seven states in Figma and `GET /api/scores/*` now answers with
 * `orbState`, so the artwork follows the score instead of always being the
 * healthy one. The bands are the server's (0/20/40/55/70/80/90) and sit inside
 * 22's 70/40 boundaries, so `orbState` and `grade` can never disagree.
 *
 * Each `*Gene` symbol carries its **own** three highlight dots, in its own
 * colour, drawn over the artwork — that is rule 9, and it is why the pair moves
 * together here rather than the dots being a single shared constant. The
 * positions are identical across all seven; only the colours change.
 *
 * `orbState` tracks `displayTotal`, which is the number this card shows, so it
 * is the right field *here*. It is the wrong field for anything per-day — see
 * `score.ts` and backlog 32.
 */
type OrbState =
  | 'DANGER_LOW'
  | 'DANGER_HIGH'
  | 'WARN_LOW'
  | 'WARN_HIGH'
  | 'GOOD_LOW'
  | 'GOOD_MID'
  | 'GOOD_HIGH';

function orbSparkles(small: string, large: string): Sparkle[] {
  return [
    { left: 74, top: 87.5, size: 2, color: small, glow: GLOW_SMALL },
    { left: 107, top: 63.5, size: 2, color: small, glow: GLOW_SMALL },
    { left: 95, top: 90.5, size: 3, color: large, glow: GLOW_LARGE },
  ];
}

export const ORB_STATES: Record<OrbState, { artwork: ImageSourcePropType; sparkles: Sparkle[] }> = {
  DANGER_LOW: {
    artwork: require('@/assets/images/home/orb-sick.png'),
    sparkles: orbSparkles('#FBFBFD', '#F8F8FA'),
  },
  DANGER_HIGH: {
    artwork: require('@/assets/images/home/orb-danger.png'),
    sparkles: orbSparkles('rgba(255,223,223,0.5)', 'rgba(255,221,221,0.75)'),
  },
  WARN_LOW: {
    artwork: require('@/assets/images/home/orb-warn.png'),
    sparkles: orbSparkles('rgba(255,253,145,0.5)', 'rgba(255,221,221,0.75)'),
  },
  WARN_HIGH: {
    artwork: require('@/assets/images/home/orb-middle.png'),
    sparkles: orbSparkles('rgba(255,209,145,0.5)', 'rgba(255,244,221,0.75)'),
  },
  GOOD_LOW: {
    artwork: require('@/assets/images/home/orb-good.png'),
    sparkles: orbSparkles('rgba(145,226,255,0.5)', 'rgba(255,221,221,0.75)'),
  },
  GOOD_MID: {
    artwork: require('@/assets/images/home/orb-better.png'),
    sparkles: orbSparkles('rgba(255,232,233,0.5)', 'rgba(255,221,221,0.75)'),
  },
  GOOD_HIGH: {
    artwork: require('@/assets/images/home/orb-nice.png'),
    sparkles: ORB_SPARKLES_OVER,
  },
};

/** Until the range answers, keep Figma's own orb rather than flashing a state. */
export const DEFAULT_ORB_STATE: OrbState = 'GOOD_HIGH';

export const ORB_PAGES: {
  key: string;
  caption: string;
  artwork: ImageSourcePropType;
  /** The artwork's box inside the 180pt card, in Figma points. */
  frame: ArtworkFrame;
  sparklesUnder: Sparkle[];
  sparklesOver: Sparkle[];
  /** The helix sways; the orb, being a sphere, has nothing to sway about. */
  tilt: boolean;
  /** A light band travelling inside the silhouette — reads best on the orb. */
  sheen: boolean;
  hint: string;
}[] = [
  {
    key: 'gene',
    caption: '오늘의 LifeDNA 컨디션',
    artwork: require('@/assets/images/home/orb-nice.png'),
    // NiceGene is placed 70.5×69.92 at (55,48), but its bitmap overhangs that
    // box — the glow — so the image itself is drawn larger and offset.
    frame: { left: 45.12, top: 42.0, width: 90.28, height: 89.92 },
    sparklesUnder: ORB_SPARKLES_UNDER,
    sparklesOver: ORB_SPARKLES_OVER,
    tilt: false,
    sheen: true,
    hint: '옆으로 밀어 나선형 모델을 확인해보세요 →',
  },
  {
    key: 'helix',
    caption: '나의 유전자 나선',
    artwork: require('@/assets/images/auth/dna-nice.png'),
    frame: { left: 45, top: 33, width: 89.76, height: 99.37 },
    // The helix card carries no highlights at all, and NiceDNA has none of its own.
    sparklesUnder: [],
    sparklesOver: [],
    tilt: true,
    sheen: true,
    hint: '← 옆으로 밀어 유기체 모델을 확인해보세요',
  },
];

type OrbCardProps = Omit<(typeof ORB_PAGES)[number], 'key'> & {
  /** The number beside 점 — `—` when there is no score to show. */
  score: string;
  /** `null` while the range has no yesterday to compare against. */
  delta: number | null;
  dateLabel: string;
  /** Which page the pager is on — every card draws the same dot row. */
  page: number;
  pageCount: number;
};

/**
 * The card grew from 180 to 197.436 in v4, but only horizontally: Figma
 * stretched the rings into 101.5×94 / 88.5×82 ellipses and `NiceGene` from 70.5
 * to 80.2 wide while every height stayed put — at three different ratios, so it
 * cannot be shown to be a resize by-product. Until the designer answers (결정
 * 대기 9 in `docs/redesign-v4-inventory.md`), the artwork, rings and highlights
 * keep their round 180-card geometry, shifted to the new card's centre; the
 * seven orb states are bitmaps a stretch would distort.
 */
const ORB_SHIFT = (CARD_WIDTH - 180) / 2;

/** v4's `▲`: a 5pt polygon in `brand/violet`, inset 6.7% each side, 25% off the bottom. */
function DeltaTriangle({ down }: { down: boolean }) {
  return (
    <Svg
      width={scale(4.33)}
      height={scale(3.75)}
      viewBox="0 0 4.33 3.75"
      style={{
        position: 'absolute',
        left: scale(7.1),
        top: scale(5),
        transform: [{ rotate: down ? '180deg' : '0deg' }],
      }}>
      <Path d="M2.165 0 L4.33 3.75 L0 3.75 Z" fill={COLOR.brand.violet} />
    </Svg>
  );
}

const BODY = { fontSize: scale(8.462), lineHeight: scale(12.41) };

const DOT_POINTS = cssGradientPoints(pastelAngle(10, 4), 10, 4);

export function OrbCard({
  caption,
  score,
  delta,
  dateLabel: date,
  artwork,
  frame,
  sparklesUnder,
  sparklesOver,
  tilt,
  sheen,
  hint,
  page,
  pageCount,
}: OrbCardProps) {
  return (
    <View
      style={{
        width: scale(CARD_WIDTH),
        height: scale(256),
        borderRadius: scale(11.282),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(9.03),
          top: scale(11),
          width: scale(84.57),
          height: scale(14),
          borderRadius: scale(10),
          backgroundColor: '#DCF7EF',
        }}>
        <View
          style={{
            position: 'absolute',
            left: scale(6.77),
            top: scale(5),
            width: scale(4),
            height: scale(4),
            borderRadius: scale(2),
            backgroundColor: '#007156',
            boxShadow: SHADOW,
          }}
        />
        {/* Figma centres the words at x 55.03 of the card — right of the chip's
            middle, clear of the dot. */}
        {/* The box stops short of the dot; at font_scale 1.1 the words shrink
            to fit rather than run into it. */}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={{
            position: 'absolute',
            left: scale(11.5),
            top: scale(11.875 - 11),
            width: scale(2 * (55.03 - 9.03 - 11.5)),
            textAlign: 'center',
            ...BODY,
            color: '#007156',
          }}
          className="font-plex">
          안정적으로 성장 중
        </Text>
      </View>
      <Text
        style={{
          position: 'absolute',
          right: scale(11.59),
          top: scale(13.085),
          ...BODY,
          color: COLOR.text.body,
        }}
        className="font-plex">
        {date}
      </Text>

      <SpinningRing left={43 + ORB_SHIFT} top={36} size={94} period={MOTION.rings.outerPeriod} />
      <SpinningRing
        left={49 + ORB_SHIFT}
        top={42}
        size={82}
        period={MOTION.rings.innerPeriod}
        reverse
      />
      {sparklesUnder.map((sparkle, index) => (
        <TwinkleDot
          key={`under-${sparkle.left}-${sparkle.top}`}
          {...sparkle}
          left={sparkle.left + ORB_SHIFT}
          index={index}
        />
      ))}
      <LivingArtwork
        source={artwork}
        frame={{ ...frame, left: frame.left + ORB_SHIFT }}
        tilt={tilt}
        sheen={sheen}
        accessibilityLabel={caption}
      />
      {sparklesOver.map((sparkle, index) => (
        <TwinkleDot
          key={`over-${sparkle.left}-${sparkle.top}`}
          {...sparkle}
          left={sparkle.left + ORB_SHIFT}
          index={index + 3}
        />
      ))}

      <Text
        style={{
          position: 'absolute',
          top: scale(140.44),
          width: '100%',
          textAlign: 'center',
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: COLOR.text.body,
        }}
        className="font-plex-semibold">
        {caption}
      </Text>
      <View
        style={{
          position: 'absolute',
          top: scale(148.65),
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: scale(1.13),
        }}>
        <Text
          style={{
            fontSize: scale(18.051),
            lineHeight: scale(22.564),
            letterSpacing: scale(-0.361),
            color: COLOR.text.strong,
          }}
          className="font-plex-bold">
          {score}
        </Text>
        <Text
          style={{
            marginTop: scale(3.1),
            fontSize: scale(11.282),
            lineHeight: scale(15.795),
            letterSpacing: scale(-0.1128),
            color: COLOR.text.body,
          }}
          className="font-plex-bold">
          점
        </Text>
      </View>

      {delta === null ? null : (
        <View
          style={{
            position: 'absolute',
            left: scale((CARD_WIDTH - 58.55) / 2),
            top: scale(179),
            width: scale(58.55),
            height: scale(14),
            borderRadius: scale(10),
            backgroundColor: COLOR.surface.tint2,
          }}>
          <DeltaTriangle down={delta < 0} />
          {/* v4 writes "   어제보다  +4": the leading spaces are the triangle's
              room, and the string sits 1pt right of the chip's middle. */}
          <Text
            numberOfLines={1}
            style={{
              position: 'absolute',
              left: scale(2),
              top: scale(8.23 - 5.077),
              width: '100%',
              textAlign: 'center',
              fontSize: scale(7.333),
              lineHeight: scale(10.154),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            {`   어제보다  ${delta >= 0 ? '+' : ''}${delta}`}
          </Text>
        </View>
      )}

      <Text
        style={{
          position: 'absolute',
          top: scale(197.16),
          width: '100%',
          textAlign: 'center',
          ...BODY,
          color: COLOR.text.muted,
        }}
        className="font-plex">
        컨디션이 좋아 오브가{' '}
        <Text style={{ color: COLOR.brand.violetText }}>푸른빛</Text>
        이에요{'\n'}나빠지면 점점 붉은빛으로 물들어요
      </Text>

      <View
        style={{
          position: 'absolute',
          top: scale(227),
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: scale(2),
        }}>
        {/* One element type for both dots (AGENTS rule 3): the resting dot is a
            gradient whose stops are all the same colour. */}
        {Array.from({ length: pageCount }, (_, index) => (
          <LinearGradient
            key={index}
            colors={
              index === page
                ? [...GRADIENT_PASTEL.colors]
                : [COLOR.surface.tint2, COLOR.surface.tint2, COLOR.surface.tint2]
            }
            locations={[...GRADIENT_PASTEL.locations]}
            start={DOT_POINTS.start}
            end={DOT_POINTS.end}
            style={{
              width: scale(index === page ? 10 : 4),
              height: scale(4),
              borderRadius: scale(10),
            }}
          />
        ))}
      </View>

      <Text
        style={{
          position: 'absolute',
          top: scale(237.03),
          width: '100%',
          textAlign: 'center',
          ...BODY,
          color: COLOR.text.body,
        }}
        className="font-plex">
        {hint}
      </Text>
    </View>
  );
}
