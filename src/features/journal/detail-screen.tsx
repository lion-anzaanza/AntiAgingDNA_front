import { useLocalSearchParams } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { FeelSelect } from '@/components/ui/feel-select';
import { InputTimeCard } from '@/components/ui/input-time-card';
import { SelectButton } from '@/components/ui/select-button';
import {
  HISTORY_CAPTION,
  pillWidth,
  rowUnderCaption,
  SelectCard,
} from '@/components/ui/select-card';
import { Slider0To10 } from '@/components/ui/slider-0-to-10';
import { fromIsoDate } from '@/lib/dates';
import { COLOR } from '@/lib/design';
import { toDiaryDraft, type DiaryFields } from '@/lib/diary-request';
import {
  CardCaption,
  CardTitle,
  FieldCaption,
  LooseCard,
  PillRow,
  SectionHeading,
  WeatherCard,
} from '@/features/journal/components/form-text';
import {
  CAFFEINE_CAPTION,
  CAFFEINE_CUPS,
  CAFFEINE_TIME,
  CAFFEINE_TIME_CAPTION,
  CAFFEINE_TIME_WIDTHS,
  CARD_GAP,
  DID_EXERCISE,
  EXERCISE_KIND,
  EXERCISE_MINUTES,
  EXERCISE_MINUTES_WIDTHS,
  JUNK_FOOD,
  JUNK_FOOD_CAPTION,
  MEAL_COUNT,
  MEAL_COUNT_WIDTHS,
  MET_PEOPLE,
  MET_PEOPLE_CAPTION,
  MOOD_RECOVERY,
  MOOD_RECOVERY_CAPTION,
  SAT,
  SAT_WIDTHS,
  SCREEN_TIME,
  SCREEN_TIME_WIDTHS,
  SLEEP_ONSET,
  SLEEP_ONSET_WIDTHS,
  WALKED,
  WALKED_WIDTHS,
  WATER,
  WATER_CAPTION,
} from '@/features/journal/journal-options';
import { scale } from '@/lib/scale';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma v3: 일지/상세보기 — `1316:2049` (v4 `1363:2642`, first `480:1275`). A
 * past day, read back rather than edited: every control is in its `history`
 * state — that looks exactly like a selected answer, it just does not respond
 * to a tap. Positions are v3's ×220/390, frame y − 38; the column is
 * 11.28 / 197.436. The rhythm is 오늘의 기록's, section for section.
 *
 * The day comes from `GET /api/diaries/{date}` and `toDiaryDraft` turns it back
 * into the same Korean labels the pills carry — the exact inverse of what
 * 오늘의 기록 sends. A day with no entry answers 404 (backlog 23); the query
 * reports that as an error and every control simply stays `inactive`, because
 * no 미응답 state is designed for a read-only day.
 *
 * 취침·기상 시각 has no data behind it at all (backlog 29), and 날씨 is only
 * recorded when a save sends `lat`/`lon`, which 오늘의 기록 does not (backlog 12).
 */
const EMPTY: ReturnType<typeof toDiaryDraft> = toDiaryDraft({});

/** `sleepMinutes` is always null (backlog 29), so the card has nothing to show. */
const NO_TIME = '—';

/** No day has weather yet — see the header comment and 결정 대기 13. */
const NO_WEATHER = '—';

/** Every control on this screen is read-only, so nothing needs a handler. */
const READ_ONLY = () => {};

const CONTENT_INSET = 11.28;

