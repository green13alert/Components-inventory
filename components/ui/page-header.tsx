import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProfileAvatar } from '@/components/ui/profile-avatar';
import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <ProfileAvatar />
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      paddingTop: 8,
    },
    textBlock: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
}
