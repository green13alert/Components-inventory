import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

export function ProfileAvatar() {
  return (
    <Pressable style={styles.button} accessibilityRole="button" accessibilityLabel="Profile">
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={ArduinoColors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ArduinoColors.surfaceElevated,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
