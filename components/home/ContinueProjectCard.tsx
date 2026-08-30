import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';
import { useSolderiColors } from '@/context/theme-context';

type ContinueProjectCardProps = {
  projectId: string;
  title: string;
  stepLabel: string;
  stepTitle: string;
  progress: number;
  image: ProjectImage;
  width?: number;
};

export function ContinueProjectCard({
  projectId,
  title,
  stepLabel,
  stepTitle,
  progress,
  image,
  width,
}: ContinueProjectCardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        width != null && { width },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/project/${projectId}`)}
      accessibilityRole="button"
      accessibilityLabel={`Continue building ${title}`}>
      <Image source={image} style={styles.image} contentFit="cover" />

      <View style={styles.body}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.stepLabel}>{stepLabel}</Text>
          <Text style={styles.stepTitle}>{stepTitle}</Text>
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

        <View style={styles.action}>
          <Text style={styles.actionText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accent} />
        </View>
      </View>
    </Pressable>
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
    pressed: {
      opacity: 0.92,
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
    stepLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    stepTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
      marginTop: 4,
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
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
  });
}
