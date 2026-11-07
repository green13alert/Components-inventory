import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContinueBuildingCarousel } from '@/components/home/ContinueBuildingCarousel';
import { ContinueLearningCard } from '@/components/home/ContinueLearningCard';
import { SearchBar } from '@/components/home/SearchBar';
import { ProjectCatalogueDropdowns, ProjectMenuOverlay } from '@/components/projects/ProjectDiscoveryControls';
import { ProjectListCard } from '@/components/projects/ProjectListCard';
import { PageHeader } from '@/components/ui/page-header';
import type { SolderiPalette } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';
import { useAtlas } from '@/context/atlas-context';
import { draftProjectsAreRequested } from '@/lib/draft-preview';
import { shownInProjectCatalogue } from '@/lib/catalogue-visibility';
import {
  discoveryCoverage,
  discoverySections,
  draftPreviewDiagnostic,
  draftPreviewSectionVisible,
  initialProjectCatalogueFilters,
  orderDiscoveryProjects,
  projectCountLabel,
  projectListPresentation,
  projectMatchesDifficulty,
  projectMatchesStatus,
  resetProjectCatalogueFilters,
  selectProjectDifficulty,
  selectProjectSort,
  selectProjectStatus,
  type ProjectMenuAnchor,
  type ProjectMenuId,
} from '@/lib/project-discovery';
import {
  fetchDraftProjects,
  fetchProjectCompatibility,
  getUserProjectProgressPercent,
  getUserProjectStatus,
  matchProjectInventory,
  PROJECT_ERRORS,
  type Project,
  type ProjectCompatibilityData,
} from '@/lib/projects';
import { useSolderiColors } from '@/context/theme-context';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const {
    inventory,
    inventoryLoading,
    inventoryError,
    publishedProjects,
    projectsLoading,
    projectsError,
    getUserProject,
    reloadInventory,
  } = useAtlas();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialProjectCatalogueFilters);
  const [openMenu, setOpenMenu] = useState<ProjectMenuId | null>(null);
  const [menuAnchors, setMenuAnchors] = useState<ProjectMenuAnchor[]>([]);
  const [compatibility, setCompatibility] = useState<ProjectCompatibilityData | null>(null);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [partsRefreshPending, setPartsRefreshPending] = useState(true);
  const [partsRefreshFailed, setPartsRefreshFailed] = useState(false);
  const [draftProjects, setDraftProjects] = useState<Project[]>([]);
  const [draftAuthorized, setDraftAuthorized] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const showDrafts = draftProjectsAreRequested(__DEV__);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setPartsRefreshPending(true);
      setPartsRefreshFailed(false);
      void reloadInventory({ silent: true }).then((result) => {
        if (!active) {
          return;
        }
        setPartsRefreshPending(false);
        setPartsRefreshFailed(result.error != null);
      });
      return () => {
        active = false;
      };
    }, [reloadInventory]),
  );

  const projectIds = useMemo(
    () => [...publishedProjects, ...draftProjects].map((project) => project.id),
    [draftProjects, publishedProjects],
  );
  const inventoryComponentIds = useMemo(
    () => [...new Set(inventory.flatMap((item) => (item.componentId ? [item.componentId] : [])))].sort(),
    [inventory],
  );

  useEffect(() => {
    if (filter === 'favourites') {
      setFilters((current) => selectProjectStatus(current, 'favourites'));
    }
  }, [filter]);

  useEffect(() => {
    if (!showDrafts) {
      return;
    }

    let cancelled = false;
    void fetchDraftProjects().then((result) => {
      if (cancelled) {
        return;
      }
      if (result.error || !result.data) {
        setDraftProjects([]);
        setDraftAuthorized(false);
        setDraftChecked(true);
        setDraftError(result.error ?? PROJECT_ERRORS.generic);
        if (__DEV__) {
          console.warn(`[Solderi] ${draftPreviewDiagnostic({ userId: null, error: result.error ?? PROJECT_ERRORS.generic })}`);
        }
        return;
      }
      setDraftProjects(result.data.projects);
      setDraftAuthorized(result.data.authorized);
      setDraftChecked(true);
      setDraftError(null);
      if (__DEV__ && !result.data.authorized) {
        console.warn(`[Solderi] ${draftPreviewDiagnostic({ userId: result.data.userId, error: null })}`);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showDrafts]);

  useEffect(() => {
    let cancelled = false;

    if (projectIds.length === 0) {
      setCompatibility(null);
      setCompatibilityError(null);
      return;
    }

    void fetchProjectCompatibility(projectIds, inventoryComponentIds).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.error || !result.data) {
        setCompatibility(null);
        setCompatibilityError(result.error ?? PROJECT_ERRORS.generic);
        return;
      }
      setCompatibility(result.data);
      setCompatibilityError(null);
    });

    return () => {
      cancelled = true;
    };
  }, [inventoryComponentIds, projectIds]);

  const matchesByProjectId = useMemo(() => {
    const loaded = compatibilityError ? null : compatibility;
    return new Map(
      [...publishedProjects, ...draftProjects].map(
        (project) => [project.id, matchProjectInventory(project.bom, inventory, loaded)] as const,
      ),
    );
  }, [compatibility, compatibilityError, draftProjects, inventory, publishedProjects]);

  const partsCoverage = useMemo(
    () =>
      discoveryCoverage({
        inventoryLoading,
        refreshPending: partsRefreshPending,
        refreshFailed: partsRefreshFailed,
        inventoryError,
        compatibilityPending: projectIds.length > 0 && compatibility == null && compatibilityError == null,
        compatibilityError,
      }),
    [
      compatibility,
      compatibilityError,
      inventoryError,
      inventoryLoading,
      partsRefreshFailed,
      partsRefreshPending,
      projectIds.length,
    ],
  );

  const inProgressProjects = useMemo(() => {
    return publishedProjects
      .filter((project) => getUserProjectStatus(getUserProject(project.id)) === 'in_progress')
      .sort((a, b) => {
        const aUpdated = getUserProject(a.id)?.updatedAt ?? '';
        const bUpdated = getUserProject(b.id)?.updatedAt ?? '';
        return bUpdated.localeCompare(aUpdated);
      });
  }, [getUserProject, publishedProjects]);

  const listedProjects = useMemo(() => {
    return publishedProjects.filter((project) => {
      const userProject = getUserProject(project.id);
      const status = getUserProjectStatus(userProject);
      const matchesView = projectMatchesStatus({
        status: filters.status,
        progress: status,
        isFavourite: userProject?.isFavourite === true,
      });
      const matchesDifficulty = projectMatchesDifficulty(filters.difficulty, project.difficulty);
      const matchesCatalogue = shownInProjectCatalogue({
        slug: project.slug,
        status,
        isFavourite: userProject?.isFavourite === true,
      });
      return matchesView && matchesDifficulty && matchesCatalogue;
    });
  }, [filters.difficulty, filters.status, getUserProject, publishedProjects]);

  const showDraftSection = draftPreviewSectionVisible({
    requested: showDrafts,
    authorized: draftChecked && draftAuthorized && draftError == null,
  });
  const catalogueProjects = useMemo(() => {
    return publishedProjects.filter((project) => {
      const userProject = getUserProject(project.id);
      return shownInProjectCatalogue({
        slug: project.slug,
        status: getUserProjectStatus(userProject),
        isFavourite: userProject?.isFavourite === true,
      });
    });
  }, [getUserProject, publishedProjects]);
  const catalogueSections = useMemo(() => {
    const sections = discoverySections({
      published: listedProjects,
      drafts: draftProjects,
      search: searchQuery,
      showDrafts: showDraftSection,
    });
    return sections.map((section) => ({
      ...section,
      projects: orderDiscoveryProjects({
        projects: section.projects,
        matches: matchesByProjectId,
        coverage: partsCoverage,
        canBuild: false,
        sort: filters.sort,
      }),
    }));
  }, [draftProjects, filters.sort, listedProjects, matchesByProjectId, partsCoverage, searchQuery, showDraftSection]);
  const publishedSection = catalogueSections.find((section) => section.id === 'published');
  const draftSection = catalogueSections.find((section) => section.id === 'drafts');
  const filteredProjects = publishedSection?.projects ?? [];

  const showContinueSection =
    filters.status === 'all' && inProgressProjects.length > 0 && searchQuery.trim().length === 0;

  const presentation = projectListPresentation({
    projectsLoading,
    projectsError,
    catalogueCount: catalogueProjects.length,
    visibleCount: filteredProjects.length,
    searchActive: searchQuery.trim().length > 0,
    statusActive: filters.status !== 'all',
    difficultyActive: filters.difficulty !== 'all',
  });

  const rememberAnchor = (anchor: ProjectMenuAnchor) => {
    setMenuAnchors((current) => {
      const previous = current.find((item) => item.menu === anchor.menu);
      if (
        previous &&
        previous.x === anchor.x &&
        previous.y === anchor.y &&
        previous.width === anchor.width &&
        previous.height === anchor.height
      ) {
        return current;
      }
      return [...current.filter((item) => item.menu !== anchor.menu), anchor];
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
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

        <ProjectCatalogueDropdowns
          filters={filters}
          openMenu={openMenu}
          onMenuChange={setOpenMenu}
          onAnchor={rememberAnchor}
        />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Published</Text>
          {presentation.kind === 'loading' ? null : (
            <Text style={styles.listCount}>{projectCountLabel(filteredProjects.length)}</Text>
          )}
        </View>

        {presentation.kind === 'loading' ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.emptySubtitle}>Loading projects…</Text>
          </View>
        ) : presentation.kind === 'list' ? (
          <View style={styles.list}>
            {filteredProjects.map((project) => {
              const match = matchesByProjectId.get(project.id);
              if (!match) {
                return null;
              }
              return (
                <ProjectListCard
                  key={project.id}
                  project={project}
                  match={match}
                  partsState={partsCoverage}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{presentation.title}</Text>
            <Text style={styles.emptySubtitle}>{presentation.description}</Text>
            {presentation.kind === 'empty' && presentation.resetFilters ? (
              <Pressable
                style={styles.clearFilters}
                onPress={() => setFilters(resetProjectCatalogueFilters())}
                accessibilityRole="button"
                accessibilityLabel="Reset filters">
                <Text style={styles.clearFiltersLabel}>Reset</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {showContinueSection ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Building</Text>
            <ContinueBuildingCarousel
              items={inProgressProjects}
              horizontalInset={20}
              keyExtractor={(project: Project) => project.id}
              renderItem={(project: Project, cardWidth: number) => {
                const stepIndex = getUserProject(project.id)?.currentStep ?? 0;
                const totalSteps = project.authoredSteps.length;
                const current = project.authoredSteps[stepIndex] ?? project.authoredSteps[0];
                const subtitle =
                  totalSteps > 0
                    ? `Step ${Math.min(stepIndex, totalSteps - 1) + 1} of ${totalSteps} · ${current?.title ?? ''}`
                    : 'Walkthrough not yet available';
                const progress = getUserProjectProgressPercent(getUserProject(project.id), totalSteps);

                return (
                  <ContinueLearningCard
                    projectId={project.slug}
                    title={project.title}
                    subtitle={subtitle}
                    progress={progress}
                    imageKey={project.imageKey}
                    width={cardWidth}
                  />
                );
              }}
            />
          </View>
        ) : null}

        {showDraftSection &&
        (searchQuery.trim().length === 0 || (draftSection?.projects.length ?? 0) > 0) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Draft Projects</Text>
            <Text style={styles.draftNote}>
              Development only. These projects are unpublished and stay hidden from other accounts.
            </Text>
            {(draftSection?.projects.length ?? 0) > 0 ? (
              <View style={styles.list}>
                {draftSection?.projects.map((project) => {
                  const match = matchesByProjectId.get(project.id);
                  if (!match) {
                    return null;
                  }
                  return (
                    <ProjectListCard
                      key={project.id}
                      project={project}
                      match={match}
                      partsState={partsCoverage}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptySubtitle}>No unpublished projects.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
      <ProjectMenuOverlay
        filters={filters}
        openMenu={openMenu}
        anchors={menuAnchors}
        onMenuChange={setOpenMenu}
        onStatus={(status) => setFilters((current) => selectProjectStatus(current, status))}
        onDifficulty={(difficulty) => setFilters((current) => selectProjectDifficulty(current, difficulty))}
        onSort={(sort) => setFilters((current) => selectProjectSort(current, sort))}
      />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screen: {
      flex: 1,
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
    draftNote: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    clearFilters: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    clearFiltersLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
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
