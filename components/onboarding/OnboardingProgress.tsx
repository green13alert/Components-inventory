import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps?: number;
};

export function OnboardingProgress({ currentStep, totalSteps = 5 }: OnboardingProgressProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingHorizontal: 2,
    },
    segment: {
      flex: 1,
      height: 3,
      borderRadius: 999,
      backgroundColor: colors.borderSubtle,
    },
    complete: {
      backgroundColor: colors.accentBorder,
    },
    current: {
      backgroundColor: colors.accent,
    },
  });
}
