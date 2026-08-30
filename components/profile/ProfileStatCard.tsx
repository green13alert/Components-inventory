import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type ProfileStatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

export function ProfileStatCard({ icon, value, label }: ProfileStatCardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
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
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      alignItems: 'center',
      gap: 6,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
