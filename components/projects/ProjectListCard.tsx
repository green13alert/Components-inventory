import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { DIFFICULTY_LABELS, Project } from '@/constants/projects-data';
import { useAtlas } from '@/context/atlas-context';
import { useSolderiColors } from '@/context/theme-context';

type ProjectListCardProps = {
  project: Project & { status: Project['status']; progress?: number };
};

export function ProjectListCard({ project }: ProjectListCardProps) {
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useAtlas();
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const matchPercent = Math.round((project.ownedParts / project.totalParts) * 100);
  const favourited = isFavourite(project.id);
  const isInProgress = project.status === 'in_progress';
  const difficultyColors = {
    beginner: colors.success,
    intermediate: colors.warning,
    advanced: colors.error,
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.cardPressable}
        onPress={() => router.push(`/project/${project.id}`)}
        accessibilityRole="button">
        <Image source={project.image} style={styles.image} contentFit="cover" transition={200} />
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
            <Text style={styles.duration}>{project.duration}</Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.partsRow}>
              <Ionicons name="cube-outline" size={13} color={colors.textMuted} />
              <Text style={styles.partsText}>
                {project.ownedParts}/{project.totalParts} parts · {matchPercent}% match
              </Text>
            </View>
            {isInProgress && project.progress != null ? (
              <Text style={styles.progressText}>{project.progress}% done</Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        style={styles.saveButton}
        onPress={() => toggleFavourite(project.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={favourited ? 'Remove from favourites' : 'Add to favourites'}>
        <Ionicons
          name={favourited ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={favourited ? colors.accent : colors.textMuted}
        />
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
    saveButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
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
      paddingRight: 24,
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
    progressText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
    },
  });
}
