import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { FeelSelect, type FeelValue } from '@/components/ui/feel-select';
import { GradientText } from '@/components/ui/gradient-text';
import { InputTimeCard } from '@/components/ui/input-time-card';
import { SelectButton } from '@/components/ui/select-button';
import { SelectCard } from '@/components/ui/select-card';
import { Slider0To10 } from '@/components/ui/slider-0-to-10';
import { messageFor, request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isoDate, WEEKDAYS_SUN_FIRST } from '@/lib/dates';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { toDiaryDraft, toDiaryRequest, type DiaryFields } from '@/lib/diary-request';
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
  const router = useRouter();
  const { token } = useAuth();
  // Pinned for the screen's lifetime so the header, the payload and the path
  // cannot disagree if the day rolls over while the form is open.
  const [today] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conditionMissing, setConditionMissing] = useState(false);
  const scroller = useRef<ScrollView>(null);

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
  // null until the slider is touched — the control rests at 0, so the value
  // alone cannot say whether the user answered (backlog 7).
  const [stress, setStress] = useState<number | null>(null);
  const [screenTime, setScreenTime] = useState<string | null>(null);
  const [moodRecovery, setMoodRecovery] = useState<string | null>(null);
  const [metPeople, setMetPeople] = useState<string | null>(null);

  /*
   * `PUT /api/diaries/{date}` replaces the whole entry, so the form has to open
   * holding whatever is already recorded for today — otherwise saving a second
   * time in one day wipes the first save's answers. A day with no entry answers
   * 404 (backlog 23) and simply leaves the form empty.
   *
   * Any other failure leaves it empty too. That is safe here because the same
   * network that fails this read fails the write: an empty form the user then
   * saves would have to reach the server to destroy anything.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await request<DiaryFields>(`/api/diaries/${isoDate(today)}`, { token });
        if (cancelled || !saved) return;
        const draft = toDiaryDraft(saved);
        setCondition(draft.condition);
        setSleepOnset(draft.sleepOnset);
        setSleepFeel(draft.sleepFeel);
        setMeals(draft.meals);
        setJunkFood(draft.junkFood);
        setCaffeineCups(draft.caffeineCups);
        setCaffeineTime(draft.caffeineTime);
        setWater(draft.water);
        setDidExercise(draft.didExercise);
        setExerciseMinutes(draft.exerciseMinutes);
        setExerciseKind(draft.exerciseKind);
        setWalked(draft.walked);
        setSat(draft.sat);
        setStress(draft.stress);
        setScreenTime(draft.screenTime);
        setMoodRecovery(draft.moodRecovery);
        setMetPeople(draft.metPeople);
      } catch {
        // 404 — 기록이 없는 날. Nothing to restore.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today, token]);

  /*
   * `conditionLevel` is the only field the server requires, so it is the only
   * one that can stop a save — every other question may be left blank.
   *
   * It used to *disable* the button, which left the user with a dead grey
   * button and no reason. Figma has an answer for that now: `SelectFeel5`'s
   * `NeedAnswer` variant (red border + "아직 응답하지 않았어요"). So the button
   * stays live and the check moved to the press — tapping it with 컨디션 blank
   * marks the card instead of doing nothing.
   *
   * `saving`/`loading` still disable it, but those are not validation: they stop
   * a double submit and stop a save landing between mount and the restore above,
   * which would overwrite the day with a form the user never saw.
   */
  const busy = saving || loading;

  async function save() {
    if (condition === null) {
      setConditionMissing(true);
      // The card is at the top of a long form and the button is at the bottom,
      // so marking it is useless unless the user is taken to it.
      scroller.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setConditionMissing(false);
    setSaving(true);
    try {
      await request(`/api/diaries/${isoDate(today)}`, {
        method: 'PUT',
        token,
        body: toDiaryRequest({
          condition,
          sleepOnset,
          sleepFeel,
          meals,
          junkFood,
          caffeineCups,
          caffeineTime,
          water,
          didExercise,
          exerciseMinutes,
          exerciseKind,
          walked,
          sat,
          stress,
          screenTime,
          moodRecovery,
          metPeople,
        }),
      });
      // 일지 메인 is still Figma's static numbers, so returning to it shows no
      // trace of the save — hence a confirmation. Replace it with whatever the
      // design lands on once that screen reads real data.
      Alert.alert('오늘 기록을 저장했어요', undefined, [{ text: '확인', onPress: leave }]);
    } catch (error) {
      Alert.alert('저장하지 못했어요', messageFor(error));
    } finally {
      setSaving(false);
    }
  }

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/journal');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        ref={scroller}
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
            {koreanDate(today)}
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
            기록할수록 나의 LifeDNA가 더 정교해져요
          </Text>
        </View>

        <SectionHeading first>오늘의 컨디션</SectionHeading>
        <FeelSelect
          needAnswer={conditionMissing}
          label="오늘 하루 컨디션은 어땠나요?"
          value={condition}
          onChange={(next) => {
            setCondition(next);
            setConditionMissing(false);
          }}
        />

        <SectionHeading>수면습관</SectionHeading>
        {/*
         * Display-only, and therefore **not saved**: there is no picker behind
         * `InputTime_Card` in Figma or in code, so 취침·기상 시각 is never
         * collected and `sleepStartedAt`/`sleepEndedAt` are omitted from the
         * payload rather than sent as this mock. Backlog item 29.
         */}
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
                onPress={() => {
                  setDidExercise(option);
                  if (option !== '네') {
                    setExerciseMinutes(null);
                    setExerciseKind(null);
                  }
                }}
                level={5}
                tone="gray"
                style={{ flex: 1 }}
              />
            ))}
          </View>
          {/*
            * 운동 시간 and 운동 종류 only make sense once 오늘 운동했나요 is 네.
            * Figma draws them unconditionally, but answering 아니요 and then
            * being asked how long you exercised is nonsense — and the two
            * answers would still be sent. Hiding them also clears them, so a
            * user who picks 네, answers, then switches to 아니요 does not leave
            * a contradiction behind in the payload.
            */}
          {didExercise === '네' ? (
            <>
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
            </>
          ) : null}
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
        <Slider0To10
          card
          label="오늘 스트레스 지수"
          // Unanswered renders at 0 like the design; `stress` stays null so
          // the payload can tell the two apart.
          value={stress ?? 0}
          onChange={setStress}
        />
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
          <Button
            label="오늘 기록 저장하기 →"
            onPress={save}
            disabled={busy}
            style={{ opacity: busy ? 0.4 : 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** The header's `8월 3일 월요일`, which Figma draws as a fixed string. */
function koreanDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_SUN_FIRST[date.getDay()]}요일`;
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
