import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { BenchComponentShadow } from '@/components/onboarding/WorkbenchSurface';
import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';

type WorkbenchComponentTileProps = {
  componentId: string;
  label: string;
  selected: boolean;
  compact?: boolean;
  onSurface?: boolean;
  onPress: () => void;
};

const SPRING = { damping: 20, stiffness: 260, mass: 0.75 };

export function WorkbenchComponentTile({
  componentId,
  label,
  selected,
  compact = false,
  onSurface = false,
  onPress,
}: WorkbenchComponentTileProps) {
  const lift = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const liftAmount = onSurface ? -8 : -5;
    lift.value = withSpring(selected ? liftAmount : 0, SPRING);
    scale.value = withSpring(selected ? 1.05 : 1, SPRING);
  }, [lift, onSurface, scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: scale.value }],
  }));

  const isSurfaceCompact = compact && onSurface;
  const illustrationSize = isSurfaceCompact ? 40 : compact ? 44 : 48;

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(selected ? 1.05 : 1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={
        isSurfaceCompact
          ? styles.surfacePressable
          : compact
            ? styles.compactPressable
            : styles.pressable
      }>
      {isSurfaceCompact ? <BenchComponentShadow width={48} /> : null}
      <Animated.View
        style={[
          isSurfaceCompact
            ? styles.surfacePart
            : compact
              ? styles.compactTile
              : styles.tile,
          !onSurface && selected && styles.tileSelected,
          onSurface && selected && styles.surfacePartSelected,
          animatedStyle,
          isSurfaceCompact && styles.surfacePartFloated,
        ]}>
        <ComponentIllustration
          id={componentId}
          name={label}
          size={illustrationSize}
          plate={!onSurface}
        />
        {!compact ? (
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        ) : null}
        {selected ? (
          <View
            style={[
              styles.checkBadge,
              compact && styles.checkBadgeCompact,
              onSurface && styles.checkBadgeSurface,
            ]}>
            <Ionicons name="checkmark" size={compact ? 10 : 12} color={SolderiColors.onAccent} />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  compactPressable: {
    width: 56,
  },
  surfacePressable: {
    width: 52,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  tile: {
    minHeight: 108,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  compactTile: {
    width: 56,
    height: 56,
    borderRadius: Radii.md,
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  surfacePart: {
    width: 44,
    height: 44,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfacePartFloated: {
    position: 'absolute',
    bottom: 8,
  },
  tileSelected: {
    borderColor: SolderiColors.accentBorder,
    backgroundColor: SolderiColors.accentMuted,
    shadowColor: SolderiColors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  surfacePartSelected: {
    borderColor: SolderiColors.accentBorder,
    backgroundColor: SolderiColors.accentMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: SolderiColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeCompact: {
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  checkBadgeSurface: {
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
