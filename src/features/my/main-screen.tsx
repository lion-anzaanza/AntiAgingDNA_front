import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { MenuRow, type MenuItem } from '@/features/my/components/menu-row';
import { ProfileCard } from '@/features/my/components/profile-card';
import { messageFor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 마이페이지/메인 (`1363:3217`) — the MY tab's root.
 *
 * The five icons are one screenshot sheet in Figma, cropped per row — cut into
 * `assets/images/my/ic-*.png` the same way the 만족도 faces were. v4 crops the
 * same sheet to the same icons, only at slightly different box sizes.
 *
 * Figma draws a back chip on this tab root, as the pre-v4 frame did. It is kept
 * with the `/home` fallback it already had.
 */
const COLUMN = { left: scale(11.28), width: scale(197.436) };

/** Row bands of the menu card, read off its four divider lines. */
const ROW_HEIGHTS = [21.15, 21.16, 22.11, 21.16, 21.15];

/** Same pastel stops as `Button`, but this bar is drawn at 167.3°, 25 tall. */
const COFFEE_RAMP = cssGradientPoints(167.3328, 197.436, 25);

/**
 * Figma puts the `무료` tier beside 이용약관 rather than 구독 관리, while the
 * icons stay with their labels. The sibling frame (`583:913`) shows the same
 * values against a different label order, which is what gives it away — a tier
 * belongs to the subscription row, so it is placed there. v4 repeats the slip.
 */
const MENU: MenuItem[] = [
  {
    label: '웨어러블 연동',
    icon: require('@/assets/images/my/ic-wearable.png'),
    iconWidth: 11.387,
    iconHeight: 14.423,
    iconTop: 3.85,
    value: '애플워치',
    href: '/my/wearable',
  },
  {
    label: '구독 관리',
    icon: require('@/assets/images/my/ic-subscription.png'),
    iconWidth: 12.714,
    iconHeight: 13.462,
    iconTop: 3.85,
    value: '무료',
    href: '/my/subscription',
  },
  {
    label: '데이터 개인정보',
    icon: require('@/assets/images/my/ic-privacy.png'),
    iconWidth: 13.235,
    iconHeight: 12.5,
    iconTop: 4.81,
    href: '/my/privacy',
  },
  {
    label: '이용약관',
    icon: require('@/assets/images/my/ic-terms.png'),
    iconWidth: 12.896,
    iconHeight: 11.538,
    iconTop: 3.85,
  },
  {
    label: '도움말',
    icon: require('@/assets/images/my/ic-help.png'),
    iconWidth: 12.821,
    iconHeight: 14.423,
    iconTop: 1.92,
  },
];

export default function MyPageScreen() {
  const { user, signOut, deleteAccount } = useAuth();

  /*
   * The server hard-deletes; there is no undo and no grace period (backlog item
   * 24), so this asks first. Figma draws 로그아웃 | 회원탈퇴 as one line with no
   * dialog of its own, and inventing a whole confirmation screen for it is not
   * this change's job — the platform's destructive alert says the same thing.
   */
  function confirmDelete() {
    Alert.alert(
      '회원탈퇴',
      '계정과 그동안의 일지·점수가 모두 삭제됩니다. 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              Alert.alert('탈퇴하지 못했어요', messageFor(error));
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: scale(33.95) }}>
        {/*
          * Everything down to 개발자 커피사주기 sits at Figma's own y, less the
          * 38pt PhoneHeader mock the safe area stands in for.
          */}
        <View style={{ height: scale(222.58) }}>
          <View style={{ position: 'absolute', left: scale(11.28), top: scale(12) }}>
            <ButtonBack fallbackHref="/home" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.47),
              top: scale(9.74),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            마이페이지
          </Text>

          <View style={{ position: 'absolute', top: scale(33.15), ...COLUMN }}>
            <ProfileCard nickname={user?.nickname ?? ''} streakDays={user?.streakDays ?? 0} />
          </View>

          <View
            style={{
              position: 'absolute',
              top: scale(81.23),
              ...COLUMN,
              height: scale(106.731),
              borderRadius: scale(5.769),
              backgroundColor: COLOR.surface.card,
              boxShadow: SHADOW_V4,
            }}>
            {MENU.map((item, index) => (
              <MenuRow key={item.label} {...item} height={ROW_HEIGHTS[index]} first={index === 0} />
            ))}
          </View>

          <Pressable style={{ position: 'absolute', top: scale(197.58), ...COLUMN }}>
            <LinearGradient
              colors={[...GRADIENT_PASTEL.colors]}
              locations={[...GRADIENT_PASTEL.locations]}
              start={COFFEE_RAMP.start}
              end={COFFEE_RAMP.end}
              style={{ height: scale(25), borderRadius: scale(9.615), boxShadow: SHADOW_V4 }}>
              {/* Figma's line box centres 1.3pt above the button's middle. */}
              <Text
                style={{
                  position: 'absolute',
                  top: scale(3.3),
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: scale(11.282),
                  lineHeight: scale(15.795),
                  letterSpacing: scale(-0.1128),
                  color: COLOR.text.onPastel,
                }}
                className="font-plex-bold">
                개발자 커피사주기
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/*
          * Figma pushes this to the bottom with a fixed gap measured on its 480pt
          * frame, but `scale()` converts by *width* — so on a device with a
          * different aspect ratio the gap lands somewhere else and the screen
          * either scrolls or leaves a hole. A flexible spacer pins it to the
          * bottom of the viewport instead, which is what the design means, and
          * `flexGrow: 1` on the content container is what gives it room to push
          * against. The bottom padding is Figma's 34pt gap above the tab bar.
          *
          * Figma centres the line on x=113.2, 3pt right of the frame's middle;
          * it is centred here like every other one-off centring slip.
          */}
        <View style={{ flex: 1, minHeight: scale(24) }} />
        <Text
          style={{
            textAlign: 'center',
            fontSize: scale(8.462),
            lineHeight: scale(12.41),
            color: COLOR.text.body,
          }}
          className="font-plex">
          <Text onPress={signOut}>로그아웃</Text>
          {' | '}
          <Text onPress={confirmDelete}>회원탈퇴</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
