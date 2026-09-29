import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/text-input';
import { messageFor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { COLOR } from '@/lib/design';
import { scale } from '@/lib/scale';

/*
 * Figma v4 로그인/메인 (`1363:1535`). Everything above the fold is placed
 * absolutely at Figma's own y, less the 38pt PhoneHeader mock the safe area
 * stands in for: the wordmark, the greeting and the first field's label all
 * overlap each other's line boxes, which flex margins can only express as a
 * run of negative numbers.
 */
const COLUMN = { left: scale(11.28), width: scale(197.436) };

const BODY = {
  fontSize: scale(8.462),
  lineHeight: scale(12.41),
  textAlign: 'center',
} as const;

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
    // Bottom edge excluded: Figma measures the last line from the frame's own
    // bottom, which is the physical screen edge, not the home-indicator inset.
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <View style={{ height: scale(248) }}>
        <Image
          source={require('@/assets/images/auth/dna-nice.png')}
          style={{
            position: 'absolute',
            top: scale(2.62),
            alignSelf: 'center',
            width: scale(52.118),
            height: scale(57.692),
          }}
          contentFit="contain"
        />

        <Text
          style={{
            position: 'absolute',
            top: scale(59.7),
            left: 0,
            right: 0,
            fontSize: scale(18.051),
            lineHeight: scale(22.564),
            letterSpacing: scale(-0.361),
            textAlign: 'center',
            color: COLOR.brand.violetText,
          }}
          className="font-plex-bold">
          LifeDNA
        </Text>
        <Text
          style={{ ...BODY, position: 'absolute', top: scale(79.49), left: 0, right: 0, color: COLOR.text.body }}
          className="font-plex">
          다시 오셨네요, 반가워요!
        </Text>

        <View style={{ position: 'absolute', top: scale(87.95), ...COLUMN }}>
          <TextInputField
            label="아이디"
            placeholder="아이디를 입력하세요"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <View style={{ position: 'absolute', top: scale(136.6), ...COLUMN }}>
          <TextInputField
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={{ position: 'absolute', top: scale(200.9), ...COLUMN }}>
          <Button
            label="로그인 →"
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.4 }}
            onPress={submit}
          />
        </View>

        <Pressable
          onPress={() => router.push('/(auth)/sign-up')}
          style={{ position: 'absolute', top: scale(235.65), left: 0, right: 0 }}>
          <Text style={{ ...BODY, color: COLOR.text.muted }} className="font-plex">
            아직 계정이 없나요?{'  '}
            <Text style={{ color: '#8B2AFE' }}>회원가입</Text>
          </Text>
        </Pressable>
      </View>

      <Text
        style={{ ...BODY, marginTop: 'auto', marginBottom: scale(51.67), color: COLOR.text.body }}
        className="font-plex">
        아이디 · 비밀번호 찾기
      </Text>
    </SafeAreaView>
  );
}
