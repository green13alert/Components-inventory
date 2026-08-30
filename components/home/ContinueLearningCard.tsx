import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';
import { useSolderiColors } from '@/context/theme-context';

type ContinueLearningCardProps = {
  projectId: string;
  title: string;
  subtitle: string;
  progress: number;
  image: ProjectImage;
  width?: number;
};

export function ContinueLearningCard({
  projectId,
  title,
  subtitle,
  progress,
  image,
  width,
}: ContinueLearningCardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Link href={`/project/${projectId}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          width != null && { width },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button">
      <Image source={image} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.body}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
      </Pressable>
    </Link>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 140,
      backgroundColor: colors.surfaceElevated,
    },
    body: {
      padding: 18,
      gap: 16,
    },
    textWrap: {
      gap: 4,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    progressSection: {
      gap: 8,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    progressValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceElevated,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
  });
}
