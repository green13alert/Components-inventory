import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { ComponentModal } from '@/components/inventory/ComponentModal';
import { FilterChips } from '@/components/inventory/FilterChips';
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { SearchBar } from '@/components/home/SearchBar';
import { PageHeader } from '@/components/ui/page-header';
import type { SolderiPalette } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';
import { COMPONENT_FILTERS, ComponentCategory, type InventoryComponent } from '@/constants/inventory';
import { useAtlas } from '@/context/atlas-context';
import { useSolderiColors } from '@/context/theme-context';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useAtlas();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ComponentCategory>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryComponent | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesCategory = selectedFilter === 'all' || item.category === selectedFilter;
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [inventory, searchQuery, selectedFilter]);

  const isFiltered =
    searchQuery.trim().length > 0 || selectedFilter !== 'all';
  const isEmptyInventory = inventory.length === 0;

  const openAddModal = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const openEditModal = (item: InventoryComponent) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <PageHeader title="Inventory" subtitle="Track the components you own" />

        <SearchBar
          placeholder="Search components..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Pressable style={styles.addButton} onPress={openAddModal} accessibilityRole="button">
          <Ionicons name="add-circle-outline" size={22} color={colors.onAccent} />
          <Text style={styles.addButtonText}>Add Components</Text>
        </Pressable>

        <FilterChips
          filters={COMPONENT_FILTERS}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Your Components</Text>
          <Text style={styles.listCount}>{filteredItems.length} items</Text>
        </View>

        <View style={styles.list}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <InventoryItemCard key={item.id} item={item} onPress={() => openEditModal(item)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              {isEmptyInventory && !isFiltered ? (
                <>
                  <ComponentIllustration id="generic-board" size={56} />
                  <Text style={styles.emptyTitle}>No components yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Add the hardware you own to start matching projects
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="search-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No components found</Text>
                  <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <ComponentModal
        visible={modalVisible}
        editingItem={editingItem}
        onClose={closeModal}
        onAdd={addInventoryItem}
        onUpdate={updateInventoryItem}
        onDelete={removeInventoryItem}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      gap: 20,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 16,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    listTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    listCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    list: {
      gap: 10,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}
