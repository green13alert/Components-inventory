import { useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { BenchComponentShadow } from '@/components/onboarding/WorkbenchSurface';
import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

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
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const lift = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (onSurface) {
      lift.value = 0;
      scale.value = 1;
      return;
    }

    const liftAmount = -5;
    lift.value = withSpring(selected ? liftAmount : 0, SPRING);
    scale.value = withSpring(selected ? 1.05 : 1, SPRING);
  }, [lift, onSurface, scale, selected]);

  const animatedStyle = useAnimatedStyle(() => {
    if (onSurface) {
      return {};
    }

    return {
      transform: [{ translateY: lift.value }, { scale: scale.value }],
    };
  });

  const isSurfaceCompact = compact && onSurface;
  const illustrationSize = isSurfaceCompact ? 40 : compact ? 44 : 48;

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => {
        if (!onSurface) {
          scale.value = withSpring(0.97, SPRING);
        }
      }}
      onPressOut={() => {
        if (!onSurface) {
          scale.value = withSpring(selected ? 1.05 : 1, SPRING);
        }
      }}
      unstable_pressDelay={onSurface ? 80 : 0}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={
        isSurfaceCompact
          ? styles.surfacePressable
          : compact
            ? styles.compactPressable
            : styles.pressable
      }>
      {isSurfaceCompact ? (
        <>
          <View style={styles.surfaceShadow}>
            <BenchComponentShadow width={44} />
          </View>
          <Animated.View
            style={[
              styles.surfacePart,
              onSurface && selected && styles.surfacePartSelected,
              animatedStyle,
            ]}>
            <ComponentIllustration
              id={componentId}
              name={label}
              size={illustrationSize}
              plate={false}
              showGroundShadow={false}
            />
            {selected ? (
              <View style={[styles.checkBadge, styles.checkBadgeSurface]}>
                <Ionicons name="checkmark" size={10} color={colors.onAccent} />
              </View>
            ) : null}
          </Animated.View>
        </>
      ) : (
        <Animated.View
          style={[
            compact ? styles.compactTile : styles.tile,
            !onSurface && selected && styles.tileSelected,
            animatedStyle,
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
            <View style={[styles.checkBadge, compact && styles.checkBadgeCompact]}>
              <Ionicons name="checkmark" size={compact ? 10 : 12} color={colors.onAccent} />
            </View>
          ) : null}
        </Animated.View>
      )}
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    pressable: {
      width: '100%',
    },
    compactPressable: {
      width: 56,
    },
    surfacePressable: {
      width: 52,
      height: 60,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    surfaceShadow: {
      position: 'absolute',
      bottom: 4,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 0,
    },
    tile: {
      minHeight: 108,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      borderRadius: Radii.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
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
      marginBottom: 8,
      zIndex: 1,
    },
    tileSelected: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentMuted,
      shadowColor: colors.accent,
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    surfacePartSelected: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentMuted,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textPrimary,
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
      backgroundColor: colors.accent,
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
      top: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
    },
  });
}
