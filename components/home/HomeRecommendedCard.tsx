import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';
import { Radii, Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type HomeRecommendedCardProps = {
  projectId: string;
  title: string;
  difficulty: string;
  duration: string;
  componentCount: number;
  image: ProjectImage;
};

export function HomeRecommendedCard({
  projectId,
  title,
  difficulty,
  duration,
  componentCount,
  image,
}: HomeRecommendedCardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/project/${projectId}`)}
      accessibilityRole="button"
      accessibilityLabel={`View project ${title}`}>
      <Image source={image} style={styles.image} contentFit="cover" transition={200} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {difficulty} · {duration}
        </Text>
        <Text style={styles.components}>
          {componentCount} component{componentCount !== 1 ? 's' : ''}
        </Text>

        <View style={styles.action}>
          <Text style={styles.actionText}>View Project</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    pressed: {
      opacity: 0.85,
    },
    image: {
      width: 88,
      height: 88,
      borderRadius: Radii.md,
      backgroundColor: colors.surfaceElevated,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      gap: Spacing.xs,
    },
    title: {
      ...Typography.cardTitle,
      fontSize: 16,
      color: colors.textPrimary,
    },
    meta: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    components: {
      ...Typography.metadata,
      color: colors.textMuted,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
    },
    actionText: {
      ...Typography.caption,
      fontWeight: '600',
      color: colors.accent,
    },
  });
}
