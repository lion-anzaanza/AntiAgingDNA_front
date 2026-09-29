import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { DiaryStatus, type DiaryStatusKind } from '@/components/ui/diary-status';
import { WeeklyConditionChart, type ConditionPoint } from '@/components/ui/weekly-condition-chart';
import { CARD_HEIGHT, CARD_WIDTH, WeekCard } from '@/features/journal/components/week-card';
import {
  addDays,
  isoDate,
  lastDays,
  mondayFirstIndex,
  WEEKDAYS_MON_FIRST,
} from '@/lib/dates';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';
import { byDate, gradeFor, scoresPath, type DailyScore, type Grade } from '@/lib/score';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma v4: 일지/메인 — `1363:2135` (was `480:1268`). The tab's root: this
 * week at a glance, the last few days, and the way in to today's entry.
 *
 * Positions are v4's, frame y − 38 for the `PhoneHeader` mock. v4 draws a back
 * chip on this tab root; it is kept with its `/home` fallback (결정 대기 1).
 *
 * One ranged score query feeds all three sections. `dailyTotal` is what says
 * whether a day was recorded at all — the server's `grade` tracks the smoothed
 * `displayTotal` and disagrees with the day it labels (backlog 32), so the
 * faces below are derived from `dailyTotal` against 22's own 70/40 boundaries.
 */
/**
 * Figma's mock rows carried their emoticon rather than deriving it, because the
 * boundaries were still open (backlog 22, since closed). Those mock scores —
 * 84 · 79 · 56 · 21 · 8 — land on exactly these three faces under 70/40, so the
 * design and the deployed boundaries already agree.
 *
 * The faces are the `Diary_Status` component now, not literal kaomoji text —
 * see `ui/diary-status.tsx` for why that matters.
 */
const FACES: Record<Grade, DiaryStatusKind> = {
  GOOD: 'good',
  WARN: 'warn',
  DANGER: 'danger',
};

const PAST_ENTRY_COUNT = 5;
/** How far back to look for those five rows. */
const HISTORY_DAYS = 30;

const CONTENT_INSET = 11.28;
/** v4 `1363:2160`: five rows in 129.646, dividers every 25.96. */
const ROW_HEIGHT = 129.646 / PAST_ENTRY_COUNT;
/**
 * Inside a row, v4 hangs each piece off the row top by its own amount (the
 * same in all five rows to within 0.4): the date's line box 6.45 down, the
 * face 10.6, the score 8.56 — the score sits 1.8 lower than the date, the same
 * in every row, so it is reproduced rather than centred.
 */
const ROW_DATE_TOP = 6.45;
const ROW_FACE_TOP = 10.6;
const ROW_SCORE_TOP = 8.56;
/** Face left and score right edge, from the card's left. */
const ROW_FACE_LEFT = 126.85;
const ROW_SCORE_RIGHT = 175.73;

/**
 * `주간_컨디션_그래프` (`585:1436`, no v4 frame) is drawn the same 197.436×91.346
 * as v4's 주간_기록, and the old Figma parked it directly beneath this frame
 * rather than inside it — the same arrangement as
 * 홈's second orb card, so the two share one slot as a horizontal swipe. Figma
 * draws no page dots or hint on either card, unlike 홈's, so none are invented
 * here; see AGENTS.md.
 *
 * Days with no entry are **left out** rather than plotted as 0: `ConditionPoint`
 * has no empty value, and a floor-level dot would read as a terrible day rather
 * than a missing one.
 */
const CHART_DAYS = 7;
/** `어제보다 수면 +40분 · 스트레스 −1` is a server-generated sentence (backlog 27). */
const CHART_SUMMARY = '';

/** `pagingEnabled` snaps by the scroll view's own width — see home-screen.tsx. */
const PAGE_WIDTH = Dimensions.get('window').width;

/**
 * v4's column is 11.28 / 197.436, symmetric. The pager has to run full-bleed
 * for its shadow, so the column lives on each section rather than on the
 * scroll view.
 */
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

