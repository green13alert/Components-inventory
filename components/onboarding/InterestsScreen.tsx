import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { InterestBubble } from '@/components/onboarding/InterestBubble';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { INTEREST_OPTIONS, ONBOARDING_CONTINUE } from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type InterestsScreenProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function InterestsScreen({
  selectedIds,
  onToggle,
  onBack,
  onContinue,
}: InterestsScreenProps) {
  const rows: (typeof INTEREST_OPTIONS)[] = [];
  for (let i = 0; i < INTEREST_OPTIONS.length; i += 2) {
    rows.push(INTEREST_OPTIONS.slice(i, i + 2));
  }

  return (
    <OnboardingShell
      step={4}
      title="What do you like building?"
      description="Choose a few interests so we can recommend projects you'll actually enjoy."
      onBack={onBack}
      background="gradient"
      footer={
        <OnboardingCta
          label={ONBOARDING_CONTINUE}
          onPress={onContinue}
          disabled={selectedIds.length === 0}
        />
      }>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={row.map((item) => item.id).join('-')} style={styles.row}>
            {row.map((interest, columnIndex) => {
              const index = rowIndex * 2 + columnIndex;
              return (
                <Animated.View
                  key={interest.id}
                  style={styles.cell}
                  entering={FadeInDown.duration(420).delay(index * 45)}>
                  <InterestBubble
                    emoji={interest.emoji}
                    label={interest.label}
                    selected={selectedIds.includes(interest.id)}
                    onPress={() => onToggle(interest.id)}
                  />
                </Animated.View>
              );
            })}
            {row.length === 1 ? <View style={styles.cell} /> : null}
          </View>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
