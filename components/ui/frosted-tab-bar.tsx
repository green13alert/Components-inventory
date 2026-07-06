import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FrostedTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 100 : 80}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View style={styles.separator} />
      <BottomTabBar
        {...props}
        style={[props.style, styles.transparentBar]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  separator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    zIndex: 1,
  },
  transparentBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
});
