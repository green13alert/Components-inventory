import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

export function SettingsRow({ icon, label, value, onPress, destructive }: SettingsRowProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      disabled={!onPress}>
      <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? SolderiColors.error : SolderiColors.textSecondary}
        />
      </View>
      <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color={SolderiColors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SolderiColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SolderiColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDestructive: {
    backgroundColor: SolderiColors.errorMuted,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
  },
  labelDestructive: {
    color: SolderiColors.error,
  },
  value: {
    fontSize: 14,
    color: SolderiColors.textSecondary,
  },
});
