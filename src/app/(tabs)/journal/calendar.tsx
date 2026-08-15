import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { DateCell, type DateLevel } from '@/components/ui/date-cell';
import { GradientText } from '@/components/ui/gradient-text';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 일지/캘린더 — `480:1274`. A month of entries, each day tinted by its
 * score.
 *
 * The month, the levels and the summary line are all Figma's mock — there is no
 * data layer, and the score→level thresholds are a backend question anyway
 * (docs/backend-backlog.md item 22).
 */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** July 2026 as Figma draws it: the 1st sits in the 월 column. */
const LEADING_BLANKS = 1;
const DAY_LEVELS: DateLevel[] = [
  'low', 'none', 'low', 'mid', 'mid', 'high',
  'none', 'low', 'high', 'low', 'mid', 'high', 'high',
  'high', 'low', 'mid', 'none', 'mid', 'high', 'low',
  'high', 'low', 'mid', 'mid', 'low', 'mid', 'high',
  'mid', 'low', 'high', 'none',
];

const CELL_WIDTH = 19;
const CARD_INSET = 15;

export default function JournalCalendarScreen() {
  const cells: (number | null)[] = [
    ...Array.from({ length: LEADING_BLANKS }, () => null),
    ...DAY_LEVELS.map((_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: scale(17), paddingBottom: scale(24) }}>
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
            height: scale(186),
            marginTop: scale(6),
            borderRadius: scale(10),
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW,
            paddingTop: scale(16),
            paddingHorizontal: scale(CARD_INSET),
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MonthArrow label="<" />
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
              2026년 7월
            </Text>
            <MonthArrow label=">" />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(9) }}>
            {WEEKDAYS.map((day, index) => (
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
                      level={DAY_LEVELS[day - 1]}
                      onPress={() => router.push(`/journal/2026-07-${String(day).padStart(2, '0')}`)}
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
            7월 기록 27일 · 평균 79점 · 최고 88점(19일)
          </GradientText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MonthArrow({ label }: { label: string }) {
  return (
    <Pressable style={{ width: scale(26) }}>
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
