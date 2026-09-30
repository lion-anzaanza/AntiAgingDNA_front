import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { PlanCard } from '@/components/ui/plan-card';
import { ActionRow, ROW_PITCH, type Action } from '@/features/plan/components/action-row';
import { ForecastTeaser } from '@/features/plan/components/forecast-teaser';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v4: 사용자맞춤개선책/메인 — `1363:2935` (was `559:1297`). The 개선책
 * tab's root.
 *
 * Positions are v4's, frame y − 38 for the `PhoneHeader` mock. v4 draws a back
 * chip on this tab root; it is kept with its `/home` fallback (결정 대기 1).
 *
 * Static like every other 개선책 screen — the numbers and the six 오늘의 실천
 * rows are Figma's. Which rows a real user sees is a data question: the section
 * carries a long note listing the full catalogue of actions per 영역, to be
 * surfaced "오늘의 한 가지" against whichever area is lowest that day.
 */
const CONTENT_INSET = 11.28;
const CARD_WIDTH = 197.436;
const COLUMN = {
  paddingLeft: scale(CONTENT_INSET),
  paddingRight: scale(220 - CONTENT_INSET - CARD_WIDTH),
};

const ACTIONS: Action[] = [
  { label: '오전에 물 2잔 이상 마시기', done: true },
  { label: '취침 1시간 전 스마트폰 내려놓기', done: false },
  { label: '햇빛 15분 쬐기 (기분·세로토닌)', done: false },
  { label: '대화 나눈 사람에게 고맙다고 표현하기', done: false },
  { label: '아침식사 챙겨 먹기', done: false },
  { label: '아침식사 챙겨 먹기', done: false },
];

const LINKS: {
  key: string;
  title: string;
  caption: string;
  icon: ImageSourcePropType;
  iconWidth: number;
  iconHeight: number;
  href: '/plan/supplements' | '/plan/report';
}[] = [
  {
    key: 'supplement',
    title: '맞춤 영양제',
    caption: '마그네슘 테아닌 외 2종',
    icon: require('@/assets/images/plan/ic-supplement.png'),
    iconWidth: 24.038,
    iconHeight: 24.038,
    href: '/plan/supplements',
  },
  {
    key: 'report',
    title: '주간 리포트',
    caption: '수면 리듬 +9% 스트레스 회복 +5%',
    icon: require('@/assets/images/plan/ic-report.png'),
    iconWidth: 23.931,
    iconHeight: 22.115,
    href: '/plan/report',
  },
];

/**
 * 오늘의 실천's two bars are drawn as separate pieces, as in Figma — a 4.808
 * pastel fill and a thinner 2.885 track 2.2pt after it — at v4's own x. Their
 * widths (76.6 : 24.1, i.e. 76%) still do not match the 70% beside them.
 */
const FILL = { left: 71.18, width: 76.629, height: 4.808 };
const FILL_RAMP = cssGradientPoints(pastelAngle(FILL.width, FILL.height), FILL.width, FILL.height);
const TRACK = { left: 150, width: 24.083, height: 2.885 };

/** Section heading: v4 Plex Bold 11.282 / 15.795, `text/heading`. */
const SECTION_LINE = 15.795;

