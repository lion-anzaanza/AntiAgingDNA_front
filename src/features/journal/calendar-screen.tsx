import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { DailySummaryCard, type DailySummary } from '@/components/ui/daily-summary-card';
import { DATE_CELL_HEIGHT, DATE_CELL_WIDTH, DateCell } from '@/components/ui/date-cell';
import { FEEL_LABELS } from '@/components/ui/feel-select';
import { Icon } from '@/components/ui/icon';
import {
  addMonths,
  endOfMonth,
  isoDate,
  startOfMonth,
  WEEKDAYS_SUN_FIRST,
} from '@/lib/dates';
import { COLOR, GRADIENT_PROGRESS, SHADOW_V4 } from '@/lib/design';
import { toDiaryDraft, type DiaryRow } from '@/lib/diary-request';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
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
 * Figma v3: 일지/캘린더 — `1316:1911` (v4 `1363:2507`, first `480:1274`). A
 * month of entries, each day tinted by its score. Positions are v3's ×220/390,
 * frame y − 38.
 *
 * Tapping a day does **not** jump straight to 상세보기 — it opens the
 * `일간_컨디션_요약` card, and 입력 기록 보기 on that card is what opens the full
 * entry. The old design parked that card beneath this frame; v3 has no
 * counterpart, so it is drawn below the monthly summary strip as before.
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
const COLUMN_LEFT = 11.28;
const CARD_SIZE = 197.436;
/** Cell grid inside the card: first column at 9.03, first row at 58.67; v3's 9pt gap. */
const CELL_LEFT = 9.026;
const CELL_PITCH = 26.348;
const ROWS_TOP = 58.67;
const ROW_PITCH = 22.56;

