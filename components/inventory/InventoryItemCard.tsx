import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { SolderiColors } from '@/constants/colors';
import { CATEGORY_LABELS, InventoryComponent } from '@/constants/inventory';

type InventoryItemCardProps = {
  item: InventoryComponent;
  onPress?: () => void;
};

export function InventoryItemCard({ item, onPress }: InventoryItemCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && onPress && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${item.name}`}>
      <View style={styles.iconWrap}>
        <ComponentIllustration id={item.id} name={item.name} size={52} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
      </View>
      <View style={styles.quantityWrap}>
        <Text style={styles.quantityLabel}>Qty</Text>
        <Text style={styles.quantity}>{item.quantity}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SolderiColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    padding: 14,
    gap: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  category: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
  },
  quantityWrap: {
    alignItems: 'center',
    minWidth: 36,
    gap: 2,
  },
  quantityLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: SolderiColors.textMuted,
    textTransform: 'uppercase',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '800',
    color: SolderiColors.textPrimary,
  },
});