export default function PlanMainScreen() {
  const [actions, setActions] = useState(ACTIONS);

  function complete(index: number) {
    setActions((previous) =>
      previous.map((action, i) => (i === index ? { ...action, done: true } : action)),
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: COLOR.surface.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(20) }}>
        {/* Header: v4 y (frame − 38). The teaser starts at 39.88. */}
        <View style={{ height: scale(39.88) }}>
          <View style={{ position: 'absolute', left: scale(CONTENT_INSET), top: scale(5.27) }}>
            <ButtonBack fallbackHref="/(tabs)/home" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(34.45),
              top: scale(11.67 - 18.051 / 2),
              fontSize: scale(13.538),
              lineHeight: scale(18.051),
              letterSpacing: scale(-0.2708),
              color: COLOR.text.strong,
            }}
            className="font-plex-bold">
            맞춤 개선책
          </Text>
          <Text
            style={{
              position: 'absolute',
              left: scale(CONTENT_INSET),
              top: scale(27.38 - 12.41 / 2),
              fontSize: scale(8.462),
              lineHeight: scale(12.41),
              color: COLOR.text.body,
            }}
            className="font-plex">
            내 유전자형에 맞춘 오늘의 처방
          </Text>
        </View>

        <View style={COLUMN}>
          <ForecastTeaser onPress={() => router.push('/plan/forecast')} />
        </View>

        {/* 오늘의 실천 row: teaser bottom 89.88 → card 123.54. */}
        <View style={{ height: scale(33.66) }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(10.91),
              top: scale(108.61 - 89.88 - SECTION_LINE / 2),
              fontSize: scale(11.282),
              lineHeight: scale(SECTION_LINE),
              letterSpacing: scale(-0.1128),
              color: COLOR.text.heading,
            }}
            className="font-plex-bold">
            오늘의 실천
          </Text>
          <LinearGradient
            colors={[...GRADIENT_PASTEL.colors]}
            locations={[...GRADIENT_PASTEL.locations]}
            start={FILL_RAMP.start}
            end={FILL_RAMP.end}
            style={{
              position: 'absolute',
              left: scale(FILL.left),
              top: scale(108.15 - 89.88),
              width: scale(FILL.width),
              height: scale(FILL.height),
              borderRadius: scale(2.885),
              boxShadow: SHADOW_V4,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: scale(TRACK.left),
              top: scale(109.12 - 89.88),
              width: scale(TRACK.width),
              height: scale(TRACK.height),
              borderRadius: scale(2.885),
              backgroundColor: COLOR.surface.track,
              boxShadow: SHADOW_V4,
            }}
          />
          {/*
            * Absolute in its own box, centred on v4's 196.41 — as a flex child
            * the system font scale squeezed it to "70" on a phone (AGENTS rule
            * 14). The box is placed from the screen edge directly, so no parent
            * padding is involved (rule 15).
            */}
          <Text
            style={{
              position: 'absolute',
              left: scale(196.41 - 15),
              top: scale(108.99 - 89.88 - SECTION_LINE / 2),
              width: scale(30),
              textAlign: 'center',
              fontSize: scale(11.282),
              lineHeight: scale(SECTION_LINE),
              letterSpacing: scale(-0.1128),
              color: COLOR.brand.violetText,
            }}
            className="font-plex-bold">
            70%
          </Text>
        </View>

        <View style={COLUMN}>
          <View
            style={{
              // 9.59 above the first box, 9.59 below the last one.
              paddingTop: scale(9.59),
              paddingBottom: scale(9.59 - (ROW_PITCH - 12.41)),
              borderRadius: scale(9.615),
              backgroundColor: COLOR.surface.card,
              boxShadow: SHADOW_V4,
            }}>
            {actions.map((action, index) => (
              <ActionRow
                key={`${action.label}-${index}`}
                action={action}
                onComplete={() => complete(index)}
              />
            ))}
          </View>
        </View>

        {/* Card bottom 262.31 → first link card 291.15. */}
        <View style={{ height: scale(28.84) }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(10.38),
              top: scale(279.04 - 262.31 - SECTION_LINE / 2),
              fontSize: scale(11.282),
              lineHeight: scale(SECTION_LINE),
              letterSpacing: scale(-0.1128),
              color: COLOR.text.heading,
            }}
            className="font-plex-bold">
            더 알아보기
          </Text>
        </View>

        <View style={{ gap: scale(4.816), ...COLUMN }}>
          {LINKS.map((link) => (
            <PlanCard
              key={link.key}
              layout="link"
              title={link.title}
              caption={link.caption}
              icon={link.icon}
              iconWidth={link.iconWidth}
              iconHeight={link.iconHeight}
              arrow
              onPress={() => router.push(link.href)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
