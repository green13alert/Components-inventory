import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterChips } from '@/components/inventory/FilterChips';
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { SearchBar } from '@/components/home/SearchBar';
import { PageHeader } from '@/components/ui/page-header';
import { tabBarBottomPadding } from '@/constants/layout';
import { ArduinoColors } from '@/constants/colors';
import {
  COMPONENT_FILTERS,
  ComponentCategory,
  MOCK_INVENTORY,
} from '@/constants/inventory';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ComponentCategory>('all');

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MOCK_INVENTORY.filter((item) => {
      const matchesCategory = selectedFilter === 'all' || item.category === selectedFilter;
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedFilter]);

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

        <Pressable style={styles.addButton} accessibilityRole="button">
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
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
            filteredItems.map((item) => <InventoryItemCard key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={ArduinoColors.textMuted} />
              <Text style={styles.emptyTitle}>No components found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
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
    backgroundColor: ArduinoColors.blue,
    borderRadius: 14,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
  },
  listCount: {
    fontSize: 14,
    color: ArduinoColors.textSecondary,
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
    color: ArduinoColors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: ArduinoColors.textSecondary,
  },
});
