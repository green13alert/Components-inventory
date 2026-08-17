import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';

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
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
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
          <Ionicons name="arrow-forward" size={16} color={SolderiColors.accent} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SolderiColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: SolderiColors.surfaceElevated,
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
    color: SolderiColors.textPrimary,
  },
  stepLabel: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: SolderiColors.textPrimary,
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
    color: SolderiColors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: SolderiColors.accent,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: SolderiColors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: SolderiColors.accent,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: SolderiColors.accent,
  },
});
