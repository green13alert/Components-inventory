import { Children, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
  dividerInset?: number;
};

export function SettingsSection({ title, children, dividerInset = 62 }: SettingsSectionProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.group}>
        {items.map((child, index) => (
          <View key={index}>
            {child}
            {index < items.length - 1 ? (
              <View style={[styles.divider, { marginLeft: dividerInset }]} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    wrap: {
      gap: Spacing.sm,
    },
    title: {
      ...Typography.sectionTitle,
      color: colors.textMuted,
      paddingHorizontal: 4,
    },
    group: {
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
  });
}
