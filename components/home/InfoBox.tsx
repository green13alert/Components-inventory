import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

type InfoBoxProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function InfoBox({ label, icon }: InfoBoxProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      aspectRatio: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: 12,
      margin: 3,
    },
    iconWrap: {
      width: 37,
      height: 37,
      borderRadius: 14,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
    },
  });
}
