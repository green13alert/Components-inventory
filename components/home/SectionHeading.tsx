import { StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.sectionTitle,
    color: SolderiColors.textMuted,
  },
  subtitle: {
    ...Typography.caption,
    color: SolderiColors.textSecondary,
  },
});
