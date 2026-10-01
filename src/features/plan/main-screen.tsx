import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { type IconName } from '@/components/ui/icon';
import { PlanCard } from '@/components/ui/plan-card';
import { ActionRow, type Action } from '@/features/plan/components/action-row';
import { ForecastTeaser } from '@/features/plan/components/forecast-teaser';
import { COLOR, GRADIENT_PROGRESS, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/**
 * Figma v3: 사용자맞춤개선책/메인 — `1318:1533` (v4 `1363:2935`, first `559:1297`).
 * The 개선책 tab's root.
 *
 * Positions are v3's ×220/390, then − 38 for the old `PhoneHeader` mock — the
 * offset every screen in this port is measured against. v3 draws a back chip on
 * this tab root; it is kept with its `/home` fallback (v4 결정 대기 1).
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
  { label: '채소·과일 3회 이상 먹기', done: false },
];

const LINKS: {
  key: string;
  title: string;
  caption: string;
  icon: IconName;
  href: '/plan/supplements' | '/plan/report';
}[] = [
  {
    key: 'supplement',
    title: '맞춤 영양제',
    caption: '마그네슘 테아닌 외 2종',
    icon: 'pill',
    href: '/plan/supplements',
  },
  {
    key: 'report',
    title: '주간 리포트',
    caption: '수면 리듬 +9% 스트레스 회복 +5%',
    icon: 'report',
    href: '/plan/report',
  },
];

/**
 * 오늘의 실천's two bars are drawn as separate pieces, as in Figma — a 4.808
 * fill in v3's progress ramp and a thinner 2.885 track 2.2pt after it. Their
 * widths (76.6 : 24.1, i.e. 76%) still do not match the 70% beside them.
 */
const FILL = { left: 71.18, width: 76.629, height: 4.808 };
const FILL_RAMP = cssGradientPoints(pastelAngle(FILL.width, FILL.height), FILL.width, FILL.height);
const TRACK = { left: 150, width: 24.083, height: 2.885 };

/** Section heading: v3 Plex Bold 20 / 28 (11.282 / 15.795), `text/heading`. */
const SECTION_LINE = 15.795;

/** 실천 card: six rows 27.077 apart, the first box 11.846 below the top and the last as far above the bottom. */
const ACTION_CARD_HEIGHT = 172.615;
const ACTION_CARD_PADDING = 11.846;

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
        {/* Header: the teaser starts at 39.89. */}
        <View style={{ height: scale(39.886) }}>
          <View style={{ position: 'absolute', left: scale(9.026), top: scale(0.246) }}>
            <ButtonBack fallbackHref="/(tabs)/home" />
          </View>
          <Text
            style={{
              position: 'absolute',
              left: scale(35.397),
              top: scale(11.196 - 18.051 / 2),
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
              top: scale(27.086 - 12.41 / 2),
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

        {/* 오늘의 실천 row: teaser bottom 89.89 → card 123.54. */}
        <View style={{ height: scale(33.654) }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(10.91),
              top: scale(19.614 - SECTION_LINE / 2),
              fontSize: scale(11.282),
              lineHeight: scale(SECTION_LINE),
              letterSpacing: scale(-0.1128),
              color: COLOR.text.heading,
            }}
            className="font-plex-bold">
            오늘의 실천
          </Text>
          <LinearGradient
            colors={[...GRADIENT_PROGRESS.colors]}
            locations={[...GRADIENT_PROGRESS.locations]}
            start={FILL_RAMP.start}
            end={FILL_RAMP.end}
            style={{
              position: 'absolute',
              left: scale(FILL.left),
              top: scale(18.264),
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
              top: scale(19.234),
              width: scale(TRACK.width),
              height: scale(TRACK.height),
              borderRadius: scale(2.885),
              backgroundColor: COLOR.surface.track,
              boxShadow: SHADOW_V4,
            }}
          />
          {/*
            * Absolute in its own box, centred on v3's 196.32 — as a flex child
            * the system font scale squeezed it to "70" on a phone (AGENTS rule
            * 14). The box is placed from the screen edge directly, so no parent
            * padding is involved (rule 15).
            */}
          <Text
            style={{
              position: 'absolute',
              left: scale(196.32 - 15),
              top: scale(20.004 - SECTION_LINE / 2),
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
              height: scale(ACTION_CARD_HEIGHT),
              paddingTop: scale(ACTION_CARD_PADDING),
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

        {/* Card bottom 296.16 → first link card 325.0. */}
        <View style={{ height: scale(28.85) }}>
          <Text
            style={{
              position: 'absolute',
              left: scale(10.38),
              top: scale(17.64 - SECTION_LINE / 2),
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
              arrow
              onPress={() => router.push(link.href)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
