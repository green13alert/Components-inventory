import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type NavBoxProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function NavBox({ label, icon, onPress }: NavBoxProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.container}>
        <Ionicons name={icon} size={26} color={colors.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    container: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.accentSoft,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.97 }],
    },
  });
}
