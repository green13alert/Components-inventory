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
import { SolderiColors } from '@/constants/colors';
import { DEV_ONBOARDING_SHORTCUTS } from '@/constants/onboarding-dev';
import { tabBarBottomPadding } from '@/constants/layout';
import { DIFFICULTY_LABELS } from '@/constants/projects-data';
import { getProjectSteps } from '@/constants/project-steps';
import { Spacing } from '@/constants/tokens';
import { useAtlas } from '@/context/atlas-context';

const RECOMMENDED_PROJECT_IDS = ['3', '7', '8'];

const RECENT_COMPONENT_IDS = ['6', '4', '3', '9'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getProjectsWithStatus, inventory, getCurrentStepIndex } = useAtlas();

  const projects = getProjectsWithStatus();
  const continueProjects = projects.filter((p) => p.status === 'in_progress');
  const recommendedProjects = RECOMMENDED_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)!);
  const recentComponents = RECENT_COMPONENT_IDS.map((id) => inventory.find((c) => c.id === id)!).filter(
    Boolean,
  );

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
                const steps = getProjectSteps(project);
                const stepIndex = getCurrentStepIndex(project.id);
                const step = steps[stepIndex];

                return (
                  <ContinueProjectCard
                    projectId={project.id}
                    title={project.title}
                    stepLabel={`Step ${stepIndex + 1} of ${steps.length}`}
                    stepTitle={step?.title ?? ''}
                    progress={project.progress ?? 0}
                    image={project.image}
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

        <View style={styles.section}>
          <SectionHeading title="Recommended For You" />
          <View style={styles.recommendedList}>
            {recommendedProjects.map((project) => (
              <HomeRecommendedCard
                key={project.id}
                projectId={project.id}
                title={project.title}
                difficulty={DIFFICULTY_LABELS[project.difficulty]}
                duration={project.duration}
                componentCount={project.totalParts}
                image={project.image}
              />
            ))}
          </View>
        </View>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SolderiColors.background,
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
