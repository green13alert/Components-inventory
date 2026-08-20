import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { InterestCardIllustration } from '@/components/onboarding/interests/InterestCardIllustrations';
import { SolderiColors } from '@/constants/colors';
import type { OnboardingInterest } from '@/constants/onboarding';
import { Radii, Spacing } from '@/constants/tokens';

type InterestCardProps = {
  interest: OnboardingInterest;
  selected: boolean;
  onPress: () => void;
};

const SPRING = { damping: 20, stiffness: 280, mass: 0.72 };
const ILLUSTRATION_SIZE = 64;

export function InterestCard({ interest, selected, onPress }: InterestCardProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.02 : 1, SPRING);
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={styles.pressable}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.02 : 1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${interest.label}${selected ? ', selected' : ''}`}>
      <Animated.View style={[styles.card, selected && styles.cardSelected, animatedStyle]}>
        <View style={[styles.illustrationWrap, selected && styles.illustrationWrapSelected]}>
          <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 64 64">
            <InterestCardIllustration id={interest.id} accent={selected} />
          </Svg>
        </View>
        <View style={styles.labelRow}>
          <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
            {interest.label}
          </Text>
          {selected ? <Ionicons name="checkmark-circle" size={16} color={SolderiColors.accent} /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48.5%',
  },
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    minHeight: 108,
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
    width: 64,
    height: 64,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: SolderiColors.textSecondary,
    flexShrink: 1,
  },
  labelSelected: {
    color: SolderiColors.textPrimary,
    fontWeight: '700',
  },
});
