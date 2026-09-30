import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 마이페이지/웨어러블연동 (`1363:3340`).
 *
 * There is nothing behind 연동하기 — pairing a watch needs a native module and
 * the API has no wearable endpoints, so the button is drawn and inert.
 *
 * The watch (`image 1122`) is the same bitmap as `watch.png`: downscaled to the
 * file's 440px, v4's 1254px fill differs from it by 0 on every channel.
 */

/** 마이페이지/메인's 개발자 커피사주기 bar exactly: 25 tall, pastel at 167.3°. */
const BUTTON_RAMP = cssGradientPoints(167.3328, 197.436, 25);

export default function WearableScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: scale(35.82) }}>
        {/* Down to the watch, everything is at Figma's y less the 38pt PhoneHeader. */}
        <View style={{ height: scale(319.5) }}>
          <View style={{ position: 'absolute', left: scale(11.28), top: scale(12) }}>
            <ButtonBack fallbackHref="/my" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.6),
              top: scale(9.38),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            웨어러블 연동
          </Text>

          {/* Figma centres it on x 106.2, 3.8pt left of the middle — once. */}
          <Text
            style={{
              position: 'absolute',
              top: scale(81.13),
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: scale(11.282),
              lineHeight: scale(15.795),
              letterSpacing: scale(-0.1128),
              color: COLOR.text.body,
            }}
            className="font-plex-bold">
            기기를 태깅해주세요
          </Text>

          {/* Full-bleed at 220×220, not inside the column. */}
          <Image
            source={require('@/assets/images/my/watch.png')}
            style={{ position: 'absolute', top: scale(99.5), left: 0, width: scale(220), height: scale(220) }}
            resizeMode="contain"
          />
        </View>

        {/*
          * Figma pushes this to the bottom with a fixed gap measured on its 480pt
          * frame, but `scale()` converts by *width* — so on a device with a
          * different aspect ratio the gap lands somewhere else and the screen
          * either scrolls or leaves a hole. A flexible spacer pins it to the
          * bottom of the viewport instead, which is what the design means, and
          * `flexGrow: 1` on the content container is what gives it room to push
          * against. The bottom padding is Figma's 35.8pt gap above the tab bar.
          */}
        <View style={{ flex: 1, minHeight: scale(20) }} />
        <Pressable style={{ marginLeft: scale(11.28), width: scale(197.436) }}>
          <LinearGradient
            colors={[...GRADIENT_PASTEL.colors]}
            locations={[...GRADIENT_PASTEL.locations]}
            start={BUTTON_RAMP.start}
            end={BUTTON_RAMP.end}
            style={{ height: scale(25), borderRadius: scale(9.615), boxShadow: SHADOW_V4 }}>
            {/* Figma's line box centres 1.36pt above the button's middle. */}
            <Text
              style={{
                position: 'absolute',
                top: scale(11.14 - 15.795 / 2),
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: scale(11.282),
                lineHeight: scale(15.795),
                letterSpacing: scale(-0.1128),
                color: COLOR.text.onPastel,
              }}
              className="font-plex-bold">
              연동하기
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
