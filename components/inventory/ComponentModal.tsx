import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryPills } from '@/components/inventory/CategoryPills';
import { ComponentCatalogueSearch } from '@/components/inventory/ComponentCatalogueSearch';
import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { SolderiColors } from '@/constants/colors';
import {
  matchCatalogueToInventoryItem,
  searchComponentCatalogue,
  type CatalogueCategory,
  type CatalogueComponent,
} from '@/constants/component-catalogue';
import {
  COMPONENT_FILTERS,
  type ComponentCategory,
  type InventoryComponent,
} from '@/constants/inventory';

const ADDABLE_CATEGORIES = COMPONENT_FILTERS.filter((f) => f.id !== 'all') as {
  id: Exclude<ComponentCategory, 'all'>;
  label: string;
}[];

const PREVIEW_WELL = 72;
const PREVIEW_ART = 64;
const CONTENT_PADDING = 20;

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
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogueComponent | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState<CatalogueCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const previewOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      const match = matchCatalogueToInventoryItem(editingItem);
      if (match) {
        setQuery(match.name);
        setSelected(match);
        setIsCustom(false);
        setCustomCategory(null);
      } else {
        setQuery(editingItem.name);
        setSelected(null);
        setIsCustom(true);
        setCustomCategory(editingItem.category);
      }
      setQuantity(editingItem.quantity);
      setDropdownOpen(false);
    } else {
      setQuery('');
      setSelected(null);
      setIsCustom(false);
      setCustomCategory(null);
      setQuantity(1);
      setDropdownOpen(false);
    }
  }, [visible, editingItem]);

  const results = useMemo(() => searchComponentCatalogue(query, 8), [query]);
  const trimmedQuery = query.trim();
  const showCustomOption = dropdownOpen && trimmedQuery.length > 0 && selected == null;

  const resolvedCategory = selected?.category ?? (isCustom ? customCategory : null);
  const resolvedName = selected?.name ?? trimmedQuery;
  const canSubmit = resolvedName.length > 0 && resolvedCategory != null && (selected != null || isCustom);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setSelected(null);
    setIsCustom(false);
    setCustomCategory(null);
    setDropdownOpen(text.trim().length > 0);
  };

  const handleSelect = (entry: CatalogueComponent) => {
    setSelected(entry);
    setQuery(entry.name);
    setIsCustom(false);
    setCustomCategory(null);
    setDropdownOpen(false);
    Keyboard.dismiss();
  };

  const handleSelectCustom = () => {
    setSelected(null);
    setIsCustom(true);
    setCustomCategory(null);
    setDropdownOpen(false);
    Keyboard.dismiss();
  };

  const handleSave = () => {
    if (!canSubmit || !resolvedCategory) return;

    const item: Omit<InventoryComponent, 'id'> = selected
      ? {
          name: selected.name,
          category: selected.category,
          quantity,
          catalogueId: selected.id,
          type: selected.type,
        }
      : {
          name: resolvedName,
          category: resolvedCategory,
          quantity,
        };

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

  const showPlaceholder = !selected && !isCustom;
  const previewTitle = selected?.name ?? (isCustom ? resolvedName : 'Search for a component');
  const previewHint = selected
    ? selected.description
    : isCustom
      ? 'Custom component — choose a category below'
      : 'Start typing to find a component';
  const previewCategory = selected
    ? COMPONENT_FILTERS.find((filter) => filter.id === selected.category)?.label
    : null;
  const previewKey = selected?.id ?? (isCustom ? `custom:${resolvedName}` : 'placeholder');

  useEffect(() => {
    previewOpacity.setValue(0);
    Animated.timing(previewOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [previewKey, previewOpacity]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerButton} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Component' : 'Add Component'}</Text>
          <Pressable
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton, canSubmit && styles.saveButtonReady]}
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
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            if (!dropdownOpen) Keyboard.dismiss();
          }}>
          <Pressable onPress={() => setDropdownOpen(false)}>
            <View style={styles.previewStage}>
              <Animated.View style={[styles.previewWell, { opacity: previewOpacity }]}>
                {showPlaceholder ? (
                  <ComponentIllustration id="electronics-kit" size={PREVIEW_ART} />
                ) : (
                  <ComponentIllustration
                    id={selected?.image}
                    name={resolvedName}
                    size={PREVIEW_ART}
                  />
                )}
              </Animated.View>
              <Animated.View style={[styles.previewCopy, { opacity: previewOpacity }]}>
                <Text style={styles.previewTitle}>{previewTitle}</Text>
                <Text style={styles.previewHint}>{previewHint}</Text>
                {previewCategory ? <Text style={styles.previewCategory}>{previewCategory}</Text> : null}
              </Animated.View>
            </View>
          </Pressable>

          <ComponentCatalogueSearch
            query={query}
            onChangeQuery={handleQueryChange}
            dropdownOpen={dropdownOpen && trimmedQuery.length > 0}
            results={results}
            onSelect={handleSelect}
            showCustomOption={showCustomOption}
            onSelectCustom={handleSelectCustom}
            autoFocus={!isEditing}
          />

          {selected ? (
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.lockedCategory}>
                <Text style={styles.lockedCategoryText}>
                  {COMPONENT_FILTERS.find((filter) => filter.id === selected.category)?.label}
                </Text>
              </View>
              <Text style={styles.lockedHint}>Assigned from the Solderi catalogue</Text>
            </View>
          ) : null}

          {isCustom ? (
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.lockedHint}>Choose where this custom part belongs</Text>
              <View style={styles.categoryBleed}>
                <CategoryPills
                  filters={ADDABLE_CATEGORIES}
                  selected={customCategory}
                  onSelect={setCustomCategory}
                  edgePadding={CONTENT_PADDING}
                />
              </View>
            </View>
          ) : null}

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
  saveButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: -4,
  },
  saveButtonReady: {
    backgroundColor: SolderiColors.accentMuted,
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
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  previewStage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    gap: 12,
  },
  previewWell: {
    width: PREVIEW_WELL,
    height: PREVIEW_WELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  previewHint: {
    fontSize: 13,
    lineHeight: 18,
    color: SolderiColors.textSecondary,
  },
  previewCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: SolderiColors.accent,
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  lockedCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: SolderiColors.accentMuted,
    borderWidth: 1,
    borderColor: SolderiColors.accent,
  },
  lockedCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: SolderiColors.accent,
  },
  lockedHint: {
    fontSize: 13,
    color: SolderiColors.textMuted,
  },
  categoryBleed: {
    marginHorizontal: -CONTENT_PADDING,
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
