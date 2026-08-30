import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type WorkshopStatsProps = {
  componentCount: number;
  projectCount: number;
  completedCount: number;
};

type StatItemProps = {
  value: number;
  label: string;
  showDivider?: boolean;
};

function StatItem({ value, label, showDivider }: StatItemProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <View style={styles.stat}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export function WorkshopStats({
  componentCount,
  projectCount,
  completedCount,
}: WorkshopStatsProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <StatItem value={componentCount} label="Components" showDivider />
      <StatItem value={projectCount} label="Projects" showDivider />
      <StatItem value={completedCount} label="Completed" />
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    stat: {
      flex: 1,
      alignItems: 'center',
      gap: Spacing.xs,
    },
    value: {
      ...Typography.stat,
      color: colors.textPrimary,
    },
    label: {
      ...Typography.metadata,
      color: colors.textMuted,
    },
    divider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
  });
}
