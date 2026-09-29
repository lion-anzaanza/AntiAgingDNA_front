import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import { PlanCard } from '@/components/ui/plan-card';
import { ActionRow, type Action } from '@/features/plan/components/action-row';
import { ForecastTeaser } from '@/features/plan/components/forecast-teaser';
import { GRADIENT_BRAND, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: 사용자맞춤개선책/메인 — `559:1297`. The 개선책 tab's root, and the first
 * screen of 05_사용자_맞춤_개선책.
 *
 * Static like every other screen — the numbers and the six 오늘의 실천 rows are
 * Figma's. Which rows a real user sees is a data question: the section carries a
 * long note listing the full catalogue of actions per 영역, to be surfaced
 * "오늘의 한 가지" against whichever area is lowest that day.
 */
const CONTENT_INSET = 18;
const CARD_WIDTH = 184;
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
  iconHeight: number;
  href?: string;
}[] = [
  {
    key: 'supplement',
    title: '맞춤 영양제',
    caption: '마그네슘 테아닌 외 2종',
    icon: require('@/assets/images/plan/ic-supplement.png'),
    iconHeight: 25,
    href: '/plan/supplements',
  },
  {
    key: 'report',
    title: '주간 리포트',
    caption: '수면 리듬 +9% 스트레스 회복 +5%',
    icon: require('@/assets/images/plan/ic-report.png'),
    iconHeight: 23,
    href: '/plan/report',
  },
];

export default function PlanMainScreen() {
  const [actions, setActions] = useState(ACTIONS);

  function complete(index: number) {
    setActions((previous) =>
      previous.map((action, i) => (i === index ? { ...action, done: true } : action)),
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(7), paddingBottom: scale(40) }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', ...COLUMN }}>
          <ButtonBack fallbackHref="/home" />
          <View style={{ marginLeft: scale(9) }}>
            <Text
              style={{ fontSize: scale(12), lineHeight: scale(15), color: '#000000' }}
              className="font-pretendard-extrabold">
              맞춤 개선책
            </Text>
            <Text
              style={{
                marginTop: scale(3),
                fontSize: scale(7),
                lineHeight: scale(10),
                color: '#696969',
              }}
              className="font-pretendard">
              내 유전자형에 맞춘 오늘의 처방
            </Text>
          </View>
        </View>

        <View style={{ marginTop: scale(8), ...COLUMN }}>
          <ForecastTeaser onPress={() => router.push('/plan/forecast')} />
        </View>

        <View style={{ marginTop: scale(13), flexDirection: 'row', alignItems: 'center', ...COLUMN }}>
          <Text
            style={{ fontSize: scale(10), lineHeight: scale(15), color: '#00352C' }}
            className="font-pretendard-bold">
            오늘의 실천
          </Text>
          {/*
           * Figma draws the two halves as separate bars rather than a track with
           * a fill — different heights (5 vs 3) and a 2pt gap between them — so
           * they are reproduced as drawn. Note the widths (70 : 22) do not work
           * out to the 70% beside them.
           */}
          <LinearGradient
            colors={['#4056F6', '#853EF6']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: scale(70),
              height: scale(5),
              marginLeft: scale(15),
              borderRadius: scale(3),
              boxShadow: SHADOW,
            }}
          />
          <View
            style={{
              width: scale(22),
              height: scale(3),
              marginLeft: scale(2),
              borderRadius: scale(3),
              backgroundColor: '#D3D1C6',
              boxShadow: SHADOW,
            }}
          />
          {/*
            * Figma places the percentage absolutely in its own 30pt box rather
            * than at the end of the row, and that turns out to matter: as a flex
            * child it competes with the label and the bars for a fixed 184pt,
            * and a device with the system font scale turned up dropped the last
            * glyph — a phone at 1.1 rendered "70" instead of "70%". Absolute,
            * like the design, it cannot be squeezed.
            *
            * `right` has to repeat the column's own right padding: an absolutely
            * positioned child is inset from its parent's *border* box, not from
            * the padding box, so `right: 0` parked the box at 190..220 when
            * Figma puts it at 172..202 — hard against the screen edge and out of
            * the card's column.
            */}
          <View
            style={{
              position: 'absolute',
              right: COLUMN.paddingRight,
              top: 0,
              bottom: 0,
              width: scale(30),
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
            <GradientText
              colors={[...GRADIENT_BRAND]}
              style={{ fontSize: scale(10), lineHeight: scale(15) }}
              className="font-pretendard-black">
              70%
            </GradientText>
          </View>
        </View>

        <View style={{ marginTop: scale(7.5), ...COLUMN }}>
          <View
            style={{
              // Was a fixed 129, which is exactly 9 + 6 rows of 20 — so any row
              // that grows (a longer label wrapping, a larger system font) is
              // clipped rather than making the card taller.
              minHeight: scale(129),
              borderRadius: scale(10),
              backgroundColor: '#FFFFFF',
              boxShadow: SHADOW,
              paddingTop: scale(9),
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

        <Text
          style={{
            marginTop: scale(10),
            fontSize: scale(10),
            lineHeight: scale(15),
            color: '#00352C',
            ...COLUMN,
          }}
          className="font-pretendard-bold">
          더 알아보기
        </Text>

        <View style={{ marginTop: scale(5), gap: scale(5), ...COLUMN }}>
          {LINKS.map((link) => (
            <PlanCard
              key={link.key}
              title={link.title}
              caption={link.caption}
              icon={link.icon}
              iconHeight={link.iconHeight}
              width={184}
              tileInset={13}
              arrow
              onPress={link.href ? () => router.push(link.href as never) : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
