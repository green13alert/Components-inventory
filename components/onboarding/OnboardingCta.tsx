import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { SolderiPalette } from '@/constants/colors';
import { Radii } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type OnboardingCtaProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'surface';
};

const PRESS_SPRING = { damping: 22, stiffness: 260, mass: 0.75 };

export function OnboardingCta({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: OnboardingCtaProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (disabled) return;
        scale.value = withSpring(0.975, PRESS_SPRING);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.button,
            variant === 'surface' && styles.buttonSurface,
            pressed && !disabled && (variant === 'surface' ? styles.pressedSurface : styles.pressed),
            disabled && styles.disabled,
            animatedStyle,
          ]}>
          <Text style={[styles.label, variant === 'surface' && styles.labelSurface]}>{label}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    button: {
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: Radii.lg,
      backgroundColor: colors.accent,
      shadowColor: '#000',
      shadowOpacity: 0.32,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    pressed: {
      backgroundColor: colors.accentStrong,
    },
    buttonSurface: {
      backgroundColor: colors.onAccent,
      shadowOpacity: 0.22,
    },
    pressedSurface: {
      opacity: 0.92,
    },
    disabled: {
      opacity: 0.45,
    },
    label: {
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.2,
      color: colors.onAccent,
    },
    labelSurface: {
      color: colors.accentStrong,
    },
  });
}
