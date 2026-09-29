import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { MenuRow, type MenuItem } from '@/features/my/components/menu-row';
import { ProfileCard } from '@/features/my/components/profile-card';
import { messageFor } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 06_마이페이지 `Frame 28` (`583:969`) — the MY tab's root.
 *
 * Only two of the section's four frames are actually designed. 데이터 개인정보
 * (`583:913`) repeats this menu under a different title and 구독관리
 * (`585:1399`) is a title over an empty 184×160 box, so neither is built; the
 * rows that would open them do nothing. 웨어러블 연동 (`583:862`) is real.
 *
 * The five icons are one screenshot sheet in Figma, cropped per row — cut into
 * `assets/images/my/ic-*.png` the same way the 만족도 faces were.
 */
const CONTENT_INSET = 17;
const CARD_WIDTH = 184;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

/**
 * Figma puts the `무료` tier beside 이용약관 rather than 구독 관리, while the
 * icons stay with their labels. The sibling frame (`583:913`) shows the same
 * values against a different label order, which is what gives it away — a tier
 * belongs to the subscription row, so it is placed there.
 */
const MENU: MenuItem[] = [
  {
    label: '웨어러블 연동',
    icon: require('@/assets/images/my/ic-wearable.png'),
    iconWidth: 12,
    iconHeight: 15,
    value: '애플워치',
    href: '/my/wearable',
  },
  {
    label: '구독 관리',
    icon: require('@/assets/images/my/ic-subscription.png'),
    iconWidth: 14,
    iconHeight: 14,
    value: '무료',
    href: '/my/subscription',
  },
  {
    label: '데이터 개인정보',
    icon: require('@/assets/images/my/ic-privacy.png'),
    iconWidth: 14,
    iconHeight: 13,
    href: '/my/privacy',
  },
  {
    label: '이용약관',
    icon: require('@/assets/images/my/ic-terms.png'),
    iconWidth: 14,
    iconHeight: 12,
  },
  {
    label: '도움말',
    icon: require('@/assets/images/my/ic-help.png'),
    iconWidth: 14,
    iconHeight: 15,
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
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: scale(14),
          paddingBottom: scale(24),
        }}>
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center', ...COLUMN }}>
          <ButtonBack fallbackHref="/home" />
          <Text
            style={{
              marginLeft: scale(9),
              fontSize: scale(12),
              lineHeight: scale(15),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            마이페이지
          </Text>
        </View>

        <View style={{ marginTop: scale(4), ...COLUMN }}>
          <ProfileCard nickname={user?.nickname ?? ''} streakDays={user?.streakDays ?? 0} />
        </View>

        <View style={{ marginTop: scale(10), ...COLUMN }}>
          <View
            style={{
              height: scale(111),
              borderRadius: scale(6),
              backgroundColor: '#FFFFFF',
              boxShadow: SHADOW,
            }}>
            {MENU.map((item, index) => (
              <MenuRow key={item.label} {...item} first={index === 0} />
            ))}
          </View>
        </View>

        <View style={{ marginTop: scale(10), ...COLUMN }}>
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
                className="font-pretendard-bold">
                개발자 커피사주기
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/*
          * Figma draws this as one line, so the two halves are separate press
          * targets inside it rather than two rows.
          */}
      {/*
        * Figma pushes this to the bottom with a fixed gap measured on its 480pt
        * frame, but `scale()` converts by *width* — so on a device with a
        * different aspect ratio the gap lands somewhere else and the screen
        * either scrolls or leaves a hole. A flexible spacer pins it to the
        * bottom of the viewport instead, which is what the design means, and
        * `flexGrow: 1` on the content container is what gives it room to push
        * against.
        */}
      <View style={{ flex: 1, minHeight: scale(24) }} />
        <Text
          style={{
            textAlign: 'center',
            fontSize: scale(6),
            lineHeight: scale(18),
            letterSpacing: scale(-0.06),
            color: '#88877F',
          }}
          className="font-pretendard">
          <Text onPress={signOut}>로그아웃</Text>
          {' | '}
          <Text onPress={confirmDelete}>회원탈퇴</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
