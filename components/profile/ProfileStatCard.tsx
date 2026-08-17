import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';

type ProfileStatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

export function ProfileStatCard({ icon, value, label }: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={SolderiColors.textSecondary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: SolderiColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: SolderiColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: SolderiColors.textPrimary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: SolderiColors.textSecondary,
    textAlign: 'center',
  },
});
