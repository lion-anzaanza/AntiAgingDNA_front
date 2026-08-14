import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { DateInputRow } from '@/components/ui/date-input-row';
import { PillGroup } from '@/components/ui/pill-group';
import { SelectButton } from '@/components/ui/select-button';
import { StepHeader } from '@/components/ui/step-header';
import { TextInputField } from '@/components/ui/text-input';
import { scale } from '@/lib/scale';

const GENDER_OPTIONS = ['남성', '여성', '비공개'];
const JOB_OPTIONS = ['직장인', '자영업', '학생', '무직', '주부'];
/** 직업 sits outside the SelectItem family: five 30pt pills across the full 186pt row. */
const JOB_GAP = 8.5;
const JOB_PILL_WIDTH = (186 - JOB_GAP * (JOB_OPTIONS.length - 1)) / JOB_OPTIONS.length;

export default function PersonalInfoScreen() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [job, setJob] = useState<string | null>(null);

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
          title="개인정보 입력"
          backHref="/(auth)/sign-up"
          stepLabel="STEP 1   개인정보 입력"
          currentStep={1}
        />

        <View style={{ marginTop: scale(23), gap: scale(7) }}>
          <TextInputField
            label="닉네임"
            placeholder="별명을 입력해주세요"
            value={nickname}
            onChangeText={setNickname}
          />
          <TextInputField
            label="이메일"
            placeholder="your@lifedna.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInputField
            label="비밀번호"
            placeholder="8자리 이상, 영문 숫자 포함"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInputField
            label="비밀번호 재확인"
            placeholder="다시 한 번 입력해주세요"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
          />
        </View>

        <View style={{ marginTop: scale(8) }}>
          <DateInputRow
            label="생년월일"
            year={year}
            month={month}
            day={day}
            onChangeYear={setYear}
            onChangeMonth={setMonth}
            onChangeDay={setDay}
          />
        </View>

        <View style={{ marginTop: scale(8) }}>
          <PillGroup
            label="성별"
            labelTone="field"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
            columns={3}
            level={2}
            tone="white"
          />
        </View>

        <View style={{ marginTop: scale(13) }}>
          <Text
            style={{ fontSize: scale(7), lineHeight: scale(10), color: '#88877F' }}
            className="font-pretendard-bold">
            직업
          </Text>
          <View style={{ flexDirection: 'row', gap: scale(JOB_GAP), marginTop: scale(3) }}>
            {JOB_OPTIONS.map((option) => (
              <SelectButton
                key={option}
                label={option}
                selected={option === job}
                onPress={() => setJob(option)}
                level={4}
                tone="white"
                style={{ width: scale(JOB_PILL_WIDTH) }}
              />
            ))}
          </View>
        </View>

        <View style={{ marginTop: scale(27) }}>
          <Link href="/(auth)/sign-up/survey" asChild>
            <Button label="다음 →" />
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
