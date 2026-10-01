import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ButtonBack } from '@/components/ui/button-back';
import { FeelSelect, type FeelValue } from '@/components/ui/feel-select';
import { InputTimeCard } from '@/components/ui/input-time-card';
import { SelectButton } from '@/components/ui/select-button';
import { pillWidth, SelectCard } from '@/components/ui/select-card';
import { Slider0To10 } from '@/components/ui/slider-0-to-10';
import { ApiError, messageFor, request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isoDate, WEEKDAYS_SUN_FIRST } from '@/lib/dates';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { toDiaryDraft, toDiaryRequest, type DiaryFields } from '@/lib/diary-request';
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

/**
 * Figma v3: 일지/오늘의기록(생성) — `1316:1610` (v4 `1363:2209`, first
 * `480:1269`). Positions are v3's ×220/390, frame y − 38 for the status-bar
 * mock; the column is 11.28 / 197.436.
 *
 * 카페인 섭취 and 운동 습관 are drawn as loose shapes in Figma rather than as
 * SelectItem components (a card holding two questions, and one with captioned
 * sub-rows), so they are assembled by hand from `form-text`'s pieces. Their
 * pills use `pillWidth`: equal, or v3's label-following widths.
 *
 * v3 drops every section heading 0.9 lower than v4 — about 0.9 more above, 0.9
 * less below — and keeps the 4.81 gap between cards.
 */
