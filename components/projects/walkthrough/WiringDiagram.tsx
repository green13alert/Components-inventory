import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { HW } from '@/constants/component-illustration-palette';
import type { SolderiPalette } from '@/constants/colors';
import { getWiringLayout, type WiringElementDef, type WiringLayout } from '@/constants/wiring-diagrams';
import type { StepConnection, WiringNode, WiringPair } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';
import {
  routeWiringDiagram,
  usedElementIds,
  WIRE_KIND_LABELS,
  wireKindColor,
  type RoutedWire,
  type WireKind,
} from '@/lib/wiring-diagram';

type WiringDiagramProps = {
  heading?: string;
  pair?: WiringPair;
  nodes?: WiringNode[];
  connections: StepConnection[];
  priorConnections?: StepConnection[];
  projectSlug?: string;
  onPinchActiveChange?: (active: boolean) => void;
};

const MIN_DIAGRAM_ZOOM = 0.75;
const MAX_DIAGRAM_ZOOM = 2.5;

function resolveNodes(pair?: WiringPair, nodes?: WiringNode[]): WiringNode[] {
  if (nodes && nodes.length > 0) {
    return nodes;
  }
  if (!pair) {
    return [];
  }
  return [
    { id: pair.leftId, name: pair.leftName, illustrationId: pair.leftId },
    { id: pair.rightId, name: pair.rightName, illustrationId: pair.rightId },
  ];
}

const FALLBACK_WIRE_COLORS = [HW.wireRed, HW.wireBlack, HW.wireGreen, HW.wireYellow] as const;

function fallbackWireColor(connection: StepConnection, index: number) {
  if (connection.signal === 'power') {
    return HW.wireRed;
  }
  if (connection.signal === 'ground') {
    return HW.wireBlack;
  }
  if (connection.signal === 'signal') {
    return HW.wireGreen;
  }
  return FALLBACK_WIRE_COLORS[index % FALLBACK_WIRE_COLORS.length];
}

export function WiringDiagram({
  heading,
  pair,
  nodes,
  connections,
  priorConnections = [],
  projectSlug,
  onPinchActiveChange,
}: WiringDiagramProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const layout = getWiringLayout(projectSlug);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{heading ?? 'Wiring diagram'}</Text>
      {layout ? (
        <VisualWiringCanvas
          layout={layout}
          connections={connections}
          priorConnections={priorConnections}
          onPinchActiveChange={onPinchActiveChange}
        />
      ) : (
        <FallbackWiringList pair={pair} nodes={nodes} connections={connections} />
      )}
    </View>
  );
}

