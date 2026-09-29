import { Image, Text, View, type ImageSourcePropType } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * The three metric cards. `value` is replaced with the day's real answer in
 * `HomeScreen`; **`badge` is not.**
 *
 * Item 22 deployed a grade for the *total* and for the five 영역 scores, and
 * neither is a grade for 수면·수분·스트레스 — there is no rule saying which
 * stress percentage is 높음 or which cup range is 좋아요. Inventing those
 * thresholds is the same mistake as inventing a cup→litre factor, so the badges
 * stay Figma's until backlog 10 answers it.
 */
export const STATS: { label: string; value: string; badge: string; bg: string; fg: string; icon: ImageSourcePropType }[] = [
  {
    label: '수면',
    value: '6.4시간',
    badge: '조금 부족',
    bg: '#FBF2E1',
    fg: '#E5A64E',
    icon: require('@/assets/images/home/ic-sleep.png'),
  },
  {
    label: '수분',
    /*
     * The band, not a litre figure. `waterIntake` is a cup range on the wire
     * (`THREE_TO_FIVE`), and there is no cup→mL factor anywhere in the data —
     * inventing one to print `1.6L` would be exactly the kind of made-up
     * constant this project refuses elsewhere. Backlog item 26; the backend
     * settled it this way on 2026-08-17.
     */
    value: '3~5잔',
    badge: '좋아요',
    bg: '#E6F4EE',
    fg: '#4B9977',
    icon: require('@/assets/images/home/ic-water.png'),
  },
  {
    label: '스트레스',
    value: '72%',
    badge: '높음',
    bg: '#F9E9E8',
    fg: '#D25D53',
    icon: require('@/assets/images/home/ic-stress.png'),
  },
];

type StatCardProps = (typeof STATS)[number];

export function StatCard({ label, value, badge, bg, fg, icon }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        height: scale(78),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        alignItems: 'center',
        paddingTop: scale(3),
      }}>
      <Image source={icon} style={{ width: scale(23), height: scale(22) }} resizeMode="contain" />
      <Text
        style={{ fontSize: scale(10), lineHeight: scale(13), marginTop: scale(7) }}
        className="font-pretendard-extrabold">
        {value}
      </Text>
      <Text
        style={{ fontSize: scale(7), lineHeight: scale(9), color: '#88877F' }}
        className="font-pretendard-medium">
        {label}
      </Text>
      <View
        style={{
          width: scale(37),
          height: scale(12),
          marginTop: scale(4),
          borderRadius: scale(10),
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{ fontSize: scale(6.5), lineHeight: scale(10), color: fg }}
          className="font-pretendard-bold">
          {badge}
        </Text>
      </View>
    </View>
  );
}
