import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      gap: Spacing.xs,
    },
    title: {
      ...Typography.sectionTitle,
      color: colors.textMuted,
    },
    subtitle: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
  });
}
