import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  grouped?: boolean;
};

export function SettingsRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  destructive,
  grouped,
}: SettingsRowProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const showChevron = Boolean(onPress) && !destructive;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        grouped && styles.rowGrouped,
        destructive && !grouped && styles.rowDestructive,
        pressed && onPress ? styles.rowPressed : null,
      ]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[label, subtitle, value].filter(Boolean).join(', ')}
      disabled={!onPress}>
      <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.error : colors.textSecondary}
        />
      </View>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
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
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 12,
      minHeight: 56,
    },
    rowGrouped: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
    },
    rowDestructive: {
      marginTop: 8,
    },
    rowPressed: {
      opacity: 0.72,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapDestructive: {
      backgroundColor: colors.errorMuted,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    labelWrap: {
      flex: 1,
      gap: 2,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.textMuted,
    },
    labelDestructive: {
      color: colors.error,
    },
    value: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}
