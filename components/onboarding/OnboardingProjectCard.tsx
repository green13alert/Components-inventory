import { StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import {
  EXPERIENCE_LABELS,
  PROJECT_BUILD_FEATURES,
  type MockRecommendedProject,
} from '@/constants/onboarding';
import { Radii, Spacing } from '@/constants/tokens';

type OnboardingProjectCardProps = {
  project: MockRecommendedProject;
};

export function OnboardingProjectCard({ project }: OnboardingProjectCardProps) {
  const complete = project.matched >= project.total;
  const metaLine = `${EXPERIENCE_LABELS[project.difficulty]} · ${project.matched}/${project.total} components`;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.emoji}>{project.emoji}</Text>
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SolderiColors.surfaceElevated,
  },
  emoji: {
    fontSize: 26,
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
    color: SolderiColors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  meta: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
  },
  readyBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: SolderiColors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: SolderiColors.successMuted,
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
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: SolderiColors.textMuted,
  },
});
