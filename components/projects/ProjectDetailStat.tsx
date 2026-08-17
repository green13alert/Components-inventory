import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';

type ProjectDetailStatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function ProjectDetailStat({ icon, label, value }: ProjectDetailStatProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={18} color={SolderiColors.textSecondary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: SolderiColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: SolderiColors.textPrimary,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: SolderiColors.textMuted,
    textAlign: 'center',
  },
});
