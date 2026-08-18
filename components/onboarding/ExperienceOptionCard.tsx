import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';

type ExperienceOptionCardProps = {
  emoji: string;
  title: string;
  subtitle: string;
  selected: boolean;
  hasSelection: boolean;
  onPress: () => void;
};

const SPRING = { damping: 18, stiffness: 220, mass: 0.8 };

export function ExperienceOptionCard({
  emoji,
  title,
  subtitle,
  selected,
  hasSelection,
  onPress,
}: ExperienceOptionCardProps) {
  const scale = useSharedValue(1);
  const recede = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.03 : 1, SPRING);
    recede.value = withSpring(hasSelection && !selected ? 0.58 : 1, SPRING);
  }, [hasSelection, recede, scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: recede.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selected ? 1.12 : 1 }],
  }));

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.985, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.03 : 1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Animated.View style={[styles.stage, selected && styles.stageSelected, animatedStyle]}>
        <Animated.View style={[styles.iconRing, selected && styles.iconRingSelected, iconStyle]}>
          <Text style={[styles.emoji, selected && styles.emojiSelected]}>{emoji}</Text>
        </Animated.View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={[styles.stageLabel, selected && styles.stageLabelSelected]}>
              {title}
            </Text>
            {selected ? <View style={styles.activeDot} /> : null}
          </View>
          <Text style={[styles.subtitle, selected && styles.subtitleSelected]} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 88,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  stageSelected: {
    backgroundColor: SolderiColors.accentMuted,
    borderColor: SolderiColors.accentBorder,
    shadowColor: SolderiColors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  iconRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  iconRingSelected: {
    backgroundColor: 'rgba(255, 181, 71, 0.2)',
    borderColor: SolderiColors.accentBorder,
  },
  emoji: {
    fontSize: 26,
  },
  emojiSelected: {
    fontSize: 30,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stageLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  stageLabelSelected: {
    color: SolderiColors.textPrimary,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SolderiColors.accent,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: SolderiColors.textSecondary,
  },
  subtitleSelected: {
    color: SolderiColors.textPrimary,
    opacity: 0.88,
  },
});
