import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLOR, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * v4 draws the three metric icons as 13.538pt line glyphs (`icon-moon`,
 * `icon-drop`, `icon-flame`) — a 1.015pt `#5F5E5A` stroke, no fill — where the
 * old design had coloured bitmaps. The paths are Figma's own SVG export. The
 * old `ic-*.png` files stay: `daily-summary-card` still draws them.
 */
const ICON_PATHS = {
  sleep:
    'M11.5642 7.44615C11.4287 8.32145 11.0535 9.14213 10.48 9.81716C9.90657 10.4922 9.15736 10.9952 8.31548 11.2704C7.47359 11.5456 6.57193 11.5822 5.7105 11.3762C4.84907 11.1702 4.06153 10.7296 3.43524 10.1033C2.80894 9.47701 2.36835 8.68947 2.16234 7.82804C1.95634 6.96661 1.99296 6.06495 2.26815 5.22306C2.54335 4.38118 3.04635 3.63197 3.72138 3.05853C4.39641 2.48508 5.21709 2.10982 6.09239 1.97436C5.59023 2.73367 5.36585 3.64317 5.45723 4.54891C5.54861 5.45465 5.95013 6.30099 6.59384 6.9447C7.23755 7.58841 8.0839 7.98993 8.98964 8.08131C9.89538 8.17269 10.8049 7.94831 11.5642 7.44615Z',
  water:
    'M6.76848 1.80504C6.76848 1.80504 3.38386 5.4717 3.38386 7.78453C3.38386 8.68218 3.74046 9.54307 4.3752 10.1778C5.00993 10.8125 5.87082 11.1691 6.76848 11.1691C7.66614 11.1691 8.52703 10.8125 9.16176 10.1778C9.7965 9.54307 10.1531 8.68218 10.1531 7.78453C10.1531 5.4717 6.76848 1.80504 6.76848 1.80504Z',
  stress:
    'M6.76978 1.41003C7.22106 3.10234 6.93901 4.5126 6.3185 5.6408C5.86722 5.0767 5.35953 4.62542 4.62619 4.34336C5.02106 5.75362 3.38517 6.76901 3.38517 8.46131C3.38517 9.35897 3.74176 10.2199 4.3765 10.8546C5.01124 11.4893 5.87213 11.8459 6.76978 11.8459C7.66744 11.8459 8.52833 11.4893 9.16307 10.8546C9.79781 10.2199 10.1544 9.35897 10.1544 8.46131C10.1544 5.6408 7.89799 3.66644 6.76978 1.41003Z',
} as const;

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
export const STATS: {
  label: string;
  value: string;
  badge: string;
  bg: string;
  fg: string;
  icon: keyof typeof ICON_PATHS;
}[] = [
  {
    label: '수면',
    value: '6.4시간',
    badge: '조금 부족',
    bg: '#FBF2E1',
    fg: '#E5A64E',
    icon: 'sleep',
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
    icon: 'water',
  },
  {
    label: '스트레스',
    value: '72%',
    badge: '높음',
    bg: '#F9E9E8',
    fg: '#D25D53',
    icon: 'stress',
  },
];

type StatCardProps = (typeof STATS)[number];

/**
 * v4 `1363:1967`/`1980`/`1987`: 61.3×78. Figma puts each icon at a different
 * height (7.2 / 9.5 / 8.7 from the card top) and the moon 2.5pt right of
 * centre; the code centres all three at the middle value, 8.73.
 */
export function StatCard({ label, value, badge, bg, fg, icon }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        height: scale(78),
        borderRadius: scale(10),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW,
        alignItems: 'center',
        paddingTop: scale(8.73),
      }}>
      <Svg width={scale(13.538)} height={scale(13.538)} viewBox="0 0 13.5385 13.5385">
        <Path
          d={ICON_PATHS[icon]}
          stroke="#5F5E5A"
          strokeWidth={1.01538}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
      <Text
        numberOfLines={1}
        style={{
          fontSize: scale(11.282),
          lineHeight: scale(15.795),
          letterSpacing: scale(-0.1128),
          marginTop: scale(27.35 - 8.73 - 13.538),
          color: COLOR.text.strong,
        }}
        className="font-plex-bold">
        {value}
      </Text>
      <Text
        style={{
          fontSize: scale(8.462),
          lineHeight: scale(12.41),
          // Figma's label line box starts 0.58 above the value's bottom.
          marginTop: scale(42.57 - 27.35 - 15.795),
          color: COLOR.text.body,
        }}
        className="font-plex">
        {label}
      </Text>
      <View
        style={{
          width: scale(37),
          height: scale(12),
          marginTop: scale(57 - 42.57 - 12.41),
          borderRadius: scale(10),
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: scale(7.333), lineHeight: scale(10.154), color: fg }}
          className="font-plex-semibold">
          {badge}
        </Text>
      </View>
    </View>
  );
}
