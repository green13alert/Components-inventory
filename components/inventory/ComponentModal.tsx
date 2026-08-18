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
import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { SolderiColors } from '@/constants/colors';
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
          <View style={styles.previewRow}>
            <ComponentIllustration
              id={isEditing ? editingItem?.id : undefined}
              name={name.trim() || editingItem?.name}
              size={72}
            />
            <View style={styles.previewCopy}>
              <Text style={styles.previewTitle}>
                {name.trim() || (isEditing ? editingItem?.name : 'New component')}
              </Text>
              <Text style={styles.previewHint}>
                {name.trim()
                  ? CATEGORY_LABELS[category]
                  : isEditing
                    ? CATEGORY_LABELS[editingItem?.category ?? category]
                    : 'Name your part to preview its illustration'}
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Component Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. DHT22 Temp & Humidity"
              placeholderTextColor={SolderiColors.textMuted}
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
                <Ionicons name="remove" size={22} color={SolderiColors.textPrimary} />
              </Pressable>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => q + 1)}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity">
                <Ionicons name="add" size={22} color={SolderiColors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {isEditing ? (
            <Pressable style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button">
              <Ionicons name="trash-outline" size={18} color={SolderiColors.error} />
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
    backgroundColor: SolderiColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: SolderiColors.border,
  },
  headerButton: {
    minWidth: 64,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: SolderiColors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: SolderiColors.accent,
    textAlign: 'right',
  },
  saveTextDisabled: {
    opacity: 0.4,
  },
  content: {
    padding: 20,
    gap: 28,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  previewCopy: {
    flex: 1,
    gap: 4,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  previewHint: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  input: {
    backgroundColor: SolderiColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: SolderiColors.textPrimary,
  },
  categoryHint: {
    fontSize: 13,
    color: SolderiColors.textMuted,
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
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 28,
    fontWeight: '800',
    color: SolderiColors.textPrimary,
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
    borderColor: SolderiColors.errorMuted,
    backgroundColor: SolderiColors.errorMuted,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: SolderiColors.error,
  },
});
