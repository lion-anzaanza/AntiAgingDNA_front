import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StepHeader } from '@/components/ui/step-header';
import { scale } from '@/lib/scale';
import { useSignUpForm } from '@/lib/sign-up-form';

const TERMS = [
  { key: 'service', label: '[필수] 서비스 이용약관' },
  { key: 'sensitive', label: '[필수] 개인정보 민감정보 처리 동의' },
  { key: 'marketing', label: '[필수] 마케팅 정보 수신' },
  { key: 'age', label: '[필수] 만 14세 이상입니다' },
] as const;

type TermKey = (typeof TERMS)[number]['key'];

export default function TermsScreen() {
  const { form, update } = useSignUpForm();
  const agreed = form.agreed;

  const allAgreed = TERMS.every((term) => agreed[term.key]);

  function toggleAll() {
    const next = !allAgreed;
    update({ agreed: Object.fromEntries(TERMS.map((term) => [term.key, next])) });
  }

  function toggle(key: TermKey) {
    update({ agreed: { ...agreed, [key]: !agreed[key] } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <View style={{ flex: 1, paddingHorizontal: scale(18), paddingTop: scale(5) }}>
        <StepHeader
          title="약관 동의"
          backHref="/(auth)/sign-up/survey"
          stepLabel="STEP 3   약관 동의"
          currentStep={3}
        />

        <Text
          style={{
            fontSize: scale(12),
            lineHeight: scale(15),
            marginTop: scale(15),
            color: '#00352C',
          }}
          className="font-pretendard-bold">
          마지막이에요! 약관에 동의해주세요
        </Text>

        <Pressable
          onPress={toggleAll}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(8),
            marginTop: scale(20.5),
          }}>
          <Checkbox checked={allAgreed} onPress={toggleAll} />
          <Text
            style={{ fontSize: scale(9), lineHeight: scale(10), color: '#00352C' }}
            className="font-pretendard-semibold">
            약관 전체 동의
          </Text>
        </Pressable>

        <View style={{ marginTop: scale(11), marginLeft: scale(14), gap: scale(7) }}>
          {TERMS.map((term) => (
            <Pressable
              key={term.key}
              onPress={() => toggle(term.key)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
              <Checkbox checked={agreed[term.key]} onPress={() => toggle(term.key)} />
              <Text
                style={{
                  fontSize: scale(8),
                  lineHeight: scale(10),
                  color: agreed[term.key] ? '#00352C' : '#88877F',
                }}
                className="font-pretendard-medium">
                {term.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: scale(30) }}>
          <Button
            label="가입하고 LifeDNA 만들기 →"
            disabled={!allAgreed}
            style={{ opacity: allAgreed ? 1 : 0.4 }}
            onPress={() => router.replace('/(tabs)/home')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
