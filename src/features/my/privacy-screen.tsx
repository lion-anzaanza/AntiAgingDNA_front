import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import { useAuth } from '@/lib/auth';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
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

/** Row pitch inside a card, measured off the dividers (192 → 214 → 237). */
const ROW_HEIGHT = 22;

const TEXT = '#2C2C2A';
const HEADING = '#5F5E5B';
const SUBTLE = '#A6A6A6';
const DANGER = '#B21E26';
const TRACK_ON = '#A100FF';
const TRACK_OFF = '#DADADA';
const PILL_BG = '#F8EBFF';

type ToggleKey =
  | 'analysis'
  | 'stats'
  | 'wearable'
  | 'marketing'
  | 'appLock'
  | 'download'
  | 'backup';

type Row = {
  label: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
  /** A switch, a `>` chevron, or a small violet pill. */
  toggle?: ToggleKey;
  chevron?: boolean;
  pill?: string;
  caption?: string;
};

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

/** Figma's own mock numbers — there is no endpoint behind any of the three. */
const STATS = [
  { value: '31일', label: '기록한 날' },
  { value: '13축', label: '분석 항목' },
  { value: '암호화', label: '저장 방식' },
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

/** `Rectangle 3709` — the `#F7F1FF` card that opens the screen. */
function ReassuranceBanner({ nickname }: { nickname: string }) {
  return (
    <View
      style={{
        height: scale(31),
        borderRadius: scale(5),
        backgroundColor: '#F7F1FF',
        borderWidth: scale(0.3),
        borderColor: '#DBDBDB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scale(11),
      }}>
      <Image
        source={require('@/assets/images/my/ic-shield-lock.png')}
        style={{ width: scale(18), height: scale(19) }}
        resizeMode="contain"
      />
      <View style={{ marginLeft: scale(6), flexShrink: 1 }}>
        <Text style={{ fontSize: scale(8), lineHeight: scale(11), color: '#00352C' }}>
          <Text style={{ color: '#6D3CFA' }} className="font-pretendard-bold">
            {nickname}
          </Text>
          <Text className="font-pretendard-bold"> 님의 건강 데이터는 안전해요</Text>
        </Text>
        <Text
          style={{
            fontSize: scale(5),
            lineHeight: scale(9),
            letterSpacing: scale(-0.15),
            color: '#676767',
          }}
          className="font-pretendard">
          모든 기록은 암호화되어 저장되고, 동의 없이 제3자에게 제공되지 않아요.
        </Text>
      </View>
    </View>
  );
}

/** `Rectangle 3825` — three columns split by two 26pt vertical rules. */
function StatStrip() {
  return (
    <View
      style={{
        height: scale(32),
        borderRadius: scale(6),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {STATS.map((stat, index) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            alignItems: 'center',
            borderLeftWidth: index === 0 ? 0 : scale(0.3),
            borderLeftColor: '#DBDBDB',
          }}>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(11), lineHeight: scale(13), letterSpacing: scale(-0.33) }}
            className="font-pretendard-bold">
            {stat.value}
          </GradientText>
          <Text
            style={{
              marginTop: scale(1),
              fontSize: scale(5.5),
              lineHeight: scale(9),
              letterSpacing: scale(-0.165),
              color: '#8C8C8C',
            }}
            className="font-pretendard">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SettingRow({
  row,
  first,
  value,
  onToggle,
}: {
  row: Row;
  first: boolean;
  value: boolean;
  onToggle?: (next: boolean) => void;
}) {
  return (
    <Pressable
      disabled={!row.chevron}
      style={{
        height: scale(ROW_HEIGHT),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(7),
        borderTopWidth: first ? 0 : scale(0.3),
        borderTopColor: '#DBDBDB',
      }}>
      <View style={{ width: scale(21), alignItems: 'center' }}>
        <Image
          source={row.icon}
          style={{ width: scale(row.iconWidth), height: scale(row.iconHeight) }}
          resizeMode="contain"
        />
      </View>
      <Text
        style={{
          marginLeft: scale(5),
          fontSize: scale(7),
          lineHeight: scale(9),
          letterSpacing: scale(-0.21),
          color: TEXT,
        }}
        className="font-pretendard">
        {row.label}
      </Text>
      {row.caption ? (
        <Text
          numberOfLines={1}
          style={{
            marginLeft: scale(6),
            flexShrink: 1,
            fontSize: scale(6),
            lineHeight: scale(9),
            letterSpacing: scale(-0.18),
            color: SUBTLE,
          }}
          className="font-pretendard">
          {row.caption}
        </Text>
      ) : null}

      <View style={{ marginLeft: 'auto' }}>
        {row.toggle ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ true: TRACK_ON, false: TRACK_OFF }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scale: scale(18) / 52 }] }}
          />
        ) : row.pill ? (
          <View
            style={{
              width: scale(18),
              height: scale(10),
              borderRadius: scale(5),
              backgroundColor: PILL_BG,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: scale(5),
                lineHeight: scale(10),
                letterSpacing: scale(-0.05),
                color: TRACK_ON,
              }}
              className="font-pretendard-semibold">
              {row.pill}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              width: scale(18),
              textAlign: 'right',
              fontSize: scale(10),
              lineHeight: scale(18),
              letterSpacing: scale(-0.1),
              color: '#B4B2A8',
            }}
            className="font-pretendard-light">
            &gt;
          </Text>
        )}
      </View>
    </Pressable>
  );
}