export default function JournalMainScreen() {
  const today = new Date();
  // 주간 기록 runs 월–일, so the week starts on the Monday on or before today.
  const monday = addDays(today, -mondayFirstIndex(today));
  const week = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const from = addDays(today, -(HISTORY_DAYS - 1));
  const to = addDays(monday, 6);

  const { data } = useApiQuery<DailyScore[]>(scoresPath(from, to));
  const scoreByDate = byDate(data, (row) => row.date);
  const totalOf = (date: Date) => scoreByDate.get(isoDate(date))?.dailyTotal ?? null;

  const todayIndex = week.findIndex((day) => isoDate(day) === isoDate(today));
  const recorded = week.map((day) => totalOf(day) !== null);

  const pastEntries = lastDays(addDays(today, -1), HISTORY_DAYS - 1)
    .reverse()
    .map((day) => ({ day, total: totalOf(day) }))
    .filter((entry): entry is { day: Date; total: number } => entry.total !== null)
    .slice(0, PAST_ENTRY_COUNT)
    .map(({ day, total }) => ({
      date: isoDate(day),
      label: `${day.getMonth() + 1}월 ${day.getDate()}일 (${WEEKDAYS_MON_FIRST[mondayFirstIndex(day)]})`,
      face: FACES[gradeFor(total)!],
      score: Math.round(total),
    }));

  const chartPoints: ConditionPoint[] = lastDays(today, CHART_DAYS)
    .map((day) => ({ day, total: totalOf(day) }))
    .filter((point): point is { day: Date; total: number } => point.total !== null)
    .map(({ day, total }) => ({
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      score: Math.round(total),
    }));

  /*
   * The ramp's CSS angle depends on the box's aspect, and the card's height
   * follows how many rows there are. v4's 130.63° is `pastelAngle` of the full
   * five-row card, so the same rule gives the angle for any row count.
   */
  const listHeight = Math.max(1, ROW_HEIGHT * pastEntries.length);
  const listRamp = cssGradientPoints(pastelAngle(CARD_WIDTH, listHeight), CARD_WIDTH, listHeight);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: scale(34.7) }}>
        {/* Header: everything at v4's own y (frame y − 38); the week card starts at 38.84. */}
        <View style={{ height: scale(38.84) }}>
          <View style={{ position: 'absolute', left: scale(CONTENT_INSET), top: scale(10.08) }}>
            <ButtonBack fallbackHref="/(tabs)/home" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(36.28),
              top: scale(16.56 - 18.051 / 2),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            오늘의 일지
          </Text>
          {/*
            * v4 ends this at x 203.81, 4.9pt short of the column, while 캘린더's
            * caption in the same slot ends on it (208.58). Aligned to the column.
            */}
          <Text
            style={{
              position: 'absolute',
              right: scale(CONTENT_INSET),
              top: scale(16.82 - 12.41 / 2),
              fontSize: scale(8.462),
              lineHeight: scale(12.41),
              color: COLOR.text.body,
            }}
            className="font-plex">
            {today.getMonth() + 1}월 {today.getDate()}일 {WEEKDAYS_MON_FIRST[mondayFirstIndex(today)]}요일
          </Text>
        </View>

        {/*
          * `flexGrow: 0`: a ScrollView grows by default, and inside a
          * `flexGrow: 1` column it would split the spare height with the
          * spacer above the button and push 지난 기록 down.
          */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}>
          <View style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
            <WeekCard recorded={recorded} todayIndex={todayIndex} />
          </View>
          {chartPoints.length === 0 ? null : (
            <View style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
              <WeeklyConditionChart points={chartPoints} summary={CHART_SUMMARY} />
            </View>
          )}
        </ScrollView>

        {/* v4 starts the heading at 10.88; it goes on the column, as on 홈. */}
        <Text
          style={{
            fontSize: scale(11.282),
            lineHeight: scale(15.795),
            letterSpacing: scale(-0.1128),
            marginTop: scale(143.73 - (38.84 + CARD_HEIGHT)),
            color: COLOR.text.heading,
            ...COLUMN,
          }}
          className="font-plex-bold">
          지난 기록
        </Text>

        <LinearGradient
          colors={[...GRADIENT_PASTEL.colors]}
          locations={[...GRADIENT_PASTEL.locations]}
          start={listRamp.start}
          end={listRamp.end}
          style={{
            marginTop: scale(163.92 - 143.73 - 15.795),
            marginLeft: scale(CONTENT_INSET),
            width: scale(CARD_WIDTH),
            borderRadius: scale(9.615),
            boxShadow: SHADOW_V4,
            overflow: 'hidden',
          }}>
          {pastEntries.map((entry, index) => (
            <Pressable
              key={entry.date}
              onPress={() => router.push(`/journal/${entry.date}`)}
              style={{ height: scale(ROW_HEIGHT) }}>
              <Text
                style={{
                  position: 'absolute',
                  left: scale(8.46),
                  top: scale(ROW_DATE_TOP),
                  fontSize: scale(9.59),
                  lineHeight: scale(13.538),
                  letterSpacing: scale(-0.0959),
                  color: COLOR.text.plum,
                }}
                className="font-plex-semibold">
                {entry.label}
              </Text>
              <View style={{ position: 'absolute', left: scale(ROW_FACE_LEFT), top: scale(ROW_FACE_TOP) }}>
                <DiaryStatus kind={entry.face} />
              </View>
              <Text
                style={{
                  position: 'absolute',
                  right: scale(CARD_WIDTH - ROW_SCORE_RIGHT),
                  top: scale(ROW_SCORE_TOP),
                  fontSize: scale(8.462),
                  lineHeight: scale(12.41),
                  color: COLOR.text.body,
                }}
                className="font-plex">
                {String(entry.score).padStart(2, '0')}점{'  '}&gt;
              </Text>
              {/* v4's dividers are 179.385 lines inset 9.03, `border/soft`, 0.288 thick. */}
              <View
                style={{
                  position: 'absolute',
                  left: scale(9.03),
                  right: scale(9.03),
                  bottom: 0,
                  height: index < pastEntries.length - 1 ? scale(0.288) : 0,
                  backgroundColor: COLOR.border.soft,
                }}
              />
            </Pressable>
          ))}
        </LinearGradient>

        {/*
          * Figma pushes this to the bottom with a fixed gap measured on its 480pt
          * frame, but `scale()` converts by *width* — so on a device with a
          * different aspect ratio the gap lands somewhere else and the screen
          * either scrolls or leaves a hole. A flexible spacer pins it to the
          * bottom of the viewport instead, which is what the design means, and
          * `flexGrow: 1` on the content container is what gives it room to push
          * against. The bottom padding is v4's 34.7 gap above the tab bar.
          */}
        <View style={{ flex: 1, minHeight: scale(24) }} />
        <View style={{ ...COLUMN }}>
          <Button label="오늘 하루 기록하기" onPress={() => router.push('/journal/today')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
