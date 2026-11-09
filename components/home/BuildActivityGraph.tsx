import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeading } from '@/components/home/SectionHeading';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';
import { useAtlas } from '@/context/atlas-context';
import { useAuth } from '@/context/auth-context';
import {
  BUILD_ACTIVITY_LOADING,
  presentBuildActivity,
  type BuildActivityDay,
  type BuildActivityPlan,
} from '@/lib/build-activity';
import { useSolderiColors } from '@/context/theme-context';

const BAR_MAX_HEIGHT = 72;

export function BuildActivitySection() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { session } = useAuth();
  const {
    stepCompletions,
    stepCompletionStatus,
    stepCompletionAccountId,
    reloadStepCompletions,
  } = useAtlas();
  const userId = session?.user.id ?? null;

  useFocusEffect(
    useCallback(() => {
      void reloadStepCompletions({ silent: true });
    }, [reloadStepCompletions]),
  );

  const plan = presentBuildActivity({
    accountId: userId,
    historyAccountId: stepCompletionAccountId,
    status: stepCompletionStatus,
    events: stepCompletions,
    today: new Date(),
  });

  return (
    <View style={styles.section}>
      <SectionHeading title="Build Activity" />
      {plan.status === 'ready' ? (
        <ActivityChart days={plan.days} />
      ) : (
        <Text style={styles.note}>{activityMessage(plan)}</Text>
      )}
    </View>
  );
}

function activityMessage(plan: Exclude<BuildActivityPlan, { status: 'ready' }>): string {
  if (plan.status === 'loading') {
    return BUILD_ACTIVITY_LOADING;
  }
  return plan.message;
}

function ActivityChart({ days }: { days: readonly BuildActivityDay[] }) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const max = Math.max(1, ...days.map((day) => day.count));

  return (
    <View style={styles.chartBlock}>
      <Text style={styles.unit}>Tutorial steps</Text>
      <View style={styles.chart}>
        {days.map((day) => {
          const height = day.count === 0 ? 4 : Math.max(10, Math.round((day.count / max) * BAR_MAX_HEIGHT));
          return (
            <View
              key={day.dateKey}
              style={styles.column}
              accessibilityLabel={`${day.label}, ${day.count} tutorial steps`}>
              <Text style={styles.count}>{day.count}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: day.count === 0 ? colors.graphEmpty : colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.day}>{day.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    section: {
      gap: Spacing.lg,
    },
    note: {
      ...Typography.body,
      color: colors.textSecondary,
    },
    chartBlock: {
      gap: Spacing.sm,
    },
    unit: {
      ...Typography.metadata,
      color: colors.textMuted,
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: Spacing.sm,
    },
    column: {
      flex: 1,
      alignItems: 'center',
      gap: Spacing.xs,
    },
    count: {
      ...Typography.metadata,
      color: colors.textSecondary,
    },
    track: {
      height: BAR_MAX_HEIGHT,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bar: {
      width: '70%',
      maxWidth: 28,
      borderRadius: 4,
    },
    day: {
      ...Typography.metadata,
      color: colors.textMuted,
    },
  });
}
