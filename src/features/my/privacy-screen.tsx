import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { BANNER_HEIGHT, ReassuranceBanner } from '@/features/my/components/reassurance-banner';
import { SettingRow, type Row, type ToggleKey } from '@/features/my/components/setting-row';
import { STAT_STRIP_HEIGHT, StatStrip } from '@/features/my/components/stat-strip';
import { useAuth } from '@/lib/auth';
import { addDays } from '@/lib/dates';
import { type DiaryRow } from '@/lib/diary-request';
import { RECORD_WINDOW_DAYS, recordedDaysLabel } from '@/lib/facts';
import { diariesPath } from '@/lib/score';
import { useApiQuery } from '@/lib/use-api-query';
import { COLOR, SHADOW_V4 } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 마이페이지/데이터개인정보 (`1318:1975`).
 *
 * **Nothing here is wired.** The API has no endpoint for any of it — consent
 * flags, app lock, password change, paired devices, data export, backup or the
 * reset (backlog 24 covers the whole 마이페이지 domain). The toggles keep local
 * state so the screen is not dead to the touch, and they reset on unmount.
 *
 * v3 fixed the slips v4 carried over: the second section is titled `보안`, every
 * row has its own `Icon/*`, 내 데이터 다운로드 and 개인정보처리방침 end in a
 * chevron instead of a switch and a stray `2대` pill, and the 위험 row lost its
 * caption. Rows are 48pt now, with 44×26 `brand/accent` switches.
 *
 * Every element sits at Figma's own y (×220/390) less the 38pt PhoneHeader mock.
 */
const V3 = 220 / 390;
const at = (v3Points: number) => scale(v3Points * V3);
/** v3 y → this screen's y: ×220/390, less the 38pt (220) PhoneHeader mock. */
const y = (v3Points: number) => scale(v3Points * V3 - 38);

const COLUMN = { left: at(20), width: at(350) };

type Section = {
  heading: string;
  headingCentre: number;
  cardTop: number;
  cardHeight: number;
  dividers: number[];
  danger?: boolean;
  rows: Row[];
};

const SECTIONS: Section[] = [
  {
    heading: '개인정보 활용',
    headingCentre: 301.67,
    cardTop: 315.1,
    cardHeight: 193,
    dividers: [47, 95, 145],
    rows: [
      { label: '맞춤 분석에 데이터 사용', icon: 'shield', iconTop: 14, labelCentre: 25, toggle: { key: 'analysis', top: 13 } },
      { label: '익명 통계 활용 동의', icon: 'chart', iconTop: 62, labelCentre: 74, toggle: { key: 'stats', top: 61 } },
      { label: '웨어러블 데이터 수집', icon: 'watch', iconTop: 110, labelCentre: 122, toggle: { key: 'wearable', top: 109 } },
      { label: '마케팅 정보 수신', icon: 'bell', iconTop: 158, labelCentre: 170, toggle: { key: 'marketing', top: 157 } },
    ],
  },
  {
    heading: '보안',
    headingCentre: 536.81,
    cardTop: 548.71,
    cardHeight: 147,
    dividers: [48, 97],
    rows: [
      { label: '앱 잠금 (생체인증)', icon: 'faceid', iconTop: 15, labelCentre: 27, toggle: { key: 'appLock', top: 14 } },
      { label: '비밀번호 변경', icon: 'lock', iconTop: 63, labelCentre: 74, chevronTop: 65 },
      { label: '연결된 기기', icon: 'phone', iconTop: 111, labelCentre: 122, pill: { text: '—', top: 114 } },
    ],
  },
  {
    heading: '내 데이터 관리',
    headingCentre: 728.66,
    cardTop: 740.23,
    cardHeight: 147,
    dividers: [48, 97],
    rows: [
      { label: '내 데이터 다운로드', icon: 'download', iconTop: 15, labelCentre: 26, chevronTop: 17 },
      {
        label: '백업 동기화',
        icon: 'sync',
        iconTop: 63,
        labelCentre: 74,
        chevronTop: 65,
        // No backup exists to have a time (backlog 24).
        caption: '마지막 백업 · —',
      },
      { label: '개인정보처리방침', icon: 'doc', iconTop: 111, labelCentre: 122, chevronTop: 113 },
    ],
  },
  {
    heading: '위험',
    headingCentre: 918.28,
    cardTop: 930.05,
    cardHeight: 48,
    // v3 draws one rule along the card's bottom edge.
    dividers: [48],
    danger: true,
    rows: [{ label: '기록 전체 초기화', icon: 'trash', iconTop: 12, labelCentre: 24, chevronTop: 14 }],
  },
];

/** v3's `Error 600` — a bare hex on the 위험 heading, not a `LifeDNA 색상` token. */
const DANGER = '#B21E26';

const DEFAULT_TOGGLES: Record<ToggleKey, boolean> = {
  analysis: true,
  stats: true,
  wearable: true,
  marketing: false,
  appLock: true,
};

export default function PrivacyScreen() {
  const { user } = useAuth();
  // 기록한 날: every diary in the widest window the API allows (366 days),
  // read once per visit. A year of full rows to take `.length` is wasteful —
  // backlog 46 asks for the count itself.
  const today = new Date();
  const diaries = useApiQuery<DiaryRow[]>(
    diariesPath(addDays(today, -(RECORD_WINDOW_DAYS - 1)), today),
    { refetchOnFocus: false },
  );
  const recordedDays = diaries.data ? recordedDaysLabel(diaries.data.length) : '—';
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      {/* v3 leaves 32pt (18 at 220) under the 위험 card. */}
      <ScrollView contentContainerStyle={{ paddingBottom: at(32) }}>
        <View style={{ height: y(978.05) }}>
          <View style={{ position: 'absolute', left: at(16), top: y(79.75) }}>
            <ButtonBack fallbackHref="/my" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: at(62.63),
              top: y(99.22 - 16),
              fontSize: at(24),
              lineHeight: at(32),
              letterSpacing: at(-0.48),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            데이터 개인정보
          </Text>

          <View style={{ position: 'absolute', top: y(126.14), height: scale(BANNER_HEIGHT), ...COLUMN }}>
            <ReassuranceBanner nickname={user?.nickname ?? ''} />
          </View>

          <View style={{ position: 'absolute', top: y(218.11), height: scale(STAT_STRIP_HEIGHT), ...COLUMN }}>
            <StatStrip recordedDays={recordedDays} />
          </View>

          {SECTIONS.map((section) => (
            <View key={section.heading}>
              <Text
                style={{
                  position: 'absolute',
                  left: at(19.3),
                  top: y(section.headingCentre - 11),
                  fontSize: at(15),
                  lineHeight: at(22),
                  color: section.danger ? DANGER : COLOR.text.body,
                }}
                className="font-plex">
                {section.heading}
              </Text>
              <View
                style={{
                  position: 'absolute',
                  top: y(section.cardTop),
                  height: at(section.cardHeight),
                  ...COLUMN,
                  borderRadius: scale(5.769),
                  backgroundColor: COLOR.surface.card,
                  boxShadow: SHADOW_V4,
                }}>
                {section.dividers.map((divider) => (
                  <View
                    key={divider}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: at(divider) - scale(0.144),
                      height: scale(0.288),
                      backgroundColor: COLOR.border.soft,
                    }}
                  />
                ))}
                {section.rows.map((row) => (
                  <SettingRow
                    key={row.label}
                    row={row}
                    value={row.toggle ? toggles[row.toggle.key] : false}
                    onToggle={
                      row.toggle
                        ? (next) =>
                            setToggles((previous) => ({ ...previous, [row.toggle!.key]: next }))
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
