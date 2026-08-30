import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingProjectCard } from '@/components/onboarding/OnboardingProjectCard';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import type { SolderiPalette } from '@/constants/colors';
import {
  ONBOARDING_READY,
  ONBOARDING_WELCOME,
  type MockRecommendedProject,
} from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type ReadyScreenProps = {
  experienceLabel: string | null;
  componentCount: number;
  interestSummary: string;
  projects: MockRecommendedProject[];
  onBack: () => void;
  onFinish: () => void;
};

export function ReadyScreen({
  experienceLabel,
  componentCount,
  interestSummary,
  projects,
  onBack,
  onFinish,
}: ReadyScreenProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const summaryParts = [
    experienceLabel,
    `${componentCount} component${componentCount === 1 ? '' : 's'}`,
    interestSummary || null,
  ].filter(Boolean);

  const summaryLine = summaryParts.join(' · ');

  return (
    <OnboardingShell
      step={5}
      title={ONBOARDING_READY.title}
      description={ONBOARDING_READY.description}
      onBack={onBack}
      background="pcb-subtle"
      footer={<OnboardingCta label={ONBOARDING_WELCOME.cta} onPress={onFinish} />}>
      <Animated.View entering={FadeInDown.duration(420)} style={styles.summaryCard}>
        <Text style={styles.summaryText}>{summaryLine}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(80)} style={styles.section}>
        <Text style={styles.sectionTitle}>{ONBOARDING_READY.sectionTitle}</Text>
        <View style={styles.projectList}>
          {projects.map((project, index) => (
            <Animated.View key={project.id} entering={FadeInDown.duration(420).delay(120 + index * 70)}>
              <OnboardingProjectCard project={project} />
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </OnboardingShell>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    summaryCard: {
      padding: Spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      marginBottom: Spacing['2xl'],
    },
    summaryText: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 22,
      color: colors.textPrimary,
    },
    section: {
      gap: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    projectList: {
      gap: Spacing.md,
    },
  });
}
