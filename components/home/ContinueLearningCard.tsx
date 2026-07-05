import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type ContinueLearningCardProps = {
  title: string;
  subtitle: string;
  progress: number;
};

export function ContinueLearningCard({ title, subtitle, progress }: ContinueLearningCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="book-outline" size={22} color={ArduinoColors.blue} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ArduinoColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 18,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ArduinoColors.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
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
