import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';

type ContinueLearningCardProps = {
  title: string;
  subtitle: string;
  progress: number;
  image: ProjectImage;
};

export function ContinueLearningCard({
  title,
  subtitle,
  progress,
  image,
}: ContinueLearningCardProps) {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ArduinoColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: ArduinoColors.surfaceElevated,
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
    color: ArduinoColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: ArduinoColors.textSecondary,
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
    color: ArduinoColors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: ArduinoColors.blue,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ArduinoColors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ArduinoColors.blue,
  },
});
