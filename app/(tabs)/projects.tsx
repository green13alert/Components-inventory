import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/home/SearchBar';
import { FilterChips } from '@/components/inventory/FilterChips';
import { ProjectListCard } from '@/components/projects/ProjectListCard';
import { PageHeader } from '@/components/ui/page-header';
import type { SolderiPalette } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';
import {
  PROJECT_DIFFICULTY_FILTERS,
  type ProjectDifficultyFilter,
} from '@/constants/projects-data';
import { useAtlas } from '@/context/atlas-context';
import { fetchProjects, matchProjectInventory, PROJECT_ERRORS, type Project } from '@/lib/projects';
import { useSolderiColors } from '@/context/theme-context';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { inventory, inventoryLoading } = useAtlas();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<ProjectDifficultyFilter>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const result = await fetchProjects();
    setLoading(false);

    if (result.error || !result.data) {
      setProjects([]);
      setError(result.error ?? PROJECT_ERRORS.generic);
      return;
    }

    setError(null);
    setProjects(result.data);
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const matchesByProjectId = useMemo(() => {
    return new Map(
      projects.map((project) => [project.id, matchProjectInventory(project.bom, inventory)] as const),
    );
  }, [projects, inventory]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesDifficulty = difficultyFilter === 'all' || project.difficulty === difficultyFilter;
      const matchesSearch =
        query.length === 0 ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      return matchesDifficulty && matchesSearch;
    });
  }, [projects, searchQuery, difficultyFilter]);

  const emptyTitle = error ? 'Could not load projects' : 'No published projects';
  const emptySubtitle = error
    ? error
    : searchQuery.trim().length > 0 || difficultyFilter !== 'all'
      ? 'Try a different search or filter'
      : 'Published projects will appear here';

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
        <PageHeader title="Projects" subtitle="Browse and manage your Arduino builds" />

        <SearchBar
          placeholder="Search projects..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FilterChips
          filters={PROJECT_DIFFICULTY_FILTERS}
          selected={difficultyFilter}
          onSelect={setDifficultyFilter}
        />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Projects</Text>
          <Text style={styles.listCount}>{filteredProjects.length} projects</Text>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.emptySubtitle}>Loading projects…</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectListCard
                  key={project.id}
                  project={project}
                  match={matchesByProjectId.get(project.id)!}
                  inventoryReady={!inventoryLoading}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
      textAlign: 'center',
    },
  });
}
