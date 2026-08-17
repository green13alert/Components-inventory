import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAtlas } from '@/context/atlas-context';
import { ArduinoColors } from '@/constants/colors';
import { getProjectSteps } from '@/constants/project-steps';
import { getProjectById, getStartButtonLabel } from '@/constants/projects-data';

export default function ProjectBuildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
          <Ionicons name="alert-circle-outline" size={40} color={ArduinoColors.textMuted} />
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
      router.replace({ pathname: '/project/[id]', params: { id: project.id } });
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
            <Ionicons name="chevron-back" size={24} color={ArduinoColors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.readyState}>
          <View style={styles.readyIcon}>
            <Ionicons name="construct-outline" size={48} color={ArduinoColors.blue} />
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
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{getStartButtonLabel(status)}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={ArduinoColors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.readyState}>
          <View style={[styles.readyIcon, styles.completedIcon]}>
            <Ionicons name="checkmark-circle" size={48} color={ArduinoColors.success} />
          </View>
          <Text style={styles.readyTitle}>Project complete!</Text>
          <Text style={styles.readySubtitle}>
            You finished all {steps.length} steps. Great work on {project.title}.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace({ pathname: '/project/[id]', params: { id: project.id } })}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Back to Project</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
          <Ionicons name="chevron-back" size={24} color={ArduinoColors.textPrimary} />
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
          <Ionicons name="close" size={22} color={ArduinoColors.textSecondary} />
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
        {currentStep.tip ? (
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={18} color={ArduinoColors.warning} />
            <Text style={styles.tipText}>{currentStep.tip}</Text>
          </View>
        ) : null}

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
          <Ionicons name="chevron-back" size={18} color={ArduinoColors.textPrimary} />
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handleNext} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>{isLastStep ? 'Complete' : 'Next Step'}</Text>
          <Ionicons name={isLastStep ? 'checkmark' : 'chevron-forward'} size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
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
    color: ArduinoColors.textPrimary,
    textAlign: 'center',
  },
  topBarSubtitle: {
    fontSize: 13,
    color: ArduinoColors.textSecondary,
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
    color: ArduinoColors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
    color: ArduinoColors.blue,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ArduinoColors.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ArduinoColors.blue,
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
    backgroundColor: ArduinoColors.blueMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ArduinoColors.blue,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 26,
    color: ArduinoColors.textSecondary,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    padding: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: ArduinoColors.warning,
    fontWeight: '500',
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
    backgroundColor: ArduinoColors.surfaceElevated,
  },
  dotActive: {
    backgroundColor: ArduinoColors.blue,
    width: 20,
  },
  dotCompleted: {
    backgroundColor: ArduinoColors.success,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ArduinoColors.border,
    backgroundColor: ArduinoColors.background,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ArduinoColors.blue,
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ArduinoColors.textPrimary,
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
    backgroundColor: ArduinoColors.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  completedIcon: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
    textAlign: 'center',
  },
  readySubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: ArduinoColors.textSecondary,
    textAlign: 'center',
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
    color: ArduinoColors.textPrimary,
  },
  notFoundButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
  },
  notFoundButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ArduinoColors.textPrimary,
  },
});
