import { useEffect, useMemo } from 'react';
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
import type { SolderiPalette } from '@/constants/colors';
import type { ExperienceLevel } from '@/constants/onboarding';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

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
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
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

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      minHeight: 68,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: Radii.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardSelected: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accentBorder,
      shadowColor: colors.accent,
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
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    illustrationWrapSelected: {
      backgroundColor: 'rgba(255, 181, 71, 0.12)',
      borderColor: colors.accentBorder,
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
      color: colors.textPrimary,
      flexShrink: 1,
    },
    titleSelected: {
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    subtitleSelected: {
      color: colors.textPrimary,
      opacity: 0.88,
    },
  });
}
