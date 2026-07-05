import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type NavBoxProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function NavBox({ label, icon }: NavBoxProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={ArduinoColors.blue} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: ArduinoColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
  },
  iconWrap: {
    width: 37,
    height: 37,
    borderRadius: 14,
    backgroundColor: ArduinoColors.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: ArduinoColors.textPrimary,
    textAlign: 'center',
  },
});
