import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolderiColors } from '@/constants/colors';

const MAIN_TABS = [
  { routeName: 'index', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { routeName: 'projects', label: 'Projects', icon: 'folder-open-outline', activeIcon: 'folder-open' },
  { routeName: 'inventory', label: 'Inventory', icon: 'cube-outline', activeIcon: 'cube' },
] as const;

const TAB_COUNT = MAIN_TABS.length;
const BAR_SURFACE = 'rgba(23, 27, 36, 0.78)';
const AI_BUTTON_SIZE = 52;
const H_PADDING = 6;
const TAB_GAP = 4;
const BUBBLE_TOP = 6;
const BUBBLE_HEIGHT = 52;

const SPRING = { damping: 22, stiffness: 260, mass: 0.75 };

function getTabWidth(containerWidth: number) {
  'worklet';
  const innerWidth = containerWidth - H_PADDING * 2;
  return (innerWidth - TAB_GAP * (TAB_COUNT - 1)) / TAB_COUNT;
}

function getTabPosition(index: number, containerWidth: number) {
  'worklet';
  const tabWidth = getTabWidth(containerWidth);
  return H_PADDING + index * (tabWidth + TAB_GAP);
}

function getNearestTabIndex(x: number, containerWidth: number) {
  'worklet';
  let nearest = 0;
  let minDist = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < TAB_COUNT; i++) {
    const pos = getTabPosition(i, containerWidth);
    const dist = Math.abs(x - pos);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  }

  return nearest;
}

function getMainTabIndex(state: BottomTabBarProps['state']) {
  const routeName = state.routes[state.index]?.name;
  const idx = MAIN_TABS.findIndex((tab) => tab.routeName === routeName);
  return idx >= 0 ? idx : 0;
}

