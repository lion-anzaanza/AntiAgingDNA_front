import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { TextInputField } from '@/components/ui/text-input';
import { messageFor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { scale } from '@/lib/scale';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !busy;

  /*
   * The server distinguishes 401 (wrong id or password — deliberately not
   * saying which), 400 with per-field `errors`, and transport failure. None of
   * them have anywhere to land on this screen: Figma's `TextInput` has no error
   * state and there is no space for a message. `Alert` is the platform's own
   * affordance, so it borrows nothing that has to be designed first; a proper
   * inline treatment is still an open design question (AGENTS.md).
   */
  async function submit() {
    setBusy(true);
    try {
      await signIn(username.trim(), password);
    } catch (error) {
      Alert.alert('로그인하지 못했어요', messageFor(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <View style={{ flex: 1, paddingHorizontal: scale(18), paddingTop: scale(5) }}>
        <Image
          source={require('@/assets/images/auth/dna-nice.png')}
          style={{ width: scale(54), height: scale(60), alignSelf: 'center' }}
          contentFit="contain"
        />

        <View style={{ alignItems: 'center', marginTop: scale(1.5) }}>
          <GradientText
            colors={['#4B52F6', '#BC40F6']}
            style={{ fontSize: scale(14), lineHeight: scale(15) }}
            className="font-pretendard-extrabold">
            LifeDNA
          </GradientText>
        </View>
        <Text
          style={{
            fontSize: scale(7),
            lineHeight: scale(15),
            marginTop: scale(1),
            textAlign: 'center',
            color: '#5F5E5B',
          }}
          className="font-pretendard">
          다시 오셨네요, 반가워요!
        </Text>

        <View style={{ marginTop: scale(1.5), gap: scale(5) }}>
          <TextInputField
            label="아이디"
            placeholder="아이디를 입력하세요"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInputField
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={{ marginTop: scale(22) }}>
          <Button
            label="로그인 →"
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.4 }}
            onPress={submit}
          />
        </View>

        <Pressable onPress={() => router.push('/(auth)/sign-up')} style={{ marginTop: scale(4.5) }}>
          <Text
            style={{
              fontSize: scale(7),
              lineHeight: scale(15),
              textAlign: 'center',
              color: '#88877F',
            }}
            className="font-pretendard">
            아직 계정이 없나요?{'  '}
            <Text style={{ color: '#8B2AFE' }} className="font-pretendard-bold">
              회원가입
            </Text>
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: scale(7),
            lineHeight: scale(15),
            marginTop: 'auto',
            marginBottom: scale(50.5),
            textAlign: 'center',
            color: '#88877F',
          }}
          className="font-pretendard">
          아이디 · 비밀번호 찾기
        </Text>
      </View>
    </SafeAreaView>
  );
}