function VisualWiringCanvas({
  layout,
  connections,
  priorConnections,
  onPinchActiveChange,
}: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections: StepConnection[];
  onPinchActiveChange?: (active: boolean) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [layoutZoom, setLayoutZoom] = useState(1);
  const zoom = useSharedValue(1);
  const pinchStartZoom = useSharedValue(1);

  const wires = useMemo(
    () => routeWiringDiagram(layout, connections, priorConnections),
    [layout, connections, priorConnections],
  );
  const used = useMemo(() => usedElementIds(wires), [wires]);
  const visibleElements = useMemo(
    () =>
      layout.elements.filter(
        (element) => element.kind === 'arduino-uno' || element.kind === 'breadboard' || used.has(element.id),
      ),
    [layout.elements, used],
  );
  const legendKinds = useMemo(() => {
    const present = new Set(wires.map((wire) => wire.kind));
    return WIRE_KIND_LABELS.filter((item) => present.has(item.kind));
  }, [wires]);

  const drawWidth = Math.max(canvasWidth || 0, 560);
  const scale = drawWidth / layout.width;
  const drawHeight = layout.height * scale;
  const zoomedWidth = drawWidth * layoutZoom;
  const zoomedHeight = drawHeight * layoutZoom;
  const stepFingerprint = `${layout.slug}:${connections.map((row) => `${row.fromPin}->${row.toPin}`).join('|')}`;

  const onPinchActiveChangeRef = useRef(onPinchActiveChange);
  onPinchActiveChangeRef.current = onPinchActiveChange;

  const setPinchActive = useCallback((active: boolean) => {
    onPinchActiveChangeRef.current?.(active);
  }, []);

  const applyZoom = useCallback((next: number) => {
    setLayoutZoom(next);
  }, []);

  useEffect(() => {
    zoom.value = 1;
    pinchStartZoom.value = 1;
    setLayoutZoom(1);
    onPinchActiveChangeRef.current?.(false);
  }, [pinchStartZoom, stepFingerprint, zoom]);

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          pinchStartZoom.value = zoom.value;
          runOnJS(setPinchActive)(true);
        })
        .onUpdate((event) => {
          const next = Math.min(MAX_DIAGRAM_ZOOM, Math.max(MIN_DIAGRAM_ZOOM, pinchStartZoom.value * event.scale));
          zoom.value = next;
          runOnJS(applyZoom)(next);
        })
        .onFinalize(() => {
          runOnJS(applyZoom)(zoom.value);
          runOnJS(setPinchActive)(false);
        }),
    [applyZoom, pinchStartZoom, setPinchActive, zoom],
  );

  const composed = useMemo(() => Gesture.Simultaneous(pinch, Gesture.Native()), [pinch]);

  return (
    <View
      style={styles.canvas}
      onLayout={(event) => setCanvasWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponderCapture={(event) => (event.nativeEvent.touches?.length ?? 0) > 1}
      onMoveShouldSetResponderCapture={(event) => (event.nativeEvent.touches?.length ?? 0) > 1}>
      <GestureDetector gesture={composed}>
        <GestureScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          bounces={false}
          keyboardShouldPersistTaps="handled"
          style={{ height: zoomedHeight }}>
          <View style={{ width: zoomedWidth, height: zoomedHeight }} collapsable={false}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`}>
              {visibleElements.map((element) => (
                <DiagramSymbol key={element.id} element={element} />
              ))}
              {wires.map((wire) => (
                <WirePath key={wire.key} wire={wire} />
              ))}
              {wires.map((wire) => (
                <G key={`${wire.key}-ports`}>
                  <Circle cx={wire.from.x} cy={wire.from.y} r={4} fill={wireKindColor(wire.kind)} />
                  <Circle cx={wire.to.x} cy={wire.to.y} r={4} fill={wireKindColor(wire.kind)} />
                </G>
              ))}
            </Svg>
          </View>
        </GestureScrollView>
      </GestureDetector>
      {legendKinds.length > 0 ? (
        <View style={styles.legend}>
          {legendKinds.map((item) => (
            <LegendKey key={item.kind} kind={item.kind} label={item.label} />
          ))}
        </View>
      ) : null}
      {canvasWidth > 0 && canvasWidth < drawWidth - 8 ? (
        <Text style={styles.legendLabel}>Swipe sideways to see the full diagram</Text>
      ) : null}
    </View>
  );
}

function WirePath({ wire }: { wire: RoutedWire }) {
  return (
    <Path
      d={wire.d}
      fill="none"
      stroke={wireKindColor(wire.kind)}
      strokeWidth={wire.active ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={wire.active ? 1 : 0.32}
    />
  );
}

function LegendKey({ kind, label }: { kind: WireKind; label: string }) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: wireKindColor(kind) }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function DiagramSymbol({ element }: { element: WiringElementDef }) {
  switch (element.kind) {
    case 'arduino-uno':
      return <ArduinoUnoSymbol element={element} />;
    case 'breadboard':
      return <BreadboardSymbol element={element} />;
    case 'breadboard-psu':
      return <PsuSymbol element={element} />;
    case 'pir':
      return <ModuleSymbol element={element} body={HW.sensorBlue} />;
    case 'buzzer':
      return <ModuleSymbol element={element} body={HW.relayBlack} />;
    case 'resistor':
      return <ResistorSymbol element={element} />;
    case 'led':
      return <LedSymbol element={element} />;
    case 'servo':
      return <ServoSymbol element={element} />;
    case 'joystick':
      return <JoystickSymbol element={element} />;
    default:
      return null;
  }
}

function ArduinoUnoSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  return (
    <G>
      <Rect x={x} y={y} width={width} height={height} rx={10} fill={HW.pcbBlue} />
      <Rect x={x + 8} y={y + 10} width={18} height={44} rx={3} fill={HW.usbSilver} />
      <Rect x={x + 36} y={y + 16} width={width - 52} height={36} rx={4} fill={HW.icBlack} />
      <Circle cx={x + width - 22} cy={y + 28} r={5} fill={HW.ledGreen} />
      <SvgText x={x + 36} y={y + 68} fill="#F8FAFC" fontSize={13} fontWeight="700">
        {element.label}
      </SvgText>
      {element.ports.map((port) => (
        <G key={port.id}>
          <Rect x={x + width - 22} y={y + port.dy - 7} width={22} height={14} rx={2} fill={HW.pcbBlueDark} />
          <SvgText
            x={x + width - 26}
            y={y + port.dy + 4}
            fill="#ECFDF5"
            fontSize={10}
            fontWeight="700"
            textAnchor="end">
            {port.label}
          </SvgText>
        </G>
      ))}
    </G>
  );
}

function BreadboardSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  const split = element.ports.some((port) => port.id === 'servo-plus');
  const holeCols = Math.max(8, Math.floor((width - 24) / 14));
  const holeRows = Math.max(4, Math.floor((height - 88) / 16));

  return (
    <G>
      <Rect x={x} y={y} width={width} height={height} rx={12} fill={HW.breadWhite} stroke={HW.breadCream} strokeWidth={2} />
      <Rect x={x + 10} y={y + 10} width={split ? width / 2 - 16 : width - 20} height={18} rx={4} fill={HW.railRed} opacity={0.9} />
      <Rect x={x + 10} y={y + 34} width={split ? width / 2 - 16 : width - 20} height={18} rx={4} fill={HW.railBlue} opacity={0.9} />
      {split ? (
        <>
          <Rect x={x + width / 2 + 6} y={y + 10} width={width / 2 - 16} height={18} rx={4} fill="#F59E0B" opacity={0.95} />
          <Rect x={x + width / 2 + 6} y={y + 34} width={width / 2 - 16} height={18} rx={4} fill={HW.railBlue} opacity={0.9} />
          <SvgText x={x + 18} y={y + 23} fill="#FFF7ED" fontSize={9} fontWeight="700">
            UNO 5V
          </SvgText>
          <SvgText x={x + width / 2 + 14} y={y + 23} fill="#111827" fontSize={9} fontWeight="700">
            PSU 5V
          </SvgText>
          <Line
            x1={x + width / 2}
            y1={y + 8}
            x2={x + width / 2}
            y2={y + 54}
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        </>
      ) : (
        <SvgText x={x + 18} y={y + 23} fill="#FFF7ED" fontSize={9} fontWeight="700">
          + 5V
        </SvgText>
      )}
      <SvgText x={x + 18} y={y + 47} fill="#EFF6FF" fontSize={9} fontWeight="700">
        − GND
      </SvgText>
      {Array.from({ length: holeRows }, (_, row) =>
        Array.from({ length: holeCols }, (_, col) => (
          <Circle
            key={`${row}-${col}`}
            cx={x + 22 + col * 14}
            cy={y + 78 + row * 16}
            r={2.2}
            fill={HW.breadHole}
          />
        )),
      )}
    </G>
  );
}

function PsuSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  const portsOnLeft = element.ports.every((port) => port.dx <= width / 2);
  return (
    <G>
      <Rect x={x} y={y} width={width} height={height} rx={8} fill="#1F2937" />
      <Rect
        x={portsOnLeft ? x + width - 46 : x + 10}
        y={y + 12}
        width={36}
        height={22}
        rx={3}
        fill={HW.usbSilver}
      />
      <Circle cx={portsOnLeft ? x + width - 28 : x + 28} cy={y + 56} r={6} fill="#F59E0B" />
      <SvgText x={x + (portsOnLeft ? 48 : 54)} y={y + 28} fill="#F9FAFB" fontSize={11} fontWeight="700">
        PSU
      </SvgText>
      <SvgText x={x + (portsOnLeft ? 48 : 54)} y={y + 46} fill="#F59E0B" fontSize={10} fontWeight="700">
        5V servo
      </SvgText>
      {element.ports.map((port) => {
        const onLeft = port.dx <= width / 2;
        return (
          <SvgText
            key={port.id}
            x={onLeft ? x + 10 : x + port.dx - 8}
            y={y + port.dy + 4}
            fill="#E5E7EB"
            fontSize={9}
            fontWeight="700"
            textAnchor={onLeft ? 'start' : 'end'}>
            {port.label}
          </SvgText>
        );
      })}
    </G>
  );
}

function ModuleSymbol({ element, body }: { element: WiringElementDef; body: string }) {
  const { x, y, width, height } = element;
  return (
    <G>
      <Rect x={x} y={y} width={width} height={height} rx={8} fill={body} />
      <Circle cx={x + width - 28} cy={y + 28} r={16} fill="#F8FAFC" opacity={0.18} />
      <SvgText x={x + 12} y={y + 22} fill="#F8FAFC" fontSize={12} fontWeight="700">
        {element.label}
      </SvgText>
      {element.ports.map((port) => (
        <SvgText key={port.id} x={x + 10} y={y + port.dy + 4} fill="#E2E8F0" fontSize={9} fontWeight="700">
          {port.label}
        </SvgText>
      ))}
    </G>
  );
}

function ResistorSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  const midY = y + height / 2;
  return (
    <G>
      <Line x1={x} y1={midY} x2={x + width} y2={midY} stroke={HW.pinSilver} strokeWidth={2} />
      <Rect x={x + 28} y={y + 8} width={width - 56} height={height - 16} rx={6} fill={HW.resistorBody} />
      <Rect x={x + 40} y={y + 8} width={8} height={height - 16} fill={HW.bandRed} />
      <Rect x={x + 56} y={y + 8} width={8} height={height - 16} fill={HW.bandRed} />
      <Rect x={x + width - 52} y={y + 8} width={8} height={height - 16} fill={HW.bandGold} />
      <SvgText x={x + width / 2} y={y - 4} fill="#334155" fontSize={10} fontWeight="700" textAnchor="middle">
        {element.label}
      </SvgText>
    </G>
  );
}

function LedSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  return (
    <G>
      <Circle cx={x + width / 2} cy={y + height / 2 - 4} r={18} fill={HW.ledRed} />
      <Circle cx={x + width / 2 - 4} cy={y + height / 2 - 8} r={5} fill={HW.ledRedGlow} opacity={0.8} />
      <Rect x={x + width / 2 - 7} y={y + height / 2 + 14} width={4} height={14} fill={HW.pinGold} />
      <Rect x={x + width / 2 + 3} y={y + height / 2 + 14} width={4} height={10} fill={HW.pinGold} />
      <SvgText x={x + width / 2} y={y + 12} fill="#7F1D1D" fontSize={10} fontWeight="700" textAnchor="middle">
        LED
      </SvgText>
    </G>
  );
}

function ServoSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  return (
    <G>
      <Rect x={x + 24} y={y + 16} width={width - 36} height={height - 32} rx={10} fill={HW.servoBlue} />
      <Circle cx={x + width - 48} cy={y + height / 2} r={22} fill={HW.servoWhite} />
      <Circle cx={x + width - 48} cy={y + height / 2} r={6} fill={HW.servoBlueDark} />
      <SvgText x={x + 36} y={y + 36} fill="#EFF6FF" fontSize={12} fontWeight="700">
        {element.label}
      </SvgText>
      {element.ports.map((port) => (
        <SvgText key={port.id} x={x + 12} y={y + port.dy + 4} fill="#DBEAFE" fontSize={9} fontWeight="700">
          {port.label}
        </SvgText>
      ))}
    </G>
  );
}

function JoystickSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  return (
    <G>
      <Rect x={x} y={y} width={width} height={height} rx={10} fill="#111827" />
      <Circle cx={x + width - 36} cy={y + 40} r={18} fill="#6B7280" />
      <Circle cx={x + width - 36} cy={y + 40} r={8} fill="#9CA3AF" />
      <SvgText x={x + 10} y={y + 16} fill="#F9FAFB" fontSize={10} fontWeight="700">
        Joystick
      </SvgText>
      {element.ports.map((port) => (
        <SvgText key={port.id} x={x + 12} y={y + port.dy + 4} fill="#E5E7EB" fontSize={9} fontWeight="700">
          {port.label}
        </SvgText>
      ))}
    </G>
  );
}

function FallbackWiringList({
  pair,
  nodes,
  connections,
}: {
  pair?: WiringPair;
  nodes?: WiringNode[];
  connections: StepConnection[];
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedNodes = resolveNodes(pair, nodes);

  return (
    <View style={styles.fallbackCanvas}>
      {resolvedNodes.length > 0 ? (
        <View style={styles.endpoints}>
          {resolvedNodes.map((node) => (
            <View key={node.id} style={styles.endpoint}>
              <ComponentIllustration id={node.illustrationId} name={node.name} size={56} plate />
              <Text style={styles.endpointName} numberOfLines={2}>
                {node.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.wires}>
        {connections.map((row, index) => {
          const color = fallbackWireColor(row, index);
          return (
            <View
              key={`${row.fromComponent}-${row.fromPin}-${row.toComponent}-${row.toPin}-${index}`}
              style={styles.wireRow}>
              <View style={styles.pinColumn}>
                <Text style={styles.pinName} numberOfLines={1}>
                  {row.fromComponent}
                </Text>
                <Text style={styles.pinId} numberOfLines={1}>
                  {row.fromPin}
                </Text>
              </View>
              <View style={styles.lineWrap}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={[styles.line, { backgroundColor: color }]} />
                <View style={[styles.dot, { backgroundColor: color }]} />
              </View>
              <View style={[styles.pinColumn, styles.pinColumnRight]}>
                <Text style={styles.pinName} numberOfLines={1}>
                  {row.toComponent}
                </Text>
                <Text style={styles.pinId} numberOfLines={1}>
                  {row.toPin}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    section: {
      gap: 10,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    canvas: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      paddingTop: 10,
      paddingBottom: 12,
      gap: 10,
      overflow: 'hidden',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 6,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendSwatch: {
      width: 14,
      height: 4,
      borderRadius: 2,
    },
    legendLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    fallbackCanvas: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 18,
      gap: 18,
    },
    endpoints: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: 16,
    },
    endpoint: {
      width: 88,
      alignItems: 'center',
      gap: 8,
    },
    endpointName: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    wires: {
      gap: 14,
    },
    wireRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pinColumn: {
      width: 92,
      gap: 2,
    },
    pinColumnRight: {
      alignItems: 'flex-end',
    },
    pinName: {
      fontSize: 11,
      color: colors.textMuted,
    },
    pinId: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    lineWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    line: {
      flex: 1,
      height: 3,
      borderRadius: 2,
      opacity: 0.9,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });
}
