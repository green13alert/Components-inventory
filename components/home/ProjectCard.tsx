import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type ProjectCardProps = {
  title: string;
  difficulty: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function ProjectCard({ title, difficulty, duration, icon }: ProjectCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconArea}>
        <Ionicons name={icon} size={32} color={ArduinoColors.blue} />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.meta}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{difficulty}</Text>
        </View>
        <Text style={styles.duration}>{duration}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: ArduinoColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 14,
    gap: 12,
  },
  iconArea: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: ArduinoColors.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
    lineHeight: 20,
    minHeight: 40,
  },
  meta: {
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: ArduinoColors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: ArduinoColors.textSecondary,
    textTransform: 'uppercase',
  },
  duration: {
    fontSize: 12,
    color: ArduinoColors.textMuted,
  },
});
