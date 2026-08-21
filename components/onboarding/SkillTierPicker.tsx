import { StyleSheet, View } from 'react-native';

import { ExperienceOptionCard } from '@/components/onboarding/ExperienceOptionCard';
import { EXPERIENCE_OPTIONS, type ExperienceLevel } from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type SkillTierPickerProps = {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
};

export function SkillTierPicker({ selected, onSelect }: SkillTierPickerProps) {
  return (
    <View style={styles.list}>
      {EXPERIENCE_OPTIONS.map((option) => (
        <ExperienceOptionCard
          key={option.id}
          tier={option.id}
          title={option.title}
          subtitle={option.subtitle}
          selected={selected === option.id}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
});