export function CustomTabBar({ navigation, state }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isAiActive = pathname === '/ai';

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none">
      <SlidingTabBar navigation={navigation} state={state} />

      <Pressable
        style={({ pressed }) => [
          styles.aiButton,
          isAiActive && styles.aiButtonActive,
          pressed && styles.pressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/ai');
        }}
        accessibilityRole="button"
        accessibilityLabel="AI"
        accessibilityState={{ selected: isAiActive }}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 48}
          tint="dark"
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        />
        <View style={[styles.aiOverlay, isAiActive && styles.aiOverlayActive]} />
        <Ionicons
          name={isAiActive ? 'sparkles' : 'sparkles-outline'}
          size={22}
          color={isAiActive ? SolderiColors.accent : SolderiColors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

function SlidingTabBar({
  navigation,
  state,
}: {
  navigation: BottomTabBarProps['navigation'];
  state: BottomTabBarProps['state'];
}) {
  const activeIndex = getMainTabIndex(state);
  const [visualIndex, setVisualIndex] = useState(activeIndex);
  const [barWidth, setBarWidth] = useState(0);

  const barWidthShared = useSharedValue(0);
  const bubbleX = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const dragIndex = useSharedValue(activeIndex);

  const navigateToTab = useCallback(
    (index: number) => {
      const config = MAIN_TABS[index];
      const routeIndex = state.routes.findIndex((route) => route.name === config.routeName);
      if (routeIndex === -1) return;

      const route = state.routes[routeIndex];
      if (state.index === routeIndex) return;

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, state],
  );

  const onTabCrossed = useCallback(
    (index: number) => {
      setVisualIndex(index);
      navigateToTab(index);
    },
    [navigateToTab],
  );

  const onBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      setBarWidth(width);
      barWidthShared.value = width;
      bubbleX.value = getTabPosition(activeIndex, width);
      dragIndex.value = activeIndex;
    },
    [activeIndex, barWidthShared, bubbleX, dragIndex],
  );

  useEffect(() => {
    setVisualIndex(activeIndex);
    dragIndex.value = activeIndex;

    if (barWidth > 0) {
      bubbleX.value = withSpring(getTabPosition(activeIndex, barWidth), SPRING);
    }
  }, [activeIndex, barWidth, bubbleX, dragIndex]);

  const panGesture = Gesture.Pan()
    .minDistance(6)
    .activeOffsetX([-4, 4])
    .failOffsetY([-12, 12])
    .onStart(() => {
      dragStartX.value = bubbleX.value;
      dragIndex.value = getNearestTabIndex(bubbleX.value, barWidthShared.value);
    })
    .onUpdate((event) => {
      if (barWidthShared.value <= 0) return;

      const minX = getTabPosition(0, barWidthShared.value);
      const maxX = getTabPosition(TAB_COUNT - 1, barWidthShared.value);
      const nextX = dragStartX.value + event.translationX;
      bubbleX.value = Math.min(Math.max(nextX, minX), maxX);

      const nearest = getNearestTabIndex(bubbleX.value, barWidthShared.value);
      if (nearest !== dragIndex.value) {
        dragIndex.value = nearest;
        runOnJS(onTabCrossed)(nearest);
      }
    })
    .onEnd(() => {
      if (barWidthShared.value <= 0) return;

      const nearest = getNearestTabIndex(bubbleX.value, barWidthShared.value);
      bubbleX.value = withSpring(getTabPosition(nearest, barWidthShared.value), SPRING);
      runOnJS(onTabCrossed)(nearest);
    });

  const bubbleStyle = useAnimatedStyle(() => ({
    width: getTabWidth(barWidthShared.value),
    transform: [{ translateX: bubbleX.value }],
  }));

  return (
    <View style={styles.mainBar}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 60 : 48}
        tint="dark"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View style={styles.barOverlay} />

      <GestureDetector gesture={panGesture}>
        <View style={styles.barContent} onLayout={onBarLayout}>
          <Animated.View style={[styles.slidingBubble, bubbleStyle]} pointerEvents="none" />

          {MAIN_TABS.map((config, index) => {
            const routeIndex = state.routes.findIndex((route) => route.name === config.routeName);
            if (routeIndex === -1) return null;

            const route = state.routes[routeIndex];
            const isFocused = visualIndex === index;

            return (
              <TabButton
                key={route.key}
                label={config.label}
                icon={isFocused ? config.activeIcon : config.icon}
                isFocused={isFocused}
                onPress={() => {
                  if (barWidth > 0) {
                    bubbleX.value = withSpring(getTabPosition(index, barWidth), SPRING);
                  }
                  navigateToTab(index);
                  setVisualIndex(index);
                }}
              />
            );
          })}
        </View>
      </GestureDetector>
    </View>
  );
}

function TabButton({
  icon,
  label,
  isFocused,
  onPress,
}: {
  icon: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}>
      <View style={styles.tabContent}>
        <Ionicons
          name={icon as never}
          size={20}
          color={isFocused ? SolderiColors.accent : SolderiColors.textMuted}
        />
        <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  mainBar: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SolderiColors.border,
  },
  barOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BAR_SURFACE,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: BUBBLE_TOP,
    paddingHorizontal: H_PADDING,
    gap: TAB_GAP,
    position: 'relative',
    minHeight: BUBBLE_HEIGHT + BUBBLE_TOP * 2,
  },
  slidingBubble: {
    position: 'absolute',
    top: BUBBLE_TOP,
    height: BUBBLE_HEIGHT,
    borderRadius: 22,
    backgroundColor: 'rgba(32, 184, 196, 0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(32, 184, 196, 0.4)',
  },
  tabButton: {
    flex: 1,
    zIndex: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
    paddingHorizontal: 10,
    minWidth: 72,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: SolderiColors.textMuted,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: SolderiColors.accent,
    fontWeight: '600',
  },
  aiButton: {
    width: AI_BUTTON_SIZE,
    height: AI_BUTTON_SIZE,
    borderRadius: AI_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SolderiColors.border,
  },
  aiButtonActive: {
    borderColor: 'rgba(32, 184, 196, 0.45)',
  },
  aiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BAR_SURFACE,
  },
  aiOverlayActive: {
    backgroundColor: 'rgba(32, 184, 196, 0.14)',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
