import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodeBlock, StepContent } from '@/components/projects/walkthrough/StepContent';
import { useWalkthroughScrollController, WalkthroughScrollProvider } from '@/components/projects/walkthrough/WalkthroughScroll';
import type { SolderiPalette } from '@/constants/colors';
import { useAtlas } from '@/context/atlas-context';
import {
  moveWalkthroughStep,
  resolveBuildDestination,
  walkthroughButtonFlex,
  walkthroughFooterControls,
  walkthroughFooterPadding,
  walkthroughProgressPercent,
  WALKTHROUGH_SAVE_FAILED,
} from '@/lib/project-navigation';
import {
  fetchProjectBySlug,
  fetchProjectSteps,
  getUserProjectStatus,
  getWalkthroughSketch,
  getWalkthroughStageContext,
  PROJECT_ERRORS,
  type Project,
  type ProjectWalkthroughStep,
} from '@/lib/projects';
import { collectPriorWiringConnections } from '@/lib/wiring-diagram';
import { useSolderiColors } from '@/context/theme-context';

const rowButtonFlex = walkthroughButtonFlex('row');
const standaloneButtonFlex = walkthroughButtonFlex('standalone');

export default function ProjectBuildScreen() {
  const { id, review: reviewParam, code: codeParam } = useLocalSearchParams<{
    id: string;
    review?: string | string[];
    code?: string | string[];
  }>();
  const slug = Array.isArray(id) ? id[0] : id;
  const reviewRequested = (Array.isArray(reviewParam) ? reviewParam[0] : reviewParam) === '1';
  const codeRequested = (Array.isArray(codeParam) ? codeParam[0] : codeParam) === '1';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    getCurrentStepIndex,
    getUserProject,
    setProjectStep,
    completeProject,
    startProject,
  } = useAtlas();

  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<ProjectWalkthroughStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(reviewRequested);
  const [isReviewingCode, setIsReviewingCode] = useState(codeRequested);
  const [reviewStepIndex, setReviewStepIndex] = useState(0);
  const [stepOverride, setStepOverride] = useState<number | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const startAttemptedRef = useRef<string | null>(null);
  const stepCursorRef = useRef(0);
  const [wiringPinchActive, setWiringPinchActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!slug) {
        setProject(null);
        setSteps([]);
        setError(PROJECT_ERRORS.notFound);
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await fetchProjectBySlug(slug);
      if (cancelled) {
        return;
      }

      if (result.error || !result.data) {
        setProject(null);
        setSteps([]);
        setError(result.error ?? PROJECT_ERRORS.notFound);
        setLoading(false);
        return;
      }

      const stepsResult = await fetchProjectSteps(result.data.id);
      if (cancelled) {
        return;
      }

      setProject(result.data);
      setSteps(stepsResult.data ?? []);
      setError(stepsResult.error);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    setIsReviewing(reviewRequested);
    setIsReviewingCode(codeRequested);
    setReviewStepIndex(0);
    setStepOverride(null);
    setSaveNotice(null);
  }, [codeRequested, reviewRequested, slug]);

  const projectKey = project?.id ?? '';
  const status = getUserProjectStatus(project ? getUserProject(projectKey) : undefined);
  const persistedStep = project ? getCurrentStepIndex(projectKey) : 0;
  const lastStepIndex = Math.max(0, steps.length - 1);
  const isCompleted = status === 'completed';
  const reviewMode = isCompleted && isReviewing && !isReviewingCode;
  const currentStepIndex = reviewMode
    ? Math.min(reviewStepIndex, lastStepIndex)
    : Math.min(stepOverride ?? persistedStep, lastStepIndex);
  const destination = resolveBuildDestination({
    stepCount: steps.length,
    status,
    reviewingSteps: isReviewing,
    reviewingCode: isReviewingCode,
  });

  useEffect(() => {
    if (!project || destination !== 'walkthrough' || status !== 'not_started') {
      return;
    }
    if (startAttemptedRef.current === project.id) {
      return;
    }
    startAttemptedRef.current = project.id;
    void startProject(project.id);
  }, [destination, project, startProject, status]);
  stepCursorRef.current = currentStepIndex;
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const stepNavigationKey = currentStep?.id ?? String(currentStepIndex);
  const walkthroughScroll = useWalkthroughScrollController(stepNavigationKey);
  const footerControls = walkthroughFooterControls({
    stepIndex: currentStepIndex,
    stepCount: steps.length,
    reviewing: reviewMode,
  });

  useEffect(() => {
    setWiringPinchActive(false);
  }, [stepNavigationKey]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.notFoundTitle}>Loading project…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>{error ?? PROJECT_ERRORS.notFound}</Text>
          <Pressable style={styles.notFoundButton} onPress={() => router.back()}>
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const stepBlocks =
    currentStep?.tip && !currentStep.blocks.some((block) => block.type === 'tip' && block.body === currentStep.tip)
      ? [...currentStep.blocks, { type: 'tip' as const, body: currentStep.tip }]
      : currentStep?.blocks ?? [];
  const priorWiringConnections = collectPriorWiringConnections(steps, currentStepIndex);
  const progressPercent = walkthroughProgressPercent(currentStepIndex, steps.length, reviewMode);
  const isFirstStep = !footerControls.previousEnabled;
  const isLastStep = footerControls.nextLabel !== 'Next Step';
  const sketch = getWalkthroughSketch(steps);
  const stage = getWalkthroughStageContext(steps, currentStepIndex);

  const exitReview = () => {
    if (reviewRequested || codeRequested) {
      router.replace({ pathname: '/project/[id]', params: { id: project.slug } });
      return;
    }
    setIsReviewing(false);
    setIsReviewingCode(false);
  };

  const openCodeReview = () => {
    setIsReviewing(false);
    setIsReviewingCode(true);
  };

  const persistStep = async (step: number) => {
    const result = await setProjectStep(project.id, step);
    if (stepCursorRef.current !== step) {
      return;
    }
    setSaveNotice(result.error ? WALKTHROUGH_SAVE_FAILED : null);
  };

  const finishProject = async () => {
    const result = await completeProject(project.id, stepCursorRef.current);
    setSaveNotice(result.error ? WALKTHROUGH_SAVE_FAILED : null);
  };

  const handlePrev = () => {
    if (isFirstStep) {
      return;
    }
    if (reviewMode) {
      setReviewStepIndex((index) => Math.max(index - 1, 0));
      return;
    }
    const previous = moveWalkthroughStep(stepCursorRef.current, -1, steps.length);
    if (previous === stepCursorRef.current) {
      return;
    }
    stepCursorRef.current = previous;
    setStepOverride(previous);
    void persistStep(previous);
  };

  const handleNext = () => {
    if (reviewMode) {
      if (isLastStep) {
        exitReview();
        return;
      }
      setReviewStepIndex((index) => Math.min(index + 1, lastStepIndex));
      return;
    }
    if (isLastStep) {
      void finishProject();
      return;
    }
    const next = moveWalkthroughStep(stepCursorRef.current, 1, steps.length);
    if (next === stepCursorRef.current) {
      return;
    }
    stepCursorRef.current = next;
    setStepOverride(next);
    void persistStep(next);
  };

  if (destination === 'coming_soon') {
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
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.readyTitle}>Walkthrough coming soon</Text>
          <Text style={styles.readySubtitle}>
            {error ?? PROJECT_ERRORS.stepsUnavailable}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (destination === 'complete') {
    return (
      <ProjectCompleteView
        title={project.title}
        stepCount={steps.length}
        hasSketch={sketch != null}
        onViewSteps={() => {
          setIsReviewingCode(false);
          setReviewStepIndex(0);
          setIsReviewing(true);
        }}
        onViewCode={openCodeReview}
        onBackToProject={() => router.replace({ pathname: '/project/[id]', params: { id: project.slug } })}
        onBrowseProjects={() => router.replace('/projects')}
      />
    );
  }

  if (destination === 'review_code') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={exitReview}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              {project.title}
            </Text>
            <Text style={styles.topBarSubtitle}>Your Code</Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={exitReview}
            accessibilityRole="button"
            accessibilityLabel="Exit code review">
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}>
          {sketch ? (
            <CodeBlock
              heading="Your Code"
              language={sketch.language}
              filename={sketch.filename}
              libraries={sketch.libraries}
              code={sketch.code}
              explain={{
                projectId: project.id,
                projectSlug: project.slug,
                projectTitle: project.title,
              }}
            />
          ) : (
            <Text style={styles.stepDescription}>No authored sketch is available for this project yet.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            if (reviewMode) {
              exitReview();
              return;
            }
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <Text style={styles.topBarSubtitle}>
            {reviewMode ? 'Review · ' : ''}
            {stage
              ? `Stage ${stage.stageNumber} of ${stage.stageCount}`
              : `Step ${currentStepIndex + 1} of ${steps.length}`}
          </Text>
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            if (reviewMode) {
              exitReview();
              return;
            }
            router.replace({ pathname: '/project/[id]', params: { id: project.slug } });
          }}
          accessibilityRole="button"
          accessibilityLabel={reviewMode ? 'Exit review' : 'Exit build'}>
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

      <WalkthroughScrollProvider reportMarker={walkthroughScroll.reportMarker}>
      <ScrollView
        key={stepNavigationKey}
        ref={walkthroughScroll.scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEnabled={!wiringPinchActive}
        scrollEventThrottle={16}
        onScroll={walkthroughScroll.onScroll}
        onScrollBeginDrag={walkthroughScroll.onScrollBeginDrag}
        onScrollEndDrag={walkthroughScroll.onScrollEndDrag}
        onMomentumScrollEnd={walkthroughScroll.onMomentumScrollEnd}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        contentInsetAdjustmentBehavior="never">
        <View style={styles.stepBody}>
          {stage ? (
            <Text style={styles.stageKicker}>
              Stage {stage.stageNumber} of {stage.stageCount} — {stage.stageTitle}
            </Text>
          ) : null}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Step {currentStepIndex + 1} of {steps.length}
            </Text>
          </View>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepDescription}>{currentStep.description}</Text>
          <StepContent
            blocks={stepBlocks}
            projectSlug={project.slug}
            priorWiringConnections={priorWiringConnections}
            steps={steps}
            stepIndex={currentStepIndex}
            onWiringPinchActiveChange={setWiringPinchActive}
            explain={{
              projectId: project.id,
              projectSlug: project.slug,
              projectTitle: project.title,
              stepIndex: currentStepIndex,
            }}
          />

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
        </View>
      </ScrollView>
      </WalkthroughScrollProvider>

      <View style={[styles.footer, { paddingBottom: walkthroughFooterPadding(insets.bottom) }]}>
        {saveNotice ? <Text style={styles.continueHint}>{saveNotice}</Text> : null}
        <View style={styles.footerRow}>
          <Pressable
            style={[styles.secondaryButton, isFirstStep && styles.buttonDisabled]}
            onPress={handlePrev}
            disabled={isFirstStep}
            accessibilityRole="button"
            accessibilityState={{ disabled: isFirstStep }}>
            <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, styles.footerPrimaryButton]}
            onPress={handleNext}
            disabled={!footerControls.nextEnabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: !footerControls.nextEnabled }}>
            <Text style={styles.primaryButtonText}>
              {footerControls.nextLabel}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark' : 'chevron-forward'}
              size={18}
              color={colors.onAccent}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ProjectCompleteView({
  title,
  stepCount,
  hasSketch,
  onViewSteps,
  onViewCode,
  onBackToProject,
  onBrowseProjects,
}: {
  title: string;
  stepCount: number;
  hasSketch: boolean;
  onViewSteps: () => void;
  onViewCode: () => void;
  onBackToProject: () => void;
  onBrowseProjects: () => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

        <View style={styles.completeActions}>
          <Pressable style={styles.primaryButton} onPress={onViewSteps} accessibilityRole="button">
            <Ionicons name="book-outline" size={18} color={colors.onAccent} />
            <Text style={styles.primaryButtonText}>View Steps</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButtonWide, !hasSketch && styles.buttonDisabled]}
            onPress={onViewCode}
            disabled={!hasSketch}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasSketch }}
            accessibilityLabel="View Code">
            <Ionicons name="code-slash-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.secondaryButtonText}>View Code</Text>
          </Pressable>
          <Pressable style={styles.secondaryButtonWide} onPress={onBrowseProjects} accessibilityRole="button">
            <Ionicons name="albums-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.secondaryButtonText}>Start another project</Text>
          </Pressable>
          <Pressable style={styles.secondaryButtonWide} onPress={onBackToProject} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Back to Project</Text>
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
      flexShrink: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    stepBody: {
      gap: 16,
    },
    stageKicker: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.2,
      color: colors.textSecondary,
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
      flexShrink: 0,
      gap: 8,
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    continueHint: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    primaryButton: {
      flexGrow: standaloneButtonFlex.flexGrow,
      flexShrink: standaloneButtonFlex.flexShrink,
      alignSelf: standaloneButtonFlex.alignSelf,
      minHeight: standaloneButtonFlex.minHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 16,
    },
    footerPrimaryButton: {
      flexGrow: rowButtonFlex.flexGrow,
      flexShrink: rowButtonFlex.flexShrink,
      flexBasis: rowButtonFlex.flexBasis,
      alignSelf: rowButtonFlex.alignSelf,
      minHeight: rowButtonFlex.minHeight,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    secondaryButton: {
      flexGrow: 0,
      flexShrink: 0,
      minHeight: standaloneButtonFlex.minHeight,
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
