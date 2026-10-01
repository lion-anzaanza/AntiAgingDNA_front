import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';

import { WEEKDAYS_MON_FIRST } from '@/lib/dates';
import { COLOR, GRADIENT_PASTEL, SHADOW_V4 } from '@/lib/design';
import { cssGradientPoints, pastelAngle } from '@/lib/gradient';
import { scale } from '@/lib/scale';

/** v3 `주간_기록` (`1316:1574`): the full 197.436 column, 91.346 tall. */
export const CARD_WIDTH = 197.436;
export const CARD_HEIGHT = 91.346;

/**
 * Day columns, v3's circle centres (`Chip Row` + three loose discs, ×220/390).
 * v3 now puts every weekday label on its circle to within 0.6 — except 월,
 * still 6.8 left of its circle as in v4; it is centred here like the rest.
 * The pitch is ~26.2 with a wider last gap (27.9), reproduced as drawn.
 * `WeeklyConditionChart` spans the same first → last centre.
 */
const DAY_CENTERS = [18.72, 44.89, 71.06, 97.7, 123.67, 150.15, 178.31];

/** 4 of 7 circles are 18.269 round; three are drawn 19.231 wide. */
const CIRCLE = 18.269;
const CIRCLE_TOP = 34.62;
const LABEL_TOP = 29.0 - 12.41 / 2;
const CIRCLE_RAMP = cssGradientPoints(pastelAngle(CIRCLE, CIRCLE), CIRCLE, CIRCLE);
const CIRCLE_SHADOW = '0px 0px 1.923px rgba(169, 169, 169, 0.25)';

/** The `surface/tint` strip holding 월간 보기; the chart's summary strip matches it. */
const STRIP = { left: 9.026, top: 63.46, width: 179.385, height: 18.269, radius: 4.513 };

/** v3's 9.59 SemiBold card title in `text/heading`, line centre 13.08. */
const CARD_TITLE_STYLE = {
  position: 'absolute' as const,
  left: scale(8.7),
  top: scale(13.08 - 13.538 / 2),
  fontSize: scale(9.59),
  lineHeight: scale(13.538),
  letterSpacing: scale(-0.0959),
  color: COLOR.text.heading,
};

export function WeekCard({ recorded, todayIndex }: { recorded: boolean[]; todayIndex: number }) {
  return (
    <View
      style={{
        width: scale(CARD_WIDTH),
        height: scale(CARD_HEIGHT),
        borderRadius: scale(9.615),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW_V4,
      }}>
      <Text style={CARD_TITLE_STYLE} className="font-plex-semibold">
        주간 기록
      </Text>

      {WEEKDAYS_MON_FIRST.map((day, index) => {
        const center = DAY_CENTERS[index];
        return (
          <Fragment key={day}>
            <Text
              style={{
                position: 'absolute',
                left: scale(center - 12),
                top: scale(LABEL_TOP),
                width: scale(24),
                textAlign: 'center',
                fontSize: scale(8.462),
                lineHeight: scale(12.41),
                color: COLOR.text.body,
              }}
              className="font-plex">
              {day}
            </Text>
            <View
              style={{
                position: 'absolute',
                left: scale(center - CIRCLE / 2),
                top: scale(CIRCLE_TOP),
              }}>
              <DayCircle recorded={recorded[index]} today={index === todayIndex} />
            </View>
          </Fragment>
        );
      })}

      <Pressable
        onPress={() => router.push('/journal/calendar')}
        style={{
          position: 'absolute',
          left: scale(STRIP.left),
          top: scale(STRIP.top),
          width: scale(STRIP.width),
          height: scale(STRIP.height),
          borderRadius: scale(STRIP.radius),
          backgroundColor: COLOR.surface.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.brand.violetText }}
          className="font-plex-semibold">
          월간 보기 →
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Recorded days are pastel with a ✓, today is ringed, the rest of the week is
 * a plain `surface/chip` disc. All three are the same `LinearGradient → Text`
 * tree so a day changing state does not remount (AGENTS.md rule 3).
 *
 * The ring is v3's own `#4655F6` hex — the one colour on this card that is not
 * a token. A recorded disc's shadow is v3's 3.409 blur (1.923 at 220), half the
 * card's.
 */
function DayCircle({ recorded, today }: { recorded: boolean; today: boolean }) {
  const ringed = today && !recorded;
  return (
    <LinearGradient
      colors={recorded ? [...GRADIENT_PASTEL.colors] : [COLOR.surface.chip, COLOR.surface.chip, COLOR.surface.chip]}
      locations={[...GRADIENT_PASTEL.locations]}
      start={CIRCLE_RAMP.start}
      end={CIRCLE_RAMP.end}
      style={{
        width: scale(CIRCLE),
        height: scale(CIRCLE),
        borderRadius: scale(CIRCLE),
        borderWidth: ringed ? scale(0.962) : 0,
        borderColor: '#4655F6',
        boxShadow: recorded ? CIRCLE_SHADOW : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {/*
        * Both glyphs are always rendered, each with its own fixed font class,
        * and the unused one is empty — swapping one Text's className between
        * fonts would remount it (rule 3). The row keeps an empty one at zero
        * width.
        */}
      <Text
        style={{ fontSize: scale(7.333), lineHeight: scale(9.778), color: COLOR.text.plum }}
        className="font-pretendard-medium">
        {recorded ? '✓' : ''}
      </Text>
      <Text
        style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: COLOR.brand.violetText }}
        className="font-plex-semibold">
        {ringed ? '오늘' : ''}
      </Text>
    </LinearGradient>
  );
}
