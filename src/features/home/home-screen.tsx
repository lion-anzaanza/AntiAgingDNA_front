import { useState } from 'react';
import {
  Dimensions,
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
  WeeklyInfoCard,
  type Level,
  type ScoreBarValue,
} from '@/components/ui/weekly-info-card';
import { JournalCta } from '@/features/home/components/journal-cta';
import {
  CARD_WIDTH,
  DEFAULT_ORB_STATE,
  ORB_PAGES,
  ORB_STATES,
  OrbCard,
} from '@/features/home/components/orb-card';
import { StatCard, STATS } from '@/features/home/components/stat-card';
import { useAuth } from '@/lib/auth';
import { addDays, isoDate, WEEKDAYS_SUN_FIRST } from '@/lib/dates';
import { toDiaryDraft, type DiaryRow } from '@/lib/diary-request';
import { SHADOW, type Tone } from '@/lib/design';
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

  // Only the first page is 오늘의 컨디션, so only it follows the state.
  const orbState = scoreByDate.get(isoDate(today))?.orbState ?? DEFAULT_ORB_STATE;

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
                artwork={index === 0 ? ORB_STATES[orbState].artwork : orbPage.artwork}
                sparklesOver={index === 0 ? ORB_STATES[orbState].sparkles : orbPage.sparklesOver}
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
              // Figma puts the 5개 영역 밸런스 heading's box 10pt below the card
              // top; 5.5 was measured off the ink, which sits lower in its line
              // box than the box itself starts.
              paddingTop: scale(10),
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