export default function JournalTodayScreen() {
  const router = useRouter();
  const { token } = useAuth();
  // Pinned for the screen's lifetime so the header, the payload and the path
  // cannot disagree if the day rolls over while the form is open.
  const [today] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
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
   * Any other failure is *not* "no entry". A 500, a 401 or a timeout says
   * nothing about what is saved, and the network can recover before the user
   * presses 저장 — at which point an empty form would replace the day. So the
   * form stays locked (`restoreFailed` feeds `busy`) until a retry succeeds.
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
      } catch (error) {
        // 404 — 기록이 없는 날. Nothing to restore.
        if (cancelled || (error instanceof ApiError && error.status === 404)) return;
        setRestoreFailed(true);
        Alert.alert('오늘 기록을 불러오지 못했어요', messageFor(error), [
          { text: '닫기', style: 'cancel' },
          {
            text: '다시 시도',
            onPress: () => {
              setRestoreFailed(false);
              setLoading(true);
              setRestoreAttempt((n) => n + 1);
            },
          },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today, token, restoreAttempt]);

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
   * which would overwrite the day with a form the user never saw. A failed
   * restore keeps it disabled for the same reason.
   */
  const busy = saving || loading || restoreFailed;

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
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView
        ref={scroller}
        contentContainerStyle={{
          paddingHorizontal: scale(CONTENT_INSET),
          // v3 leaves 28.96 between the button and the tab bar; the shared
          // `Button` is 27.08 tall where this frame draws 29.33, so the
          // difference is added here to keep the page the same length.
          paddingBottom: scale(28.96 + (29.333 - 27.077)),
        }}>
        {/* Header: v3's own y (×220/390 − 38); the banner starts at 34.12. */}
        <View style={{ height: scale(72.12 - 38), marginHorizontal: scale(-CONTENT_INSET) }}>
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(0.26) }}>
            <ButtonBack fallbackHref="/(tabs)/home" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.66),
              top: scale(2.25),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            오늘의 기록
          </Text>
          <Text
            style={{
              position: 'absolute',
              right: scale(CONTENT_INSET),
              top: scale(5.51),
              fontSize: scale(8.462),
              lineHeight: scale(12.41),
              color: COLOR.text.body,
            }}
            className="font-plex">
            {koreanDate(today)}
          </Text>
        </View>

        {/*
          * The two lines' boxes overlap (the second starts 0.9 above the
          * first's bottom), so both are placed absolutely. The heading used to
          * be a `GradientText`; v4 has no gradient text anywhere and draws it
          * in `brand/violet-text`.
          */}
        <View
          style={{
            height: scale(35.472),
            borderRadius: scale(9.615),
            backgroundColor: COLOR.surface.tint2,
            boxShadow: SHADOW_V4,
          }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(8.78),
              top: scale(6.31),
              fontSize: scale(9.59),
              lineHeight: scale(13.538),
              letterSpacing: scale(-0.0959),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-semibold">
            항목별로 오늘의 기록을 채워주세요!
          </Text>
          {/* v4 wrote "LifeDAN" here; the name is LifeDNA (AGENTS, 2026-08-17). v3 sets it at 6.21. */}
          <Text
            style={{
              position: 'absolute',
              left: scale(8.5),
              top: scale(20.37),
              fontSize: scale(6.205),
              lineHeight: scale(9.026),
              color: COLOR.text.body,
            }}
            className="font-plex">
            기록할수록 나의 LifeDNA가 더 정교해져요
          </Text>
        </View>

        <SectionHeading above={10.77} below={4.21}>
          오늘의 컨디션
        </SectionHeading>
        <FeelSelect
          needAnswer={conditionMissing}
          label="오늘 하루 컨디션은 어땠나요?"
          value={condition}
          onChange={(next) => {
            setCondition(next);
            setConditionMissing(false);
          }}
        />

        <SectionHeading above={10.72} below={4.18}>
          수면습관
        </SectionHeading>
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
            widths={SLEEP_ONSET_WIDTHS}
            value={sleepOnset}
            onChange={setSleepOnset}
          />
        </View>
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <FeelSelect label="수면 만족도" value={sleepFeel} onChange={setSleepFeel} />
        </View>

        <SectionHeading above={9.69} below={4.25}>
          식습관
        </SectionHeading>
        <SelectCard
          label="오늘 식사 횟수"
          options={MEAL_COUNT}
          widths={MEAL_COUNT_WIDTHS}
          value={meals}
          onChange={setMeals}
        />
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="패스트푸드·단 음식"
            caption={JUNK_FOOD_CAPTION}
            options={JUNK_FOOD}
            value={junkFood}
            onChange={setJunkFood}
          />
        </View>

        <View style={{ marginTop: scale(CARD_GAP) }}>
          <LooseCard>
            <CardTitle>카페인 섭취</CardTitle>
            <CardCaption>{CAFFEINE_CAPTION}</CardCaption>
            <PillRow marginTop={4.42}>
              {CAFFEINE_CUPS.map((option, index) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === caffeineCups ? 'active' : 'inactive'}
                  onPress={() => setCaffeineCups(option)}
                  style={pillWidth(undefined, index)}
                />
              ))}
            </PillRow>
            <CardTitle marginTop={6.32}>마지막 섭취 시각</CardTitle>
            <CardCaption>{CAFFEINE_TIME_CAPTION}</CardCaption>
            <PillRow marginTop={4.38}>
              {CAFFEINE_TIME.map((option, index) => (
                <SelectButton
                  key={option}
                  label={option}
                  state={option === caffeineTime ? 'active' : 'inactive'}
                  onPress={() => setCaffeineTime(option)}
                  style={pillWidth(CAFFEINE_TIME_WIDTHS, index)}
                />
              ))}
            </PillRow>
          </LooseCard>
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

        <SectionHeading above={11.66} below={4.28}>
          운동 습관
        </SectionHeading>
        <LooseCard>
          <CardTitle>오늘 운동했나요?</CardTitle>
          <PillRow marginTop={3.78}>
            {DID_EXERCISE.map((option, index) => (
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
                style={pillWidth(undefined, index)}
              />
            ))}
          </PillRow>
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
              <FieldCaption marginTop={7.39}>운동 시간</FieldCaption>
              <PillRow marginTop={3.99}>
                {EXERCISE_MINUTES.map((option, index) => (
                  <SelectButton
                    key={option}
                    label={option}
                    state={option === exerciseMinutes ? 'active' : 'inactive'}
                    onPress={() => setExerciseMinutes(option)}
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
                    state={option === exerciseKind ? 'active' : 'inactive'}
                    onPress={() => setExerciseKind(option)}
                    style={pillWidth(undefined, index)}
                  />
                ))}
              </PillRow>
            </>
          ) : null}
        </LooseCard>

        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="오늘 걸은 시간"
            options={WALKED}
            widths={WALKED_WIDTHS}
            value={walked}
            onChange={setWalked}
          />
        </View>
        <View style={{ marginTop: scale(CARD_GAP) }}>
          <SelectCard
            label="앉아 있던 시간"
            options={SAT}
            widths={SAT_WIDTHS}
            value={sat}
            onChange={setSat}
          />
        </View>

        <SectionHeading above={12.37} below={2.61}>
          기타
        </SectionHeading>
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
            widths={SCREEN_TIME_WIDTHS}
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

        <SectionHeading above={10.69} below={4.29}>
          자동 기록
        </SectionHeading>
        {/*
          * The server can record the day's weather now (backlog 12), but only
          * when the save carries `lat`/`lon`, and this screen sends neither —
          * so nothing is ever recorded and v3's "서울 · 맑음 · 28°C" would be
          * invented. 결정 대기 13 in the v4 inventory.
          */}
        <WeatherCard value={NO_WEATHER} />

        <View style={{ marginTop: scale(37.5) }}>
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

const CONTENT_INSET = 11.28;

/** Nothing is recorded yet — see the comment at `WeatherCard`. */
const NO_WEATHER = '—';