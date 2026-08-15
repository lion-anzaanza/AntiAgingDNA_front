import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { LikertCard } from '@/components/ui/likert-card';
import { PillGroup } from '@/components/ui/pill-group';
import { Slider0To10 } from '@/components/ui/slider-0-to-10';
import { StepHeader } from '@/components/ui/step-header';
import { GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';
import { isDiagnosisComplete, useSignUpForm } from '@/lib/sign-up-form';

const SLEEP_TYPE_OPTIONS = [
  { label: '아침형', icon: require('@/assets/images/auth/sleep-morning.png') },
  { label: '저녁형', icon: require('@/assets/images/auth/sleep-evening.png') },
  { label: '일반형', icon: require('@/assets/images/auth/sleep-normal.png') },
  { label: '예민형', icon: require('@/assets/images/auth/sleep-sensitive.png') },
];
const SLEEP_QUALITY_OPTIONS = [
  '잠드는데 30분 이상 걸려요',
  '잠을 자도 개운하지 않아요',
  '낮에 졸림이 잦아요',
  '자다가 자주 깨요',
  '해당없음',
];
const EXERCISE_OPTIONS = ['주 150분 미만', '주 150 ~ 300분', '300분 초과', '거의 안 함'];
const WORK_TYPE_OPTIONS = ['교대·야간근무', '잦은 출장·시차', '해당없음'];

const DRINK_OPTIONS = ['월 1회 이하', '월 2 ~ 4회', '주 2 ~ 3회', '주 4회 이상', '전혀 안 마심'];
const SMOKING_OPTIONS = ['비흡연', '과거 흡연', '현재 가끔', '현재 매일'];
const LIFE_RHYTHM_OPTIONS = ['매우 규칙적이에요', '대체로 규칙적이에요', '다소 불규칙해요', '매우 불규칙해요'];
const SOCIAL_FREQUENCY_OPTIONS = ['거의 안 함', '주 1~2회', '주 3~4회', '거의 매일'];
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

/** SelectButton1 pairs — 75pt wide with a 12pt gutter across the 162pt row. */
const SLEEP_TYPE_PILL_WIDTH = 75;
const SECTION_GAP = 16;

function SectionLabel({ children, caption }: { children: string; caption?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6) }}>
      <Text
        style={{ fontSize: scale(10), lineHeight: scale(14), color: '#00352C' }}
        className="font-pretendard-bold">
        {children}
      </Text>
      {caption ? (
        <Text
          style={{ fontSize: scale(5), lineHeight: scale(8), color: '#88877F' }}
          className="font-pretendard-medium">
          {caption}
        </Text>
      ) : null}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(17),
          paddingTop: scale(5),
          paddingBottom: scale(24),
        }}
        keyboardShouldPersistTaps="handled">
        <StepHeader
          title="초기 진단"
          backHref="/(auth)/sign-up/personal-info"
          stepLabel="STEP 2   LifeDNA 설계"
          currentStep={2}
        />

        <Text
          style={{
            fontSize: scale(12),
            lineHeight: scale(15),
            marginTop: scale(16),
            color: '#00352C',
          }}
          className="font-pretendard-bold">
          10가지만 답해주세요
        </Text>
        <Text
          style={{ fontSize: scale(7), lineHeight: scale(8), marginTop: scale(6), color: '#88877F' }}
          className="font-pretendard">
          이 진단으로 나만의 기본 유전자가 만들어지고,{'\n'}일지 기록으로 정교해져요
        </Text>

        <View style={{ marginTop: scale(19), gap: scale(SECTION_GAP) }}>
          <View>
            <SectionLabel>평소 수면 유형은?</SectionLabel>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                columnGap: scale(12),
                rowGap: scale(6),
                paddingHorizontal: scale(12),
                marginTop: scale(4),
              }}>
              {SLEEP_TYPE_OPTIONS.map(({ label, icon }) => {
                const selected = form.sleepType === label;
                return (
                  <Pressable
                    key={label}
                    onPress={() => update({ sleepType: label })}
                    style={{
                      width: scale(SLEEP_TYPE_PILL_WIDTH),
                      height: scale(19),
                      borderRadius: scale(5),
                      boxShadow: selected ? SHADOW : 'none',
                    }}>
                    <LinearGradient
                      colors={selected ? [...GRADIENT_SELECT] : ['#FFFFFF', '#FFFFFF']}
                      locations={selected ? [...GRADIENT_SELECT_STOPS] : undefined}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: scale(4),
                        borderRadius: scale(5),
                      }}>
                      <Image
                        source={icon}
                        style={{ width: scale(22), height: scale(17) }}
                        contentFit="contain"
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: scale(6),
                          lineHeight: scale(8),
                          textAlign: 'center',
                          color: selected ? '#FFFFFF' : '#5F5E5B',
                        }}
                        className="font-pretendard-medium">
                        {label}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <SectionLabel caption="해당하는 항목을 모두 선택해주세요">수면의 질 만족도는?</SectionLabel>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                columnGap: scale(5),
                rowGap: scale(6),
                paddingLeft: scale(8),
                marginTop: scale(4),
              }}>
              {SLEEP_QUALITY_OPTIONS.map((option) => {
                const selected = form.sleepQuality.includes(option);
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleSleepQuality(option)}
                    style={{ height: scale(19), borderRadius: scale(5), boxShadow: SHADOW }}>
                    <LinearGradient
                      colors={selected ? [...GRADIENT_SELECT] : ['#FFFFFF', '#FFFFFF']}
                      locations={selected ? [...GRADIENT_SELECT_STOPS] : undefined}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: scale(6),
                        borderRadius: scale(5),
                      }}>
                      <Text
                        style={{
                          fontSize: scale(7),
                          lineHeight: scale(8),
                          color: selected ? '#FFFFFF' : '#5F5E5B',
                        }}
                        className="font-pretendard-medium">
                        {option}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Slider0To10 label="당분에 얼마나 민감한가요?" value={form.sugarSensitivity}
            onChange={(sugarSensitivity) => update({ sugarSensitivity })} />
          <Slider0To10 label="카페인에 얼마나 민감한가요?" value={form.caffeineSensitivity}
            onChange={(caffeineSensitivity) => update({ caffeineSensitivity })} />
          <Slider0To10 label="스트레스에 얼마나 민감한가요?" value={form.stressSensitivity}
            onChange={(stressSensitivity) => update({ stressSensitivity })} />

          <View>
            <PillGroup
              label="평소 운동량은?"
              caption="중강도 기준으로 답해주세요"
              options={EXERCISE_OPTIONS}
              value={form.exercise}
              onChange={(exercise) => update({ exercise })}
              columns={2}
              level={1}
              tone="white"
            />
            <Text
              style={{
                fontSize: scale(5),
                lineHeight: scale(8),
                marginTop: scale(6),
                marginLeft: scale(12),
                color: '#88877F',
              }}
              className="font-pretendard-medium">
              중강도 = 약간 숨이 차는 활동 (WHO 기준)
            </Text>
          </View>

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
            level={2}
            tone="white"
          />
          <PillGroup
            label="술은 얼마나 자주 마시나요?"
            options={DRINK_OPTIONS}
            value={form.drink}
            onChange={(drink) => update({ drink })}
            columns={3}
            level={2}
            tone="white"
          />
          <PillGroup
            label="담배를 피우시나요?"
            options={SMOKING_OPTIONS}
            value={form.smoking}
            onChange={(smoking) => update({ smoking })}
            columns={4}
            level={3}
            tone="white"
          />
          <PillGroup
            label="평소 생활 리듬은 어떤가요?"
            options={LIFE_RHYTHM_OPTIONS}
            value={form.lifeRhythm}
            onChange={(lifeRhythm) => update({ lifeRhythm })}
            columns={2}
            level={1}
            tone="white"
          />
          <PillGroup
            label="평소 사람들과 얼마나 자주 교류하나요?"
            options={SOCIAL_FREQUENCY_OPTIONS}
            value={form.socialFrequency}
            onChange={(socialFrequency) => update({ socialFrequency })}
            columns={2}
            level={1}
            tone="white"
          />

          <View>
            <SectionLabel>최근(2주 이내) 전반적인 기분·활력은?</SectionLabel>
            <View style={{ gap: scale(4), marginTop: scale(7) }}>
              {MOOD_STATEMENTS.map((statement) => (
                <LikertCard
                  key={statement}
                  statement={statement}
                  value={form.mood[statement] ?? null}
                  onChange={(v) => update({ mood: { ...form.mood, [statement]: v } })}
                />
              ))}
            </View>
          </View>
        </View>

        <Text
          style={{
            fontSize: scale(5),
            lineHeight: scale(8),
            marginTop: scale(28),
            textAlign: 'center',
            color: '#88877F',
          }}
          className="font-pretendard-medium">
          문항 기준 : WHO·AASM·EFSA·AUDIT-C·PSQI·WHO-5 근거
        </Text>

        <View style={{ marginTop: scale(3) }}>
          <Button
            label="다음 →"
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.4 }}
            onPress={() => router.push('/(auth)/sign-up/terms')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
