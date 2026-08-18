import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { COMPONENT_CATEGORY_LABELS, type ComponentCategory } from '@/constants/onboarding';
import { Radii, Spacing } from '@/constants/tokens';

const CATEGORIES = Object.keys(COMPONENT_CATEGORY_LABELS) as ComponentCategory[];

type WorkbenchCategoryTabsProps = {
  active: ComponentCategory;
  onChange: (category: ComponentCategory) => void;
};

export function WorkbenchCategoryTabs({ active, onChange }: WorkbenchCategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {CATEGORIES.map((category) => {
        const isActive = category === active;
        return (
          <Pressable
            key={category}
            onPress={() => onChange(category)}
            style={[styles.tab, isActive && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {COMPONENT_CATEGORY_LABELS[category]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.xl,
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  tabActive: {
    backgroundColor: SolderiColors.accentMuted,
    borderColor: SolderiColors.accentBorder,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SolderiColors.textSecondary,
  },
  tabLabelActive: {
    color: SolderiColors.textPrimary,
  },
});