export default function JournalDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data } = useApiQuery<DiaryFields>(`/api/diaries/${date}`);
  const entry = data ? toDiaryDraft(data) : EMPTY;
  const day = fromIsoDate(date);
  const title = `${day.getMonth() + 1}월 ${day.getDate()}일 기록`;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(CONTENT_INSET),
          // The frame ends 13.88 below the weather card, at the tab bar.
          paddingBottom: scale(13.88),
        }}>
        {/*
          * Header: v3's own y (×220/390 − 38). The view ends at the chip's
          * bottom (22.8); 이날의 컨디션's gap is measured from there. v3 draws
          * no date caption on the right here, unlike 오늘의 기록.
          */}
        <View style={{ height: scale(0.24 + 22.564), marginHorizontal: scale(-CONTENT_INSET) }}>
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(0.24) }}>
            <ButtonBack fallbackHref="/journal" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.36),
              top: scale(2.21),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            {title}
          </Text>
        </View>

        <SectionHeading above={7.65} below={4.22}>
          이날의 컨디션
        </SectionHeading>
        <FeelSelect
          label="이날 하루 컨디션은?"
          value={entry.condition}
          onChange={READ_ONLY}
          history
        />

        <SectionHeading above={10.73} below={4.18}>
          수면습관
        </SectionHeading>
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
            widths={SLEEP_ONSET_WIDTHS}
            value={entry.sleepOnset}
            onChange={READ_ONLY}
            history
          />
        </Gap>
        <Gap>
          <FeelSelect
            label="수면 만족도"
            value={entry.sleepFeel}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <SectionHeading above={9.68} below={4.26}>
          식습관
        </SectionHeading>
        <SelectCard
          label="이날의 식사 횟수"
          options={MEAL_COUNT}
          widths={MEAL_COUNT_WIDTHS}
          value={entry.meals}
          onChange={READ_ONLY}
          history
        />
        <Gap>
          <SelectCard
            label="패스트푸드·단 음식"
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
            <CardCaption history>{CAFFEINE_CAPTION}</CardCaption>
            <PillRow marginTop={4.42 - HISTORY_CAPTION.drop}>
              {CAFFEINE_CUPS.map((option, index) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === entry.caffeineCups ? 'history' : 'inactive'}
                  style={pillWidth(undefined, index)}
                />
              ))}
            </PillRow>
            <CardTitle marginTop={6.32}>마지막 섭취 시각</CardTitle>
            <CardCaption history>{CAFFEINE_TIME_CAPTION}</CardCaption>
            <PillRow marginTop={rowUnderCaption(true)}>
              {CAFFEINE_TIME.map((option, index) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === entry.caffeineTime ? 'history' : 'inactive'}
                  style={pillWidth(CAFFEINE_TIME_WIDTHS, index)}
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

        <SectionHeading above={11.66} below={4.28}>
          운동 습관
        </SectionHeading>
        <LooseCard>
          <CardTitle>이날의 운동</CardTitle>
          <PillRow marginTop={3.78}>
            {DID_EXERCISE.map((option, index) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.didExercise ? 'history' : 'inactive'}
                style={pillWidth(undefined, index)}
              />
            ))}
          </PillRow>
          <FieldCaption marginTop={7.39}>운동 시간</FieldCaption>
          <PillRow marginTop={3.99}>
            {EXERCISE_MINUTES.map((option, index) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.exerciseMinutes ? 'history' : 'inactive'}
                style={pillWidth(EXERCISE_MINUTES_WIDTHS, index)}
              />
            ))}
          </PillRow>
          <FieldCaption marginTop={7.27}>운동 종류</FieldCaption>
          <PillRow marginTop={3.99}>
            {EXERCISE_KIND.map((option, index) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.exerciseKind ? 'history' : 'inactive'}
                style={pillWidth(undefined, index)}
              />
            ))}
          </PillRow>
        </LooseCard>

        <Gap>
          <SelectCard
            label="이날 걸은 시간"
            options={WALKED}
            widths={WALKED_WIDTHS}
            value={entry.walked}
            onChange={READ_ONLY}
            history
          />
        </Gap>
        <Gap>
          <SelectCard
            label="앉아 있던 시간"
            options={SAT}
            widths={SAT_WIDTHS}
            value={entry.sat}
            onChange={READ_ONLY}
            history
          />
        </Gap>

        <SectionHeading above={12.38} below={2.61}>
          기타
        </SectionHeading>
        <Slider0To10
          history
          label="이날의 스트레스 지수"
          value={entry.stress ?? 0}
          onChange={READ_ONLY}
        />
        <Gap>
          <SelectCard
            label="스마트폰 사용 시간 (스크린타임)"
            options={SCREEN_TIME}
            widths={SCREEN_TIME_WIDTHS}
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

        <SectionHeading above={10.69} below={4.28}>
          자동 기록
        </SectionHeading>
        <WeatherCard value={NO_WEATHER} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Gap({ children }: { children: ReactNode }) {
  return <View style={{ marginTop: scale(CARD_GAP) }}>{children}</View>;
}
