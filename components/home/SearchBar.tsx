import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: TextInputProps['onChangeText'];
  editable?: boolean;
};

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  editable = true,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={ArduinoColors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={ArduinoColors.textMuted}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
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
