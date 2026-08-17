import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAtlas } from '@/context/atlas-context';
import { SolderiColors } from '@/constants/colors';
import { HOME_PROJECT_CARD_HEIGHT, HOME_PROJECT_CARD_WIDTH } from '@/constants/home-cards';
import { ProjectImage } from '@/constants/projects';

type ProjectCardProps = {
  projectId: string;
  title: string;
  difficulty: string;
  duration: string;
  image: ProjectImage;
};

export function ProjectCard({ projectId, title, difficulty, duration, image }: ProjectCardProps) {
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useAtlas();
  const favourited = isFavourite(projectId);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.cardPressable, pressed && styles.pressed]}
        onPress={() => router.push(`/project/${projectId}`)}
        accessibilityRole="button">
        <Image source={image} style={styles.image} contentFit="cover" transition={200} />
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{difficulty}</Text>
          </View>
          <Text style={styles.duration}>{duration}</Text>
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
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: SolderiColors.surfaceElevated,
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: SolderiColors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: SolderiColors.textSecondary,
    textTransform: 'uppercase',
  },
  duration: {
    fontSize: 12,
    color: SolderiColors.textMuted,
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
