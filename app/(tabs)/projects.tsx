import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContinueBuildingCarousel } from '@/components/home/ContinueBuildingCarousel';
import { ContinueLearningCard } from '@/components/home/ContinueLearningCard';
import { SearchBar } from '@/components/home/SearchBar';
import { FilterChips } from '@/components/inventory/FilterChips';
import { ProjectListCard } from '@/components/projects/ProjectListCard';
import { PageHeader } from '@/components/ui/page-header';
import type { SolderiPalette } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';
import { getProjectSteps, getStepSubtitle } from '@/constants/project-steps';
import {
  PROJECT_DIFFICULTY_FILTERS,
  PROJECT_VIEW_FILTERS,
  ProjectDifficultyFilter,
  ProjectViewFilter,
} from '@/constants/projects-data';
import { useAtlas } from '@/context/atlas-context';
import { useSolderiColors } from '@/context/theme-context';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const { getProjectsWithStatus, isFavourite, getCurrentStepIndex } = useAtlas();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<ProjectViewFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<ProjectDifficultyFilter>('all');

  useEffect(() => {
    if (filter === 'favourites') {
      setViewFilter('favourites');
    }
  }, [filter]);

  const allProjects = getProjectsWithStatus();

  const inProgressProjects = useMemo(
    () => allProjects.filter((p) => p.status === 'in_progress'),
    [allProjects],
  );

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allProjects.filter((project) => {
      const matchesView =
        viewFilter === 'all' ||
        (viewFilter === 'in_progress' && project.status === 'in_progress') ||
        (viewFilter === 'favourites' && isFavourite(project.id)) ||
        (viewFilter === 'completed' && project.status === 'completed');

      const matchesDifficulty =
        difficultyFilter === 'all' || project.difficulty === difficultyFilter;

      const matchesSearch =
        query.length === 0 ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      return matchesView && matchesDifficulty && matchesSearch;
    });
  }, [allProjects, searchQuery, viewFilter, difficultyFilter, isFavourite]);

  const showContinueSection =
    viewFilter === 'all' && inProgressProjects.length > 0 && searchQuery.trim().length === 0;

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
          filters={PROJECT_VIEW_FILTERS}
          selected={viewFilter}
          onSelect={setViewFilter}
        />

        <FilterChips
          filters={PROJECT_DIFFICULTY_FILTERS}
          selected={difficultyFilter}
          onSelect={setDifficultyFilter}
        />

        {showContinueSection ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Building</Text>
            <ContinueBuildingCarousel
              items={inProgressProjects}
              horizontalInset={20}
              keyExtractor={(project) => project.id}
              renderItem={(project, cardWidth) => {
                const steps = getProjectSteps(project);
                const stepIndex = getCurrentStepIndex(project.id);
                const subtitle = getStepSubtitle(project, stepIndex, steps);

                return (
                  <ContinueLearningCard
                    projectId={project.id}
                    title={project.title}
                    subtitle={subtitle}
                    progress={project.progress ?? 0}
                    image={project.image}
                    width={cardWidth}
                  />
                );
              }}
            />
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {viewFilter === 'all' ? 'All Projects' : PROJECT_VIEW_FILTERS.find((f) => f.id === viewFilter)?.label}
          </Text>
          <Text style={styles.listCount}>{filteredProjects.length} projects</Text>
        </View>

        <View style={styles.list}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
            </View>
          )}
        </View>
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
    section: {
      gap: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.3,
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
