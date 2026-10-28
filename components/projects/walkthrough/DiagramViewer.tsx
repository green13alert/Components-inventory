import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pressFeedback } from '@/components/ui/press-feedback';
import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';
import { sceneTouchRadius, viewerPointToScene, WIRE_TOUCH_POINTS } from '@/lib/diagram-hit';
import { toggleDiagramPanel, type DiagramPanel } from '@/lib/diagram-panel';
import { diagramChromeFit, diagramFrameKey, panDiagram, shouldRefitViewport, zoomAroundFocal } from '@/lib/diagram-viewport';

type DiagramMode = 'physical' | 'schematic';

type DiagramViewerProps = {
  visible: boolean;
  onClose: () => void;
  mode: DiagramMode;
  onModeChange?: (mode: DiagramMode) => void;
  showModeToggle?: boolean;
  contentWidth: number;
  contentHeight: number;
  connections?: ReactNode;
  components?: ReactNode;
  detail?: ReactNode;
  onSceneTap?: (point: { x: number; y: number }, radius: number) => void;
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
  connections,
  components,
  detail,
  onSceneTap,
  children,
}: DiagramViewerProps) {
  const colors = useSolderiColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [chromeHeight, setChromeHeight] = useState(0);
  const [panel, setPanel] = useState<DiagramPanel>('none');
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
  const pinchStartFocalX = useSharedValue(0);
  const pinchStartFocalY = useSharedValue(0);
  const frameKey = diagramFrameKey(mode, contentWidth, contentHeight);
  const measuredFrame = useRef('');
  const lockedHeight = useRef(0);
  if (measuredFrame.current !== '' && measuredFrame.current !== frameKey) {
    measuredFrame.current = '';
    lockedHeight.current = 0;
  }

  useEffect(() => {
    diagramWidth.value = contentWidth;
    diagramHeight.value = contentHeight;
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = 1;
    savedX.value = 0;
    savedY.value = 0;
  }, [contentHeight, contentWidth, diagramHeight, diagramWidth, frameKey, savedScale, savedX, savedY, scale, translateX, translateY, visible]);

  useEffect(() => {
    if (visible) {
      setPanel('none');
    }
  }, [visible]);

  const reportSceneTap = useCallback(
    (x: number, y: number, nextScale: number, tx: number, ty: number, vw: number, vh: number) => {
      if (!onSceneTap) {
        return;
      }
      const fittedSize = diagramChromeFit(vw, vh, contentWidth, contentHeight, chromeHeight);
      if (fittedSize.width <= 0 || fittedSize.height <= 0) {
        return;
      }
      onSceneTap(
        viewerPointToScene({
          x,
          y,
          scale: nextScale,
          translateX: tx,
          translateY: ty,
          viewportWidth: vw,
          viewportHeight: vh,
          fittedWidth: fittedSize.width,
          fittedHeight: fittedSize.height,
          sceneWidth: contentWidth,
          sceneHeight: contentHeight,
        }),
        sceneTouchRadius(WIRE_TOUCH_POINTS, fittedSize.width, contentWidth, nextScale),
      );
    },
    [chromeHeight, contentHeight, contentWidth, onSceneTap],
  );

  const fitted = diagramChromeFit(viewport.width, viewport.height, contentWidth, contentHeight, chromeHeight);

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onStart((event) => {
          savedScale.value = scale.value;
          savedX.value = translateX.value;
          savedY.value = translateY.value;
          pinchStartFocalX.value = event.focalX;
          pinchStartFocalY.value = event.focalY;
        })
        .onUpdate((event) => {
          const next = zoomAroundFocal({
            startScale: savedScale.value,
            startX: savedX.value,
            startY: savedY.value,
            scaleFactor: event.scale,
            startFocalX: pinchStartFocalX.value,
            startFocalY: pinchStartFocalY.value,
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
    [diagramHeight, diagramWidth, pinchStartFocalX, pinchStartFocalY, savedScale, savedX, savedY, scale, translateX, translateY, viewportHeight, viewportWidth],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .minDistance(6)
        .onTouchesMove((event, state) => {
          if (event.numberOfTouches > 1) {
            state.fail();
          }
        })
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

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .maxDuration(280)
        .onEnd((event) => {
          runOnJS(reportSceneTap)(event.x, event.y, scale.value, translateX.value, translateY.value, viewportWidth.value, viewportHeight.value);
        }),
    [reportSceneTap, scale, translateX, translateY, viewportHeight, viewportWidth],
  );

  const gesture = useMemo(() => Gesture.Exclusive(Gesture.Simultaneous(pinch, pan), tap), [pan, pinch, tap]);

  const animated = useAnimatedStyle(() => ({
    // iOS and Android post-multiply each operation, so the last item reaches the
    // point first. Scale stays last: zoom about the centre, then translate.
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close diagram" onPress={onClose} style={pressFeedback(styles.headerButton)}>
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
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.body}>
          <GestureDetector gesture={gesture}>
            <View
              style={styles.viewport}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                if (!shouldRefitViewport(width, height, lockedHeight.current, measuredFrame.current === frameKey, scale.value)) {
                  return;
                }
                measuredFrame.current = frameKey;
                lockedHeight.current = height;
                viewportWidth.value = width;
                viewportHeight.value = height;
                setViewport((current) => (current.width === width && current.height === height ? current : { width, height }));
              }}>
              <Animated.View style={[styles.stage, animated]} pointerEvents="none">
                <View style={{ width: fitted.width, height: fitted.height }}>{children}</View>
              </Animated.View>
            </View>
          </GestureDetector>
          <View style={styles.overlay} pointerEvents="box-none">
          {detail ? <View style={styles.detail}>{detail}</View> : null}
          <View style={styles.sheet}>
            <View
              style={styles.segmentRow}
              onLayout={(event) => {
                const next = event.nativeEvent.layout.height;
                if (next < 20) {
                  return;
                }
                setChromeHeight((current) => (current === 0 ? next : current));
              }}>
              <View style={styles.segment}>
                {components ? (
                  <ModeButton
                    label="Components"
                    selected={panel === 'components'}
                    onPress={() => setPanel((current) => toggleDiagramPanel(current, 'components'))}
                  />
                ) : null}
                <ModeButton
                  label="Connections"
                  selected={panel === 'connections'}
                  onPress={() => setPanel((current) => toggleDiagramPanel(current, 'connections'))}
                />
              </View>
            </View>
            {panel === 'components' && components ? (
              <ScrollView
                style={styles.sheetList}
                contentContainerStyle={styles.sheetContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}>
                {components}
              </ScrollView>
            ) : null}
            {panel === 'connections' ? (
              <ScrollView
                style={styles.sheetList}
                contentContainerStyle={styles.sheetContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}>
                {connections}
              </ScrollView>
            ) : null}
          </View>
          </View>
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
      style={pressFeedback([styles.modeButton, selected && styles.modeButtonOn])}>
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
    headerSpacer: { minWidth: 64 },
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
    segmentRow: { alignItems: 'center', paddingBottom: 4 },
    segment: { flexDirection: 'row', gap: 6 },
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
    body: { flex: 1 },
    viewport: { flex: 1, overflow: 'hidden', backgroundColor: colors.surface },
    overlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    detail: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
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
    sheetList: { maxHeight: 220 },
    sheetContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  });
}
