import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

const CHIP_GAP = 8;
const CHIP_VERTICAL_INSET = 2;
const FADE_WIDTH = 28;

type CategoryPillsProps<T extends string> = {
  filters: { id: T; label: string }[];
  selected: T | null;
  onSelect: (id: T) => void;
  /** Horizontal inset so the first and last pills can sit fully on-screen. */
  edgePadding?: number;
};

export function CategoryPills<T extends string>({
  filters,
  selected,
  onSelect,
  edgePadding = 20,
}: CategoryPillsProps<T>) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const chipX = useRef<Record<string, number>>({});
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [chipVersion, setChipVersion] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const maxOffset = Math.max(0, contentWidth - viewportWidth);
  const canScroll = maxOffset > 1;
  const showLeftFade = canScroll && scrollX > 4;
  const showRightFade = canScroll && scrollX < maxOffset - 4;
  const fadeTransparent = `${colors.background}00`;

  const snapOffsets = useMemo(() => {
    const limit = Math.max(0, Math.round(maxOffset));
    const offsets = filters
      .map((filter) => chipX.current[filter.id])
      .filter((x): x is number => typeof x === 'number')
      .map((x) => Math.max(0, Math.round(x - edgePadding)))
      .filter((offset) => offset <= limit);

    return [...new Set([0, ...offsets, limit])].sort((a, b) => a - b);
  }, [chipVersion, edgePadding, filters, maxOffset]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.clip}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        disableIntervalMomentum={canScroll}
        snapToAlignment="start"
        snapToOffsets={canScroll && snapOffsets.length > 1 ? snapOffsets : undefined}
        onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
        onContentSizeChange={(width) => setContentWidth(width)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.list,
          {
            paddingLeft: edgePadding,
            paddingRight: edgePadding + 12,
            paddingVertical: CHIP_VERTICAL_INSET,
          },
        ]}>
        {filters.map((filter) => {
          const isActive = filter.id === selected;
          return (
            <Pressable
              key={filter.id}
              onPress={() => onSelect(filter.id)}
              onLayout={(event) => {
                const x = event.nativeEvent.layout.x;
                if (chipX.current[filter.id] === x) return;
                chipX.current[filter.id] = x;
                setChipVersion((value) => value + 1);
              }}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {showLeftFade ? (
        <LinearGradient
          pointerEvents="none"
          colors={[colors.background, fadeTransparent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fade, styles.fadeLeft]}
        />
      ) : null}
      {showRightFade ? (
        <LinearGradient
          pointerEvents="none"
          colors={[fadeTransparent, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fade, styles.fadeRight]}
        />
      ) : null}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    clip: {
      overflow: 'hidden',
    },
    list: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: CHIP_GAP,
    },
    fade: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: FADE_WIDTH,
    },
    fadeLeft: {
      left: 0,
    },
    fadeRight: {
      right: 0,
    },
    chip: {
      flexShrink: 0,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.accent,
    },
  });
}
