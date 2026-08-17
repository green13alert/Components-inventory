import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArduinoColors } from '@/constants/colors';

type ToastProps = {
  message: string | null;
  onHide: () => void;
};

const TOAST_DURATION_MS = 2200;

export function Toast({ message, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onHide, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, { bottom: insets.bottom + 88 }]}>
      <View style={styles.toast}>
        <Ionicons name="bookmark" size={18} color={ArduinoColors.blue} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: ArduinoColors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: ArduinoColors.textPrimary,
  },
});
