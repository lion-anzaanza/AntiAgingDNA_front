import { TextInput, Text, View } from 'react-native';

import { SHADOW } from '@/lib/design';
import { scale } from '@/lib/scale';

type DateInputRowProps = {
  label: string;
  year: string;
  month: string;
  day: string;
  onChangeYear: (value: string) => void;
  onChangeMonth: (value: string) => void;
  onChangeDay: (value: string) => void;
};

type DateSegmentProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  unit: string;
  maxLength: number;
};

function DateSegment({ value, onChangeText, placeholder, unit, maxLength }: DateSegmentProps) {
  return (
    <View
      style={{
        flex: 1,
        height: scale(23),
        borderRadius: scale(5),
        paddingHorizontal: scale(7),
        backgroundColor: '#FFFFFF',
        boxShadow: SHADOW,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B4B2A8"
        keyboardType="number-pad"
        maxLength={maxLength}
        style={{ flex: 1, fontSize: scale(7), color: '#00352C', padding: 0 }}
        className="font-pretendard-medium"
      />
      <Text
        style={{ fontSize: scale(7), lineHeight: scale(8), color: '#5F5E5B' }}
        className="font-pretendard-medium">
        {unit}
      </Text>
    </View>
  );
}

/** Figma: 생년월일 — a 7pt Bold label over three 55×23 fields with ~9pt gaps. */
export function DateInputRow({
  label,
  year,
  month,
  day,
  onChangeYear,
  onChangeMonth,
  onChangeDay,
}: DateInputRowProps) {
  return (
    <View>
      <Text
        style={{ fontSize: scale(7), lineHeight: scale(10), color: '#88877F' }}
        className="font-pretendard-bold">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: scale(9), marginTop: scale(1) }}>
        <DateSegment value={year} onChangeText={onChangeYear} placeholder="1999" unit="년" maxLength={4} />
        <DateSegment value={month} onChangeText={onChangeMonth} placeholder="12" unit="월" maxLength={2} />
        <DateSegment value={day} onChangeText={onChangeDay} placeholder="24" unit="일" maxLength={2} />
      </View>
    </View>
  );
}
