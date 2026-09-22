import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import type { SolderiPalette } from '@/constants/colors';
import { COMPONENT_CATALOGUE, type CatalogueComponent } from '@/constants/component-catalogue';
import { COMPONENT_FILTERS, type InventoryComponent } from '@/constants/inventory';
import { useSolderiColors } from '@/context/theme-context';

const BROWSE_CATEGORIES = COMPONENT_FILTERS.filter((filter) => filter.id !== 'all');

type ComponentCatalogueBrowseProps = {
  inventory: InventoryComponent[];
  onSelect: (entry: CatalogueComponent) => void;
};

export function ComponentCatalogueBrowse({ inventory, onSelect }: ComponentCatalogueBrowseProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const ownedBySlug = useMemo(() => {
    const owned = new Map<string, number>();
    for (const item of inventory) {
      if (!item.catalogueId) continue;
      owned.set(item.catalogueId, (owned.get(item.catalogueId) ?? 0) + item.quantity);
    }
    return owned;
  }, [inventory]);

  const sections = useMemo(
    () =>
      BROWSE_CATEGORIES.map((category) => ({
        id: category.id,
        label: category.label,
        items: COMPONENT_CATALOGUE.filter((entry) => entry.category === category.id),
      })).filter((section) => section.items.length > 0),
    [],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.label}</Text>
          <View style={styles.list}>
            {section.items.map((entry) => {
              const owned = ownedBySlug.get(entry.id) ?? 0;
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => onSelect(entry)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    owned > 0
                      ? `${entry.name}, ${section.label}, you have ${owned}`
                      : `${entry.name}, ${section.label}`
                  }>
                  <ComponentIllustration id={entry.image} name={entry.name} size={48} />
                  <View style={styles.copy}>
                    <Text style={styles.name}>{entry.name}</Text>
                    <Text style={styles.description} numberOfLines={1}>
                      {entry.description}
                    </Text>
                    {owned > 0 ? <Text style={styles.owned}>You have {owned}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
      gap: 24,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    list: {
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowPressed: {
      backgroundColor: colors.accentMuted,
    },
    copy: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    owned: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
      marginTop: 2,
    },
  });
}
