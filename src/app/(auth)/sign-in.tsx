import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { TextInputField } from '@/components/ui/text-input';
import { scale } from '@/lib/scale';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <View style={{ flex: 1, paddingHorizontal: scale(18), paddingTop: scale(5) }}>
        <Image
          source={require('@/assets/images/auth/dna-nice.png')}
          style={{ width: scale(54), height: scale(60), alignSelf: 'center' }}
          contentFit="contain"
        />

        <View style={{ alignItems: 'center', marginTop: scale(4) }}>
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
            lineHeight: scale(10),
            marginTop: scale(6),
            textAlign: 'center',
            color: '#5F5E5B',
          }}
          className="font-pretendard">
          다시 오셨네요, 반가워요!
        </Text>

        <View style={{ marginTop: scale(4), gap: scale(5) }}>
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
          <Button label="로그인 →" />
        </View>

        <Pressable onPress={() => router.push('/(auth)/sign-up')} style={{ marginTop: scale(7) }}>
          <Text
            style={{
              fontSize: scale(7),
              lineHeight: scale(10),
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
            lineHeight: scale(10),
            marginTop: 'auto',
            marginBottom: scale(53),
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
