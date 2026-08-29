import { StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';

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
  return (
    <View style={styles.container}>
      <StatItem value={componentCount} label="Components" showDivider />
      <StatItem value={projectCount} label="Projects" showDivider />
      <StatItem value={completedCount} label="Completed" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SolderiColors.surface,
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
    color: SolderiColors.textPrimary,
  },
  label: {
    ...Typography.metadata,
    color: SolderiColors.textMuted,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: SolderiColors.border,
  },
});
