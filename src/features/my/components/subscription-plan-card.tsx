import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { INK, PREMIUM } from '@/features/my/components/subscription-tokens';
import { GRADIENT_BRAND } from '@/lib/design';
import { scale } from '@/lib/scale';

/** Both cards carry this in Figma — it is the 마이페이지 profile label, not a plan. */
const PLAN_SUBTITLE = '올빼미 - 고민감 - 누적형';

export function SubscriptionPlanCard({
  title,
  price,
  per,
  badge,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  per: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          height: scale(30),
          borderRadius: scale(7),
          // Same element tree either way — only the values change (AGENTS.md #3).
          backgroundColor: selected ? '#F7F1FF' : '#FFFFFF',
          borderWidth: selected ? scale(0.4) : scale(0.3),
          borderColor: selected ? PREMIUM : '#DDDDDD',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: scale(11),
        }}>
        {/* `Rectangle 3091` / `3797` — a 10pt radio with a 4pt dot when chosen. */}
        <View
          style={{
            width: scale(10),
            height: scale(10),
            borderRadius: scale(5),
            borderWidth: scale(0.6),
            borderColor: selected ? PREMIUM : '#C9C9C9',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: scale(4),
              height: scale(4),
              borderRadius: scale(2),
              backgroundColor: selected ? PREMIUM : 'transparent',
            }}
          />
        </View>

        <View style={{ marginLeft: scale(9), flexShrink: 1 }}>
          <Text
            style={{ fontSize: scale(8), lineHeight: scale(11), color: INK }}
            className="font-pretendard-bold">
            {title}
          </Text>
          <Text
            style={{
              fontSize: scale(6),
              lineHeight: scale(9),
              letterSpacing: scale(-0.18),
              color: '#676767',
            }}
            className="font-pretendard">
            {PLAN_SUBTITLE}
          </Text>
        </View>

        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{ fontSize: scale(9), lineHeight: scale(15), color: INK }}
            className="font-pretendard-bold">
            {price}
          </Text>
          <Text
            style={{
              marginLeft: scale(3),
              fontSize: scale(5),
              lineHeight: scale(9),
              letterSpacing: scale(-0.15),
              color: '#868686',
            }}
            className="font-pretendard">
            {per}
          </Text>
        </View>
      </View>

      {badge ? (
        <LinearGradient
          colors={[...GRADIENT_BRAND]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            right: scale(8),
            top: scale(-4),
            width: scale(44),
            height: scale(9),
            borderRadius: scale(5),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: scale(4),
              lineHeight: scale(9),
              letterSpacing: scale(-0.04),
              color: '#FFFFFF',
            }}
            className="font-pretendard-semibold">
            {badge}
          </Text>
        </LinearGradient>
      ) : null}
    </Pressable>
  );
}
