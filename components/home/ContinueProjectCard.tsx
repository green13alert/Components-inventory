import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';
import { Radii, Spacing, Typography } from '@/constants/tokens';

type ContinueProjectCardProps = {
  projectId: string;
  title: string;
  stepLabel: string;
  stepTitle: string;
  progress: number;
  image: ProjectImage;
};

export function ContinueProjectCard({
  projectId,
  title,
  stepLabel,
  stepTitle,
  progress,
  image,
}: ContinueProjectCardProps) {
  return (
    <Link href={`/project/${projectId}`} asChild>
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Continue building ${title}`}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.stepLabel}>{stepLabel}</Text>
        </View>

        <Image source={image} style={styles.image} contentFit="cover" transition={200} />

        <View style={styles.body}>
          <Text style={styles.stepTitle}>{stepTitle}</Text>

          <View style={styles.progressSection}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>

          <View style={styles.action}>
            <Text style={styles.actionText}>Continue</Text>
            <Ionicons name="arrow-forward" size={16} color={SolderiColors.accent} />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SolderiColors.surface,
    borderRadius: Radii.xl,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.cardTitle,
    color: SolderiColors.textPrimary,
  },
  stepLabel: {
    ...Typography.caption,
    color: SolderiColors.textSecondary,
  },
  image: {
    width: '100%',
    height: 168,
    backgroundColor: SolderiColors.surfaceElevated,
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  stepTitle: {
    ...Typography.body,
    color: SolderiColors.textPrimary,
    fontWeight: '500',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: SolderiColors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: SolderiColors.accent,
  },
  progressValue: {
    ...Typography.metadata,
    color: SolderiColors.textMuted,
    minWidth: 32,
    textAlign: 'right',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    ...Typography.body,
    fontWeight: '600',
    color: SolderiColors.accent,
  },
});
