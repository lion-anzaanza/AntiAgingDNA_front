import { Text, View } from 'react-native';

import { COLOR, SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

import { SelectButton } from './select-button';
import { CARD_INSET, CARD_TITLE } from './select-card';

const SCALE_VALUES = [0, 1, 2, 3, 4, 5];

type LikertCardProps = {
  statement: string;
  value: number | null;
  onChange: (value: number) => void;
  /** Read-only replay of an earlier answer — see `SelectButtonState`. */
  history?: boolean;
};

/**
 * Figma v3: `SelectItem6_Card` on 회원가입/2 — a 55.56pt white card with the
 * statement near its top edge and six 22.56-tall `likert` pills below, 3.95
 * apart.
 *
 * All five v4 instances keep the pre-v4 radius 10 and 4px shadow rather than
 * the 9.615 / 3.846 the rest of the family was rescaled to; reproduced as drawn.
 */
export function LikertCard({ statement, value, onChange, history = false }: LikertCardProps) {
  return (
    <View
      style={{
        borderRadius: scale(10),
        backgroundColor: COLOR.surface.card,
        boxShadow: SHADOW,
        paddingTop: scale(3.33),
        paddingBottom: scale(9),
      }}>
      <Text style={[CARD_TITLE, { marginLeft: scale(8.65) }]} className="font-plex-semibold">
        {statement}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: scale(3.949),
          paddingHorizontal: scale(CARD_INSET),
          marginTop: scale(7.108),
        }}>
        {SCALE_VALUES.map((n) => (
          <SelectButton
            key={n}
            label={String(n)}
            state={n === value ? (history ? 'history' : 'active') : 'inactive'}
            onPress={() => onChange(n)}
            size="likert"
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </View>
  );
}
