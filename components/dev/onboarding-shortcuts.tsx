import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolderiColors } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';
import { Spacing } from '@/constants/tokens';

export function HomeOnboardingDevButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.floatingWrap, { bottom: tabBarBottomPadding(insets.bottom) }]}
      pointerEvents="box-none">
      <Pressable
        style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        onPress={() => router.push('/onboarding')}
        accessibilityRole="button"
        accessibilityLabel="Dev: open onboarding">
        <Text style={styles.homeLabel}>Dev: Open onboarding</Text>
      </Pressable>
    </View>
  );
}

type OnboardingSkipDevButtonProps = {
  onPress: () => void;
};

export function OnboardingSkipDevButton({ onPress }: OnboardingSkipDevButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Dev: skip onboarding">
      <Text style={styles.skipLabel}>Skip</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 20,
    elevation: 20,
  },
  homeButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: SolderiColors.accentBorder,
    backgroundColor: SolderiColors.surfaceElevated,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  homeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SolderiColors.textMuted,
  },
  skipLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: SolderiColors.textSecondary,
  },
});
