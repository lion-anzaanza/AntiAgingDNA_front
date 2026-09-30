import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { LikertCard } from '@/components/ui/likert-card';
import { PillGroup } from '@/components/ui/pill-group';
import { SelectButton } from '@/components/ui/select-button';
import { CARD_TITLE } from '@/components/ui/select-card';
import { StepHeader } from '@/components/ui/step-header';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';
import { isDiagnosisComplete, useSignUpForm } from '@/features/auth/sign-up-form';

const SLEEP_TYPE_OPTIONS = [
  { label: '아침형', icon: require('@/assets/images/auth/sleep-morning.png') },
  { label: '저녁형', icon: require('@/assets/images/auth/sleep-evening.png') },
  { label: '일반형', icon: require('@/assets/images/auth/sleep-normal.png') },
  { label: '예민형', icon: require('@/assets/images/auth/sleep-sensitive.png') },
];
/**
 * v4 sizes these pills to their text and packs them two over three, each row
 * flush to both edges. The widths are v4's; the gaps fall out of
 * `space-between` (v4's second row is 6.94 then 3.76, read as a slip).
 */
const SLEEP_QUALITY_ROWS = [
  [
    { label: '잠드는데 30분 이상 걸려요', width: 88.923 },
    { label: '잠을 자도 개운하지 않아요', width: 83.927 },
  ],
  [
    { label: '낮에 졸림이 잦아요', width: 65.943 },
    { label: '자다가 자주 깨요', width: 63.945 },
    { label: '해당없음', width: 38.808 },
  ],
];
/** v4's `NoSelect` draws these 19 tall, like 수면의 질 — not the groups' 24.82. */
const EXERCISE_ROWS = [
  [
    { label: '주 150분 미만', width: 85.87 },
    { label: '주 150 ~ 300분', width: 85.87 },
  ],
  [
    { label: '300분 초과', width: 85.87 },
    { label: '거의 안 함', width: 85.87 },
  ],
];
const WORK_TYPE_OPTIONS = ['교대·야간근무', '잦은 출장·시차', '해당없음'];

const DRINK_OPTIONS = ['월 1회 이하', '월 2 ~ 4회', '주 2 ~ 3회', '주 4회 이상', '전혀 안 마심'];
const SMOKING_OPTIONS = ['비흡연', '과거 흡연', '현재 가끔', '현재 매일'];
const LIFE_RHYTHM_OPTIONS = ['매우 규칙적이에요', '대체로 규칙적이에요', '다소 불규칙해요', '매우 불규칙해요'];
const SOCIAL_FREQUENCY_OPTIONS = ['거의 안 함', '주 1~2회', '주 3~4회', '거의 매일'];
/**
 * Figma still draws these as 0–10 sliders, but 기획 settled on a 4-point scale
 * and the API only ever had four levels (backlog item 6) — so the mock is the
 * out-of-date side here. As pills they also stop being ambiguous: an untouched
 * slider reported 0, which was indistinguishable from a real 0.
 */
const SENSITIVITY_OPTIONS = ['전혀 아님', '약간', '보통', '매우'];

const MOOD_STATEMENTS = [
  '밝고 기분이 좋았다',
  '차분하고 편안했다',
  '활기차고 활력이 있었다',
  '상쾌하게 잘 쉬고 일어났다',
  '일상이 흥미로운 일로 가득했다',
];

/**
 * Both multi-selects end in 해당없음, which contradicts every other option in
 * its list — and the API models these as independent booleans, so "해당없음 +
 * 자다가 자주 깨요" would serialise to nonsense. Picking it clears the rest;
 * picking anything else clears it.
 */
const NONE_OPTION = '해당없음';

/** `PillGroup` hands back the whole array, so recover which option was hit. */
function changedOption(previous: string[], next: string[]): string | undefined {
  return next.find((o) => !previous.includes(o)) ?? previous.find((o) => !next.includes(o));
}

