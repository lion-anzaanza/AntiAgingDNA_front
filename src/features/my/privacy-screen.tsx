import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { ReassuranceBanner } from '@/features/my/components/reassurance-banner';
import { SettingRow, type Row, type ToggleKey } from '@/features/my/components/setting-row';
import { StatStrip } from '@/features/my/components/stat-strip';
import { useAuth } from '@/lib/auth';
import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 마이페이지/데이터 개인정보 — `583:913`. Until 2026-08-17 this frame was
 * an undesigned repeat of the 마이페이지 menu; it is now a full screen and this
 * is the port of it.
 *
 * **Nothing here is wired.** The API has no endpoint for any of it — consent
 * flags, app lock, password change, paired devices, data export, backup or the
 * reset (backlog 24 covers the whole 마이페이지 domain). The toggles keep local
 * state so the screen is not dead to the touch, and they reset on unmount.
 *
 * Two slips reproduced rather than corrected, both worth a designer's eye:
 *
 * - **The second section header reads `개인정보 활용` again**, though its rows are
 *   앱 잠금 · 비밀번호 변경 · 연결된 기기. `보안` is what it looks like it wants.
 * - **Four rows share one icon** (`ic-analysis`, the shield-and-person): 맞춤
 *   분석, 내 데이터 다운로드, 개인정보처리방침 and 기록 전체 초기화. 앱 잠금
 *   (생체인증) meanwhile gets a download arrow. These read as placeholders.
 */
const CONTENT_INSET = 17;
const CARD_WIDTH = 184;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

const HEADING = '#5F5E5B';
const DANGER = '#B21E26';

const SECTIONS: { heading: string; danger?: boolean; rows: Row[] }[] = [
  {
    heading: '개인정보 활용',
    rows: [
      {
        label: '맞춤 분석에 데이터 사용',
        icon: require('@/assets/images/my/ic-analysis.png'),
        iconWidth: 14,
        iconHeight: 13,
        toggle: 'analysis',
      },
      {
        label: '익명 통계 활용 동의',
        icon: require('@/assets/images/my/ic-stats.png'),
        iconWidth: 14,
        iconHeight: 15,
        toggle: 'stats',
      },
      {
        label: '웨어러블 데이터 수집',
        icon: require('@/assets/images/my/ic-watch-data.png'),
        iconWidth: 12,
        iconHeight: 15,
        toggle: 'wearable',
      },
      {
        label: '마케팅 정보 수신',
        icon: require('@/assets/images/my/ic-bell.png'),
        iconWidth: 14,
        iconHeight: 12,
        toggle: 'marketing',
      },
    ],
  },
  {
    // Figma repeats 개인정보 활용 here; see the note above.
    heading: '개인정보 활용',
    rows: [
      {
        label: '앱 잠금 (생체인증)',
        icon: require('@/assets/images/my/ic-biometric.png'),
        iconWidth: 12,
        iconHeight: 12,
        toggle: 'appLock',
      },
      {
        label: '비밀번호 변경',
        icon: require('@/assets/images/my/ic-password.png'),
        iconWidth: 13,
        iconHeight: 14,
        chevron: true,
      },
      {
        label: '연결된 기기',
        icon: require('@/assets/images/my/ic-devices.png'),
        iconWidth: 10,
        iconHeight: 13,
        pill: '2대',
      },
    ],
  },
  {
    heading: '내 데이터 관리',
    rows: [
      {
        label: '내 데이터 다운로드',
        icon: require('@/assets/images/my/ic-analysis.png'),
        iconWidth: 14,
        iconHeight: 13,
        toggle: 'download',
      },
      {
        label: '백업 동기화',
        icon: require('@/assets/images/my/ic-sync.png'),
        iconWidth: 14,
        iconHeight: 12,
        chevron: true,
        caption: '마지막 백업 · 오늘 09:12',
      },
      {
        label: '개인정보처리방침',
        icon: require('@/assets/images/my/ic-analysis.png'),
        iconWidth: 14,
        iconHeight: 13,
        pill: '2대',
      },
    ],
  },
  {
    heading: '위험',
    danger: true,
    rows: [
      {
        label: '기록 전체 초기화',
        icon: require('@/assets/images/my/ic-analysis.png'),
        iconWidth: 14,
        iconHeight: 13,
        chevron: true,
        caption: '모든 일지·분석 삭제 (복구 불가)',
      },
    ],
  },
];

const DEFAULT_TOGGLES: Record<ToggleKey, boolean> = {
  analysis: true,
  stats: true,
  wearable: true,
  marketing: false,
  appLock: true,
  download: true,
  backup: false,
};

export default function PrivacyScreen() {
  const { user } = useAuth();
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(6), paddingBottom: scale(24) }}>
        <View style={{ height: scale(22), flexDirection: 'row', alignItems: 'center', ...COLUMN }}>
          <ButtonBack fallbackHref="/my" />
          <Text
            style={{
              marginLeft: scale(9),
              fontSize: scale(12),
              lineHeight: scale(15),
              color: '#000000',
            }}
            className="font-pretendard-extrabold">
            데이터 개인정보
          </Text>
        </View>

        <View style={{ marginTop: scale(14), ...COLUMN }}>
          <ReassuranceBanner nickname={user?.nickname ?? ''} />
        </View>

        <View style={{ marginTop: scale(9), ...COLUMN }}>
          <StatStrip />
        </View>

        {SECTIONS.map((section, index) => (
          <View key={`${section.heading}-${index}`} style={{ marginTop: scale(18), ...COLUMN }}>
            <Text
              style={{
                fontSize: scale(6),
                lineHeight: scale(9),
                letterSpacing: scale(-0.18),
                color: section.danger ? DANGER : HEADING,
              }}
              className="font-pretendard-medium">
              {section.heading}
            </Text>
            <View
              style={{
                marginTop: scale(9),
                borderRadius: scale(6),
                backgroundColor: '#FFFFFF',
                boxShadow: SHADOW,
              }}>
              {section.rows.map((row, rowIndex) => (
                <SettingRow
                  key={row.label}
                  row={row}
                  first={rowIndex === 0}
                  value={row.toggle ? toggles[row.toggle] : false}
                  onToggle={
                    row.toggle
                      ? (next) =>
                          setToggles((previous) => ({ ...previous, [row.toggle!]: next }))
                      : undefined
                  }
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
