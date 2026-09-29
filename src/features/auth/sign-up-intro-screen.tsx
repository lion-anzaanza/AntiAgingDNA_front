import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { scale } from '@/lib/scale';

export default function SignUpIntroScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <View style={{ flex: 1, paddingHorizontal: scale(18), paddingTop: scale(46) }}>
        <Image
          source={require('@/assets/images/auth/dna-icon.png')}
          style={{ width: scale(77.5), height: scale(77.5), alignSelf: 'center' }}
          contentFit="contain"
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: scale(2),
          }}>
          <GradientText
            colors={['#4B52F6', '#BC40F6']}
            style={{ fontSize: scale(14), lineHeight: scale(15) }}
            className="font-pretendard-extrabold">
            LifeDNA
          </GradientText>
          <Text
            style={{ fontSize: scale(14), lineHeight: scale(15), color: '#000000' }}
            className="font-pretendard-extrabold">
            {' '}
            시작해보기
          </Text>
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
          매일의 나를 모아 &lsquo;나만의 유전자&rsquo;를 만들어요
        </Text>

        <View style={{ marginTop: scale(52) }}>
          <Link href="/(auth)/sign-up/personal-info" asChild>
            <Button label="회원가입 →" />
          </Link>
        </View>

        <Pressable onPress={() => router.push('/(auth)/sign-in')} style={{ marginTop: scale(7) }}>
          <Text
            style={{
              fontSize: scale(7),
              lineHeight: scale(10),
              textAlign: 'center',
              color: '#88877F',
            }}
            className="font-pretendard">
            이미 계정이 있나요?{'  '}
            <Text style={{ color: '#8B2AFE' }} className="font-pretendard-bold">
              로그인
            </Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
