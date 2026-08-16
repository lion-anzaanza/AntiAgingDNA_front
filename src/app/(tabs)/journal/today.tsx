import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { FeelSelect, type FeelValue } from '@/components/ui/feel-select';
import { GradientText } from '@/components/ui/gradient-text';
import { InputTimeCard } from '@/components/ui/input-time-card';
import { SelectButton } from '@/components/ui/select-button';
import { SelectCard } from '@/components/ui/select-card';
import { Slider0To10 } from '@/components/ui/slider-0-to-10';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
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

/**
 * Figma: 일지/오늘의기록(생성) — `480:1269`.
 *
 * 카페인 섭취 and 운동 습관 are drawn as loose shapes in Figma rather than as
 * SelectItem components, and their pills are content-sized rather than an even
 * grid, so they are assembled by hand below. Like `survey.tsx` and
 * `personal-info.tsx`, do not copy them as a pattern for a new screen.
 */
export default function JournalTodayScreen() {
  const [condition, setCondition] = useState<FeelValue | null>(null);
  const [sleepOnset, setSleepOnset] = useState<string | null>(null);
  const [sleepFeel, setSleepFeel] = useState<FeelValue | null>(null);
  const [meals, setMeals] = useState<string | null>(null);
  const [junkFood, setJunkFood] = useState<string | null>(null);
  const [caffeineCups, setCaffeineCups] = useState<string | null>(null);
  const [caffeineTime, setCaffeineTime] = useState<string | null>(null);
  const [water, setWater] = useState<string | null>(null);
  const [didExercise, setDidExercise] = useState<string | null>(null);
  const [exerciseMinutes, setExerciseMinutes] = useState<string | null>(null);
  const [exerciseKind, setExerciseKind] = useState<string | null>(null);
  const [walked, setWalked] = useState<string | null>(null);
  const [sat, setSat] = useState<string | null>(null);
  const [stress, setStress] = useState(0);
  const [screenTime, setScreenTime] = useState<string | null>(null);
  const [moodRecovery, setMoodRecovery] = useState<string | null>(null);
  const [metPeople, setMetPeople] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(18),
          paddingTop: scale(3),
          paddingBottom: scale(24),
        }}>
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center' }}>
          <ButtonBack fallbackHref="/(tabs)/home" />
          <Text
            style={{
              fontSize: scale(12),
              lineHeight: scale(15),
              marginLeft: scale(9),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            오늘의 기록
          </Text>
          <Text
            style={{
              marginLeft: 'auto',
              fontSize: scale(7),
              lineHeight: scale(9),
              color: '#696969',
            }}
            className="font-pretendard">
            8월 3일 월요일
          </Text>
        </View>

        <View
          style={{
            height: scale(41),
            marginTop: scale(12),
            borderRadius: scale(10),
            backgroundColor: '#F3E9FF',
            boxShadow: SHADOW,
            paddingLeft: scale(12),
            justifyContent: 'center',
          }}>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(9), lineHeight: scale(14) }}
            className="font-pretendard-extrabold">
            항목별로 오늘의 기록을 채워주세요!
          </GradientText>
          <Text
            style={{ fontSize: scale(7), lineHeight: scale(10), color: '#88877F' }}
            className="font-pretendard">
            기록할수록 나의 LifeDAN가 더 정교해져요
          </Text>
        </View>

        <SectionHeading first>오늘의 컨디션</SectionHeading>
        <FeelSelect
          label="오늘 하루 컨디션은 어땠나요?"
          value={condition}
          onChange={setCondition}
        />

        <SectionHeading>수면습관</SectionHeading>
        <InputTimeCard
          label="취침 기상 시각"
          startLabel="취침"
          endLabel="기상"
          start="오전 01:30"
          end="오전 07:40"
          duration="6시간 10분"
        />
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="잠들기까지 걸린 시간"
            options={SLEEP_ONSET}
            value={sleepOnset}
            onChange={setSleepOnset}
          />
        </View>
        <View style={{ marginTop: scale(CARD_GAP + 1) }}>
          <FeelSelect label="수면 만족도" value={sleepFeel} onChange={setSleepFeel} />
        </View>

        <SectionHeading>식습관</SectionHeading>
        <SelectCard label="오늘 식사 횟수" options={MEAL_COUNT} value={meals} onChange={setMeals} />
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="페스트푸드·단 음식"
            caption={JUNK_FOOD_CAPTION}
            options={JUNK_FOOD}
            value={junkFood}
            onChange={setJunkFood}
          />
        </View>

        <View
          style={{
            marginTop: scale(CARD_GAP),
            borderRadius: scale(10),
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW,
            paddingTop: scale(4.5),
            paddingBottom: scale(9),
            paddingLeft: scale(12),
            paddingRight: scale(10),
          }}>
          <CardTitle>카페인 섭취</CardTitle>
          <CardCaption>{CAFFEINE_CAPTION}</CardCaption>
          <View style={{ flexDirection: 'row', gap: scale(8), marginTop: scale(2.5) }}>
            {CAFFEINE_CUPS.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === caffeineCups ? 'active' : 'inactive'}
                onPress={() => setCaffeineCups(option)}
                level={5}
                tone="gray"
                style={{ width: scale(34) }}
              />
            ))}
          </View>
          <View style={{ marginTop: scale(6) }}>
            <CardTitle>마지막 섭취 시각</CardTitle>
          </View>
          <CardCaption>{CAFFEINE_TIME_CAPTION}</CardCaption>
          <View style={{ flexDirection: 'row', gap: scale(7), marginTop: scale(2) }}>
            {CAFFEINE_TIME.map((option, index) => (
              <SelectButton
                key={option}
                label={option}
                state={option === caffeineTime ? 'active' : 'inactive'}
                onPress={() => setCaffeineTime(option)}
                level={5}
                tone="gray"
                style={{ width: scale(CAFFEINE_TIME_WIDTH[index]) }}
              />
            ))}
          </View>
        </View>

        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="수분 섭취량"
            caption={WATER_CAPTION}
            options={WATER}
            value={water}
            onChange={setWater}
          />
        </View>

        <SectionHeading>운동 습관</SectionHeading>
        <View
          style={{
            borderRadius: scale(10),
            backgroundColor: '#FFFFFF',
            boxShadow: SHADOW,
            paddingTop: scale(4.5),
            paddingBottom: scale(9),
            paddingLeft: scale(12),
            paddingRight: scale(11),
          }}>
          <CardTitle>오늘 운동했나요?</CardTitle>
          <View style={{ flexDirection: 'row', gap: scale(9), marginTop: scale(4.5) }}>
            {DID_EXERCISE.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === didExercise ? 'active' : 'inactive'}
                onPress={() => setDidExercise(option)}
                level={5}
                tone="gray"
                style={{ flex: 1 }}
              />
            ))}
          </View>
          <FieldCaption>운동 시간</FieldCaption>
          <View style={{ flexDirection: 'row', gap: scale(8), marginTop: scale(3.5) }}>
            {EXERCISE_MINUTES.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === exerciseMinutes ? 'active' : 'inactive'}
                onPress={() => setExerciseMinutes(option)}
                level={5}
                tone="gray"
                style={{ width: scale(34) }}
              />
            ))}
          </View>
          <FieldCaption>운동 종류</FieldCaption>
          <View style={{ flexDirection: 'row', gap: scale(8), marginTop: scale(3.5) }}>
            {EXERCISE_KIND.map((option) => (
              <SelectButton
                key={option}
                label={option}
                state={option === exerciseKind ? 'active' : 'inactive'}
                onPress={() => setExerciseKind(option)}
                level={5}
                tone="gray"
                style={{ width: scale(34) }}
              />
            ))}
          </View>
        </View>

        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="오늘 걸은 시간"
            options={WALKED}
            value={walked}
            onChange={setWalked}
          />
        </View>
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard label="앉아 있던 시간" options={SAT} value={sat} onChange={setSat} />
        </View>

        <SectionHeading>기타</SectionHeading>
        <Slider0To10 card label="오늘 스트레스 지수" value={stress} onChange={setStress} />
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="스마트폰 사용 시간 (스크린타임)"
            options={SCREEN_TIME}
            value={screenTime}
            onChange={setScreenTime}
          />
        </View>
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="기분 전환·회복 활동을 했나요?"
            caption={MOOD_RECOVERY_CAPTION}
            options={MOOD_RECOVERY}
            value={moodRecovery}
            onChange={setMoodRecovery}
          />
        </View>
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="오늘 사람을 만났나요?"
            caption={MET_PEOPLE_CAPTION}
            options={MET_PEOPLE}
            value={metPeople}
            onChange={setMetPeople}
          />
        </View>

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
            📍 서울 · ☀️ 맑음 · 28°C · 습도 55%
          </Text>
        </View>

        <View style={{ marginTop: scale(39) }}>
          <Button label="오늘 기록 저장하기 →" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * 오늘의 기록's first heading follows the 항목별로 banner, not the screen header,
 * so it sits further down than 상세보기's — see that file's own constant.
 */
const FIRST_HEADING_GAP = 12.5;

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

/** The Bold 8 heading the hand-built cards share with `SelectCard`. */
function CardTitle({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(8), lineHeight: scale(15), color: '#00352C' }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}

/** Grey Medium 5 note under a card title. */
function CardCaption({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(8), marginTop: scale(-1), color: '#88877F' }}
      className="font-pretendard-medium">
      {children}
    </Text>
  );
}

/** 운동 습관 labels its two pill rows in a darker Bold 5 instead. */
function FieldCaption({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: scale(5), lineHeight: scale(8), marginTop: scale(5.5), color: '#5F5E5B' }}
      className="font-pretendard-bold">
      {children}
    </Text>
  );
}
