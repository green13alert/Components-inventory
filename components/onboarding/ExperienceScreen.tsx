import { Dimensions, StyleSheet, View } from 'react-native';

import { SkillTierPicker } from '@/components/onboarding/SkillTierPicker';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { ONBOARDING_CONTINUE, type ExperienceLevel } from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type ExperienceScreenProps = {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ExperienceScreen({ selected, onSelect, onBack, onContinue }: ExperienceScreenProps) {
  const screenHeight = Dimensions.get('window').height;
  const isCompact = screenHeight < 700;

  return (
    <OnboardingShell
      step={2}
      title="What's your experience?"
      description="Tell us your skill level so we can tailor projects to you."
      onBack={onBack}
      background="gradient"
      scrollable={isCompact}
      footer={
        <OnboardingCta
          label={ONBOARDING_CONTINUE}
          onPress={onContinue}
          disabled={!selected}
        />
      }>
      <View style={styles.content}>
        <SkillTierPicker selected={selected} onSelect={onSelect} />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
});
