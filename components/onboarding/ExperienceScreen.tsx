import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ExperienceOptionCard } from '@/components/onboarding/ExperienceOptionCard';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import {
  EXPERIENCE_OPTIONS,
  ONBOARDING_CONTINUE,
  type ExperienceLevel,
} from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type ExperienceScreenProps = {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ExperienceScreen({ selected, onSelect, onBack, onContinue }: ExperienceScreenProps) {
  return (
    <OnboardingShell
      step={2}
      title="What's your experience?"
      description="Tell us your skill level so we can tailor projects to you."
      onBack={onBack}
      background="gradient"
      scrollable={false}
      footer={
        <OnboardingCta
          label={ONBOARDING_CONTINUE}
          onPress={onContinue}
          disabled={!selected}
        />
      }>
      <View style={styles.options}>
        {EXPERIENCE_OPTIONS.map((option, index) => (
          <Animated.View key={option.id} entering={FadeInDown.duration(420).delay(index * 70)}>
            <ExperienceOptionCard
              emoji={option.emoji}
              title={option.title}
              subtitle={option.subtitle}
              selected={selected === option.id}
              onPress={() => onSelect(option.id)}
            />
          </Animated.View>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  options: {
    flex: 1,
    gap: Spacing.md,
    justifyContent: 'center',
    paddingBottom: Spacing.lg,
  },
});
