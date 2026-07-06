import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type NavBoxProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function NavBox({ label, icon }: NavBoxProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name={icon} size={26} color={ArduinoColors.blue} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  container: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: ArduinoColors.blueSoft,
    borderRadius: 16,
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
