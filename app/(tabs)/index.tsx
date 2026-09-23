import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeOnboardingDevButton } from '@/components/dev/onboarding-shortcuts';
import { BuildActivitySection } from '@/components/home/BuildActivityGraph';
import { ContinueBuildingCarousel } from '@/components/home/ContinueBuildingCarousel';
import { ContinueProjectCard } from '@/components/home/ContinueProjectCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeRecommendedCard } from '@/components/home/HomeRecommendedCard';
import { RecentComponents } from '@/components/home/RecentComponents';
import { SectionHeading } from '@/components/home/SectionHeading';
import { WorkshopStats } from '@/components/home/WorkshopStats';
import type { SolderiPalette } from '@/constants/colors';
import { DEV_ONBOARDING_SHORTCUTS } from '@/constants/onboarding-dev';
import { tabBarBottomPadding } from '@/constants/layout';
import { getProjectImage } from '@/constants/projects';
import { DIFFICULTY_LABELS } from '@/constants/projects-data';
import { Spacing } from '@/constants/tokens';
import { useAtlas } from '@/context/atlas-context';
import { useSolderiColors } from '@/context/theme-context';

const RECOMMENDED_PROJECT_LIMIT = 3;
const RECENT_COMPONENT_COUNT = 4;

export default function HomeScreen() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { getProjectsWithStatus, inventory, getCurrentStepIndex, getUserProject } = useAtlas();

  const projects = getProjectsWithStatus();
  const continueProjects = projects
    .filter((p) => p.status === 'in_progress')
    .sort((a, b) => {
      const aUpdated = getUserProject(a.id)?.updatedAt ?? '';
      const bUpdated = getUserProject(b.id)?.updatedAt ?? '';
      return bUpdated.localeCompare(aUpdated);
    });
  const recommendedProjects = projects
    .filter((project) => project.requiredComponentCount > 0 || project.authoredSteps.length > 0)
    .slice(0, RECOMMENDED_PROJECT_LIMIT);
  const recentComponents = [...inventory]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, RECENT_COMPONENT_COUNT);

  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: DEV_ONBOARDING_SHORTCUTS
              ? tabBarBottomPadding(insets.bottom) + 64
              : tabBarBottomPadding(insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <HomeHeader />

        {continueProjects.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Continue Building" />
            <ContinueBuildingCarousel
              items={continueProjects}
              keyExtractor={(project) => project.id}
              renderItem={(project, cardWidth) => {
                const stepIndex = getCurrentStepIndex(project.id);
                const totalSteps = project.authoredSteps.length;
                const current = project.authoredSteps[stepIndex] ?? project.authoredSteps[0];
                const stepLabel =
                  totalSteps > 0
                    ? `Step ${Math.min(stepIndex, totalSteps - 1) + 1} of ${totalSteps}`
                    : 'Walkthrough not yet available';

                return (
                  <ContinueProjectCard
                    projectId={project.slug}
                    title={project.title}
                    stepLabel={stepLabel}
                    stepTitle={current?.title ?? ''}
                    progress={project.progress ?? 0}
                    image={getProjectImage(project.imageKey)}
                    width={cardWidth}
                  />
                );
              }}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeading title="Your Workshop" />
          <WorkshopStats
            componentCount={inventory.length}
            projectCount={inProgressCount}
            completedCount={completedCount}
          />
        </View>

        <BuildActivitySection />

        {recommendedProjects.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Recommended For You" />
            <View style={styles.recommendedList}>
              {recommendedProjects.map((project) => (
                <HomeRecommendedCard
                  key={project.id}
                  projectId={project.slug}
                  title={project.title}
                  difficulty={DIFFICULTY_LABELS[project.difficulty]}
                  duration={project.durationLabel}
                  componentCount={project.requiredComponentCount}
                  image={getProjectImage(project.imageKey)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeading title="Recently Added" />
          <RecentComponents items={recentComponents} />
        </View>
      </ScrollView>

      {/* TEMP dev onboarding shortcut — see constants/onboarding-dev.ts */}
      {DEV_ONBOARDING_SHORTCUTS ? <HomeOnboardingDevButton /> : null}
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
      paddingHorizontal: Spacing.xl,
      gap: Spacing['3xl'],
    },
    section: {
      gap: Spacing.lg,
    },
    recommendedList: {
      gap: Spacing.xs,
    },
  });
}