/** The legend's three 9.615×4.808 swatches; their top is 3.69 below the labels' line box. */
const SWATCH_BOX = {
  position: 'absolute' as const,
  top: scale(3.69),
  width: scale(9.615),
  height: scale(4.808),
  borderRadius: scale(0.962),
};
/** v3 draws the high swatch in `GRADIENT_PROGRESS` at 138.4° — `pastelAngle` of its box. */
const SWATCH_RAMP = cssGradientPoints(pastelAngle(9.615, 4.808), 9.615, 4.808);

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
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: scale(COLUMN_LEFT), paddingBottom: scale(24) }}>
        {/*
          * Header at v3's own y (×220/390 − 38). This frame's header sits 4.8pt
          * higher than 일지/메인's — each frame placed its own; both are kept.
          */}
        <View style={{ height: scale(37.96) }}>
          <View style={{ position: 'absolute', left: scale(9.026 - COLUMN_LEFT), top: scale(0.26) }}>
            <ButtonBack fallbackHref="/journal" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.49 - COLUMN_LEFT),
              top: scale(11.27 - 18.051 / 2),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            기록 캘린더
          </Text>
          <Text
            style={{
              position: 'absolute',
              right: scale(-0.69),
              top: scale(11.38 - 12.41 / 2),
              fontSize: scale(8.462),
              lineHeight: scale(12.41),
              color: COLOR.text.body,
            }}
            className="font-plex">
            한 달 기록을 한눈에!
          </Text>
        </View>

        <View
          style={{
            /*
             * v3's card is a 197.436 square, measured on July 2026, which fits
             * in five rows. A month that needs six overflowed a fixed height
             * and cut the 낮음/높음 legend off, so the square is a floor: five-row
             * months match v3, six-row months grow by one row.
             */
            minHeight: scale(CARD_SIZE),
            paddingBottom: scale(9.76),
            borderRadius: scale(9.615),
            backgroundColor: COLOR.surface.card,
            boxShadow: SHADOW_V4,
          }}>
          <View style={{ height: scale(ROWS_TOP) }}>
            <Text
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scale(22.27 - 18.051 / 2),
                textAlign: 'center',
                fontSize: scale(13.538),
                lineHeight: scale(18.051),
                letterSpacing: scale(-0.2708),
                color: COLOR.text.strong,
              }}
              className="font-plex-bold">
              {month.getFullYear()}년 {month.getMonth() + 1}월
            </Text>
            {/* After the full-width title, or the title swallows the arrow's taps. */}
            <MonthArrow icon="chevron-left" center={19.74} onPress={() => goToMonth(-1)} />
            <MonthArrow icon="chevron-right" center={177.68} onPress={() => goToMonth(1)} />

            {/* v3 centres each weekday on its column (to within 0.2). */}
            {WEEKDAYS_SUN_FIRST.map((day, index) => (
              <Text
                key={day}
                style={{
                  position: 'absolute',
                  left: scale(CELL_LEFT + CELL_PITCH * index),
                  top: scale(47.21 - 12.41 / 2),
                  width: scale(DATE_CELL_WIDTH),
                  textAlign: 'center',
                  fontSize: scale(8.462),
                  lineHeight: scale(12.41),
                  // v3's own hex, not tokens: `Error 600` and `text・icon/medium` at 60%.
                  color: index === 0 ? '#B21E26' : 'rgba(2,3,12,0.6)',
                }}
                className="font-plex">
                {day}
              </Text>
            ))}
          </View>

          <View style={{ gap: scale(ROW_PITCH - DATE_CELL_HEIGHT) }}>
            {rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: 'row',
                  paddingLeft: scale(CELL_LEFT),
                  gap: scale(CELL_PITCH - DATE_CELL_WIDTH),
                }}>
                {row.map((day, columnIndex) =>
                  day === null ? (
                    <View key={`blank-${columnIndex}`} style={{ width: scale(DATE_CELL_WIDTH) }} />
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

          {/* Legend, placed at v3's x; its line box starts 7.16 below the last row. */}
          <View style={{ height: scale(12.41), marginTop: scale(7.16) }}>
            <LegendLabel center={65.33}>낮음</LegendLabel>
            <Swatch left={79.33} color={COLOR.calendar.level1} />
            <Swatch left={93.75} color={COLOR.calendar.level2} />
            <LinearGradient
              colors={[...GRADIENT_PROGRESS.colors]}
              locations={[...GRADIENT_PROGRESS.locations]}
              start={SWATCH_RAMP.start}
              end={SWATCH_RAMP.end}
              style={[SWATCH_BOX, { left: scale(108.17) }]}
            />
            <LegendLabel center={131.78}>높음</LegendLabel>
          </View>
        </View>

        <View
          style={{
            height: scale(24.821),
            marginTop: scale(242.17 - 37.96 - CARD_SIZE),
            borderRadius: scale(4.513),
            backgroundColor: COLOR.surface.tint2,
          }}>
          {/*
            * v3 centres the line in the strip (v4 sat it 1.2 high). The sentence
            * nearly fills the strip at font scale 1.1, so it shrinks rather than
            * wrapping out of the 24.8 box.
            */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: scale((24.821 - 13.538) / 2),
              paddingHorizontal: scale(4),
              textAlign: 'center',
              fontSize: scale(9.59),
              lineHeight: scale(13.538),
              letterSpacing: scale(-0.0959),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            {month.getMonth() + 1}월 기록 {recorded.length}일
            {average === null || best === null
              ? ''
              : ` · 평균 ${average}점 · 최고 ${Math.round(best.total)}점(${best.day}일)`}
          </Text>
        </View>

        {selected === null ? null : (
          <View style={{ marginTop: scale(6.77) }}>
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

/**
 * v3 draws the arrows as 24pt `Icon/Chevron-*` (13.54) in `text/muted`, centred
 * at x 19.74 / 177.68 on the month title's line (22.56); the hit box is 26 square.
 */
const ARROW_SIZE = 13.538;
const ARROW_HIT = 26;

function MonthArrow({
  icon,
  center,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right';
  center: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        left: scale(center - ARROW_HIT / 2),
        top: scale(22.56 - ARROW_HIT / 2),
        width: scale(ARROW_HIT),
        height: scale(ARROW_HIT),
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={icon} size={scale(ARROW_SIZE)} color={COLOR.text.muted} />
    </Pressable>
  );
}

function LegendLabel({ center, children }: { center: number; children: string }) {
  return (
    <Text
      style={{
        position: 'absolute',
        left: scale(center - 12),
        width: scale(24),
        textAlign: 'center',
        fontSize: scale(8.462),
        lineHeight: scale(12.41),
        color: 'rgba(2,3,12,0.6)',
      }}
      className="font-plex">
      {children}
    </Text>
  );
}

function Swatch({ left, color }: { left: number; color: string }) {
  return <View style={[SWATCH_BOX, { left: scale(left), backgroundColor: color }]} />;
}
