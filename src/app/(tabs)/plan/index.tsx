import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ButtonBack } from '@/components/ui/button-back';
import { GradientText } from '@/components/ui/gradient-text';
import { PlanCard } from '@/components/ui/plan-card';
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

/**
 * 맞춤 영양제 / 주간 리포트 / 한 달 뒤 내 모습 are the section's other three
 * screens; these cards and the forecast teaser are inert until those land.
 */

/**
 * A row is either still open — a `#E9F0FF` 완료! button — or done, which greys
 * and strikes the label and swaps the button for a mint check.
 */
type Action = { label: string; done: boolean };

const ACTIONS: Action[] = [
  { label: '오전에 물 2잔 이상 마시기', done: true },
  { label: '취침 1시간 전 스마트폰 내려놓기', done: false },
  { label: '햇빛 15분 쬐기 (기분·세로토닌)', done: false },
  { label: '대화 나눈 사람에게 고맙다고 표현하기', done: false },
  { label: '아침식사 챙겨 먹기', done: false },
  { label: '아침식사 챙겨 먹기', done: false },
];

/** Row pitch inside the 오늘의 실천 card, measured off the chips. */
const ROW_PITCH = 20;
const CHIP_WIDTH = 25;
const CHIP_HEIGHT = 13;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: scale(7), paddingBottom: scale(24) }}>
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
          <ForecastTeaser />
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
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{
              marginLeft: 'auto',
              fontSize: scale(10),
              lineHeight: scale(15),
            }}
            className="font-pretendard-black">
            70%
          </GradientText>
        </View>

        <View style={{ marginTop: scale(7.5), ...COLUMN }}>
          <View
            style={{
              height: scale(129),
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

/**
 * `Frame 33` (`677:1083`) — the locked forecast. The orb is deliberately
 * unreadable: a grey "?" sits over it and the score reads `??`, because the
 * forecast itself lives behind 한 달 뒤 내 모습.
 */
function ForecastTeaser() {
  return (
    <Pressable>
      <LinearGradient
        colors={['#FDF0FF', '#FFFFFF']}
        locations={[0.234, 0.984]}
        /*
         * Figma states 151.2°, but converting that angle through the card's
         * 184×52 aspect gives a near-vertical ramp, which is not what the file
         * renders. Taken from the export's own corners instead: pink at the top
         * left, white at the bottom right, and more horizontal than diagonal.
         */
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={{
          height: scale(52),
          borderRadius: scale(10),
          boxShadow: SHADOW,
          overflow: 'hidden',
        }}>
        {/* The bitmap overhangs its 37.3×35 box — the glow — so it is drawn larger. */}
        <Image
          source={require('@/assets/images/plan/orb-unknown.png')}
          style={{
            position: 'absolute',
            left: scale(13.06),
            top: scale(2.0),
            width: scale(57.157),
            height: scale(55),
          }}
          resizeMode="stretch"
        />
        {SPARKLES.map((sparkle) => (
          <View
            key={`${sparkle.left}-${sparkle.top}`}
            style={{
              position: 'absolute',
              left: scale(sparkle.left),
              top: scale(sparkle.top),
              width: scale(sparkle.size),
              height: scale(sparkle.size),
              borderRadius: scale(sparkle.size),
              backgroundColor: sparkle.color,
              boxShadow: sparkle.glow,
            }}
          />
        ))}
        <Text
          style={{
            position: 'absolute',
            left: scale(23),
            top: scale(14.5),
            width: scale(37),
            textAlign: 'center',
            fontSize: scale(18),
            lineHeight: scale(21),
            color: '#CFCFCF',
            textShadowColor: '#858585',
            textShadowOffset: { width: 0, height: scale(4) },
            textShadowRadius: scale(3),
          }}
          className="font-pretendard-extrabold">
          ?
        </Text>

        <Text
          style={{
            position: 'absolute',
            left: scale(63),
            top: scale(13),
            width: scale(120),
            textAlign: 'center',
            fontSize: scale(8),
            lineHeight: scale(9),
            letterSpacing: scale(-0.24),
            color: '#A07EAD',
          }}
          className="font-pretendard-semibold">
          한달 뒤 내 모습 예상하기
        </Text>
        <View
          style={{
            position: 'absolute',
            left: scale(83),
            top: scale(23),
            width: scale(83),
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: scale(18),
              lineHeight: scale(21),
              letterSpacing: scale(-0.24),
              color: '#542173',
            }}
            className="font-pretendard-extrabold">
            ??
          </Text>
          <Text
            style={{
              marginLeft: scale(3),
              fontSize: scale(10),
              lineHeight: scale(12),
              letterSpacing: scale(-0.24),
              color: '#A07EAD',
            }}
            className="font-pretendard">
            ← 현재 74
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Card-relative, and the same near-white treatment the 홈 orb uses. */
const SPARKLES = [
  { left: 33.05, top: 27.77, size: 1.06, color: 'rgba(251,232,255,0.5)', glow: '0px 0px 5px rgba(255,255,255,0.5)' },
  { left: 50.49, top: 15.76, size: 1.06, color: 'rgba(251,232,255,0.5)', glow: '0px 0px 5px rgba(255,255,255,0.5)' },
  { left: 44.15, top: 29.27, size: 1.59, color: 'rgba(231,221,255,0.75)', glow: '0px 0px 4px 1px rgba(255,255,255,0.25)' },
];

function ActionRow({ action, onComplete }: { action: Action; onComplete: () => void }) {
  return (
    <View style={{ height: scale(ROW_PITCH), flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ marginLeft: scale(20), flexShrink: 1 }}>
        <Text
          style={{
            fontSize: scale(7),
            lineHeight: scale(15),
            color: action.done ? '#B4B2A8' : '#2C2C2A',
          }}
          className="font-pretendard-medium">
          {action.label}
        </Text>
        {action.done ? (
          <View
            style={{
              position: 'absolute',
              left: scale(-3),
              right: scale(-3),
              top: '50%',
              height: scale(0.5),
              backgroundColor: '#B4B2A8',
            }}
          />
        ) : null}
      </View>

      {action.done ? (
        <View
          style={{
            marginLeft: 'auto',
            marginRight: scale(11),
            width: scale(CHIP_WIDTH),
            height: scale(CHIP_HEIGHT),
            borderRadius: scale(10),
            backgroundColor: '#DCF7EF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Svg width={scale(5)} height={scale(4)} viewBox="0 0 5 4">
            <Path d="M0.5 0.5L2.5 3.5" stroke="#00A172" strokeLinecap="round" />
            <Path d="M4.5 0.5L2.5 3.5" stroke="#00A172" strokeLinecap="round" />
          </Svg>
        </View>
      ) : (
        <Pressable
          onPress={onComplete}
          style={{
            marginLeft: 'auto',
            marginRight: scale(11),
            width: scale(CHIP_WIDTH),
            height: scale(CHIP_HEIGHT),
            borderRadius: scale(10),
            backgroundColor: '#E9F0FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <GradientText
            colors={[...GRADIENT_BRAND]}
            style={{ fontSize: scale(7), lineHeight: scale(10) }}
            className="font-pretendard-semibold">
            완료!
          </GradientText>
        </Pressable>
      )}
    </View>
  );
}
