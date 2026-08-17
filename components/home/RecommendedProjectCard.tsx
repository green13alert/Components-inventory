import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAtlas } from '@/context/atlas-context';
import { ArduinoColors } from '@/constants/colors';
import { HOME_PROJECT_CARD_HEIGHT, HOME_PROJECT_CARD_WIDTH } from '@/constants/home-cards';
import { ProjectImage } from '@/constants/projects';

type RecommendedProjectCardProps = {
  projectId: string;
  title: string;
  ownedParts: number;
  totalParts: number;
  image: ProjectImage;
};

export function RecommendedProjectCard({
  projectId,
  title,
  ownedParts,
  totalParts,
  image,
}: RecommendedProjectCardProps) {
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useAtlas();
  const favourited = isFavourite(projectId);
  const missingParts = totalParts - ownedParts;
  const matchPercent = Math.round((ownedParts / totalParts) * 100);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.cardPressable, pressed && styles.pressed]}
        onPress={() => router.push(`/project/${projectId}`)}
        accessibilityRole="button">
        <View style={styles.imageWrap}>
          <Image source={image} style={styles.image} contentFit="cover" transition={200} />
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{matchPercent}% match</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.partsRow}>
            <Ionicons name="cube-outline" size={14} color={ArduinoColors.textSecondary} />
            <Text style={styles.partsText} numberOfLines={1}>
              {ownedParts}/{totalParts} parts
            </Text>
          </View>
          <View style={styles.missingWrap}>
            <Text style={styles.missingText}>
              {missingParts} part{missingParts !== 1 ? 's' : ''} missing
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        style={styles.favouriteButton}
        onPress={() => toggleFavourite(projectId)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={favourited ? 'Remove from favourites' : 'Add to favourites'}>
        <Ionicons
          name={favourited ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={favourited ? ArduinoColors.blue : ArduinoColors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: HOME_PROJECT_CARD_WIDTH,
    height: HOME_PROJECT_CARD_HEIGHT,
    position: 'relative',
  },
  cardPressable: {
    flex: 1,
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
    left: 8,
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
  footer: {
    gap: 6,
    minHeight: 44,
    justifyContent: 'flex-end',
  },
  partsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partsText: {
    flex: 1,
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
  favouriteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 1,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 17, 23, 0.65)',
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
