import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';

type ComponentPickerChipProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  onOrange?: boolean;
};

const SPRING = { damping: 20, stiffness: 280, mass: 0.75 };

export function ComponentPickerChip({
  emoji,
  label,
  selected,
  onPress,
  onOrange = false,
}: ComponentPickerChipProps) {
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
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, onOrange && styles.labelOnOrange]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radii.xl,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  chipOnOrange: {
    backgroundColor: SolderiColors.onAccent,
    borderColor: 'rgba(24, 27, 30, 0.12)',
  },
  selected: {
    backgroundColor: SolderiColors.accentMuted,
    borderColor: SolderiColors.accentBorder,
  },
  selectedOnOrange: {
    backgroundColor: SolderiColors.surface,
    borderColor: SolderiColors.onAccent,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  emoji: {
    fontSize: 16,
    flexShrink: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
    flexShrink: 1,
  },
  labelOnOrange: {
    color: SolderiColors.textPrimary,
  },
});
