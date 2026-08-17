import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAtlas } from '@/context/atlas-context';
import { SolderiColors } from '@/constants/colors';
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
            <Ionicons name="cube-outline" size={14} color={SolderiColors.textSecondary} />
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
          color={favourited ? SolderiColors.accent : SolderiColors.textMuted}
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
    backgroundColor: SolderiColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SolderiColors.border,
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
    backgroundColor: SolderiColors.surfaceElevated,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: SolderiColors.overlay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
    color: SolderiColors.accent,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
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
    color: SolderiColors.textSecondary,
  },
  missingWrap: {
    alignSelf: 'flex-start',
    backgroundColor: SolderiColors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  missingText: {
    fontSize: 12,
    fontWeight: '600',
    color: SolderiColors.warning,
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
    backgroundColor: SolderiColors.overlay,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
