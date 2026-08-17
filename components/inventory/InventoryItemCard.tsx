import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';
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
        <Ionicons name={item.icon} size={24} color={ArduinoColors.blue} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
      </View>
      <View style={styles.quantityWrap}>
        <Text style={styles.quantityLabel}>Qty</Text>
        <Text style={styles.quantity}>{item.quantity}</Text>
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color={ArduinoColors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ArduinoColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 14,
    gap: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: ArduinoColors.blueMuted,
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
    color: ArduinoColors.textPrimary,
  },
  category: {
    fontSize: 13,
    color: ArduinoColors.textSecondary,
  },
  quantityWrap: {
    alignItems: 'center',
    minWidth: 36,
    gap: 2,
  },
  quantityLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: ArduinoColors.textMuted,
    textTransform: 'uppercase',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
  },
});
