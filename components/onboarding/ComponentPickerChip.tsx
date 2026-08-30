import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type ComponentPickerChipProps = {
  componentId: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  onOrange?: boolean;
};

const SPRING = { damping: 20, stiffness: 280, mass: 0.75 };

export function ComponentPickerChip({
  componentId,
  label,
  selected,
  onPress,
  onOrange = false,
}: ComponentPickerChipProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);

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
        scale.value = withSpring(0.96, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.03 : 1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Animated.View
        style={[
          styles.chip,
          onOrange && styles.chipOnOrange,
          selected && (onOrange ? styles.selectedOnOrange : styles.selected),
          animatedStyle,
        ]}>
        <ComponentIllustration id={componentId} name={label} size={32} plate={false} />
        <Text style={[styles.label, onOrange && styles.labelOnOrange]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: Radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipOnOrange: {
      backgroundColor: colors.onAccent,
      borderColor: 'rgba(24, 27, 30, 0.12)',
    },
    selected: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accentBorder,
    },
    selectedOnOrange: {
      backgroundColor: colors.surface,
      borderColor: colors.onAccent,
      borderWidth: 2,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      flexShrink: 1,
    },
    labelOnOrange: {
      color: colors.textPrimary,
    },
  });
}
