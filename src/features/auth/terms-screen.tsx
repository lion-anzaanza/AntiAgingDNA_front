import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StepHeader } from '@/components/ui/step-header';
import { messageFor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';
import { useSignUpForm } from '@/features/auth/sign-up-form';
import { toSignUpRequest } from '@/features/auth/sign-up-request';

/**
 * Figma marks 마케팅 정보 수신 `[필수]`, which would make signup impossible for
 * anyone who declines — 정보통신망법 requires advertising consent to be optional
 * and separable. The backend confirmed on 2026-08-16 that the server never
 * required it and that the screen label is the thing to fix (backlog item 1),
 * so it reads `[선택]` and does not gate 가입.
 */
const TERMS = [
  { key: 'service', label: '[필수] 서비스 이용약관', required: true },
  { key: 'sensitive', label: '[필수] 개인정보 민감정보 처리 동의', required: true },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신', required: false },
  { key: 'age', label: '[필수] 만 14세 이상입니다', required: true },
] as const;

type TermKey = (typeof TERMS)[number]['key'];

/*
 * Figma v4 회원가입/3 (`1363:1921`). Gaps below the header are measured from
 * v4's own "STEP 3" line, so they hold wherever `StepHeader` ends.
 */
const COLUMN_INSET = 11.28;
const ROW_TEXT = { fontSize: scale(8.462), lineHeight: scale(12.41) } as const;

export default function TermsScreen() {
  const { form, update } = useSignUpForm();
  const { signUp } = useAuth();
  const [busy, setBusy] = useState(false);
  const agreed = form.agreed;

  /** The 전체 동의 checkbox still covers everything, required or not. */
  const allAgreed = TERMS.every((term) => agreed[term.key]);
  const canSubmit = TERMS.every((term) => !term.required || agreed[term.key]) && !busy;

  async function submit() {
    setBusy(true);
    try {
      await signUp(toSignUpRequest(form));
    } catch (error) {
      Alert.alert('가입하지 못했어요', messageFor(error));
    } finally {
      setBusy(false);
    }
  }

  function toggleAll() {
    const next = !allAgreed;
    update({ agreed: Object.fromEntries(TERMS.map((term) => [term.key, next])) });
  }

  function toggle(key: TermKey) {
    update({ agreed: { ...agreed, [key]: !agreed[key] } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: scale(COLUMN_INSET),
          paddingTop: scale(9.42),
        }}>
        <StepHeader
          title="약관 동의"
          backHref="/(auth)/sign-up/survey"
          stepLabel="STEP 3   약관 동의"
          currentStep={3}
        />

        <Text
          style={{
            fontSize: scale(11.282),
            lineHeight: scale(15.795),
            letterSpacing: scale(-0.1128),
            marginTop: scale(11.4),
            color: COLOR.text.heading,
          }}
          className="font-plex-bold">
          마지막이에요! 약관에 동의해주세요
        </Text>

        {/* v4 sits the circle 0.95pt below the label's centre; reproduced. */}
        <Pressable
          onPress={toggleAll}
          style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: scale(20.55) }}>
          <View style={{ marginTop: scale(2.08) }}>
            <Checkbox checked={allAgreed} onPress={toggleAll} />
          </View>
          <Text
            style={{
              fontSize: scale(9.59),
              lineHeight: scale(13.538),
              letterSpacing: scale(-0.0959),
              marginLeft: scale(6.79),
              color: COLOR.text.heading,
            }}
            className="font-plex-semibold">
            약관 전체 동의
          </Text>
        </Pressable>

        <View style={{ marginTop: scale(12.8), gap: scale(12.41) }}>
          {TERMS.map((term) => (
            <Pressable
              key={term.key}
              onPress={() => toggle(term.key)}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: scale(COLUMN_INSET) }}>
              <Checkbox checked={agreed[term.key]} onPress={() => toggle(term.key)} />
              <Text
                style={{
                  ...ROW_TEXT,
                  marginLeft: scale(6.83),
                  color: agreed[term.key] ? COLOR.text.heading : COLOR.text.body,
                }}
                className="font-plex">
                {term.label}
              </Text>
              {/*
                v4 ends every row in a `>` as if it opened the term's full text.
                There is no such screen, so it is drawn and does nothing.
                */}
              <Text
                style={{
                  ...ROW_TEXT,
                  position: 'absolute',
                  right: scale(COLUMN_INSET),
                  color: COLOR.text.body,
                }}
                className="font-plex">
                {'>'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: scale(15.53) }}>
          <Button
            label="가입하고 LifeDNA 만들기 →"
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.4 }}
            onPress={submit}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
