import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { BANNER_HEIGHT, ReassuranceBanner } from '@/features/my/components/reassurance-banner';
import { SettingRow, type Row, type ToggleKey } from '@/features/my/components/setting-row';
import { STAT_STRIP_HEIGHT, StatStrip } from '@/features/my/components/stat-strip';
import { useAuth } from '@/lib/auth';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 마이페이지/데이터개인정보 (`1363:3364`).
 *
 * **Nothing here is wired.** The API has no endpoint for any of it — consent
 * flags, app lock, password change, paired devices, data export, backup or the
 * reset (backlog 24 covers the whole 마이페이지 domain). The toggles keep local
 * state so the screen is not dead to the touch, and they reset on unmount.
 *
 * Slips v4 carries over from the older frame, reproduced rather than corrected
 * and worth a designer's eye:
 *
 * - **The second section header reads `개인정보 활용` again**, though its rows are
 *   앱 잠금 · 비밀번호 변경 · 연결된 기기. `보안` is what it looks like it wants.
 * - **Four rows share one icon** (`ic-analysis`, the shield-and-person): 맞춤
 *   분석, 내 데이터 다운로드, 개인정보처리방침 and 기록 전체 초기화. 앱 잠금
 *   (생체인증) meanwhile gets a download arrow. These read as placeholders.
 * - **개인정보처리방침 carries the `2대` pill** of the row above it.
 *
 * One slip corrected: v4 draws the 위험 row's icon 3pt left, its label 2.8pt
 * left and its `>` 5.2pt left of every other row's. It is aligned with them.
 *
 * Every element sits at Figma's own y less the 38pt PhoneHeader mock.
 */
const COLUMN = { left: scale(11.28), width: scale(197.436) };

/** Row bands, read off each card's dividers — the menu card's rhythm again. */
const ROW_HEIGHTS = [21.15, 21.16, 22.11, 21.157];

const ANALYSIS_ICON = {
  icon: require('@/assets/images/my/ic-analysis.png'),
  iconWidth: 13.235,
  iconHeight: 12.5,
};

type Section = { heading: string; headingTop: number; cardTop: number; danger?: boolean; rows: Row[] };

const SECTIONS: Section[] = [
  {
    heading: '개인정보 활용',
    headingTop: 126.27,
    cardTop: 139.75,
    rows: [
      { label: '맞춤 분석에 데이터 사용', ...ANALYSIS_ICON, iconTop: 4.81, toggle: 'analysis' },
      {
        label: '익명 통계 활용 동의',
        icon: require('@/assets/images/my/ic-stats.png'),
        iconWidth: 12.821,
        iconHeight: 14.423,
        iconTop: 3.85,
        toggle: 'stats',
      },
      {
        label: '웨어러블 데이터 수집',
        icon: require('@/assets/images/my/ic-watch-data.png'),
        iconWidth: 11.387,
        iconHeight: 14.423,
        iconTop: 3.84,
        toggle: 'wearable',
      },
      {
        label: '마케팅 정보 수신',
        icon: require('@/assets/images/my/ic-bell.png'),
        iconWidth: 12.896,
        iconHeight: 11.538,
        iconTop: 3.85,
        toggle: 'marketing',
      },
    ],
  },
  {
    // Figma repeats 개인정보 활용 here; see the note above.
    heading: '개인정보 활용',
    headingTop: 235.78,
    cardTop: 248.4,
    rows: [
      {
        label: '앱 잠금 (생체인증)',
        icon: require('@/assets/images/my/ic-biometric.png'),
        iconWidth: 11.842,
        iconHeight: 11.538,
        iconTop: 5.77,
        toggle: 'appLock',
      },
      {
        label: '비밀번호 변경',
        icon: require('@/assets/images/my/ic-password.png'),
        iconWidth: 12.944,
        iconHeight: 13.462,
        iconTop: 3.85,
        chevron: true,
      },
      {
        label: '연결된 기기',
        icon: require('@/assets/images/my/ic-devices.png'),
        iconWidth: 9.75,
        iconHeight: 12.5,
        iconTop: 3.84,
        pill: '2대',
      },
    ],
  },
  {
    heading: '내 데이터 관리',
    headingTop: 325.39,
    cardTop: 337.82,
    rows: [
      { label: '내 데이터 다운로드', ...ANALYSIS_ICON, iconTop: 4.81, toggle: 'download' },
      {
        label: '백업 동기화',
        icon: require('@/assets/images/my/ic-sync.png'),
        iconWidth: 13.417,
        iconHeight: 11.538,
        iconTop: 4.81,
        chevron: true,
        caption: '마지막 백업 · 오늘 09:12',
        captionLeft: 75.71,
      },
      { label: '개인정보처리방침', ...ANALYSIS_ICON, iconTop: 3.84, pill: '2대' },
    ],
  },
  {
    heading: '위험',
    headingTop: 413.74,
    cardTop: 426.29,
    danger: true,
    rows: [
      {
        label: '기록 전체 초기화',
        ...ANALYSIS_ICON,
        iconTop: 4.8,
        chevron: true,
        caption: '모든 일지·분석 삭제 (복구 불가)',
        captionLeft: 82.81,
      },
    ],
  },
];

/** v4's `Error 600` — a bare hex on the 위험 heading, not a `LifeDNA 색상` token. */
const DANGER = '#B21E26';

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
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(24) }}>
        <View style={{ height: scale(447.44) }}>
          <View style={{ position: 'absolute', left: scale(11.28), top: scale(12) }}>
            <ButtonBack fallbackHref="/my" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.39),
              top: scale(9.42),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            데이터 개인정보
          </Text>

          <View style={{ position: 'absolute', top: scale(33.15), height: scale(BANNER_HEIGHT), ...COLUMN }}>
            <ReassuranceBanner nickname={user?.nickname ?? ''} />
          </View>

          <View style={{ position: 'absolute', top: scale(85.04), height: scale(STAT_STRIP_HEIGHT), ...COLUMN }}>
            <StatStrip />
          </View>

          {SECTIONS.map((section, index) => (
            <View key={`${section.heading}-${index}`}>
              <Text
                style={{
                  position: 'absolute',
                  left: scale(11.28),
                  top: scale(section.headingTop),
                  fontSize: scale(8.462),
                  lineHeight: scale(12.41),
                  color: section.danger ? DANGER : COLOR.text.body,
                }}
                className="font-plex">
                {section.heading}
              </Text>
              <View
                style={{
                  position: 'absolute',
                  top: scale(section.cardTop),
                  ...COLUMN,
                  borderRadius: scale(5.769),
                  backgroundColor: COLOR.surface.card,
                  boxShadow: SHADOW_V4,
                }}>
                {section.rows.map((row, rowIndex) => (
                  <SettingRow
                    key={row.label}
                    row={row}
                    height={ROW_HEIGHTS[rowIndex]}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
