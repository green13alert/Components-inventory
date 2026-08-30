import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type ProjectDetailStatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function ProjectDetailStat({ icon, label, value }: ProjectDetailStatProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 4,
    },
    value: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
