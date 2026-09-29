import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { DailySummaryCard, type DailySummary } from '@/components/ui/daily-summary-card';
import { DateCell } from '@/components/ui/date-cell';
import { FEEL_LABELS } from '@/components/ui/feel-select';
import { GradientText } from '@/components/ui/gradient-text';
import {
  addMonths,
  endOfMonth,
  isoDate,
  startOfMonth,
  WEEKDAYS_SUN_FIRST,
} from '@/lib/dates';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { toDiaryDraft, type DiaryRow } from '@/lib/diary-request';
import { scale } from '@/lib/scale';
import {
  byDate,
  dayLevelFor,
  diariesPath,
  gradeFor,
  scoresPath,
  type DailyScore,
} from '@/lib/score';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma: 일지/캘린더 — `480:1274`. A month of entries, each day tinted by its
 * score.
 *
 * Tapping a day does **not** jump straight to 상세보기 — it opens the
 * `일간_컨디션_요약` card, and 입력 기록 보기 on that card is what opens the full
 * entry. Figma parks that card directly beneath this frame on the canvas.
 *
 * Two ranged queries feed the month: scores tint the cells and fill the footer
 * total, diaries fill the summary card's tiles. Both are ranged on purpose —
 * a per-day score fetch would write a row for every cell drawn (backlog 31).
 *
 * A cell is `none` when its `dailyTotal` is null, which is the only field that
 * separates "no entry" from "scored" — the server's own `grade` follows the
 * smoothed `displayTotal` and reads `GOOD` on days the user never opened
 * (backlog 32).
 */
const CELL_WIDTH = 19;
const CARD_INSET = 15;

/** The summary card's `컨디션 좋음` pill. */
const GRADE_LABEL = { GOOD: '좋음', WARN: '주의', DANGER: '위험' } as const;

/** No data behind these: `sleepMinutes` is always null (29), and 27 owns the 2줄 코멘트. */
const NO_VALUE = '—';

