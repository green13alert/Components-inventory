import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';

type ProjectCardProps = {
  title: string;
  difficulty: string;
  duration: string;
  image: ProjectImage;
};

export function ProjectCard({ title, difficulty, duration, image }: ProjectCardProps) {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} contentFit="cover" transition={200} />
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
    padding: 10,
    gap: 10,
  },
  image: {
    width: '100%',
    height: 96,
    borderRadius: 12,
    backgroundColor: ArduinoColors.surfaceElevated,
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
