import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import type { SolderiPalette } from '@/constants/colors';
import type { CatalogueComponent } from '@/constants/component-catalogue';
import { COMPONENT_FILTERS } from '@/constants/inventory';
import { useSolderiColors } from '@/context/theme-context';

function categoryLabel(category: CatalogueComponent['category']): string {
  return COMPONENT_FILTERS.find((filter) => filter.id === category)?.label ?? category;
}

type ComponentCatalogueSearchProps = {
  query: string;
  onChangeQuery: (text: string) => void;
  dropdownOpen: boolean;
  results: CatalogueComponent[];
  onSelect: (entry: CatalogueComponent) => void;
  showCustomOption: boolean;
  onSelectCustom: () => void;
  autoFocus?: boolean;
};

export function ComponentCatalogueSearch({
  query,
  onChangeQuery,
  dropdownOpen,
  results,
  onSelect,
  showCustomOption,
  onSelectCustom,
  autoFocus,
}: ComponentCatalogueSearchProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const showEmpty = dropdownOpen && query.trim().length > 0 && results.length === 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Component</Text>
      <TextInput
        style={[styles.input, dropdownOpen && styles.inputOpen]}
        placeholder="Search DHT22, HC-SR04, Arduino Uno…"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={onChangeQuery}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Search components"
      />

      {dropdownOpen ? (
        <View style={styles.dropdown}>
          {results.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.resultList}
              showsVerticalScrollIndicator={false}>
              {results.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => onSelect(entry)}
                  style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${entry.name}, ${entry.description}, ${categoryLabel(entry.category)}`}>
                  <ComponentIllustration id={entry.image} name={entry.name} size={48} />
                  <View style={styles.resultCopy}>
                    <Text style={styles.resultName}>{entry.name}</Text>
                    <Text style={styles.resultDescription} numberOfLines={1}>
                      {entry.description}
                    </Text>
                  </View>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{categoryLabel(entry.category)}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : showEmpty ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>Couldn't identify this component</Text>
              <Text style={styles.emptyBody}>No catalogue match for “{query.trim()}”.</Text>
            </View>
          ) : null}

          {showCustomOption ? (
            <Pressable
              onPress={onSelectCustom}
              style={({ pressed }) => [styles.customRow, pressed && styles.resultRowPressed]}
              accessibilityRole="button">
              <Text style={styles.customTitle}>Add as custom component</Text>
              <Text style={styles.customHint}>You’ll choose a category next</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
      zIndex: 2,
    },
    label: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
    },
    inputOpen: {
      borderColor: colors.accentBorder,
    },
    dropdown: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    resultList: {
      maxHeight: 260,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    resultRowPressed: {
      backgroundColor: colors.accentMuted,
    },
    resultCopy: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    resultName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    resultDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    categoryChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    emptyBlock: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 4,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptyBody: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    customRow: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: 2,
    },
    customTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
    },
    customHint: {
      fontSize: 12,
      color: colors.textMuted,
    },
  });
}