function toggleExclusive(selected: string[], option: string): string[] {
  if (option === NONE_OPTION) {
    return selected.includes(NONE_OPTION) ? [] : [NONE_OPTION];
  }
  const withoutNone = selected.filter((o) => o !== NONE_OPTION);
  return withoutNone.includes(option)
    ? withoutNone.filter((o) => o !== option)
    : [...withoutNone, option];
}

/*
 * Figma v4 회원가입/2 (`1363:1629`). Every question sits in its own white card
 * (`카드/…`) on the 197.44 column, 6.77 apart. The vertical padding is not one
 * value in v4 — it goes by card, so each card carries its own (`CARD_PAD`) and
 * every card below keeps v4's y.
 */
const CARD_SHADOW = '0px 1.128px 4.513px rgba(0, 0, 0, 0.05)';
const CARD_GAP = 6.769;
/** Pills fill the card's 179.39 content width from a 9.03 inset. */
const CARD_PAD_X = 9.03;
/** v4's padding above the question and below the last line, per card. */
const CARD_PAD = {
  twoColumn: { top: 4.08, bottom: 14.25 },
  sleepQuality: { top: 2.65, bottom: 6.77 },
  exercise: { top: 2.59, bottom: 4.18 },
  /**
   * v4 puts this card's pills 1.52 closer to the question than `PillGroup`
   * does (5.03 vs 6.77); the bottom gives it back so the card stays 52.8.
   */
  workType: { top: 2.42, bottom: 5.25 },
  drinkSmoking: { top: 6.32, bottom: 7.9 },
  /**
   * v4 draws 민감도 as 59.28-tall slider cards; the four pills (backlog 6) are
   * shorter, so the card keeps v4's height with its content at the top.
   */
  sensitivity: { top: 3.59, bottom: 0, minHeight: 59.28 },
} as const;
const PILL_ROW_GAP = 4.513;
const SMALL_PILL_HEIGHT = 19;
/** Question → pills, and caption → pills, as `PillGroup` spaces them. */
const LABEL_GAP = 6.769;
const CAPTION_GAP = 3.69;

const BODY: TextStyle = {
  fontSize: scale(8.462),
  lineHeight: scale(12.41),
  color: COLOR.text.body,
};

/** 수면 유형 pill: v4 centres the icon at 32.7 and the label at 54.4. */
const SLEEP_TYPE_PILL = { width: 87.436, height: 24.821 };
const SLEEP_ICON = { left: 22.98, width: 19.381, height: 14.667 };

function QuestionCard({
  pad,
  children,
}: {
  pad: { top: number; bottom: number; minHeight?: number };
  children: ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: scale(9.026),
        backgroundColor: COLOR.surface.card,
        boxShadow: CARD_SHADOW,
        paddingHorizontal: scale(CARD_PAD_X),
        paddingTop: scale(pad.top),
        paddingBottom: scale(pad.bottom),
        minHeight: pad.minHeight ? scale(pad.minHeight) : undefined,
      }}>
      {children}
    </View>
  );
}

/** A question and an optional caption, spaced as `PillGroup` spaces its own. */
function CardHeading({ title, caption }: { title: string; caption?: string }) {
  return (
    <>
      <Text style={CARD_TITLE} className="font-plex-semibold">
        {title}
      </Text>
      {caption ? (
        // v4 lets the caption's line box ride 2.2pt up into the question's.
        <Text style={{ ...BODY, marginTop: scale(-2.22) }} className="font-plex">
          {caption}
        </Text>
      ) : null}
    </>
  );
}

