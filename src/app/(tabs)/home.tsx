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
import {
  WeeklyInfoCard,
  type Level,
  type ScoreBarValue,
} from '@/components/ui/weekly-info-card';
import { useAuth } from '@/lib/auth';
import { addDays, isoDate, WEEKDAYS_SUN_FIRST } from '@/lib/dates';
import { toDiaryDraft, type DiaryRow } from '@/lib/diary-request';
import { SHADOW, type Tone } from '@/lib/design';
import { MOTION } from '@/lib/motion';
import { scale } from '@/lib/scale';
import { byDate, diariesPath, scoresPath, type DailyScore } from '@/lib/score';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma: 홈/메인 — `597:1466`.
 *
 * The orb card is a two-page swipe: 오늘의 LifeDNA 컨디션 with the gene orb
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
    caption: '오늘의 LifeDNA 컨디션',
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

/**
 * The three metric cards. `value` is replaced with the day's real answer in
 * `HomeScreen`; **`badge` is not.**
 *
 * Item 22 deployed a grade for the *total* and for the five 영역 scores, and
 * neither is a grade for 수면·수분·스트레스 — there is no rule saying which
 * stress percentage is 높음 or which cup range is 좋아요. Inventing those
 * thresholds is the same mistake as inventing a cup→litre factor, so the badges
 * stay Figma's until backlog 10 answers it.
 */
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
    /*
     * The band, not a litre figure. `waterIntake` is a cup range on the wire
     * (`THREE_TO_FIVE`), and there is no cup→mL factor anywhere in the data —
     * inventing one to print `1.6L` would be exactly the kind of made-up
     * constant this project refuses elsewhere. Backlog item 26; the backend
     * settled it this way on 2026-08-17.
     */
    value: '3~5잔',
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

/**
 * 나의 LifeDNA 정보 — re-pulled 2026-08-17, when Figma turned the five `DNAKind`
 * chips into a **tab strip** (`725:1213`, `725:1294`, `725:1375`, `725:1456`,
 * `726:1472`). Selecting an area swaps the two weekly cards below it.
 *
 * Two things changed at once and both matter:
 *
 * - **The order is 신체 · 정신 · 감정 · 사회 · 환경**, not the 신체 · 정신 · 환경 ·
 *   감정 · 사회 this screen used to draw.
 * - **Only the selected chip carries a grade colour**; the other four are
 *   `default`. That is how the design shows selection — there is no separate
 *   underline or highlight.
 *
 * Every string below is Figma's mock. **There is no endpoint behind any of it**
 * — no weekly trend data (backlog 11), no server-written sentences (27), and
 * two of the five areas score `null` even on a full day (33). The score bars
 * are the same two patterns the old card used, which Figma kept.
 *
 * **The icons are the unfinished part.** Figma supplies them for 신체 and 정신
 * only, reusing one glyph for both cards, and leaves 감정·사회·환경 as empty
 * white squares. Rather than pick five new icons, the port uses the 5 영역 icons
 * the 개선책 screens already ship — one per area — as a visible stand-in.
 */
type BalanceArea = {
  label: string;
  tone: Tone;
  icon: ImageSourcePropType;
  cards: { title: string; caption: string; tone: Tone; level: Level }[];
};

const BALANCE_AREAS: BalanceArea[] = [
  {
    label: '신체',
    tone: 'good',
    icon: require('@/assets/images/plan/area-body.png'),
    cards: [
      {
        title: '수면 패턴(시간·질)',
        caption: '최근 평균 6.4시간 · 잠들기까지 15분',
        tone: 'good',
        level: 'high',
      },
      {
        title: '수면 리듬(크로노타입)',
        caption: '올빼미형 — 취침이 3일째 30분씩 빨라졌어요.',
        tone: 'warn',
        level: 'mid',
      },
    ],
  },
  {
    label: '정신',
    tone: 'good',
    icon: require('@/assets/images/plan/area-mind.png'),
    cards: [
      {
        title: '스트레스 회복력',
        caption: '회복이 몰아서 오는 편 — 짧은 휴식 분산을 추천해요.',
        tone: 'good',
        level: 'high',
      },
      {
        title: '집중 · 디지털 부하',
        caption: '취침 전 폰 사용이 집중과 잠드는 시간에 영향을 줘요.',
        tone: 'warn',
        level: 'mid',
      },
    ],
  },
  {
    label: '감정',
    tone: 'danger',
    icon: require('@/assets/images/plan/area-emotion.png'),
    cards: [
      {
        title: '기분 안정도',
        caption: '기분의 편차가 커요 — 기복을 줄이는 게 목표예요.',
        tone: 'good',
        level: 'high',
      },
      {
        title: '기분 회복 탄력',
        caption: '낮은 기분 다음날 스스로 회복하는 힘이 붙고 있어요.',
        tone: 'warn',
        level: 'mid',
      },
    ],
  },
  {
    label: '사회',
    tone: 'good',
    icon: require('@/assets/images/plan/area-social.png'),
    cards: [
      {
        title: '사람 만나는 주기',
        caption: '교류가 줄면 다음 날 기분 점수가 내려갔어요.',
        tone: 'good',
        level: 'high',
      },
      {
        title: '사회적 지지감',
        caption: '기댈 사람이 있다는 느낌은 꾸준히 유지되고 있어요.',
        tone: 'warn',
        level: 'mid',
      },
    ],
  },
  {
    label: '환경',
    tone: 'good',
    icon: require('@/assets/images/plan/area-environment.png'),
    cards: [
      {
        title: '날씨 영향',
        caption: '흐린 날 컨디션이 낮아지는 경향이 보여요.',
        tone: 'good',
        level: 'high',
      },
      {
        title: '수면 환경(빛·소음)',
        caption: '어두운 침실·낮은 소음이 수면 질을 받쳐줘요.',
        tone: 'warn',
        level: 'mid',
      },
    ],
  },
];

