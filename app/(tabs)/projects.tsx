import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  getStepCount,
  type ProjectDifficultyFilter,
  type ProjectViewFilter,
} from '@/constants/projects-data';
import { useAtlas } from '@/context/atlas-context';
import {
  getUserProjectProgressPercent,
  getUserProjectStatus,
  matchProjectInventory,
  toWalkthroughProject,
  type Project,
} from '@/lib/projects';
import { useSolderiColors } from '@/context/theme-context';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const {
    inventory,
    inventoryLoading,
    publishedProjects,
    projectsLoading,
    projectsError,
    getUserProject,
  } = useAtlas();
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

  const matchesByProjectId = useMemo(() => {
    return new Map(
      publishedProjects.map((project) => [project.id, matchProjectInventory(project.bom, inventory)] as const),
    );
  }, [publishedProjects, inventory]);

  const inProgressProjects = useMemo(() => {
    return publishedProjects
      .filter((project) => getUserProjectStatus(getUserProject(project.id)) === 'in_progress')
      .sort((a, b) => {
        const aUpdated = getUserProject(a.id)?.updatedAt ?? '';
        const bUpdated = getUserProject(b.id)?.updatedAt ?? '';
        return bUpdated.localeCompare(aUpdated);
      });
  }, [getUserProject, publishedProjects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return publishedProjects.filter((project) => {
      const userProject = getUserProject(project.id);
      const status = getUserProjectStatus(userProject);
      const matchesView =
        viewFilter === 'all' ||
        (viewFilter === 'in_progress' && status === 'in_progress') ||
        (viewFilter === 'favourites' && userProject?.isFavourite === true) ||
        (viewFilter === 'completed' && status === 'completed');

      const matchesDifficulty = difficultyFilter === 'all' || project.difficulty === difficultyFilter;
      const matchesSearch =
        query.length === 0 ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      return matchesView && matchesDifficulty && matchesSearch;
    });
  }, [difficultyFilter, getUserProject, publishedProjects, searchQuery, viewFilter]);

  const showContinueSection =
    viewFilter === 'all' && inProgressProjects.length > 0 && searchQuery.trim().length === 0;

  const emptyTitle = projectsError ? 'Could not load projects' : 'No published projects';
  const emptySubtitle = projectsError
    ? projectsError
    : searchQuery.trim().length > 0 || difficultyFilter !== 'all' || viewFilter !== 'all'
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
              keyExtractor={(project: Project) => project.id}
              renderItem={(project: Project, cardWidth: number) => {
                const walkthrough = toWalkthroughProject(project, 'in_progress');
                const steps = getProjectSteps(walkthrough);
                const stepIndex = getUserProject(project.id)?.currentStep ?? 0;
                const subtitle = getStepSubtitle(walkthrough, stepIndex, steps);
                const progress = getUserProjectProgressPercent(
                  getUserProject(project.id),
                  getStepCount(project.difficulty),
                );

                return (
                  <ContinueLearningCard
                    projectId={project.slug}
                    title={project.title}
                    subtitle={subtitle}
                    progress={progress}
                    image={walkthrough.image}
                    width={cardWidth}
                  />
                );
              }}
            />
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {viewFilter === 'all' ? 'All Projects' : PROJECT_VIEW_FILTERS.find((item) => item.id === viewFilter)?.label}
          </Text>
          <Text style={styles.listCount}>{filteredProjects.length} projects</Text>
        </View>

        {projectsLoading ? (
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
      textAlign: 'center',
    },
  });
}
