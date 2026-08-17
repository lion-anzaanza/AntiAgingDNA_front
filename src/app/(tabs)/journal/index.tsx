import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { DiaryStatus, type DiaryStatusKind } from '@/components/ui/diary-status';
import { GradientText } from '@/components/ui/gradient-text';
import { WeeklyConditionChart, type ConditionPoint } from '@/components/ui/weekly-condition-chart';
import {
  addDays,
  isoDate,
  lastDays,
  mondayFirstIndex,
  WEEKDAYS_MON_FIRST,
} from '@/lib/dates';
import { GRADIENT_BRAND, GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { byDate, gradeFor, scoresPath, type DailyScore, type Grade } from '@/lib/score';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma: 일지/메인 — `480:1268`. The tab's root: this week at a glance, the
 * last few days, and the way in to today's entry.
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

const CARD_WIDTH = 184;
const CONTENT_INSET = 19;
const ROW_HEIGHT = 134.83 / PAST_ENTRY_COUNT;

/**
 * `주간_컨디션_그래프` (`585:1436`) is the same 184×95 as 주간_기록 and Figma parks
 * it directly beneath this frame rather than inside it — the same arrangement as
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

/** `pagingEnabled` snaps by the scroll view's own width — see home.tsx. */
const PAGE_WIDTH = Dimensions.get('window').width;

/**
 * 일지/메인 sits at x=19 and is 184 wide, so the right margin is 17. The orb-card
 * pager has to run full-bleed for its shadow, so the column lives on each
 * section rather than on the scroll view.
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: scale(8),
          paddingBottom: scale(24),
        }}>
        <View
          style={{
            height: scale(22),
            flexDirection: 'row',
            alignItems: 'center',
            ...COLUMN,
          }}>
          <ButtonBack fallbackHref="/(tabs)/home" />
          <Text
            style={{
              fontSize: scale(12),
              lineHeight: scale(15),
              marginLeft: scale(9),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            오늘의 일지
          </Text>
          <Text
            style={{
              marginLeft: 'auto',
              fontSize: scale(7),
              lineHeight: scale(10),
              color: '#696969',
            }}
            className="font-pretendard">
            {today.getMonth() + 1}월 {today.getDate()}일 {WEEKDAYS_MON_FIRST[mondayFirstIndex(today)]}요일
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: scale(12) }}>
          <View style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
            <WeekCard recorded={recorded} todayIndex={todayIndex} />
          </View>
          {chartPoints.length === 0 ? null : (
            <View style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
              <WeeklyConditionChart points={chartPoints} summary={CHART_SUMMARY} />
            </View>
          )}
        </ScrollView>

        <Text
          style={{
            fontSize: scale(10),
            lineHeight: scale(15),
            marginTop: scale(15),
            color: '#00352C',
            ...COLUMN,
          }}
          className="font-pretendard-bold">
          지난 기록
        </Text>

        <LinearGradient
          colors={['#FBEEFF', '#FFFFFF']}
          locations={[0.039, 0.638]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginTop: scale(5),
            marginLeft: scale(CONTENT_INSET),
            width: scale(CARD_WIDTH),
            borderRadius: scale(10),
            boxShadow: SHADOW,
            overflow: 'hidden',
          }}>
          {pastEntries.map((entry, index) => (
            <Pressable
              key={entry.date}
              onPress={() => router.push(`/journal/${entry.date}`)}
              style={{
                height: scale(ROW_HEIGHT),
                flexDirection: 'row',
                alignItems: 'center',
                // Figma insets the row 19 on the left and ends the score at
                // 170 of a 184-wide card — 14 on the right. 5/5 was far tighter
                // than the design and read as text against the edge.
                paddingLeft: scale(19),
                paddingRight: scale(14),
                borderBottomWidth: index < pastEntries.length - 1 ? scale(0.3) : 0,
                borderBottomColor: '#D3D1C6',
              }}>
              <Text
                style={{ fontSize: scale(8), lineHeight: scale(15), color: '#674978' }}
                className="font-pretendard-bold">
                {entry.label}
              </Text>
              <View style={{ marginLeft: 'auto' }}>
                <DiaryStatus kind={entry.face} />
              </View>
              <Text
                style={{ fontSize: scale(8), lineHeight: scale(15), color: '#88877F' }}
                className="font-pretendard">
                {'   '}
                {String(entry.score).padStart(2, '0')}점{'  '}&gt;
              </Text>
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
        * against.
        */}
      <View style={{ flex: 1, minHeight: scale(24) }} />
        <View style={{ ...COLUMN }}>
          <Button label="오늘 하루 기록하기" onPress={() => router.push('/journal/today')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekCard({ recorded, todayIndex }: { recorded: boolean[]; todayIndex: number }) {
  return (
    <View
      style={{
        width: scale(CARD_WIDTH),
        height: scale(95),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(5),
        paddingHorizontal: scale(12),
      }}>
      <Text
        style={{ fontSize: scale(8), lineHeight: scale(15), color: '#00352C' }}
        className="font-pretendard-bold">
        주간 기록
      </Text>

      <View style={{ flexDirection: 'row', marginTop: scale(3) }}>
        {WEEKDAYS_MON_FIRST.map((day) => (
          <Text
            key={day}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: scale(6),
              lineHeight: scale(8),
              color: '#5F5E5B',
            }}
            className="font-pretendard-medium">
            {day}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', marginTop: scale(4) }}>
        {WEEKDAYS_MON_FIRST.map((day, index) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <DayCircle recorded={recorded[index]} today={index === todayIndex} />
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/journal/calendar')}
        style={{
          height: scale(19),
          marginTop: scale(11),
          borderRadius: scale(5),
          backgroundColor: '#F3F1FE',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(7), lineHeight: scale(8) }}
          className="font-pretendard-bold">
          월간 보기 →
        </GradientText>
      </Pressable>
    </View>
  );
}

/** Recorded days are filled, today is outlined, the rest of the week is empty. */
function DayCircle({ recorded, today }: { recorded: boolean; today: boolean }) {
  const size = scale(19);

  if (recorded) {
    return (
      <LinearGradient
        colors={[...GRADIENT_SELECT]}
        locations={[...GRADIENT_SELECT_STOPS]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          width: size,
          height: size,
          borderRadius: size,
          boxShadow: SHADOW,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(6), lineHeight: scale(8), color: '#FFFFFF' }}
          className="font-pretendard-medium">
          ✓
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: '#F2F2F0',
        borderWidth: today ? scale(1) : 0,
        borderColor: '#4655F6',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {today ? (
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(6), lineHeight: scale(8) }}
          className="font-pretendard-extrabold">
          오늘
        </GradientText>
      ) : null}
    </View>
  );
}
