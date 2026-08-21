import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SkillLevelIllustration } from '@/components/onboarding/experience/SkillLevelIllustrations';
import { SolderiColors } from '@/constants/colors';
import type { ExperienceLevel } from '@/constants/onboarding';
import { Radii, Spacing } from '@/constants/tokens';

type ExperienceOptionCardProps = {
  tier: ExperienceLevel;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

const SPRING = { damping: 20, stiffness: 260, mass: 0.75 };
const ILLUSTRATION_SIZE = 48;

export function ExperienceOptionCard({
  tier,
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
        scale.value = withSpring(0.985, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.02 : 1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}${selected ? ', selected' : ''}`}>
      <Animated.View style={[styles.card, selected && styles.cardSelected, animatedStyle]}>
        <View style={[styles.illustrationWrap, selected && styles.illustrationWrapSelected]}>
          <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 64 64">
            <SkillLevelIllustration tier={tier} accent={selected} />
          </Svg>
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
            {selected ? (
              <Ionicons name="checkmark-circle" size={18} color={SolderiColors.accent} />
            ) : null}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 68,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  cardSelected: {
    backgroundColor: SolderiColors.accentMuted,
    borderColor: SolderiColors.accentBorder,
    shadowColor: SolderiColors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  illustrationWrap: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  illustrationWrapSelected: {
    backgroundColor: 'rgba(255, 181, 71, 0.12)',
    borderColor: SolderiColors.accentBorder,
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
    flexShrink: 1,
  },
  titleSelected: {
    color: SolderiColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: SolderiColors.textSecondary,
  },
  subtitleSelected: {
    color: SolderiColors.textPrimary,
    opacity: 0.88,
  },
});
