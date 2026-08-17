import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';

type InterestBubbleProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

const SPRING = { damping: 20, stiffness: 280, mass: 0.75 };

export function InterestBubble({ emoji, label, selected, onPress }: InterestBubbleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
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
        accessibilityState={{ selected }}
        style={styles.pressable}>
        <View style={[styles.bubble, selected && styles.selected]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  pressable: {
    flex: 1,
  },
  bubble: {
    minHeight: 104,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  selected: {
    backgroundColor: SolderiColors.accentMuted,
    borderColor: SolderiColors.accentBorder,
    shadowColor: SolderiColors.accent,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    color: SolderiColors.textPrimary,
    flexShrink: 1,
  },
});
