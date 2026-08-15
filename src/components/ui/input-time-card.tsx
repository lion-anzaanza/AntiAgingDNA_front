import { Pressable, Text, View } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

/**
 * Figma: `InputTime_Card` (182×60) — a start/end time pair with a duration
 * badge in the corner. 일지 uses it for 취침 · 기상 시각.
 *
 * There is no picker behind it yet; like the rest of the app the fields are
 * display-only and the screen decides what tapping one does.
 */
type InputTimeCardProps = {
  label: string;
  startLabel: string;
  endLabel: string;
  /** Preformatted, e.g. `오전 00:00` — this component does no time maths. */
  start: string;
  end: string;
  /** The `#E9F0FF` corner badge, e.g. `7시간 20분`. Hidden when absent. */
  duration?: string;
  onPressStart?: () => void;
  onPressEnd?: () => void;
};

export function InputTimeCard({
  label,
  startLabel,
  endLabel,
  start,
  end,
  duration,
  onPressStart,
  onPressEnd,
}: InputTimeCardProps) {
  return (
    <View
      style={{
        // Figma draws InputTime_Card 182 wide inside the 일지 screens' 184 column.
        width: scale(182),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        paddingTop: scale(4.5),
        paddingBottom: scale(9),
        paddingHorizontal: scale(10.5),
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: scale(8),
            lineHeight: scale(15),
            marginLeft: scale(1.5),
            color: '#00352C',
          }}
          className="font-pretendard-bold">
          {label}
        </Text>
        {duration ? (
          <View
            style={{
              marginLeft: 'auto',
              minWidth: scale(33),
              height: scale(10),
              borderRadius: scale(10),
              paddingHorizontal: scale(3),
              backgroundColor: '#E9F0FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{ fontSize: scale(5), lineHeight: scale(10), color: '#4800FF' }}
              className="font-pretendard-medium">
              {duration}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', marginTop: scale(1.5) }}>
        <FieldLabel style={{ flex: 1 }}>{startLabel}</FieldLabel>
        <View style={{ width: scale(25) }} />
        <FieldLabel style={{ flex: 1 }}>{endLabel}</FieldLabel>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(3) }}>
        <TimeField value={start} onPress={onPressStart} />
        <Text
          style={{
            width: scale(25),
            fontSize: scale(10),
            lineHeight: scale(19),
            textAlign: 'center',
            color: '#B4B2A8',
          }}
          className="font-pretendard-light">
          →
        </Text>
        <TimeField value={end} onPress={onPressEnd} />
      </View>
    </View>
  );
}

function FieldLabel({ children, style }: { children: string; style?: { flex: number } }) {
  return (
    <Text
      style={[
        { fontSize: scale(5), lineHeight: scale(8), color: '#88877F' },
        style,
      ]}
      className="font-pretendard-medium">
      {children}
    </Text>
  );
}

function TimeField({ value, onPress }: { value: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: scale(19),
        borderRadius: scale(5),
        borderWidth: scale(0.7),
        borderColor: '#F1EFE7',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          fontSize: scale(7),
          lineHeight: scale(8),
          letterSpacing: scale(0.21),
          color: '#2C2C2A',
        }}
        className="font-pretendard-bold">
        {value}
      </Text>
    </Pressable>
  );
}
