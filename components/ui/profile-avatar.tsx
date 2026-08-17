import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';

export function ProfileAvatar() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Profile">
      <View style={styles.avatar}>
        <Ionicons name="person" size={18} color={SolderiColors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SolderiColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
