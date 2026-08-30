import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import {
  EXPERIENCE_LABELS,
  PROJECT_BUILD_FEATURES,
  type MockRecommendedProject,
} from '@/constants/onboarding';
import { PROJECT_IMAGES } from '@/constants/projects';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type OnboardingProjectCardProps = {
  project: MockRecommendedProject;
};

const ONBOARDING_PROJECT_IMAGES = {
  'obstacle-robot': PROJECT_IMAGES.obstacleRobot,
  'temp-monitor': PROJECT_IMAGES.weatherStation,
  'servo-radar': PROJECT_IMAGES.servoCamera,
} as const;

export function OnboardingProjectCard({ project }: OnboardingProjectCardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const complete = project.matched >= project.total;
  const metaLine = `${EXPERIENCE_LABELS[project.difficulty]} · ${project.matched}/${project.total} components`;
  const image =
    ONBOARDING_PROJECT_IMAGES[project.id as keyof typeof ONBOARDING_PROJECT_IMAGES] ??
    PROJECT_IMAGES.obstacleRobot;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Image source={image} style={styles.image} contentFit="cover" transition={200} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{project.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{metaLine}</Text>
          {complete ? <Text style={styles.readyBadge}>Ready</Text> : null}
        </View>
        <View style={styles.featuresRow}>
          {PROJECT_BUILD_FEATURES.map((feature) => (
            <View
              key={feature.label}
              style={styles.featureChip}
              accessibilityRole="text"
              accessibilityLabel={feature.label}>
              <Text style={styles.featureText}>
                {feature.emoji} {feature.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: Spacing.md,
      padding: Spacing.md,
      borderRadius: Radii.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: Radii.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceElevated,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    content: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: 6,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    meta: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    readyBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: colors.successMuted,
      overflow: 'hidden',
    },
    featuresRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 2,
    },
    featureChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: Radii.sm,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featureText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });
}
