import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodeBlock, StepContent } from '@/components/projects/walkthrough/StepContent';
import type { SolderiPalette } from '@/constants/colors';
import { getProjectSteps } from '@/constants/project-steps';
import { getProjectById, getStartButtonLabel } from '@/constants/projects-data';
import { getProjectSketch } from '@/constants/walkthrough-content';
import { useAtlas } from '@/context/atlas-context';
import { useSolderiColors } from '@/context/theme-context';

export default function ProjectBuildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    getCurrentStepIndex,
    setProjectStep,
    completeProject,
    startProject,
    getProjectStatus,
    getProjectProgressPercent,
  } = useAtlas();

  const project = getProjectById(id ?? '');
  const steps = useMemo(() => (project ? getProjectSteps(project) : []), [project]);

  if (!project) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Project not found</Text>
          <Pressable style={styles.notFoundButton} onPress={() => router.back()}>
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const status = getProjectStatus(project.id);
  const currentStepIndex = getCurrentStepIndex(project.id);
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const progressPercent = getProjectProgressPercent(project.id, project.difficulty);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isCompleted = status === 'completed';

  const handlePrev = () => {
    if (!isFirstStep) {
      setProjectStep(project.id, currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      completeProject(project.id);
      return;
    }
    setProjectStep(project.id, currentStepIndex + 1);
  };

  const handleStartOrContinue = () => {
    if (status === 'not_started') {
      startProject(project.id);
    }
  };

  if (status === 'not_started') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.readyState}>
          <View style={styles.readyIcon}>
            <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.readyTitle}>Ready to build?</Text>
          <Text style={styles.readySubtitle}>
            This project has {steps.length} guided steps. You can pause anytime and pick up where you left off.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              handleStartOrContinue();
            }}
            accessibilityRole="button">
            <Ionicons name="play" size={20} color={colors.onAccent} />
            <Text style={styles.primaryButtonText}>{getStartButtonLabel(status)}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isCompleted) {
    return (
      <ProjectCompleteView
        title={project.title}
        stepCount={steps.length}
        onBackToProject={() => router.replace({ pathname: '/project/[id]', params: { id: project.id } })}
        onBrowseProjects={() => router.replace('/projects')}
        sketch={getProjectSketch(project)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <Text style={styles.topBarSubtitle}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.replace({ pathname: '/project/[id]', params: { id: project.id } })}
          accessibilityRole="button"
          accessibilityLabel="Exit build">
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step {currentStepIndex + 1}</Text>
        </View>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepDescription}>{currentStep.description}</Text>
        <StepContent blocks={currentStep.blocks} />

        <View style={styles.stepDots}>
          {steps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.dot,
                index === currentStepIndex && styles.dotActive,
                index < currentStepIndex && styles.dotCompleted,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.secondaryButton, isFirstStep && styles.buttonDisabled]}
          onPress={handlePrev}
          disabled={isFirstStep}
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handleNext} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>{isLastStep ? 'Complete' : 'Next Step'}</Text>
          <Ionicons name={isLastStep ? 'checkmark' : 'chevron-forward'} size={18} color={colors.onAccent} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ProjectCompleteView({
  title,
  stepCount,
  onBackToProject,
  onBrowseProjects,
  sketch,
}: {
  title: string;
  stepCount: number;
  onBackToProject: () => void;
  onBrowseProjects: () => void;
  sketch: ReturnType<typeof getProjectSketch>;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showCode, setShowCode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconButton}
          onPress={onBackToProject}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.iconButton} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.completeScroll}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.readyIcon, styles.completedIcon]}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>
        <Text style={styles.completeKicker}>Project complete</Text>
        <Text style={styles.readyTitle}>You've finished the project.</Text>
        <Text style={styles.readySubtitle}>
          You completed all {stepCount} steps of {title}.
        </Text>

        {showCode ? (
          <View style={styles.completeCode}>
            <CodeBlock {...sketch} />
          </View>
        ) : null}

        <View style={styles.completeActions}>
          <Pressable
            style={styles.secondaryButtonWide}
            onPress={() => setShowCode((open) => !open)}
            accessibilityRole="button">
            <Ionicons name="code-slash-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.secondaryButtonText}>{showCode ? 'Hide code' : 'View code'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButtonWide} onPress={onBrowseProjects} accessibilityRole="button">
            <Ionicons name="albums-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.secondaryButtonText}>Start another project</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onBackToProject} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Back to Project</Text>
          </Pressable>
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
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 12,
      gap: 8,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarCenter: {
      flex: 1,
      gap: 2,
    },
    topBarTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    topBarSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    progressSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 8,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    progressValue: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.accent,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceElevated,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      gap: 16,
    },
    stepBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accentMuted,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    stepBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
      textTransform: 'uppercase',
    },
    stepTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
      lineHeight: 32,
    },
    stepDescription: {
      fontSize: 16,
      lineHeight: 26,
      color: colors.textSecondary,
    },
    stepDots: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingTop: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceElevated,
    },
    dotActive: {
      backgroundColor: colors.accent,
      width: 20,
    },
    dotCompleted: {
      backgroundColor: colors.success,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    primaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 16,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    readyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 16,
    },
    readyIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    completedIcon: {
      backgroundColor: colors.successMuted,
    },
    readyTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    readySubtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    completeScroll: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 16,
      alignItems: 'center',
    },
    completeKicker: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.success,
      textAlign: 'center',
    },
    completeActions: {
      width: '100%',
      gap: 10,
      marginTop: 8,
    },
    completeCode: {
      width: '100%',
      alignSelf: 'stretch',
    },
    secondaryButtonWide: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 20,
    },
    notFoundTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    notFoundButton: {
      marginTop: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notFoundButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
}
