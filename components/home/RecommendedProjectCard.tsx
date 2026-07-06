import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';
import { ProjectImage } from '@/constants/projects';

type RecommendedProjectCardProps = {
  title: string;
  ownedParts: number;
  totalParts: number;
  image: ProjectImage;
};

export function RecommendedProjectCard({
  title,
  ownedParts,
  totalParts,
  image,
}: RecommendedProjectCardProps) {
  const missingParts = totalParts - ownedParts;
  const matchPercent = Math.round((ownedParts / totalParts) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.image} contentFit="cover" transition={200} />
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{matchPercent}% match</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.partsRow}>
        <Ionicons name="cube-outline" size={14} color={ArduinoColors.textSecondary} />
        <Text style={styles.partsText}>
          You have {ownedParts}/{totalParts} parts
        </Text>
      </View>
      <View style={styles.missingWrap}>
        <Text style={styles.missingText}>
          {missingParts} part{missingParts !== 1 ? 's' : ''} missing
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 190,
    backgroundColor: ArduinoColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 10,
    gap: 10,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: ArduinoColors.surfaceElevated,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 17, 23, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
    color: ArduinoColors.blue,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
    lineHeight: 20,
    minHeight: 40,
  },
  partsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partsText: {
    fontSize: 12,
    color: ArduinoColors.textSecondary,
  },
  missingWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  missingText: {
    fontSize: 12,
    fontWeight: '600',
    color: ArduinoColors.warning,
  },
});
