import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

export function ProfileAvatar() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Profile">
      <View style={styles.avatar}>
        <Ionicons name="person" size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    button: {
      borderRadius: 20,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
