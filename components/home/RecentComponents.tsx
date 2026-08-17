import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { InventoryComponent } from '@/constants/inventory';
import { Radii, Spacing, Typography } from '@/constants/tokens';

type RecentComponentsProps = {
  items: InventoryComponent[];
};

function RecentComponentChip({ item, onPress }: { item: InventoryComponent; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.name}>
      <View style={styles.iconWrap}>
        <Ionicons name={item.icon} size={18} color={SolderiColors.textSecondary} />
      </View>
      <Text style={styles.chipName} numberOfLines={2}>
        {item.name}
      </Text>
    </Pressable>
  );
}

export function RecentComponents({ items }: RecentComponentsProps) {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}>
      {items.map((item) => (
        <RecentComponentChip
          key={item.id}
          item={item}
          onPress={() => router.push('/(tabs)/inventory')}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    paddingRight: Spacing.xs,
  },
  chip: {
    width: 100,
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: SolderiColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: {
    ...Typography.metadata,
    color: SolderiColors.textSecondary,
    textAlign: 'center',
  },
});
