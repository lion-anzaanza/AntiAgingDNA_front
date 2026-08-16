import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 06_마이페이지 `Frame 26` (`583:862`).
 *
 * There is nothing behind 연동하기 — pairing a watch needs a native module and
 * the API has no wearable endpoints, so the button is drawn and inert.
 */
const CONTENT_INSET = 17;

export default function WearableScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(14), paddingBottom: scale(24) }}>
        <View
          style={{
            height: scale(22),
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: scale(CONTENT_INSET),
          }}>
          <ButtonBack fallbackHref="/my" />
          <Text
            style={{
              marginLeft: scale(9),
              fontSize: scale(12),
              lineHeight: scale(15),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            웨어러블 연동
          </Text>
        </View>

        <Text
          style={{
            marginTop: scale(44),
            textAlign: 'center',
            fontSize: scale(8),
            lineHeight: scale(18),
            letterSpacing: scale(-0.08),
            color: '#88877F',
          }}
          className="font-pretendard">
          기기를 태깅해주세요
        </Text>

        {/* Figma draws the watch full-bleed at 220×220, not inside the column. */}
        <Image
          source={require('@/assets/images/my/watch.png')}
          style={{ width: scale(220), height: scale(220), marginTop: scale(1) }}
          resizeMode="contain"
        />

        <View
          style={{
            marginTop: scale(42),
            paddingLeft: scale(CONTENT_INSET),
            paddingRight: scale(220 - CONTENT_INSET - 184),
          }}>
          <Pressable>
            <LinearGradient
              colors={[...GRADIENT_BRAND]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: scale(26),
                borderRadius: scale(10),
                boxShadow: SHADOW,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ fontSize: scale(10), lineHeight: scale(15), color: '#FFFFFF' }}
                className="font-pretendard-extrabold">
                연동하기
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
