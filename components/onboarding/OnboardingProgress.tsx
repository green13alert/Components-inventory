import { StyleSheet, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps?: number;
};

export function OnboardingProgress({ currentStep, totalSteps = 5 }: OnboardingProgressProps) {
  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <View
            key={step}
            style={[
              styles.segment,
              isComplete && styles.complete,
              isCurrent && styles.current,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: SolderiColors.borderSubtle,
  },
  complete: {
    backgroundColor: SolderiColors.accentBorder,
  },
  current: {
    backgroundColor: SolderiColors.accent,
  },
});
