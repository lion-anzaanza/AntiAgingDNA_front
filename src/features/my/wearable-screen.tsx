import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { COLOR, GRADIENT_PASTEL } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 마이페이지/웨어러블연동 (`1318:1948`).
 *
 * There is nothing behind 연동하기 — pairing a watch needs a native module and
 * the API has no wearable endpoints, so the button is drawn and inert, and the
 * `Card/연결 상태` v3 added always reads "연결된 기기 없음".
 *
 * The watch (`image 1122`) is the same bitmap as `watch.png`: v3's 1254px fill
 * differs from it by 0 on every channel. v3 also stopped pinning 연동하기 to the
 * tab bar — it sits right under the new status card — so the whole screen is
 * laid out from the top.
 *
 * Every element sits at Figma's own y (×220/390) less the 38pt PhoneHeader mock.
 */
const V3 = 220 / 390;
const at = (v3Points: number) => scale(v3Points * V3);
const y = (v3Points: number) => scale(v3Points * V3 - 38);

const COLUMN = { left: at(20), width: at(350) };

/** 마이페이지/메인's 개발자 커피사주기 bar exactly: 44.3 tall, pastel at 167.3°. */
const BUTTON_RAMP = cssGradientPoints(167.3328, 350, 44.318);
const BUTTON_SHADOW = '0px 0px 1.923px rgba(169, 169, 169, 0.25)';
/** `0px 2px 10px rgba(74,56,128,0.06)` on the status card, at 220. */
const CARD_SHADOW = '0px 1.128px 5.641px rgba(74, 56, 128, 0.06)';

export default function WearableScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: at(24) }}>
        <View style={{ height: y(618.91 + 44.318) }}>
          <View style={{ position: 'absolute', left: at(16), top: y(79.75) }}>
            <ButtonBack fallbackHref="/my" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: at(63.76),
              top: y(99.16 - 16),
              fontSize: at(24),
              lineHeight: at(32),
              letterSpacing: at(-0.48),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            웨어러블 연동
          </Text>

          {/* v3 centres it on x 187.9, 7pt left of the middle — once. Centred. */}
          <Text
            style={{
              position: 'absolute',
              top: y(182.79 - 14),
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: at(20),
              lineHeight: at(28),
              letterSpacing: at(-0.2),
              color: COLOR.text.body,
            }}
            className="font-plex-bold">
            기기를 태깅해주세요
          </Text>
          <Text
            style={{
              position: 'absolute',
              top: y(200.91),
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: at(15),
              lineHeight: at(22),
              color: COLOR.text.body,
            }}
            className="font-plex">
            휴대폰을 워치 가까이 두고 아래 버튼을 눌러 주세요
          </Text>

          <Image
            source={require('@/assets/images/my/watch.png')}
            style={{ position: 'absolute', top: y(238.91), left: at(55), width: at(280), height: at(280) }}
            resizeMode="contain"
          />

          <View
            style={{
              position: 'absolute',
              top: y(530.91),
              height: at(72),
              ...COLUMN,
              borderRadius: at(16),
              backgroundColor: COLOR.surface.card,
              boxShadow: CARD_SHADOW,
            }}>
            <View
              style={{
                position: 'absolute',
                left: at(16),
                top: at(22),
                width: at(8),
                height: at(8),
                borderRadius: at(4),
                backgroundColor: COLOR.text.muted,
              }}
            />
            <Text
              style={{
                position: 'absolute',
                left: at(32),
                top: at(14),
                fontSize: at(17),
                lineHeight: at(24),
                letterSpacing: at(-0.17),
                color: COLOR.text.heading,
              }}
              className="font-plex-semibold">
              연결된 기기 없음
            </Text>
            <Text
              style={{
                position: 'absolute',
                left: at(16),
                top: at(44),
                fontSize: at(12),
                lineHeight: at(16),
                color: COLOR.text.body,
              }}
              className="font-plex">
              지원 기기 · Apple Watch, Galaxy Watch·Ring
            </Text>
          </View>

          <Pressable style={{ position: 'absolute', top: y(618.91), ...COLUMN }}>
            <LinearGradient
              colors={[...GRADIENT_PASTEL.colors]}
              locations={[...GRADIENT_PASTEL.locations]}
              start={BUTTON_RAMP.start}
              end={BUTTON_RAMP.end}
              style={{
                height: at(44.318),
                borderRadius: at(16),
                boxShadow: BUTTON_SHADOW,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: at(20),
                  lineHeight: at(28),
                  letterSpacing: at(-0.2),
                  color: COLOR.text.onPastel,
                }}
                className="font-plex-bold">
                연동하기
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
