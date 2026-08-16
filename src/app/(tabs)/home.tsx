import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DnaKind } from '@/components/ui/dna-kind';
import { GradientText } from '@/components/ui/gradient-text';
import {
  LivingArtwork,
  SpinningRing,
  TwinkleDot,
  type ArtworkFrame,
} from '@/components/ui/living-artwork';
import { WeeklyInfoCard, type ScoreBarValue } from '@/components/ui/weekly-info-card';
import { useAuth } from '@/lib/auth';
import { SHADOW } from '@/lib/design';
import { MOTION } from '@/lib/motion';
import { scale } from '@/lib/scale';

/**
 * Figma: 홈/메인 — `597:1466`.
 *
 * The orb card is a two-page swipe: 오늘의 Life DAN 컨디션 with the gene orb
 * (`463:1195`), then 나의 유전자 나선 with the DNA helix (`457:791`, which sits
 * beside the frame rather than inside it).
 *
 * Everything here is still static — there is no data layer yet, so the numbers
 * are the ones Figma shows.
 */
const CARD_WIDTH = 180;
const CONTENT_INSET = 18;
/**
 * 홈 is inset asymmetrically: every section starts at 18 and is 180 wide, so the
 * right margin is 22. Padding both sides by 18 made each card 4pt too wide.
 */
const CONTENT_INSET_RIGHT = 220 - CONTENT_INSET - CARD_WIDTH;
/**
 * `pagingEnabled` snaps by the scroll view's own width, so each page is a
 * full-width wrapper holding the 180pt card — otherwise the next card peeks in.
 * Fixed at module scope for the same reason `scale()` is: the app is portrait.
 */
const PAGE_WIDTH = Dimensions.get('window').width;

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

const ORB_PAGES: {
  key: string;
  caption: string;
  score: string;
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
    caption: '오늘의 Life DAN 컨디션',
    score: '100',
    artwork: require('@/assets/images/home/orb-nice.png'),
    // NiceGene is placed 70.5×69.92 at (55,48), but its bitmap overhangs that
    // box — the glow — so the image itself is drawn larger and offset.
    frame: { left: 45.12, top: 42.0, width: 90.28, height: 89.92 },
    sparklesUnder: ORB_SPARKLES_UNDER,
    sparklesOver: ORB_SPARKLES_OVER,
    tilt: false,
    sheen: true,
    hint: '옆으로 밀어 유기체 모델을 확인해보세요 →',
  },
  {
    key: 'helix',
    caption: '나의 유전자 나선',
    score: '99',
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

const STATS: { label: string; value: string; badge: string; bg: string; fg: string; icon: ImageSourcePropType }[] = [
  {
    label: '수면',
    value: '6.4시간',
    badge: '조금 부족',
    bg: '#FBF2E1',
    fg: '#E5A64E',
    icon: require('@/assets/images/home/ic-sleep.png'),
  },
  {
    label: '수분',
    value: '1.6L',
    badge: '좋아요',
    bg: '#E6F4EE',
    fg: '#4B9977',
    icon: require('@/assets/images/home/ic-water.png'),
  },
  {
    label: '스트레스',
    value: '72%',
    badge: '높음',
    bg: '#F9E9E8',
    fg: '#D25D53',
    icon: require('@/assets/images/home/ic-stress.png'),
  },
];

/**
 * Two 1×1 dots on the 오늘의 일지 card, each carrying a 20pt blur and a 10pt
 * spread — so what you see is a soft bloom about 40pt across, not a dot. Easy to
 * dismiss by their size and then wonder why the card looks flat.
 */
const CTA_GLOWS = [
  { left: 156, top: 19 },
  { left: 175, top: 78 },
];

const BALANCE_AREAS = ['신체', '정신', '환경', '감정', '사회'];

const SLEEP_SCORES: ScoreBarValue[] = [1, 2, 3, 4, 5, 6, 7];
const WATER_SCORES: ScoreBarValue[] = [4, 2, 5, 6, 3, 2, 7];

export default function HomeScreen() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  function handlePageScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH));
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(24) }}>
        <View
          style={{
            paddingLeft: scale(CONTENT_INSET),
            paddingRight: scale(CONTENT_INSET_RIGHT),
            paddingTop: scale(10),
          }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={GREETING} className="font-pretendard-extrabold">
              안녕하세요,{' '}
            </Text>
            <GradientText
              colors={['#4B4CF5', '#8E56FF']}
              style={GREETING}
              className="font-pretendard-black">
              {user?.nickname ?? ''}
            </GradientText>
            <Text style={GREETING} className="font-pretendard-extrabold">
              님!
            </Text>
          </View>
          <Text
            style={{ fontSize: scale(7), lineHeight: scale(10), color: '#696969' }}
            className="font-pretendard">
            오늘도 나를 조금 더 알아가요
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handlePageScroll}
          scrollEventThrottle={16}
          style={{ marginTop: scale(9) }}>
          {ORB_PAGES.map(({ key, ...orbPage }) => (
            // The page is the full window so paging snaps, but the card itself
            // lines up with every other section at CONTENT_INSET — centring the
            // 180pt card in a 220pt page would push it 2pt right of Figma.
            <View key={key} style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
              <OrbCard {...orbPage} page={page} pageCount={ORB_PAGES.length} />
            </View>
          ))}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            gap: scale(6),
            marginTop: scale(16),
            paddingLeft: scale(CONTENT_INSET),
            paddingRight: scale(CONTENT_INSET_RIGHT),
          }}>
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </View>

        <View
          style={{
            paddingLeft: scale(CONTENT_INSET),
            paddingRight: scale(CONTENT_INSET_RIGHT),
          }}>
          <SectionHeading>오늘의 일지</SectionHeading>
          <JournalCta />

          <SectionHeading>나의 LifeDNA 정보</SectionHeading>
          <View
            style={{
              borderRadius: scale(10),
              backgroundColor: '#FFFFFF',
              boxShadow: SHADOW,
              paddingTop: scale(5.5),
              paddingBottom: scale(10),
              paddingHorizontal: scale(11),
            }}>
            <Text
              style={{ fontSize: scale(8), lineHeight: scale(9) }}
              className="font-pretendard-bold">
              5개 영역 밸런스
            </Text>
            <View style={{ flexDirection: 'row', gap: scale(2), marginTop: scale(8) }}>
              {BALANCE_AREAS.map((area, index) => (
                <DnaKind key={area} label={area} tone={index === 0 ? 'good' : 'default'} />
              ))}
            </View>
            <View style={{ marginTop: scale(9) }}>
              <WeeklyInfoCard
                title="수면 시간"
                icon={require('@/assets/images/home/ic-sleep.png')}
                tone="good"
                level="high"
                scores={SLEEP_SCORES}
                caption="올빼미형 - 취침이 3일째 30분씩 빨라졌어요."
              />
            </View>
            <View style={{ marginTop: scale(9) }}>
              <WeeklyInfoCard
                title="수분 섭취량"
                icon={require('@/assets/images/home/ic-water.png')}
                tone="warn"
                level="mid"
                scores={WATER_SCORES}
                caption="올빼미형 - 취침이 3일째 30분씩 빨라졌어요."
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREETING = { fontSize: scale(12), lineHeight: scale(15), color: '#000000' };

