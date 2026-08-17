import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FilterChips } from '@/components/inventory/FilterChips';
import { ArduinoColors } from '@/constants/colors';
import {
  CATEGORY_LABELS,
  COMPONENT_FILTERS,
  type ComponentCategory,
  type InventoryComponent,
} from '@/constants/inventory';

const ADDABLE_CATEGORIES = COMPONENT_FILTERS.filter((f) => f.id !== 'all') as {
  id: Exclude<ComponentCategory, 'all'>;
  label: string;
}[];

const CATEGORY_ICONS: Record<Exclude<ComponentCategory, 'all'>, keyof typeof Ionicons.glyphMap> = {
  microcontrollers: 'hardware-chip-outline',
  sensors: 'thermometer-outline',
  actuators: 'sync-outline',
  displays: 'tv-outline',
  power: 'battery-charging-outline',
  modules: 'bluetooth-outline',
};

type ComponentModalProps = {
  visible: boolean;
  editingItem?: InventoryComponent | null;
  onClose: () => void;
  onAdd: (item: Omit<InventoryComponent, 'id'>) => void;
  onUpdate: (id: string, item: Omit<InventoryComponent, 'id'>) => void;
  onDelete: (id: string) => void;
};

export function ComponentModal({
  visible,
  editingItem,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: ComponentModalProps) {
  const isEditing = editingItem != null;
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<ComponentCategory, 'all'>>('sensors');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setQuantity(editingItem.quantity);
    } else {
      setName('');
      setCategory('sensors');
      setQuantity(1);
    }
  }, [visible, editingItem]);

  const handleClose = () => {
    onClose();
  };

  const buildItem = (): Omit<InventoryComponent, 'id'> => ({
    name: name.trim(),
    category,
    quantity,
    icon: CATEGORY_ICONS[category],
  });

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const item = buildItem();
    if (isEditing && editingItem) {
      onUpdate(editingItem.id, item);
    } else {
      onAdd(item);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingItem) return;
    onDelete(editingItem.id);
    onClose();
  };

  const canSubmit = name.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Component' : 'Add Component'}</Text>
          <Pressable
            onPress={handleSave}
            style={styles.headerButton}
            disabled={!canSubmit}
            accessibilityRole="button">
            <Text style={[styles.saveText, !canSubmit && styles.saveTextDisabled]}>
              {isEditing ? 'Save' : 'Add'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Component Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. DHT22 Temp & Humidity"
              placeholderTextColor={ArduinoColors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus={!isEditing}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <FilterChips
              filters={ADDABLE_CATEGORIES}
              selected={category}
              onSelect={(id) => setCategory(id as Exclude<ComponentCategory, 'all'>)}
            />
            <Text style={styles.categoryHint}>{CATEGORY_LABELS[category]}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.quantityRow}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity">
                <Ionicons name="remove" size={22} color={ArduinoColors.textPrimary} />
              </Pressable>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => q + 1)}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity">
                <Ionicons name="add" size={22} color={ArduinoColors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {isEditing ? (
            <Pressable style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button">
              <Ionicons name="trash-outline" size={18} color="#F87171" />
              <Text style={styles.deleteText}>Remove from inventory</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ArduinoColors.border,
  },
  headerButton: {
    minWidth: 64,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: ArduinoColors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: ArduinoColors.blue,
    textAlign: 'right',
  },
  saveTextDisabled: {
    opacity: 0.4,
  },
  content: {
    padding: 20,
    gap: 28,
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
  },
  input: {
    backgroundColor: ArduinoColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: ArduinoColors.textPrimary,
  },
  categoryHint: {
    fontSize: 13,
    color: ArduinoColors.textMuted,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 28,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F87171',
  },
});