/** Shown wherever the server has no value to give. */
const NO_VALUE = '—';

/** The orb card's `8월 5일 수요일`. */
function dateLabel(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_SUN_FIRST[date.getDay()]}요일`;
}

/** Figma keeps the same two bar patterns on every tab, whatever the metric. */
const FIRST_CARD_SCORES: ScoreBarValue[] = [1, 2, 3, 4, 5, 6, 7];
const SECOND_CARD_SCORES: ScoreBarValue[] = [4, 2, 5, 6, 3, 2, 7];

export default function HomeScreen() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [areaIndex, setAreaIndex] = useState(0);

  /*
   * Two days of scores give both the orb's number and 어제보다 (backlog 28 —
   * the backend confirmed the front end may compute the delta). Ranged, never
   * `/api/scores/today`: the single-date form writes a row for the day it is
   * asked about (backlog 31).
   */
  const today = new Date();
  const scores = useApiQuery<DailyScore[]>(scoresPath(addDays(today, -1), today));
  const diaries = useApiQuery<DiaryRow[]>(diariesPath(today, today));
  const scoreByDate = byDate(scores.data, (row) => row.date);
  const displayOf = (date: Date) => scoreByDate.get(isoDate(date))?.displayTotal ?? null;

  const todayScore = displayOf(today);
  const yesterdayScore = displayOf(addDays(today, -1));
  const delta =
    todayScore === null || yesterdayScore === null
      ? null
      : Math.round(todayScore) - Math.round(yesterdayScore);

  const entry = diaries.data?.[0];
  const draft = entry ? toDiaryDraft(entry) : null;
  const stats = STATS.map((stat) => {
    if (stat.label === '수분') return { ...stat, value: draft?.water ?? NO_VALUE };
    if (stat.label === '스트레스') {
      // 원시값 비례 `(x-1)/9×100` — 화면의 `%`가 "스트레스가 높다"는 뜻이라는
      // 것까지 확인된 방향입니다 (backlog 26).
      const level = entry?.stressLevel;
      const percent = level == null ? null : Math.round(((level - 1) / 9) * 100);
      return { ...stat, value: percent === null ? NO_VALUE : `${percent}%` };
    }
    // 수면: `sleepMinutes` is always null — 취침·기상 시각을 받을 UI가 없습니다
    // (backlog 29), so this card cannot be filled at all.
    return { ...stat, value: NO_VALUE };
  });

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
          {ORB_PAGES.map(({ key, ...orbPage }, index) => (
            // The page is the full window so paging snaps, but the card itself
            // lines up with every other section at CONTENT_INSET — centring the
            // 180pt card in a 220pt page would push it 2pt right of Figma.
            <View key={key} style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
              <OrbCard
                {...orbPage}
                // Only the first card is 오늘의 컨디션; 나의 유전자 나선 has no
                // endpoint behind its own number and keeps Figma's.
                score={index === 0 && todayScore !== null ? String(Math.round(todayScore)) : orbPage.score}
                delta={delta}
                dateLabel={dateLabel(today)}
                page={page}
                pageCount={ORB_PAGES.length}
              />
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
          {stats.map((stat) => (
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
                <DnaKind
                  key={area.label}
                  label={area.label}
                  tone={index === areaIndex ? area.tone : 'default'}
                  onPress={() => setAreaIndex(index)}
                />
              ))}
            </View>
            {BALANCE_AREAS[areaIndex].cards.map((card, index) => (
              <View key={card.title} style={{ marginTop: scale(9) }}>
                <WeeklyInfoCard
                  title={card.title}
                  icon={BALANCE_AREAS[areaIndex].icon}
                  tone={card.tone}
                  level={card.level}
                  scores={index === 0 ? FIRST_CARD_SCORES : SECOND_CARD_SCORES}
                  caption={card.caption}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREETING = { fontSize: scale(12), lineHeight: scale(15), color: '#000000' };

type OrbCardProps = Omit<(typeof ORB_PAGES)[number], 'key'> & {
  /** `null` while the range has no yesterday to compare against. */
  delta: number | null;
  dateLabel: string;
  /** Which page the pager is on — every card draws the same dot row. */
  page: number;
  pageCount: number;
};

function OrbCard({
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
        {date}
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

      {delta === null ? null : (
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
            {delta < 0 ? '▼' : '▲'}
          </Text>
          <Text
            style={{ fontSize: scale(6), lineHeight: scale(10), color: '#3C59F6' }}
            className="font-pretendard-bold">
            {`어제보다 ${delta >= 0 ? '+' : ''}${delta}`}
          </Text>
        </View>
      )}

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
