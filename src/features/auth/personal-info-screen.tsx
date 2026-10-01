import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { StepHeader } from '@/components/ui/step-header';
import { TextInputField } from '@/components/ui/text-input';
import { checkAvailability, messageFor } from '@/lib/api';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';
import { isPersonalInfoComplete, useSignUpForm } from '@/features/auth/sign-up-form';

/**
 * Figma v3 회원가입/1 (`1315:1558`), field for field — plus an 아이디 field v3
 * leaves out. The owner chose (2026-10-01) to follow v3 literally: 성별, 직업
 * and a 년 / 월 / 일 birth date are drawn and collected again. Only the year is
 * sent (`birthYear`); 성별·직업 have no place in `SignUpRequest` (backlog 13)
 * and stay in the draft. 아이디 is kept because 로그인 asks for it and the server
 * requires `loginId` — v3 forgot it, so it takes the other fields' style and
 * opens the list.
 *
 * Values are v3's ×220/390. Fields keep the 45.26 pitch and 생년월일 follows on
 * the same pitch.
 */
/** Field box → next label; with the 0.85 label gap this keeps v3's 45.26 pitch. */
const FIELD_GAP = 3.8;
/** v3 draws this screen's typed values at 15/22, larger than the component's 12. */
const VALUE_TEXT = { fontSize: scale(8.462) };

const GENDERS = ['남성', '여성', '비공개'] as const;
const JOBS = ['직장인', '자영업', '학생', '무직', '주부'] as const;

const LABEL = {
  fontSize: scale(9.59),
  lineHeight: scale(13.538),
  letterSpacing: scale(-0.0959),
  color: COLOR.text.body,
} as const;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(11.28),
          paddingTop: scale(6.987),
          paddingBottom: scale(24),
        }}
        keyboardShouldPersistTaps="handled">
        <StepHeader
          title="개인정보 입력"
          backHref="/(auth)/sign-up"
          stepLabel="STEP 1   개인정보 입력"
          currentStep={1}
        />

        <View style={{ marginTop: scale(11.6), gap: scale(FIELD_GAP) }}>
          <TextInputField
            label="아이디"
            placeholder="영문·숫자·_ 4자 이상"
            value={form.loginId}
            onChangeText={(loginId) => update({ loginId })}
            autoCapitalize="none"
            style={VALUE_TEXT}
          />
          <TextInputField
            label="닉네임"
            placeholder="별명을 입력해주세요"
            value={form.nickname}
            onChangeText={(nickname) => update({ nickname })}
            style={VALUE_TEXT}
          />
          <TextInputField
            label="이메일"
            placeholder="your@lifedna.com"
            value={form.email}
            onChangeText={(email) => update({ email })}
            autoCapitalize="none"
            keyboardType="email-address"
            style={VALUE_TEXT}
          />
          <TextInputField
            label="비밀번호"
            placeholder="8자리 이상, 영문 숫자 포함"
            value={form.password}
            onChangeText={(password) => update({ password })}
            secureTextEntry
            style={VALUE_TEXT}
          />
          <TextInputField
            label="비밀번호 재확인"
            placeholder="다시 한 번 입력해주세요"
            value={form.passwordConfirm}
            onChangeText={(passwordConfirm) => update({ passwordConfirm })}
            secureTextEntry
            style={VALUE_TEXT}
          />
        </View>

        <View style={{ marginTop: scale(4.062) }}>
          <Text style={LABEL} className="font-plex-semibold">
            생년월일
          </Text>
          {/* v3 insets the row 0.96 at both ends of the column. */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: scale(0.962),
            }}>
            <DateBox
              unit="년"
              placeholder="YYYY"
              maxLength={4}
              value={form.birthYear}
              onChange={(birthYear) => update({ birthYear })}
            />
            <DateBox
              unit="월"
              placeholder="MM"
              maxLength={2}
              value={form.birthMonth}
              onChange={(birthMonth) => update({ birthMonth })}
            />
            <DateBox
              unit="일"
              placeholder="DD"
              maxLength={2}
              value={form.birthDay}
              onChange={(birthDay) => update({ birthDay })}
            />
          </View>
        </View>

        <View style={{ marginTop: scale(8.653) }}>
          <Text style={LABEL} className="font-plex-semibold">
            성별
          </Text>
          <ChoiceRow
            options={GENDERS}
            value={form.gender}
            onChange={(gender) => update({ gender })}
            gap={12.5}
            height={29.418}
            shadow={false}
          />
        </View>

        <View style={{ marginTop: scale(6.29) }}>
          <Text style={LABEL} className="font-plex-semibold">
            직업
          </Text>
          <ChoiceRow
            options={JOBS}
            value={form.job}
            onChange={(job) => update({ job })}
            gap={8.654}
            height={30.083}
            shadow
            style={{ marginTop: scale(2.885) }}
          />
        </View>

        <View style={{ marginTop: scale(7.085) }}>
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

type DateBoxProps = {
  unit: string;
  placeholder: string;
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
};

/**
 * One of v3's three birth-date boxes: 101.2×48 white, radius 12, `border/soft`,
 * the number (SemiBold 15/20 `text/body`) and its unit (SemiBold 13/18
 * `text/strong`) right-aligned 12.8 from the edge, about 6 apart.
 */
function DateBox({ unit, placeholder, maxLength, value, onChange }: DateBoxProps) {
  return (
    <View
      style={{
        width: scale(57.093),
        height: scale(27.077),
        borderRadius: scale(6.769),
        borderWidth: scale(0.564),
        borderColor: COLOR.border.soft,
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: scale(7.22),
      }}>
      <RNTextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={COLOR.text.muted}
        keyboardType="number-pad"
        maxLength={maxLength}
        style={{
          flex: 1,
          padding: 0,
          textAlign: 'right',
          fontSize: scale(8.462),
          color: COLOR.text.body,
        }}
        className="font-plex-semibold"
      />
      <Text
        style={{
          marginLeft: scale(3.2),
          fontSize: scale(7.333),
          lineHeight: scale(10.154),
          color: COLOR.text.strong,
        }}
        className="font-plex-semibold">
        {unit}
      </Text>
    </View>
  );
}

type ChoiceRowProps<T extends string> = {
  options: readonly T[];
  value: string | null;
  onChange: (value: T) => void;
  /** Figma gap and pill height, at 220. */
  gap: number;
  height: number;
  /** 직업 carries the ambient shadow; 성별 does not. */
  shadow: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * v3's white answer pills on this step — `SelectItem3_2` (성별) and
 * `SelectItem5_2` (직업). Taller and whiter than any `SelectButton` size, and
 * equal-width across the column. Figma draws only the unanswered state; a
 * chosen pill takes the family's `brand/selected` / `text/on-pastel`.
 */
function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
  gap,
  height,
  shadow,
  style,
}: ChoiceRowProps<T>) {
  return (
    <View style={[{ flexDirection: 'row', gap: scale(gap) }, style]}>
      {options.map((option) => {
        const selected = value === option;
        // Same element tree every render; only style values change (AGENTS.md #3).
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              height: scale(height),
              borderRadius: scale(4.808),
              backgroundColor: selected ? COLOR.brand.selected : COLOR.surface.card,
              boxShadow: shadow ? SHADOW_V4 : 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: scale(7.333),
                lineHeight: scale(10.154),
                color: selected ? COLOR.text.onPastel : COLOR.text.body,
              }}
              className="font-plex-semibold">
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
