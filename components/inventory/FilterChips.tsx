import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type FilterChipsProps<T extends string> = {
  filters: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
};

export function FilterChips<T extends string>({ filters, selected, onSelect }: FilterChipsProps<T>) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    list: {
      gap: 8,
      paddingRight: 4,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.accent,
    },
  });
}
