import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';

type ExperienceOptionCardProps = {
  emoji: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

const SPRING = { damping: 20, stiffness: 280, mass: 0.75 };

export function ExperienceOptionCard({
  emoji,
  title,
  subtitle,
  selected,
  onPress,
}: ExperienceOptionCardProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.02 : 1, SPRING);
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.98, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.02 : 1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Animated.View style={[styles.card, selected && styles.selected, animatedStyle]}>
        <View style={[styles.emojiWrap, selected && styles.emojiWrapSelected]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.indicator, selected && styles.indicatorSelected]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  selected: {
    backgroundColor: SolderiColors.accentMuted,
    borderColor: SolderiColors.accentBorder,
    shadowColor: SolderiColors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SolderiColors.surfaceElevated,
  },
  emojiWrapSelected: {
    backgroundColor: 'rgba(255, 181, 71, 0.18)',
  },
  emoji: {
    fontSize: 24,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
  },
  titleSelected: {
    color: SolderiColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: SolderiColors.textSecondary,
  },
  indicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: SolderiColors.border,
  },
  indicatorSelected: {
    borderColor: SolderiColors.accent,
    backgroundColor: SolderiColors.accent,
  },
});
