import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type RecommendedProjectCardProps = {
  title: string;
  ownedParts: number;
  totalParts: number;
  icon: keyof typeof Ionicons.glyphMap;
};

export function RecommendedProjectCard({
  title,
  ownedParts,
  totalParts,
  icon,
}: RecommendedProjectCardProps) {
  const missingParts = totalParts - ownedParts;
  const matchPercent = Math.round((ownedParts / totalParts) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={28} color={ArduinoColors.blue} />
        </View>
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
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: ArduinoColors.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchBadge: {
    backgroundColor: ArduinoColors.blueMuted,
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