type OrbCardProps = Omit<(typeof ORB_PAGES)[number], 'key'> & {
  /** Which page the pager is on — every card draws the same dot row. */
  page: number;
  pageCount: number;
};

function OrbCard({
  caption,
  score,
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
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
      }}>
      <View
        style={{
          position: 'absolute',
          left: scale(12),
          top: scale(11),
          width: scale(64),
          height: scale(14),
          borderRadius: scale(10),
          backgroundColor: '#DCF7EF',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: scale(6),
        }}>
        <View
          style={{
            width: scale(4),
            height: scale(4),
            borderRadius: scale(2),
            backgroundColor: '#007156',
            boxShadow: SHADOW,
          }}
        />
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: scale(5.5),
            lineHeight: scale(10),
            color: '#007156',
          }}
          className="font-pretendard-medium">
          안정적으로 성장 중
        </Text>
      </View>
      <Text
        style={{
          position: 'absolute',
          right: scale(12),
          top: scale(13),
          fontSize: scale(5.5),
          lineHeight: scale(10),
          color: '#88877F',
        }}
        className="font-pretendard-medium">
        8월 5일 수요일
      </Text>

      <SpinningRing left={43} top={36} size={94} period={MOTION.rings.outerPeriod} />
      <SpinningRing left={49} top={42} size={82} period={MOTION.rings.innerPeriod} reverse />
      {sparklesUnder.map((sparkle, index) => (
        <TwinkleDot key={`under-${sparkle.left}-${sparkle.top}`} {...sparkle} index={index} />
      ))}
      <LivingArtwork
        source={artwork}
        frame={frame}
        tilt={tilt}
        sheen={sheen}
        accessibilityLabel={caption}
      />
      {sparklesOver.map((sparkle, index) => (
        <TwinkleDot key={`over-${sparkle.left}-${sparkle.top}`} {...sparkle} index={index + 3} />
      ))}

      <Text
        style={{
          position: 'absolute',
          top: scale(140),
          width: '100%',
          textAlign: 'center',
          fontSize: scale(7),
          lineHeight: scale(10),
          color: '#88877F',
        }}
        className="font-pretendard-semibold">
        {caption}
      </Text>
      <View
        style={{
          position: 'absolute',
          top: scale(151),
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(25), lineHeight: scale(28), color: '#2C2C2A' }}
          className="font-pretendard-extrabold">
          {score}
        </Text>
        <Text
          style={{
            fontSize: scale(10),
            lineHeight: scale(18),
            marginLeft: scale(2),
            color: '#88877F',
          }}
          className="font-pretendard-semibold">
          점
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: scale(64),
          top: scale(179),
          width: scale(48),
          height: scale(14),
          borderRadius: scale(10),
          backgroundColor: '#E8EDFE',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: scale(3),
        }}>
        <Text
          style={{ fontSize: scale(5), lineHeight: scale(10), color: '#3C59F6' }}
          className="font-pretendard-bold">
          ▲
        </Text>
        <Text
          style={{ fontSize: scale(6), lineHeight: scale(10), color: '#3C59F6' }}
          className="font-pretendard-bold">
          어제보다 +4
        </Text>
      </View>

      <Text
        style={{
          position: 'absolute',
          top: scale(203),
          width: '100%',
          textAlign: 'center',
          fontSize: scale(7),
          lineHeight: scale(9),
          color: '#88877F',
        }}
        className="font-pretendard-medium">
        컨디션이 좋아 오브가{' '}
        <Text style={{ color: '#3C59F6' }} className="font-pretendard-bold">
          푸른빛
        </Text>
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
        {Array.from({ length: pageCount }, (_, index) =>
          index === page ? (
            <LinearGradient
              key={index}
              colors={['#573FF5', '#803EF5']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: scale(10), height: scale(4), borderRadius: scale(10) }}
            />
          ) : (
            <View
              key={index}
              style={{
                width: scale(4),
                height: scale(4),
                borderRadius: scale(10),
                backgroundColor: '#E8EDFE',
              }}
            />
          ),
        )}
      </View>

      <Text
        style={{
          position: 'absolute',
          top: scale(239),
          width: '100%',
          textAlign: 'center',
          fontSize: scale(5),
          lineHeight: scale(10),
          color: '#B4B2A8',
        }}
        className="font-pretendard-medium">
        {hint}
      </Text>
    </View>
  );
}

