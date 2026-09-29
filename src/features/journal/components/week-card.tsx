import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GradientText } from '@/components/ui/gradient-text';
import { WEEKDAYS_MON_FIRST } from '@/lib/dates';
import { GRADIENT_BRAND, GRADIENT_SELECT, GRADIENT_SELECT_STOPS, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

export const CARD_WIDTH = 184;

export function WeekCard({ recorded, todayIndex }: { recorded: boolean[]; todayIndex: number }) {
  return (
    <View
      style={{
        width: scale(CARD_WIDTH),
        height: scale(95),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(5),
        paddingHorizontal: scale(12),
      }}>
      <Text
        style={{ fontSize: scale(8), lineHeight: scale(15), color: '#00352C' }}
        className="font-pretendard-bold">
        주간 기록
      </Text>

      <View style={{ flexDirection: 'row', marginTop: scale(3) }}>
        {WEEKDAYS_MON_FIRST.map((day) => (
          <Text
            key={day}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: scale(6),
              lineHeight: scale(8),
              color: '#5F5E5B',
            }}
            className="font-pretendard-medium">
            {day}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', marginTop: scale(4) }}>
        {WEEKDAYS_MON_FIRST.map((day, index) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <DayCircle recorded={recorded[index]} today={index === todayIndex} />
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/journal/calendar')}
        style={{
          height: scale(19),
          marginTop: scale(11),
          borderRadius: scale(5),
          backgroundColor: '#F3F1FE',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(7), lineHeight: scale(8) }}
          className="font-pretendard-bold">
          월간 보기 →
        </GradientText>
      </Pressable>
    </View>
  );
}

/** Recorded days are filled, today is outlined, the rest of the week is empty. */
function DayCircle({ recorded, today }: { recorded: boolean; today: boolean }) {
  const size = scale(19);

  if (recorded) {
    return (
      <LinearGradient
        colors={[...GRADIENT_SELECT]}
        locations={[...GRADIENT_SELECT_STOPS]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          width: size,
          height: size,
          borderRadius: size,
          boxShadow: SHADOW,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(6), lineHeight: scale(8), color: '#FFFFFF' }}
          className="font-pretendard-medium">
          ✓
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: '#F2F2F0',
        borderWidth: today ? scale(1) : 0,
        borderColor: '#4655F6',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {today ? (
        <GradientText
          colors={[...GRADIENT_BRAND]}
          style={{ fontSize: scale(6), lineHeight: scale(8) }}
          className="font-pretendard-extrabold">
          오늘
        </GradientText>
      ) : null}
    </View>
  );
}
