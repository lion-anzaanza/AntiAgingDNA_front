import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
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
 * Figma v3 회원가입/3 (`1307:1534`), ×220/390. Gaps below the header are
 * measured from v3's own "STEP 3" line, so they hold wherever `StepHeader`
 * ends. Rows are on a 24.82 pitch: a 13.54 circle, its label 4.57 to the right,
 * and an `Icon/Chevron-Right` 8.74 in from the column's right edge.
 */
const COLUMN_INSET = 11.28;
const CHEVRON = { size: 11.282, right: 8.744 };
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
          paddingTop: scale(6.987),
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
            marginTop: scale(12.727),
            color: COLOR.text.heading,
          }}
          className="font-plex-bold">
          마지막이에요! 약관에 동의해주세요
        </Text>

        <Pressable
          onPress={toggleAll}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(20.415) }}>
          <Checkbox checked={allAgreed} onPress={toggleAll} />
          <Text
            style={{
              fontSize: scale(9.59),
              lineHeight: scale(13.538),
              letterSpacing: scale(-0.0959),
              marginLeft: scale(4.53),
              color: COLOR.text.heading,
            }}
            className="font-plex-semibold">
            약관 전체 동의
          </Text>
        </Pressable>

        <View style={{ marginTop: scale(11.369), gap: scale(11.282) }}>
          {TERMS.map((term) => (
            <Pressable
              key={term.key}
              onPress={() => toggle(term.key)}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: scale(COLUMN_INSET) }}>
              <Checkbox checked={agreed[term.key]} onPress={() => toggle(term.key)} />
              <Text
                style={{
                  ...ROW_TEXT,
                  marginLeft: scale(4.57),
                  color: agreed[term.key] ? COLOR.text.heading : COLOR.text.body,
                }}
                className="font-plex">
                {term.label}
              </Text>
              {/*
                v3 ends every row in a chevron as if it opened the term's full
                text. There is no such screen, so it is drawn and does nothing.
                */}
              <View
                style={{
                  position: 'absolute',
                  right: scale(CHEVRON.right),
                  top: scale((13.538 - CHEVRON.size) / 2),
                }}>
                <Icon name="chevron-right" size={scale(CHEVRON.size)} color={COLOR.text.muted} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: scale(15.062) }}>
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
