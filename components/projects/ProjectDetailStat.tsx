import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type ProjectDetailStatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function ProjectDetailStat({ icon, label, value }: ProjectDetailStatProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={18} color={ArduinoColors.blue} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: ArduinoColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: ArduinoColors.textMuted,
    textAlign: 'center',
  },
});