export default function JournalCalendarScreen() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<number | null>(null);

  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const scores = useApiQuery<DailyScore[]>(scoresPath(first, last));
  const diaries = useApiQuery<DiaryRow[]>(diariesPath(first, last));
  const scoreByDate = byDate(scores.data, (row) => row.date);
  const diaryByDate = byDate(diaries.data, (row) => row.logDate);

  const dayOf = (day: number) => isoDate(new Date(month.getFullYear(), month.getMonth(), day));
  const totalOf = (day: number) => scoreByDate.get(dayOf(day))?.dailyTotal ?? null;

  const leadingBlanks = first.getDay();
  const dayCount = last.getDate();
  const recorded = Array.from({ length: dayCount }, (_, i) => i + 1)
    .map((day) => ({ day, total: totalOf(day) }))
    .filter((entry): entry is { day: number; total: number } => entry.total !== null);
  const best = recorded.reduce<{ day: number; total: number } | null>(
    (top, entry) => (top === null || entry.total > top.total ? entry : top),
    null,
  );
  const average =
    recorded.length === 0
      ? null
      : Math.round(recorded.reduce((sum, entry) => sum + entry.total, 0) / recorded.length);

  function summaryFor(day: number): DailySummary {
    const iso = dayOf(day);
    const total = scoreByDate.get(iso)?.dailyTotal ?? null;
    const saved = diaryByDate.get(iso);
    const entry = saved ? toDiaryDraft(saved) : null;
    const condition = entry?.condition ?? 3;
    const grade = gradeFor(total);
    return {
      dateLabel: `${month.getMonth() + 1}월 ${day}일 (${WEEKDAYS_SUN_FIRST[(leadingBlanks + day - 1) % 7]})`,
      score: total === null ? 0 : Math.round(total),
      grade: grade === null ? NO_VALUE : `컨디션 ${GRADE_LABEL[grade]}`,
      sleep: NO_VALUE,
      water: entry?.water ?? NO_VALUE,
      stress: saved?.stressLevel == null ? NO_VALUE : `${saved.stressLevel}/10`,
      condition,
      conditionLabel: FEEL_LABELS[condition - 1],
      // 서버가 내려주는 문장이 없습니다 (backlog 27) — 지어내지 않고 비웁니다.
      comment: '',
    };
  }

  function goToMonth(delta: number) {
    setSelected(null);
    setMonth((current) => addMonths(current, delta));
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(17),
          paddingTop: scale(3),
          paddingBottom: scale(24),
        }}>
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center' }}>
          <ButtonBack fallbackHref="/journal" />
          <Text
            style={{
              fontSize: scale(12),
              lineHeight: scale(15),
              marginLeft: scale(9),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            기록 캘린더
          </Text>
          <Text
            style={{
              marginLeft: 'auto',
              fontSize: scale(7),
              lineHeight: scale(10),
              color: '#696969',
            }}
            className="font-pretendard">
            한 달 기록을 한눈에!
          </Text>
        </View>

        <View
          style={{
            /*
             * Figma's 186 is measured on July 2026, which fits in five rows.
             * A month that needs six — August 2026 does — overflowed the fixed
             * height and cut the 낮음/높음 legend off the bottom, so the height
             * is a floor rather than a fixed value. Five-row months are
             * unchanged; six-row months grow by exactly one row.
             */
            minHeight: scale(186),
            paddingBottom: scale(6),
            marginTop: scale(16),
            borderRadius: scale(10),
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW,
            paddingTop: scale(16),
            paddingHorizontal: scale(CARD_INSET),
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MonthArrow label="<" onPress={() => goToMonth(-1)} />
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: scale(10),
                lineHeight: scale(18),
                letterSpacing: scale(-0.1),
                color: '#2C2C2A',
              }}
              className="font-pretendard-extrabold">
              {month.getFullYear()}년 {month.getMonth() + 1}월
            </Text>
            <MonthArrow label=">" onPress={() => goToMonth(1)} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(9) }}>
            {WEEKDAYS_SUN_FIRST.map((day, index) => (
              <Text
                key={day}
                style={{
                  width: scale(CELL_WIDTH),
                  textAlign: 'center',
                  fontSize: scale(7),
                  lineHeight: scale(18),
                  letterSpacing: scale(-0.07),
                  color: index === 0 ? '#B21E26' : 'rgba(2,3,12,0.6)',
                }}
                className="font-pretendard-medium">
                {day}
              </Text>
            ))}
          </View>

          <View style={{ marginTop: scale(2), gap: scale(3) }}>
            {rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {row.map((day, columnIndex) =>
                  day === null ? (
                    <View key={`blank-${columnIndex}`} style={{ width: scale(CELL_WIDTH) }} />
                  ) : (
                    <DateCell
                      key={day}
                      day={day}
                      level={dayLevelFor(totalOf(day))}
                      // A day with no entry has nothing to summarise.
                      onPress={() => setSelected(totalOf(day) === null ? null : day)}
                    />
                  ),
                )}
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: scale(5),
              marginTop: scale(10),
            }}>
            <LegendLabel>낮음</LegendLabel>
            <Swatch color="#DACEFF" />
            <Swatch color="#B19CFF" />
            <LinearGradient
              colors={[...GRADIENT_BRAND]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: scale(10), height: scale(5), borderRadius: scale(1) }}
            />
            <LegendLabel>높음</LegendLabel>
          </View>
        </View>

        <View
          style={{
            height: scale(20),
            marginTop: scale(10),
            borderRadius: scale(5),
            backgroundColor: '#EAE4FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(8), lineHeight: scale(8) }}
            className="font-pretendard">
            {month.getMonth() + 1}월 기록 {recorded.length}일
            {average === null || best === null
              ? ''
              : ` · 평균 ${average}점 · 최고 ${Math.round(best.total)}점(${best.day}일)`}
          </GradientText>
        </View>

        {selected === null ? null : (
          <View style={{ marginTop: scale(10) }}>
            <DailySummaryCard
              summary={summaryFor(selected)}
              onOpenDetail={() => router.push(`/journal/${dayOf(selected)}`)}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MonthArrow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: scale(26) }}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: scale(10),
          lineHeight: scale(18),
          letterSpacing: scale(-0.1),
          color: '#B4B2A8',
        }}
        className="font-pretendard-light">
        {label}
      </Text>
    </Pressable>
  );
}

function LegendLabel({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(18), color: 'rgba(2,3,12,0.6)' }}
      className="font-pretendard-medium">
      {children}
    </Text>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <View
      style={{
        width: scale(10),
        height: scale(5),
        borderRadius: scale(1),
        backgroundColor: color,
      }}
    />
  );
}
