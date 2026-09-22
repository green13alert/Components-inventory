import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { DIFFICULTY_LABELS } from '@/constants/projects-data';
import { getProjectImage } from '@/constants/projects';
import type { Project } from '@/lib/projects';
import { useSolderiColors } from '@/context/theme-context';

type ProjectListCardProps = {
  project: Project;
};

export function ProjectListCard({ project }: ProjectListCardProps) {
  const router = useRouter();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const requiredLabel =
    project.requiredComponentCount === 1
      ? '1 required component'
      : `${project.requiredComponentCount} required components`;
  const difficultyColors = {
    beginner: colors.success,
    intermediate: colors.warning,
    advanced: colors.error,
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.cardPressable}
        onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.slug } })}
        accessibilityRole="button">
        <Image
          source={getProjectImage(project.imageKey)}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {project.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>
          <View style={styles.meta}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: `${difficultyColors[project.difficulty]}22` },
              ]}>
              <Text style={[styles.difficultyText, { color: difficultyColors[project.difficulty] }]}>
                {DIFFICULTY_LABELS[project.difficulty]}
              </Text>
            </View>
            <Text style={styles.duration}>{project.durationLabel}</Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.partsRow}>
              <Ionicons name="cube-outline" size={13} color={colors.textMuted} />
              <Text style={styles.partsText}>{requiredLabel}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      position: 'relative',
    },
    cardPressable: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      gap: 14,
      padding: 12,
    },
    image: {
      width: 96,
      height: 96,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
    },
    body: {
      flex: 1,
      gap: 6,
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 21,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    duration: {
      fontSize: 12,
      color: colors.textMuted,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    partsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    partsText: {
      fontSize: 12,
      color: colors.textMuted,
    },
  });
}
