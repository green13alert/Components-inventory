import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiTheme } from '@/context/theme-context';

type SettingsSwitchRowProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  grouped?: boolean;
};

export function SettingsSwitchRow({
  icon,
  label,
  value,
  onValueChange,
  grouped,
}: SettingsSwitchRowProps) {
  const { colors, resolvedScheme } = useSolderiTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const thumbColor = resolvedScheme === 'light' ? colors.surfaceElevated : colors.textPrimary;

  return (
    <View style={[styles.row, grouped && styles.rowGrouped]} accessibilityLabel={label}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.textSecondary} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={thumbColor}
        ios_backgroundColor={colors.border}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
      gap: 12,
      minHeight: 56,
    },
    rowGrouped: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
}
