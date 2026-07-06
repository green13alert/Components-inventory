import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ArduinoColors } from '@/constants/colors';
import { ComponentCategory } from '@/constants/inventory';

type FilterChipsProps = {
  filters: { id: ComponentCategory; label: string }[];
  selected: ComponentCategory;
  onSelect: (id: ComponentCategory) => void;
};

export function FilterChips({ filters, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}>
      {filters.map((filter) => {
        const isActive = filter.id === selected;
        return (
          <Pressable
            key={filter.id}
            onPress={() => onSelect(filter.id)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
  },
  chipActive: {
    backgroundColor: ArduinoColors.blueMuted,
    borderColor: ArduinoColors.blue,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: ArduinoColors.textSecondary,
  },
  chipTextActive: {
    color: ArduinoColors.blue,
  },
});
