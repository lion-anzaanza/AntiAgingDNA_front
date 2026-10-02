import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DnaKind } from '@/components/ui/dna-kind';
import { type IconName } from '@/components/ui/icon';
import {
  WeeklyInfoCard,
  type ScoreBarValue,
  type WeeklyGlyph,
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
import { addDays, isoDate, lastDays, WEEKDAYS_SUN_FIRST } from '@/lib/dates';
import { toDiaryDraft, type DiaryRow } from '@/lib/diary-request';
import { COLOR } from '@/lib/design';
import {
  hoursLabel,
  orbCopy,
  profileLabel,
  scoreCaption,
  sleepCaption,
  toneFor,
  waterCaption,
} from '@/lib/facts';
import { scale } from '@/lib/scale';
import {
  byDate,
  diariesPath,
  itemsPath,
  recordedArea,
  scoresPath,
  stressPercent,
  valuesFor,
  weeklyTrend,
  type AreaScores,
  type DailyScore,
  type ItemTrend,
} from '@/lib/score';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma: 홈/메인 v3 — `1312:1533` (v4 `1363:1953` was its 220 copy).
 *
 * The orb card is a two-page swipe: 오늘의 LifeDNA 컨디션 with the gene orb,
 * then 나의 유전자 나선 with the DNA helix (`457:791` in the old design). v4
 * draws only the first page but keeps both page dots and a hint pointing at the
 * helix ("나선형 모델"), so the second page stays, in the first page's v4 style.
 *
 * v4 reorders the page: orb → 오늘의 일지 → the three metric cards → 나의
 * LifeDNA 정보 (the metrics used to sit above 오늘의 일지).
 *
 * Vertical gaps are v4's, measured between line boxes (frame y − 38).
 */
const CONTENT_INSET = 11.28;
/** v4 is symmetric: every section is the 197.436 column. */
const CONTENT_INSET_RIGHT = 220 - CONTENT_INSET - CARD_WIDTH;
/**
 * `pagingEnabled` snaps by the scroll view's own width, so each page is a
 * full-width wrapper holding the 180pt card — otherwise the next card peeks in.
 * Fixed at module scope for the same reason `scale()` is: the app is portrait.
 */
const PAGE_WIDTH = Dimensions.get('window').width;

/**
 * 나의 LifeDNA 정보 — since the 2026-08-17 pull, when Figma turned the five `DNAKind`
 * chips into a **tab strip** (`725:1213`, `725:1294`, `725:1375`, `725:1456`,
 * `726:1472`). Selecting an area swaps the weekly cards below it.
 *
 * - **The order is 신체 · 정신 · 환경 · 감정 · 사회.** The 2026-08-17 pull had
 *   moved 환경 to the end; v4 (`1363:2057`…`2069`) puts it back third.
 * - **Only the selected chip carries a grade colour**; the other four are
 *   `default`. That is how the design shows selection.
 *
 * Everything here is live (2026-10-02):
 *
 * - **Chips** take today's grade for the area (`areas.grades`, backlog 33). A
 *   `null` area — 환경 always, 감정 without a stress answer — stays `default`
 *   even when selected; Figma has no empty look for it (frontend-status 33 🟣).
 * - **신체** is v3's two cards (`1312:1651`, `1312:1685`), 수면 시간 and 수분
 *   섭취량 — exactly what `GET /api/scores/items` returns.
 * - **The other four tabs** were Figma mock cards with no data behind any
 *   metric they named. Each now shows one card: that area's own daily score
 *   over the week, from `/api/scores` (the owner's call, 2026-10-02 —
 *   frontend-status 11 still owns what these tabs *should* show).
 *
 * Captions are the interim fact-only sentences in `lib/facts.ts`.
 */
type BalanceArea = {
  label: string;
  /** Which `areas` score and grade this tab reads. */
  key: keyof AreaScores['grades'];
  /** The same `Icon/*` glyph 개선책's 영역 cards use for this area. */
  icon: IconName;
};

const BALANCE_AREAS: BalanceArea[] = [
  { label: '신체', key: 'physical', icon: 'heart' },
  { label: '정신', key: 'mental', icon: 'mind' },
  { label: '환경', key: 'environment', icon: 'leaf' },
  { label: '감정', key: 'emotion', icon: 'smile' },
  { label: '사회', key: 'social', icon: 'users' },
];

type BalanceCard = {
  title: string;
  icon: IconName | WeeklyGlyph;
  trend: ReturnType<typeof weeklyTrend>;
  caption: string;
};

/** Shown wherever the server has no value to give. */
const NO_VALUE = '—';

/** The orb card's `8월 5일 수요일`. */
function dateLabel(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_SUN_FIRST[date.getDay()]}요일`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [areaIndex, setAreaIndex] = useState(0);

  /*
   * A week of scores gives the orb's number, 어제보다 (backlog 28 — the front
   * end computes the delta) and the four area tabs. Ranged, never
   * `/api/scores/today` — one read path (backlog 31).
   */
  const today = new Date();
  const week = lastDays(today, 7);
  const scores = useApiQuery<DailyScore[]>(scoresPath(week[0], today));
  const diaries = useApiQuery<DiaryRow[]>(diariesPath(today, today));
  const dna = useApiQuery<Parameters<typeof profileLabel>[0]>('/api/dna', {
    // Fixed at signup — no need to re-read on every tab switch.
    refetchOnFocus: false,
  });
  const items = useApiQuery<ItemTrend[]>(itemsPath(week[0], today));
  const todayItem = byDate(items.data, (row) => row.date).get(isoDate(today));
  const scoreByDate = byDate(scores.data, (row) => row.date);
  const displayOf = (date: Date) => scoreByDate.get(isoDate(date))?.displayTotal ?? null;

  const todayScore = displayOf(today);
  const yesterdayScore = displayOf(addDays(today, -1));
  const delta =
    todayScore === null || yesterdayScore === null
      ? null
      : Math.round(todayScore) - Math.round(yesterdayScore);

  // The state drives the orb page's artwork and both pages' chip; the helix
  // page keeps its own artwork.
  const todayOrb = scoreByDate.get(isoDate(today))?.orbState ?? null;
  const orbState = todayOrb ?? DEFAULT_ORB_STATE;

  const entry = diaries.data?.[0];
  const draft = entry ? toDiaryDraft(entry) : null;
  const stats = STATS.map((stat) => {
    if (stat.label === '수분') {
      return { ...stat, value: draft?.water ?? NO_VALUE, grade: todayItem?.waterGrade ?? null };
    }
    if (stat.label === '스트레스') {
      // 원시값 비례 — the `%` means "how stressed" (backlog 26), 0–10 since 7.
      const percent = stressPercent(entry?.stressLevel);
      return {
        ...stat,
        value: percent === null ? NO_VALUE : `${percent}%`,
        grade: todayItem?.stressGrade ?? null,
      };
    }
    // 수면: null for anything entered in the app — there is no UI for 취침·기상
    // 시각 (backlog 29). Only seeded data fills it.
    const minutes = todayItem?.sleepMinutes ?? null;
    return {
      ...stat,
      value: minutes === null ? NO_VALUE : hoursLabel(minutes),
      grade: todayItem?.sleepGrade ?? null,
    };
  });

  // Only a recorded today lights a chip — see `recordedArea`.
  const todayRow = scoreByDate.get(isoDate(today));
  const areaGrades = todayRow?.dailyTotal == null ? undefined : todayRow.areas.grades;
  const area = BALANCE_AREAS[areaIndex];
  const cards: BalanceCard[] =
    area.key === 'physical'
      ? [
          {
            title: '수면 시간',
            icon: 'sleep',
            trend: weeklyTrend(week, items.data, (row) => row.sleepScore),
            caption: sleepCaption(valuesFor(week, items.data, (row) => row.sleepMinutes)),
          },
          {
            title: '수분 섭취량',
            icon: 'water',
            trend: weeklyTrend(week, items.data, (row) => row.waterScore),
            caption: waterCaption(
              valuesFor(week, items.data, (row) =>
                row.waterIntake ? toDiaryDraft({ waterIntake: row.waterIntake }).water : null,
              ),
            ),
          },
        ]
      : [
          (() => {
            const trend = weeklyTrend(week, scores.data, (row) => recordedArea(row, area.key));
            return {
              title: `${area.label} 영역 점수`,
              icon: area.icon,
              trend,
              caption: scoreCaption(trend.values),
            };
          })(),
        ];

  function handlePageScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH));
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(7.5) }}>
        <View
          style={{
            paddingLeft: scale(CONTENT_INSET),
            paddingRight: scale(CONTENT_INSET_RIGHT),
            paddingTop: scale(49.87 - 38),
          }}>
          <Text style={GREETING} className="font-plex-bold">
            안녕하세요,{' '}
            <Text style={{ color: COLOR.brand.violetText }}>{user?.nickname ?? ''}</Text>
            님!
          </Text>
          <Text
            style={{
              // v4 lets the two line boxes overlap by 0.27.
              marginTop: scale(67.655 - 49.87 - 18.051),
              fontSize: scale(8.462),
              lineHeight: scale(12.41),
              color: COLOR.text.body,
            }}
            className="font-plex">
            오늘도 나를 조금 더 알아가요
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handlePageScroll}
          scrollEventThrottle={16}
          style={{ marginTop: scale(87 - 67.655 - 12.41) }}>
          {ORB_PAGES.map(({ key, ...orbPage }, index) => (
            // The page is the full window so paging snaps, but the card itself
            // lines up with every other section at CONTENT_INSET.
            <View key={key} style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
              <OrbCard
                {...orbPage}
                artwork={index === 0 ? ORB_STATES[orbState].artwork : orbPage.artwork}
                sparklesOver={index === 0 ? ORB_STATES[orbState].sparkles : orbPage.sparklesOver}
                // Until the range answers — or on a day with no score — `—`,
                // not Figma's 100. 나의 유전자 나선 shows the same number: no
                // other score is defined for it (the owner's call, 2026-10-02).
                score={todayScore !== null ? String(Math.round(todayScore)) : NO_VALUE}
                copy={orbCopy(todayOrb)}
                helix={{ streakDays: user?.streakDays ?? 0, typeLabel: profileLabel(dna.data) }}
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
            paddingLeft: scale(CONTENT_INSET),
            paddingRight: scale(CONTENT_INSET_RIGHT),
          }}>
          <SectionHeading top={357.9 - 343} bottom={377.95 - 373.695}>
            오늘의 일지
          </SectionHeading>
          <JournalCta />

          <View
            style={{
              flexDirection: 'row',
              gap: scale(6.77),
              marginTop: scale(479.15 - 463.92),
            }}>
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </View>

          <SectionHeading top={566.7 - 557.15} bottom={588.02 - 582.495}>
            나의 LifeDNA 정보
          </SectionHeading>
          <View
            style={{
              borderRadius: scale(11.031),
              backgroundColor: COLOR.surface.card,
              // v3: a 7.822px blur at 390 — slightly softer than `SHADOW`.
              boxShadow: '0px 0px 4.412px rgba(169, 169, 169, 0.25)',
              paddingTop: scale(9.56),
              paddingBottom: scale(208.492 - 197.461),
              paddingHorizontal: scale(9.03),
            }}>
            <Text
              style={{
                marginLeft: scale(-0.53),
                fontSize: scale(9.59),
                lineHeight: scale(13.538),
                letterSpacing: scale(-0.0959),
                color: COLOR.text.strong,
              }}
              className="font-plex-semibold">
              5개 영역 밸런스
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: scale(2.27),
                marginTop: scale(30.89 - 9.56 - 13.538),
              }}>
              {BALANCE_AREAS.map((chip, index) => {
                const grade = areaGrades?.[chip.key] ?? null;
                return (
                  <DnaKind
                    key={chip.label}
                    label={chip.label}
                    tone={index === areaIndex ? (toneFor(grade) ?? 'default') : 'default'}
                    onPress={() => setAreaIndex(index)}
                  />
                );
              })}
            </View>
            {cards.map((card) => (
              <View key={card.title} style={{ marginTop: scale(61.13 - 51.198) }}>
                <WeeklyInfoCard
                  title={card.title}
                  icon={card.icon}
                  tone={toneFor(card.trend.grade)}
                  level={card.trend.level}
                  // weeklyTrend only ever emits 1–7.
                  scores={card.trend.bars as (ScoreBarValue | null)[]}
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

const GREETING = {
  fontSize: scale(13.538),
  lineHeight: scale(18.051),
  letterSpacing: scale(-0.2708),
  color: COLOR.text.strong,
};

/** v4 section title: Plex Bold 11.282 / 15.795, `text/strong`. Gaps are per section. */
function SectionHeading({
  children,
  top,
  bottom,
}: {
  children: string;
  top: number;
  bottom: number;
}) {
  return (
    <Text
      style={{
        fontSize: scale(11.282),
        lineHeight: scale(15.795),
        letterSpacing: scale(-0.1128),
        marginTop: scale(top),
        marginBottom: scale(bottom),
        color: COLOR.text.strong,
      }}
      className="font-plex-bold">
      {children}
    </Text>
  );
}
