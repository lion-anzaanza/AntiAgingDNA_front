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
  CARD_GAP,
  DID_EXERCISE,
  EXERCISE_KIND,
  EXERCISE_MINUTES,
  JUNK_FOOD,
  JUNK_FOOD_CAPTION,
  MEAL_COUNT,
  MET_PEOPLE,
  MET_PEOPLE_CAPTION,
  MOOD_RECOVERY,
  MOOD_RECOVERY_CAPTION,
  SAT,
  SCREEN_TIME,
  SLEEP_ONSET,
  WALKED,
  WATER,
  WATER_CAPTION,
} from '@/features/journal/journal-options';
import { scale } from '@/lib/scale';
import { useApiQuery } from '@/lib/use-api-query';

/**
 * Figma v4: 일지/상세보기 — `1363:2642` (was `480:1275`). A past day, read back
 * rather than edited: every control is in its `history` state — in v4 that
 * looks exactly like a selected answer, it just does not respond to a tap.
 * Positions are v4's, frame y − 38; the column is 11.28 / 197.436.
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
          // The frame ends 13.54 below the weather card, at the tab bar.
          paddingBottom: scale(1334.9 - 1321.36),
        }}>
        {/*
          * Header: v4's own y (frame y − 38). The view ends at the chip's
          * bottom (17.77); 이날의 컨디션's gap is measured from there. v4 draws
          * no date caption on the right here, unlike 오늘의 기록.
          */}
        <View style={{ height: scale(43.27 - 38 + 12.5), marginHorizontal: scale(-CONTENT_INSET) }}>
          <View style={{ position: 'absolute', left: scale(CONTENT_INSET), top: scale(43.27 - 38) }}>
            <ButtonBack fallbackHref="/journal" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(28.16),
              top: scale(40.2 - 38),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            {title}
          </Text>
        </View>

        <SectionHeading above={67.45 - 55.77} below={5.21}>
          이날의 컨디션
        </SectionHeading>
        <FeelSelect
          label="이날 하루 컨디션은?"
          value={entry.condition}
          onChange={READ_ONLY}
          history
        />

        <SectionHeading above={9.27} below={5.17}>
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

        <SectionHeading above={8.22} below={5.25}>
          식습관
        </SectionHeading>
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
            <PillRow marginTop={4.89}>
              {CAFFEINE_CUPS.map((option) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === entry.caffeineCups ? 'history' : 'inactive'}
                  style={{ flex: 1 }}
                />
              ))}
            </PillRow>
            <CardTitle marginTop={5.47}>마지막 섭취 시각</CardTitle>
            <CardCaption>{CAFFEINE_TIME_CAPTION}</CardCaption>
            <PillRow marginTop={4.89}>
              {CAFFEINE_TIME.map((option) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === entry.caffeineTime ? 'history' : 'inactive'}
                  style={{ flex: 1 }}
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

        <SectionHeading above={10.66} below={5.28}>
          운동 습관
        </SectionHeading>
        <LooseCard>
          <CardTitle>이날의 운동</CardTitle>
          <PillRow marginTop={4.55}>
            {DID_EXERCISE.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.didExercise ? 'history' : 'inactive'}
                style={{ flex: 1 }}
              />
            ))}
          </PillRow>
          <FieldCaption marginTop={7.81}>운동 시간</FieldCaption>
          <PillRow marginTop={3.56}>
            {EXERCISE_MINUTES.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.exerciseMinutes ? 'history' : 'inactive'}
                style={{ flex: 1 }}
              />
            ))}
          </PillRow>
          <FieldCaption marginTop={7.7}>운동 종류</FieldCaption>
          <PillRow marginTop={3.56}>
            {EXERCISE_KIND.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === entry.exerciseKind ? 'history' : 'inactive'}
                style={{ flex: 1 }}
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

        <SectionHeading above={11.37} below={3.6}>
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

        <SectionHeading above={9.7} below={5.28}>
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