type StatCardProps = (typeof STATS)[number];

function StatCard({ label, value, badge, bg, fg, icon }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        height: scale(78),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        alignItems: 'center',
        paddingTop: scale(3),
      }}>
      <Image source={icon} style={{ width: scale(23), height: scale(22) }} resizeMode="contain" />
      <Text
        style={{ fontSize: scale(10), lineHeight: scale(13), marginTop: scale(7) }}
        className="font-pretendard-extrabold">
        {value}
      </Text>
      <Text
        style={{ fontSize: scale(7), lineHeight: scale(9), color: '#88877F' }}
        className="font-pretendard-medium">
        {label}
      </Text>
      <View
        style={{
          width: scale(37),
          height: scale(12),
          marginTop: scale(4),
          borderRadius: scale(10),
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(6.5), lineHeight: scale(10), color: fg }}
          className="font-pretendard-bold">
          {badge}
        </Text>
      </View>
    </View>
  );
}

function JournalCta() {
  return (
    <LinearGradient
      colors={['#4252F6', '#844BF7']}
      locations={[0.039, 0.687]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{
        height: scale(86),
        borderRadius: scale(10),
        boxShadow: SHADOW,
        // Against the 86pt card: 9 · title 26 · 4.5 · caption 9 · 6.5 · button
        // 20 · 11. The gaps are load-bearing — the card looks top-heavy if the
        // content creeps up and leaves the slack at the bottom.
        paddingTop: scale(9),
        paddingLeft: scale(12),
        // Keeps the two blooms below from spilling past the rounded corners.
        overflow: 'hidden',
      }}>
      {CTA_GLOWS.map((glow) => (
        <View
          key={`${glow.left}-${glow.top}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: scale(glow.left),
            top: scale(glow.top),
            width: scale(1),
            height: scale(1),
            borderRadius: scale(1),
            backgroundColor: '#9463F8',
            boxShadow: `0px 0px ${scale(20)}px ${scale(10)}px rgba(255, 255, 255, 0.25)`,
          }}
        />
      ))}
      <Text
        style={{ fontSize: scale(10), lineHeight: scale(13), color: '#FFFFFF' }}
        className="font-pretendard-extrabold">
        오늘 변화가 있었던 DNA,{'\n'}딱 30초만 기록해요
      </Text>
      <Text
        style={{
          fontSize: scale(7),
          lineHeight: scale(9),
          marginTop: scale(4.5),
          color: '#E7D7FF',
        }}
        className="font-pretendard-medium">
        기록할수록 나의 LifeDNA가 더 정교해져요
      </Text>
      <Pressable
        onPress={() => router.push('/journal/today')}
        style={{
          width: scale(62),
          height: scale(20),
          marginTop: scale(6.5),
          borderRadius: scale(7),
          backgroundColor: '#FFFFFF',
          boxShadow: SHADOW,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(13), color: '#844BF7' }}
          className="font-pretendard-black">
          오늘 기록하기 →
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: scale(10),
        lineHeight: scale(13),
        marginTop: scale(15),
        marginBottom: scale(6),
      }}
      className="font-pretendard-extrabold">
      {children}
    </Text>
  );
}
