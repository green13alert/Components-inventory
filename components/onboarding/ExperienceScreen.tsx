import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExperienceCircuitBackground } from '@/components/onboarding/ExperienceCircuitBackground';
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

/** Matches OnboardingShell horizontal padding — bleed circuit edge-to-edge. */
const SHELL_INSET = 28;

const CARD_STACK_HEIGHT = 224;
const HEADER_BLOCK_HEIGHT = 68;
const TOP_CHROME_HEIGHT = 64;
const FOOTER_HEIGHT = 68;
const VERTICAL_GAPS = Spacing.md + Spacing.sm;
const MIN_CIRCUIT_HEIGHT = 200;

function levelToStage(level: ExperienceLevel | null): number | null {
  if (level === null) return null;
  const map: Record<ExperienceLevel, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };
  return map[level];
}

export function ExperienceScreen({ selected, onSelect, onBack, onContinue }: ExperienceScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const activeStage = useMemo(() => levelToStage(selected), [selected]);

  const circuitHeight = useMemo(() => {
    const chrome =
      insets.top +
      Spacing.sm +
      TOP_CHROME_HEIGHT +
      HEADER_BLOCK_HEIGHT +
      Spacing.sm +
      CARD_STACK_HEIGHT +
      VERTICAL_GAPS +
      FOOTER_HEIGHT +
      Math.max(insets.bottom, Spacing.lg);

    const available = Math.max(0, screenHeight - chrome);
    return Math.max(MIN_CIRCUIT_HEIGHT, available);
  }, [insets.bottom, insets.top, screenHeight]);

  const needsScroll = screenHeight < 740;

  return (
    <OnboardingShell
      step={2}
      title="What's your experience?"
      description="We'll tailor your projects to match your experience."
      onBack={onBack}
      background="gradient"
      scrollable={needsScroll}
      headerGap={Spacing.sm}
      footer={
        <OnboardingCta
          label={ONBOARDING_CONTINUE}
          onPress={onContinue}
          disabled={!selected}
        />
      }>
      <View style={styles.content}>
        <SkillTierPicker selected={selected} onSelect={onSelect} />

        <View style={styles.circuitBleed}>
          <ExperienceCircuitBackground
            activeStage={activeStage}
            width={screenWidth}
            height={circuitHeight}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  circuitBleed: {
    marginHorizontal: -SHELL_INSET,
    flexGrow: 1,
    marginTop: Spacing.xs,
  },
});