/** Rows of fixed-width 19pt pills, each row justified to both edges. */
function SmallPillRows({
  rows,
  isSelected,
  onPress,
}: {
  rows: { label: string; width: number }[][];
  isSelected: (label: string) => boolean;
  onPress: (label: string) => void;
}) {
  return (
    <View style={{ gap: scale(PILL_ROW_GAP), marginTop: scale(CAPTION_GAP) }}>
      {rows.map((row) => (
        <View key={row[0].label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {row.map(({ label, width }) => (
            <SelectButton
              key={label}
              label={label}
              state={isSelected(label) ? 'active' : 'inactive'}
              onPress={() => onPress(label)}
              size="signup"
              style={{ width: scale(width), height: scale(SMALL_PILL_HEIGHT) }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function SurveyScreen() {
  const { form, update } = useSignUpForm();
  const canContinue = isDiagnosisComplete(form);

  function toggleSleepQuality(option: string) {
    update({ sleepQuality: toggleExclusive(form.sleepQuality, option) });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(11.28),
          paddingTop: scale(9.42),
          paddingBottom: scale(24),
        }}
        keyboardShouldPersistTaps="handled">
        <StepHeader
          title="초기 진단"
          backHref="/(auth)/sign-up/personal-info"
          stepLabel="STEP 2   LifeDNA 설계"
          currentStep={2}
        />

        <Text style={[CARD_TITLE, { marginTop: scale(11.73) }]} className="font-plex-semibold">
          10가지만 답해주세요
        </Text>
        <Text style={{ ...BODY, marginTop: scale(0.82) }} className="font-plex">
          이 진단으로 나만의 기본 유전자가 만들어지고,{'\n'}일지 기록으로 정교해져요
        </Text>

        <View style={{ marginTop: scale(19.22), gap: scale(CARD_GAP) }}>
          <QuestionCard pad={CARD_PAD.twoColumn}>
            <CardHeading title="평소 수면 유형은?" />
            <View style={{ gap: scale(PILL_ROW_GAP), marginTop: scale(LABEL_GAP) }}>
              {[SLEEP_TYPE_OPTIONS.slice(0, 2), SLEEP_TYPE_OPTIONS.slice(2)].map((row) => (
                <View
                  key={row[0].label}
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {row.map(({ label, icon }) => {
                    const selected = form.sleepType === label;
                    // Same tree in both states; only colours change (AGENTS.md #3).
                    return (
                      <Pressable
                        key={label}
                        onPress={() => update({ sleepType: label })}
                        style={{
                          width: scale(SLEEP_TYPE_PILL.width),
                          height: scale(SLEEP_TYPE_PILL.height),
                          borderRadius: scale(5.641),
                          backgroundColor: selected ? COLOR.brand.selected : COLOR.surface.chip,
                          justifyContent: 'center',
                          // Centres the label on 54.4 of the 87.4 pill.
                          paddingLeft: scale(21.46),
                        }}>
                        <Image
                          source={icon}
                          style={{
                            position: 'absolute',
                            left: scale(SLEEP_ICON.left),
                            top: scale((SLEEP_TYPE_PILL.height - SLEEP_ICON.height) / 2),
                            width: scale(SLEEP_ICON.width),
                            height: scale(SLEEP_ICON.height),
                          }}
                          contentFit="contain"
                        />
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: scale(7.333),
                            lineHeight: scale(10.154),
                            textAlign: 'center',
                            color: selected ? COLOR.text.onPastel : COLOR.text.body,
                          }}
                          className="font-plex-semibold">
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </QuestionCard>

          <QuestionCard pad={CARD_PAD.sleepQuality}>
            <CardHeading title="수면의 질 만족도는?" caption="해당하는 항목을 모두 선택해주세요" />
            <SmallPillRows
              rows={SLEEP_QUALITY_ROWS}
              isSelected={(option) => form.sleepQuality.includes(option)}
              onPress={toggleSleepQuality}
            />
          </QuestionCard>

          <QuestionCard pad={CARD_PAD.sensitivity}>
            <PillGroup
              label="당분에 얼마나 민감한가요?"
              options={SENSITIVITY_OPTIONS}
              value={form.sugarSensitivity}
              onChange={(sugarSensitivity) => update({ sugarSensitivity })}
              columns={4}
            />
          </QuestionCard>
          <QuestionCard pad={CARD_PAD.sensitivity}>
            <PillGroup
              label="카페인에 얼마나 민감한가요?"
              options={SENSITIVITY_OPTIONS}
              value={form.caffeineSensitivity}
              onChange={(caffeineSensitivity) => update({ caffeineSensitivity })}
              columns={4}
            />
          </QuestionCard>
          <QuestionCard pad={CARD_PAD.sensitivity}>
            <PillGroup
              label="스트레스에 얼마나 민감한가요?"
              options={SENSITIVITY_OPTIONS}
              value={form.stressSensitivity}
              onChange={(stressSensitivity) => update({ stressSensitivity })}
              columns={4}
            />
          </QuestionCard>

          <QuestionCard pad={CARD_PAD.exercise}>
            <CardHeading title="평소 운동량은?" caption="중강도 기준으로 답해주세요" />
            <SmallPillRows
              rows={EXERCISE_ROWS}
              isSelected={(option) => form.exercise === option}
              onPress={(exercise) => update({ exercise })}
            />
            <Text style={{ ...BODY, marginTop: scale(2.38) }} className="font-plex">
              중강도 = 약간 숨이 차는 활동 (WHO 기준)
            </Text>
          </QuestionCard>

          <QuestionCard pad={CARD_PAD.workType}>
            <PillGroup
              label="해당하는 근무 형태를 모두 선택해주세요"
              options={WORK_TYPE_OPTIONS}
              value={form.workType}
              onChange={(next) => {
                const option = changedOption(form.workType, next);
                update({ workType: option ? toggleExclusive(form.workType, option) : next });
              }}
              multiple
              columns={3}
            />
          </QuestionCard>
          <QuestionCard pad={CARD_PAD.drinkSmoking}>
            <PillGroup
              label="술은 얼마나 자주 마시나요?"
              options={DRINK_OPTIONS}
              value={form.drink}
              onChange={(drink) => update({ drink })}
              columns={3}
            />
          </QuestionCard>
          <QuestionCard pad={CARD_PAD.drinkSmoking}>
            <PillGroup
              label="담배를 피우시나요?"
              options={SMOKING_OPTIONS}
              value={form.smoking}
              onChange={(smoking) => update({ smoking })}
              columns={4}
            />
          </QuestionCard>
          <QuestionCard pad={CARD_PAD.twoColumn}>
            <PillGroup
              label="평소 생활 리듬은 어떤가요?"
              options={LIFE_RHYTHM_OPTIONS}
              value={form.lifeRhythm}
              onChange={(lifeRhythm) => update({ lifeRhythm })}
              columns={2}
            />
          </QuestionCard>
          <QuestionCard pad={CARD_PAD.twoColumn}>
            <PillGroup
              label="평소 사람들과 얼마나 자주 교류하나요?"
              options={SOCIAL_FREQUENCY_OPTIONS}
              value={form.socialFrequency}
              onChange={(socialFrequency) => update({ socialFrequency })}
              columns={2}
            />
          </QuestionCard>
        </View>

        {/* v4 writes "기분 활력은" without the dot — read as a dropped character. */}
        <Text style={[CARD_TITLE, { marginTop: scale(13.28) }]} className="font-plex-semibold">
          최근(2주 이내) 전반적인 기분·활력은?
        </Text>
        <View style={{ gap: scale(4), marginTop: scale(6.22) }}>
          {MOOD_STATEMENTS.map((statement) => (
            <LikertCard
              key={statement}
              statement={statement}
              value={form.mood[statement] ?? null}
              onChange={(v) => update({ mood: { ...form.mood, [statement]: v } })}
            />
          ))}
        </View>

        {/*
          v4's line is wider than its 197.44 box, wraps to two lines and runs its
          second line under the button. It shrinks to one line here, on v4's
          first line, and the button keeps v4's y.
          */}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ ...BODY, marginTop: scale(28.57), textAlign: 'center' }}
          className="font-plex">
          문항 기준 : WHO·AASM·EFSA·AUDIT-C·PSQI·WHO-5 근거
        </Text>

        <Button
          label="다음 →"
          disabled={!canContinue}
          style={{ marginTop: scale(6.18), opacity: canContinue ? 1 : 0.4 }}
          onPress={() => router.push('/(auth)/sign-up/terms')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
