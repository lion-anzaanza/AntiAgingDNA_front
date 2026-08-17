import { useLocalSearchParams } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { FeelSelect } from '@/components/ui/feel-select';
import { InputTimeCard } from '@/components/ui/input-time-card';
import { SelectButton } from '@/components/ui/select-button';
import { SelectCard } from '@/components/ui/select-card';
import { Slider0To10 } from '@/components/ui/slider-0-to-10';
import { fromIsoDate } from '@/lib/dates';
import { SHADOW } from '@/lib/design';
import { toDiaryDraft, type DiaryFields } from '@/lib/diary-request';
import {
  CAFFEINE_CAPTION,
  CAFFEINE_CUPS,
  CAFFEINE_TIME,
  CAFFEINE_TIME_CAPTION,
  CAFFEINE_TIME_WIDTH,
  CARD_GAP,
  DID_EXERCISE,
  EXERCISE_KIND,
  EXERCISE_MINUTES,
  HEADING_GAP,
  JUNK_FOOD,
  JUNK_FOOD_CAPTION,
  MEAL_COUNT,
  MET_PEOPLE,
  MET_PEOPLE_CAPTION,
  MOOD_RECOVERY,
  MOOD_RECOVERY_CAPTION,
  SAT,
  SCREEN_TIME,
  SECTION_GAP,
  SLEEP_ONSET,
  WALKED,
  WATER,
  WATER_CAPTION,
} from '@/lib/journal-options';
import { scale } from '@/lib/scale';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma: 일지/상세보기 — `480:1275`. A past day, read back rather than edited:
 * every control is in its `history` state, so the answer that was given shows
 * slate and nothing responds to a tap.
 *
 * The day comes from `GET /api/diaries/{date}` and `toDiaryDraft` turns it back
 * into the same Korean labels the pills carry — the exact inverse of what
 * 오늘의 기록 sends. A day with no entry answers 404 (backlog 23); the query
 * reports that as an error and every control simply stays `inactive`, because
 * the 미응답 state Figma designed (`SelectFeel5_NeedAnswer`) is not built.
 *
 * 취침·기상 시각 and 날씨 have no data behind them at all — backlog 29 and 12.
 */
const EMPTY: ReturnType<typeof toDiaryDraft> = toDiaryDraft({});

/** `sleepMinutes` is always null (backlog 29), so the card has nothing to show. */
const NO_TIME = '—';

/** Not in `DiaryResponse` at all — 날씨 자동 기록 has no field yet (backlog 12). */
const WEATHER_MOCK = '📍 서울 · ☀️ 맑음 · 28°C · 습도 55%';

/** Every control on this screen is read-only, so nothing needs a handler. */
const READ_ONLY = () => {};

