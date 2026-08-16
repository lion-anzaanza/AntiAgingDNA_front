import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { StepHeader } from '@/components/ui/step-header';
import { TextInputField } from '@/components/ui/text-input';
import { checkAvailability, messageFor } from '@/lib/api';
import { scale } from '@/lib/scale';
import { isPersonalInfoComplete, useSignUpForm } from '@/lib/sign-up-form';

/**
 * Figma also draws 성별, 직업 and a 년/월/일 birth date here. The backend will
 * not take any of them (backlog item 13): 성별·직업 have no place in
 * `SignUpRequest` and are not used by the scoring, and only `birthYear` is
 * stored. Collecting fields we cannot send is worse than a screen that differs
 * from the mock, so they are gone and the mock needs updating.
 */

export default function PersonalInfoScreen() {
  const { form, update } = useSignUpForm();
  const [checking, setChecking] = useState(false);
  const canContinue = isPersonalInfoComplete(form) && !checking;

  /*
   * 아이디 and 이메일 duplication is caught here rather than on submit. Signup
   * only posts from STEP 3, so without this the first sign of a taken 아이디 is
   * a 409 three screens later, with no way back to the field except 뒤로 twice.
   *
   * A failed *check* is not a reason to block: if the network is down the user
   * still gets the 409 at the end, which is where they were before.
   */
  async function next() {
    setChecking(true);
    try {
      const [idFree, emailFree] = await Promise.all([
        checkAvailability('loginId', form.loginId.trim()),
        checkAvailability('email', form.email.trim()),
      ]);
      const taken = [!idFree && '아이디', !emailFree && '이메일'].filter(Boolean);
      if (taken.length > 0) {
        Alert.alert('이미 사용 중이에요', `${taken.join('과 ')}를 다시 정해주세요.`);
        return;
      }
    } catch (error) {
      console.warn('중복 확인을 건너뜁니다', messageFor(error));
    } finally {
      setChecking(false);
    }
    router.push('/(auth)/sign-up/survey');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(18),
          paddingTop: scale(5),
          paddingBottom: scale(24),
        }}
        keyboardShouldPersistTaps="handled">
        <StepHeader
          title="개인정보 입력"
          backHref="/(auth)/sign-up"
          stepLabel="STEP 1   개인정보 입력"
          currentStep={1}
        />

        <View style={{ marginTop: scale(23), gap: scale(7) }}>
          <TextInputField
            label="아이디"
            placeholder="영문·숫자·_ 4자 이상"
            value={form.loginId}
            onChangeText={(loginId) => update({ loginId })}
            autoCapitalize="none"
          />
          <TextInputField
            label="닉네임"
            placeholder="별명을 입력해주세요"
            value={form.nickname}
            onChangeText={(nickname) => update({ nickname })}
          />
          <TextInputField
            label="이메일"
            placeholder="your@lifedna.com"
            value={form.email}
            onChangeText={(email) => update({ email })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInputField
            label="비밀번호"
            placeholder="8자리 이상, 영문 숫자 포함"
            value={form.password}
            onChangeText={(password) => update({ password })}
            secureTextEntry
          />
          <TextInputField
            label="비밀번호 재확인"
            placeholder="다시 한 번 입력해주세요"
            value={form.passwordConfirm}
            onChangeText={(passwordConfirm) => update({ passwordConfirm })}
            secureTextEntry
          />
          <TextInputField
            label="출생연도"
            placeholder="예: 1999"
            value={form.birthYear}
            onChangeText={(birthYear) => update({ birthYear: birthYear.replace(/\D/g, '') })}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        <View style={{ marginTop: scale(27) }}>
          <Button
            label="다음 →"
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.4 }}
            onPress={next}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
