import { Pressable, StyleSheet, Text } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type SuggestionChipProps = {
  label: string;
  onPress: () => void;
};

export function SuggestionChip({ label, onPress }: SuggestionChipProps) {
  return (
    <Pressable style={styles.chip} onPress={onPress} accessibilityRole="button">
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: ArduinoColors.textSecondary,
  },
});