export default function JournalDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data } = useApiQuery<DiaryFields>(`/api/diaries/${date}`);
  const entry = data ? toDiaryDraft(data) : EMPTY;
  const day = fromIsoDate(date);
  const title = `${day.getMonth() + 1}월 ${day.getDate()}일 기록`;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(18),
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
            {title}
          </Text>
          <Text
            style={{
              marginLeft: 'auto',
              fontSize: scale(7),
              lineHeight: scale(9),
              color: '#696969',
            }}
            className="font-pretendard">
            {date}
          </Text>
        </View>

        <SectionHeading first>이날의 컨디션</SectionHeading>
        <FeelSelect
          label="이날 하루 컨디션은?"
          value={entry.condition}
          onChange={READ_ONLY}
          history
        />

        <SectionHeading>수면습관</SectionHeading>
        <InputTimeCard
          label="취침 기상 시각"
          startLabel="취침"
          endLabel="기상"
          start={NO_TIME}
          end={NO_TIME}
          duration={NO_TIME}
        />
        <Gap>
          <SelectCard
            label="잠들기까지 걸린 시간"
            options={SLEEP_ONSET}
            value={entry.sleepOnset}
            onChange={READ_ONLY}
            history
          />
        </Gap>
        <Gap extra={1}>
          <FeelSelect
            label="수면 만족도"
            value={entry.sleepFeel}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <SectionHeading>식습관</SectionHeading>
        <SelectCard
          label="이날의 식사 횟수"
          options={MEAL_COUNT}
          value={entry.meals}
          onChange={READ_ONLY}
          history
        />
        <Gap>
          <SelectCard
            label="페스트푸드·단 음식"
            caption={JUNK_FOOD_CAPTION}
            options={JUNK_FOOD}
            value={entry.junkFood}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <Gap>
          <LooseCard>
            <CardTitle>카페인 섭취</CardTitle>
            <CardCaption>{CAFFEINE_CAPTION}</CardCaption>
            <PillRow gap={8} marginTop={2.5}>
              {CAFFEINE_CUPS.map((option) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === entry.caffeineCups ? 'history' : 'inactive'}
                  level={5}
                  tone="gray"
                  style={{ width: scale(34) }}
                />
              ))}
            </PillRow>
            <View style={{ marginTop: scale(6) }}>
              <CardTitle>마지막 섭취 시각</CardTitle>
            </View>
            <CardCaption>{CAFFEINE_TIME_CAPTION}</CardCaption>
            <PillRow gap={7} marginTop={2}>
              {CAFFEINE_TIME.map((option, index) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === entry.caffeineTime ? 'history' : 'inactive'}
                  level={5}
                  tone="gray"
                  style={{ width: scale(CAFFEINE_TIME_WIDTH[index]) }}
                />
              ))}
            </PillRow>
          </LooseCard>
        </Gap>

        <Gap>
          <SelectCard
            label="수분 섭취량"
            caption={WATER_CAPTION}
            options={WATER}
            value={entry.water}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <SectionHeading>운동 습관</SectionHeading>
        <LooseCard paddingRight={11}>
          <CardTitle>이날의 운동</CardTitle>
          <PillRow gap={9} marginTop={4.5}>
            {DID_EXERCISE.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.didExercise ? 'history' : 'inactive'}
                level={5}
                tone="gray"
                style={{ flex: 1 }}
              />
            ))}
          </PillRow>
          <FieldCaption>운동 시간</FieldCaption>
          <PillRow gap={8} marginTop={3.5}>
            {EXERCISE_MINUTES.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.exerciseMinutes ? 'history' : 'inactive'}
                level={5}
                tone="gray"
                style={{ width: scale(34) }}
              />
            ))}
          </PillRow>
          <FieldCaption>운동 종류</FieldCaption>
          <PillRow gap={8} marginTop={3.5}>
            {EXERCISE_KIND.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.exerciseKind ? 'history' : 'inactive'}
                level={5}
                tone="gray"
                style={{ width: scale(34) }}
              />
            ))}
          </PillRow>
        </LooseCard>

        <Gap>
          <SelectCard
            label="이날 걸은 시간"
            options={WALKED}
            value={entry.walked}
            onChange={READ_ONLY}
            history
          />
        </Gap>
        <Gap>
          <SelectCard
            label="앉아 있던 시간"
            options={SAT}
            value={entry.sat}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <SectionHeading>기타</SectionHeading>
        <Slider0To10
          history
          label="이날의 스트레스 지수"
          value={entry.stress}
          onChange={READ_ONLY}
        />
        <Gap>
          <SelectCard
            label="스마트폰 사용 시간 (스크린타임)"
            options={SCREEN_TIME}
            value={entry.screenTime}
            onChange={READ_ONLY}
            history
          />
        </Gap>
        <Gap>
          <SelectCard
            label="기분 전환·회복 활동을 했나요?"
            caption={MOOD_RECOVERY_CAPTION}
            options={MOOD_RECOVERY}
            value={entry.moodRecovery}
            onChange={READ_ONLY}
            history
          />
        </Gap>
        <Gap>
          <SelectCard
            label="이날 사람을 만났나요?"
            caption={MET_PEOPLE_CAPTION}
            options={MET_PEOPLE}
            value={entry.metPeople}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <SectionHeading>자동 기록</SectionHeading>
        <View
          style={{
            height: scale(42),
            borderRadius: scale(10),
            backgroundColor: '#ECECEC',
            borderWidth: scale(0.3),
            borderColor: '#D2D2D2',
            paddingTop: scale(4.5),
            paddingLeft: scale(12),
            paddingRight: scale(10),
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CardTitle>오늘 날씨</CardTitle>
            <View
              style={{
                marginLeft: 'auto',
                width: scale(35),
                height: scale(10),
                borderRadius: scale(10),
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ fontSize: scale(5), lineHeight: scale(10), color: '#5F5E5B' }}
                className="font-pretendard-medium">
                자동 기록됨
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: scale(8),
              lineHeight: scale(14),
              marginTop: scale(2),
              color: '#88877F',
            }}
            className="font-pretendard-bold">
            {WEATHER_MOCK}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Gap({ children, extra = 0 }: { children: ReactNode; extra?: number }) {
  return <View style={{ marginTop: scale(CARD_GAP + extra) }}>{children}</View>;
}

function LooseCard({
  children,
  paddingRight = 10,
}: {
  children: ReactNode;
  paddingRight?: number;
}) {
  return (
    <View
      style={{
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(4.5),
        paddingBottom: scale(9),
        paddingLeft: scale(12),
        paddingRight: scale(paddingRight),
      }}>
      {children}
    </View>
  );
}

function PillRow({
  children,
  gap,
  marginTop,
}: {
  children: ReactNode;
  gap: number;
  marginTop: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: scale(gap), marginTop: scale(marginTop) }}>
      {children}
    </View>
  );
}

/**
 * 상세보기's first heading follows the screen header directly, and Figma leaves
 * 9pt there rather than a full section gap. 오늘의 기록 has the 항목별로 banner
 * in between and spaces it differently, so the two are not shared.
 */
const FIRST_HEADING_GAP = 9;

function SectionHeading({ children, first }: { children: string; first?: boolean }) {
  return (
    <Text
      style={{
        fontSize: scale(10),
        lineHeight: scale(14),
        marginTop: scale(first ? FIRST_HEADING_GAP : SECTION_GAP),
        marginBottom: scale(HEADING_GAP),
        color: '#00352C',
      }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}

function CardTitle({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(8), lineHeight: scale(15), color: '#00352C' }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}

function CardCaption({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(8), marginTop: scale(-1), color: '#88877F' }}
      className="font-pretendard-medium">
      {children}
    </Text>
  );
}

function FieldCaption({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(8), marginTop: scale(5.5), color: '#5F5E5B' }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}
