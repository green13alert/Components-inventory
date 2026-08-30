import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

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
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
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

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
    },
  });
}
