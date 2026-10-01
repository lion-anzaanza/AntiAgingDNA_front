import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { MENU_ROW_HEIGHT, MenuRow, type MenuItem } from '@/features/my/components/menu-row';
import { ProfileCard } from '@/features/my/components/profile-card';
import { messageFor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 마이페이지/메인 (`1318:1821`) — the MY tab's root.
 *
 * v3 redrew the menu with `Icon/*` line icons and a `Icon/Chevron-Right` on every
 * row, in 48pt rows (27.08 at 220), and moved 개발자 커피사주기 well below the
 * card. The menu icons are drawn thinner here than anywhere else in v3 (1.44, the
 * watch 1.33) and kept so.
 *
 * Figma draws a back chip on this tab root, as the pre-v4 frame did. It is kept
 * with the `/home` fallback it already had.
 */
const COLUMN = { left: scale(11.282), width: scale(197.436) };

/** Same pastel stops as `Button`, but this bar is drawn at 167.3°, 25 tall. */
const COFFEE_RAMP = cssGradientPoints(167.3328, 197.436, 25);

/** v3's `drop-shadow(0 0 3.409px …)` on the pastel buttons, at 220. */
const BUTTON_SHADOW = '0px 0px 1.923px rgba(169, 169, 169, 0.25)';

/**
 * Figma puts the `무료` tier beside 이용약관 rather than 구독 관리 in the oldest
 * frame; v3 finally draws it on 구독 관리, and 애플워치 on 웨어러블 연동.
 */
const MENU: MenuItem[] = [
  { label: '웨어러블 연동', icon: 'watch', iconStroke: 1.333, value: '애플워치', href: '/my/wearable' },
  { label: '구독 관리', icon: 'crown', iconStroke: 1.44, value: '무료', href: '/my/subscription' },
  { label: '데이터 개인정보', icon: 'shield', iconStroke: 1.44, href: '/my/privacy' },
  { label: '이용약관', icon: 'doc', iconStroke: 1.44 },
  { label: '도움말', icon: 'question', iconStroke: 1.44 },
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: scale(30.86) }}>
        {/*
          * Everything down to 개발자 커피사주기 sits at Figma's own y, less the
          * 38pt PhoneHeader mock the safe area stands in for.
          */}
        <View style={{ height: scale(293.65) }}>
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(6.99) }}>
            <ButtonBack fallbackHref="/home" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.4),
              top: scale(9.27),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            마이페이지
          </Text>

          <View style={{ position: 'absolute', top: scale(33.157), ...COLUMN }}>
            <ProfileCard nickname={user?.nickname ?? ''} streakDays={user?.streakDays ?? 0} />
          </View>

          <View
            style={{
              position: 'absolute',
              top: scale(81.23),
              ...COLUMN,
              height: scale(MENU_ROW_HEIGHT * MENU.length),
              borderRadius: scale(5.769),
              backgroundColor: COLOR.surface.card,
              boxShadow: SHADOW_V4,
            }}>
            {MENU.map((item, index) => (
              <MenuRow key={item.label} {...item} first={index === 0} />
            ))}
          </View>

          <Pressable style={{ position: 'absolute', top: scale(268.65), ...COLUMN }}>
            <LinearGradient
              colors={[...GRADIENT_PASTEL.colors]}
              locations={[...GRADIENT_PASTEL.locations]}
              start={COFFEE_RAMP.start}
              end={COFFEE_RAMP.end}
              style={{
                height: scale(25),
                borderRadius: scale(9.026),
                boxShadow: BUTTON_SHADOW,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
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
          * against. The bottom padding is v3's 54.7pt gap above the tab bar.
          *
          * Figma centres the line on x=201.7 of 390, 3.6pt right of the frame's middle;
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
