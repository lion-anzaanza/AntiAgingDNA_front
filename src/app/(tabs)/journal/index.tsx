import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import { WeeklyConditionChart, type ConditionPoint } from '@/components/ui/weekly-condition-chart';
import { GRADIENT_BRAND, GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 일지/메인 — `480:1268`. The tab's root: this week at a glance, the
 * last few days, and the way in to today's entry.
 *
 * Static like every other screen — the numbers are Figma's.
 */
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
/** Which of those days already has an entry, and which one is today. */
const RECORDED = [true, true, true, false, false, false, false];
const TODAY_INDEX = 3;

/**
 * The emoticon comes with the row rather than being derived from the score:
 * the score→band boundaries are the server's to define (backlog item 22), and
 * guessing them here would disagree with its own grading.
 */
const PAST_ENTRIES = [
  { date: '2026-07-30', label: '7월 30일 (수)', face: 'ദ്ദി ˃ ᴗ ˂ )', score: 84 },
  { date: '2026-07-29', label: '7월 29일 (화)', face: 'ദ്ദി ˃ ᴗ ˂ )', score: 79 },
  { date: '2026-07-28', label: '7월 28일 (월)', face: '(ง •̀_•́)ง', score: 56 },
  { date: '2026-07-27', label: '7월 27일 (일)', face: '( •́ ̯•̀ )', score: 21 },
  { date: '2026-07-26', label: '7월 26일 (토)', face: '( •́ ̯•̀ )', score: 8 },
];

const CARD_WIDTH = 184;
const CONTENT_INSET = 19;
const ROW_HEIGHT = 134.83 / PAST_ENTRIES.length;

/**
 * `주간_컨디션_그래프` (`585:1436`) is the same 184×95 as 주간_기록 and Figma parks
 * it directly beneath this frame rather than inside it — the same arrangement as
 * 홈's second orb card, so the two share one slot as a horizontal swipe. Figma
 * draws no page dots or hint on either card, unlike 홈's, so none are invented
 * here; see AGENTS.md.
 *
 * Scores round-trip to Figma's own dot positions.
 */
const WEEK_CONDITION: ConditionPoint[] = [
  { label: '8/9', score: 0 },
  { label: '8/10', score: 8 },
  { label: '8/11', score: 28 },
  { label: '8/12', score: 52 },
  { label: '8/13', score: 80 },
  { label: '8/14', score: 96 },
  { label: '8/15', score: 100 },
];
const WEEK_CONDITION_SUMMARY = '어제보다 수면 +40분 · 스트레스 −1';

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
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: scale(8), paddingBottom: scale(24) }}>
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
            8월 3일 월요일
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: scale(12) }}>
          <View style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
            <WeekCard />
          </View>
          <View style={{ width: PAGE_WIDTH, paddingLeft: scale(CONTENT_INSET) }}>
            <WeeklyConditionChart points={WEEK_CONDITION} summary={WEEK_CONDITION_SUMMARY} />
          </View>
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
          {PAST_ENTRIES.map((entry, index) => (
            <Pressable
              key={entry.date}
              onPress={() => router.push(`/journal/${entry.date}`)}
              style={{
                height: scale(ROW_HEIGHT),
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: scale(5),
                borderBottomWidth: index < PAST_ENTRIES.length - 1 ? scale(0.3) : 0,
                borderBottomColor: '#D3D1C6',
              }}>
              <Text
                style={{ fontSize: scale(8), lineHeight: scale(15), color: '#674978' }}
                className="font-pretendard-bold">
                {entry.label}
              </Text>
              <Text
                style={{
                  marginLeft: 'auto',
                  fontSize: scale(8),
                  lineHeight: scale(15),
                  letterSpacing: scale(-0.8),
                  color: '#88877F',
                }}
                className="font-pretendard">
                {entry.face}
              </Text>
              <Text
                style={{ fontSize: scale(8), lineHeight: scale(15), color: '#88877F' }}
                className="font-pretendard">
                {'   '}
                {String(entry.score).padStart(2, '0')}점{'  '}&gt;
              </Text>
            </Pressable>
          ))}
        </LinearGradient>

        <View style={{ marginTop: scale(49), ...COLUMN }}>
          <Button label="오늘 하루 기록하기" onPress={() => router.push('/journal/today')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekCard() {
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
        {WEEKDAYS.map((day) => (
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
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <DayCircle recorded={RECORDED[index]} today={index === TODAY_INDEX} />
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
