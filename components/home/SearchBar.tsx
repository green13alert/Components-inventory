import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

export function SearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={ArduinoColors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder="Search projects..."
        placeholderTextColor={ArduinoColors.textMuted}
        editable={false}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ArduinoColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: ArduinoColors.textPrimary,
  },
});
