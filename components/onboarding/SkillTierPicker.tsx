import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SkillTierModule } from '@/components/onboarding/SkillTierModule';
import { SolderiColors } from '@/constants/colors';
import { EXPERIENCE_OPTIONS, type ExperienceLevel } from '@/constants/onboarding';
import { Radii, Spacing } from '@/constants/tokens';

type SkillTierPickerProps = {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
};

const SPRING = { damping: 18, stiffness: 210, mass: 0.82 };

const TIER_LAYOUT = [
  { offsetY: 14, moduleSize: 92, zIndex: 1 },
  { offsetY: 0, moduleSize: 100, zIndex: 2 },
  { offsetY: -10, moduleSize: 108, zIndex: 3 },
] as const;

function SkillTierItem({
  tier,
  emoji,
  index,
  selected,
  hasSelection,
  onPress,
}: {
  tier: ExperienceLevel;
  emoji: string;
  index: number;
  selected: boolean;
  hasSelection: boolean;
  onPress: () => void;
}) {
  const layout = TIER_LAYOUT[index];
  const scale = useSharedValue(1);
  const translateY = useSharedValue(layout.offsetY);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.1 : hasSelection ? 0.86 : 0.94, SPRING);
    translateY.value = withSpring(
      selected ? layout.offsetY - 10 : hasSelection ? layout.offsetY + 8 : layout.offsetY,
      SPRING,
    );
    opacity.value = withSpring(hasSelection && !selected ? 0.52 : 1, SPRING);
  }, [hasSelection, layout.offsetY, opacity, scale, selected, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.tierPressable, { zIndex: layout.zIndex }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={EXPERIENCE_OPTIONS[index].title}>
      <Animated.View
        style={[styles.tierObject, selected && styles.tierObjectSelected, animatedStyle]}>
        <SkillTierModule tier={tier} size={layout.moduleSize} />
        <Text style={[styles.tierEmoji, selected && styles.tierEmojiSelected]}>{emoji}</Text>
        {selected ? <View style={styles.selectionRing} pointerEvents="none" /> : null}
      </Animated.View>
    </Pressable>
  );
}

export function SkillTierPicker({ selected, onSelect }: SkillTierPickerProps) {
  const selectedOption = EXPERIENCE_OPTIONS.find((option) => option.id === selected);

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <View style={styles.planeGlow} pointerEvents="none" />
        {EXPERIENCE_OPTIONS.map((option, index) => (
          <SkillTierItem
            key={option.id}
            tier={option.id}
            emoji={option.emoji}
            index={index}
            selected={selected === option.id}
            hasSelection={selected !== null}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>

      <View style={styles.detailPanel}>
        {selectedOption ? (
          <Animated.View
            entering={FadeIn.duration(280)}
            key={selectedOption.id}
            style={styles.detailContent}>
            <Text style={styles.detailTitle}>
              {selectedOption.emoji} {selectedOption.title}
            </Text>
            <Text style={styles.detailSubtitle}>{selectedOption.subtitle}</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(320)}>
            <Text style={styles.detailHint}>Select your skill tier to continue</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing['2xl'],
  },
  stage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 200,
    paddingHorizontal: Spacing.xs,
  },
  planeGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: 28,
    height: 48,
    borderRadius: 999,
    backgroundColor: SolderiColors.accent,
    opacity: 0.06,
  },
  tierPressable: {
    flex: 1,
    alignItems: 'center',
  },
  tierObject: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  tierObjectSelected: {
    shadowColor: SolderiColors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  tierEmoji: {
    marginTop: Spacing.sm,
    fontSize: 22,
    opacity: 0.75,
  },
  tierEmojiSelected: {
    fontSize: 26,
    opacity: 1,
  },
  selectionRing: {
    ...StyleSheet.absoluteFillObject,
    top: -6,
    bottom: 24,
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: SolderiColors.accentBorder,
    backgroundColor: SolderiColors.accentMuted,
  },
  detailPanel: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  detailContent: {
    alignItems: 'center',
    gap: 6,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
    letterSpacing: -0.3,
  },
  detailSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: SolderiColors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  detailHint: {
    fontSize: 14,
    color: SolderiColors.textMuted,
    textAlign: 'center',
  },
});
