import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';
import { fitContentSize, panDiagram, zoomAroundFocal } from '@/lib/diagram-viewport';

type DiagramMode = 'physical' | 'schematic';

type DiagramViewerProps = {
  visible: boolean;
  onClose: () => void;
  mode: DiagramMode;
  onModeChange?: (mode: DiagramMode) => void;
  showModeToggle?: boolean;
  contentWidth: number;
  contentHeight: number;
  lines: string[];
  children: ReactNode;
};

export function DiagramViewer({
  visible,
  onClose,
  mode,
  onModeChange,
  showModeToggle = false,
  contentWidth,
  contentHeight,
  lines,
  children,
}: DiagramViewerProps) {
  const colors = useSolderiColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [listOpen, setListOpen] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const viewportWidth = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const diagramWidth = useSharedValue(contentWidth);
  const diagramHeight = useSharedValue(contentHeight);

  useEffect(() => {
    diagramWidth.value = contentWidth;
    diagramHeight.value = contentHeight;
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = 1;
    savedX.value = 0;
    savedY.value = 0;
    if (visible) {
      setListOpen(false);
    }
  }, [contentHeight, contentWidth, diagramHeight, diagramWidth, mode, savedScale, savedX, savedY, scale, translateX, translateY, visible]);

  const fitted = fitContentSize(viewport.width, viewport.height, contentWidth, contentHeight);

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          savedScale.value = scale.value;
          savedX.value = translateX.value;
          savedY.value = translateY.value;
        })
        .onUpdate((event) => {
          const next = zoomAroundFocal({
            startScale: savedScale.value,
            startX: savedX.value,
            startY: savedY.value,
            scaleFactor: event.scale,
            focalX: event.focalX,
            focalY: event.focalY,
            viewportWidth: viewportWidth.value,
            viewportHeight: viewportHeight.value,
            contentWidth: diagramWidth.value,
            contentHeight: diagramHeight.value,
          });
          scale.value = next.scale;
          translateX.value = next.x;
          translateY.value = next.y;
        }),
    [diagramHeight, diagramWidth, savedScale, savedX, savedY, scale, translateX, translateY, viewportHeight, viewportWidth],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
          savedX.value = translateX.value;
          savedY.value = translateY.value;
        })
        .onUpdate((event) => {
          const next = panDiagram({
            startX: savedX.value,
            startY: savedY.value,
            translationX: event.translationX,
            translationY: event.translationY,
            scale: scale.value,
            viewportWidth: viewportWidth.value,
            viewportHeight: viewportHeight.value,
            contentWidth: diagramWidth.value,
            contentHeight: diagramHeight.value,
          });
          translateX.value = next.x;
          translateY.value = next.y;
        }),
    [diagramHeight, diagramWidth, savedX, savedY, scale, translateX, translateY, viewportHeight, viewportWidth],
  );

  const gesture = useMemo(() => Gesture.Simultaneous(pinch, pan), [pan, pinch]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const reset = () => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = 1;
    savedX.value = 0;
    savedY.value = 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close diagram" onPress={onClose} style={styles.headerButton}>
              <Text style={styles.headerLabel}>Close</Text>
            </Pressable>
            {showModeToggle ? (
              <View style={styles.modes}>
                <ModeButton label="Physical" selected={mode === 'physical'} onPress={() => onModeChange?.('physical')} />
                <ModeButton label="Schematic" selected={mode === 'schematic'} onPress={() => onModeChange?.('schematic')} />
              </View>
            ) : (
              <View style={styles.modes} />
            )}
            <Pressable accessibilityRole="button" accessibilityLabel="Reset diagram view" onPress={reset} style={styles.headerButton}>
              <Text style={styles.headerLabel}>Reset</Text>
            </Pressable>
          </View>
          <GestureDetector gesture={gesture}>
            <View
              style={styles.viewport}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                viewportWidth.value = width;
                viewportHeight.value = height;
                setViewport({ width, height });
              }}>
              <Animated.View style={[styles.stage, animated]} pointerEvents="none">
                <View style={{ width: fitted.width, height: fitted.height }}>{children}</View>
              </Animated.View>
            </View>
          </GestureDetector>
          <View style={styles.sheet}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={listOpen ? 'Hide connections' : 'Show connections'}
              onPress={() => setListOpen((open) => !open)}
              style={styles.sheetToggle}>
              <Text style={styles.sheetToggleLabel}>{listOpen ? 'Hide connections' : 'Show connections'}</Text>
            </Pressable>
            {listOpen ? (
              <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetContent}>
                {lines.length > 0 ? (
                  lines.map((line, index) => (
                    <Text key={`${line}-${index}`} style={styles.sheetLine}>
                      {line}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.sheetLine}>This step has no new connections.</Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function ModeButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.modeButton, selected && styles.modeButtonOn]}>
      <Text style={[styles.modeLabel, selected && styles.modeLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    headerButton: {
      minWidth: 64,
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    headerLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
    modes: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
    modeButton: {
      minHeight: 44,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeButtonOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
    modeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
    modeLabelOn: { color: colors.textPrimary },
    viewport: { flex: 1, overflow: 'hidden', backgroundColor: colors.surface },
    stage: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheet: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    sheetToggle: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    sheetToggleLabel: { color: colors.accent, fontSize: 15, fontWeight: '700' },
    sheetList: { maxHeight: 220 },
    sheetContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
    sheetLine: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
  });
}
