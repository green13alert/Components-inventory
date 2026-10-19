import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { DiagramViewer } from '@/components/projects/walkthrough/DiagramViewer';
import { PhysicalBoard, PhysicalBreadboard } from '@/components/projects/walkthrough/PhysicalBreadboard';
import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { HW } from '@/constants/component-illustration-palette';
import type { SolderiPalette } from '@/constants/colors';
import { getWiringLayout, type WiringElementDef, type WiringLayout } from '@/constants/wiring-diagrams';
import type { StepBlock, StepConnection, WiringNode, WiringPair } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';
import { resolveAssembly } from '@/lib/assembly-progress';
import { describeInstalled, describePlacements } from '@/lib/breadboard-layout';
import { physicalSceneSize, type AssemblyFrame } from '@/lib/physical-scene';
import { fitContentSize } from '@/lib/diagram-viewport';
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
  steps?: { blocks: StepBlock[] }[];
  stepIndex?: number;
  onPinchActiveChange?: (active: boolean) => void;
};

const PREVIEW_MAX_HEIGHT = 320;

function connectionLines(connections: StepConnection[]) {
  return connections.map((row) => `${row.fromComponent} ${row.fromPin} → ${row.toComponent} ${row.toPin}`);
}

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
  steps = [],
  stepIndex = 0,
}: WiringDiagramProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const layout = getWiringLayout(projectSlug);
  const [view, setView] = useState<'physical' | 'schematic'>(layout?.physical ? 'physical' : 'schematic');
  const [assemblyView, setAssemblyView] = useState<'current' | 'complete'>('current');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setAssemblyView('current');
  }, [stepIndex]);
  const showPhysical = Boolean(layout?.physical) && view === 'physical';
  const assembly = useMemo(
    () => resolveAssembly(steps, stepIndex, assemblyView, layout?.physical?.fixtures ?? []),
    [assemblyView, layout?.physical?.fixtures, stepIndex, steps],
  );
  const assemblyFrame = useMemo<AssemblyFrame | null>(() => {
    if (!assembly.hasSequence || !showPhysical) {
      return null;
    }
    return {
      installedParts: new Set(assembly.installedParts),
      newParts: new Set(assembly.newParts),
      installedJumpers: new Set(assembly.installedJumpers),
      newJumpers: new Set(assembly.newJumpers),
    };
  }, [assembly, showPhysical]);
  const wires = useMemo(
    () => (layout ? routeWiringDiagram(layout, connections, priorConnections) : []),
    [connections, layout, priorConnections],
  );
  const lines = useMemo(() => {
    if (!layout) {
      return connectionLines(connections);
    }
    if (showPhysical && assembly.hasSequence) {
      const parts = assemblyView === 'current' && assembly.phase === 'building' ? assembly.newParts : assembly.installedParts;
      const jumpers = assemblyView === 'current' && assembly.phase === 'building' ? assembly.newJumpers : assembly.installedJumpers;
      return describeInstalled(layout, parts, jumpers);
    }
    if (showPhysical) {
      const placed = describePlacements(layout, connections);
      return placed.length > 0 ? placed : connectionLines(connections);
    }
    return connectionLines(connections);
  }, [assembly, assemblyView, connections, layout, showPhysical]);
  const physicalSize = showPhysical && layout ? physicalSceneSize(layout) : null;
  const contentWidth = physicalSize ? physicalSize.width : (layout?.width ?? 1);
  const contentHeight = physicalSize ? physicalSize.height : (layout?.height ?? 1);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{heading ?? 'Wiring diagram'}</Text>
      {layout?.physical ? (
        <View style={styles.viewToggle}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setView('physical')}
            style={[styles.viewOption, view === 'physical' && styles.viewOptionOn]}>
            <Text style={[styles.viewOptionLabel, view === 'physical' && styles.viewOptionLabelOn]}>Physical</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setView('schematic')}
            style={[styles.viewOption, view === 'schematic' && styles.viewOptionOn]}>
            <Text style={[styles.viewOptionLabel, view === 'schematic' && styles.viewOptionLabelOn]}>Schematic</Text>
          </Pressable>
        </View>
      ) : null}
      {showPhysical && assembly.hasSequence ? (
        <View style={styles.viewToggle}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAssemblyView('current')}
            style={[styles.viewOption, assemblyView === 'current' && styles.viewOptionOn]}>
            <Text style={[styles.viewOptionLabel, assemblyView === 'current' && styles.viewOptionLabelOn]}>Current step</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAssemblyView('complete')}
            style={[styles.viewOption, assemblyView === 'complete' && styles.viewOptionOn]}>
            <Text style={[styles.viewOptionLabel, assemblyView === 'complete' && styles.viewOptionLabelOn]}>Complete build</Text>
          </Pressable>
        </View>
      ) : null}
      {showPhysical && layout ? (
        <PhysicalBreadboard layout={layout} connections={connections} priorConnections={priorConnections} assembly={assemblyFrame} />
      ) : layout ? (
        <VisualWiringCanvas layout={layout} wires={wires} />
      ) : (
        <FallbackWiringList pair={pair} nodes={nodes} connections={connections} />
      )}
      {layout ? (
        <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.enlarge}>
          <Text style={styles.enlargeLabel}>Enlarge diagram</Text>
        </Pressable>
      ) : null}
      {showPhysical && lines.length > 0 ? (
        <View style={styles.placementList}>
          {lines.map((line, index) => (
            <Text key={`${line}-${index}`} style={styles.placementLine}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
      {layout ? (
        <DiagramViewer
          visible={open}
          onClose={() => setOpen(false)}
          mode={view}
          onModeChange={setView}
          showModeToggle={Boolean(layout.physical)}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
          lines={lines}
          assemblyView={showPhysical && assembly.hasSequence ? assemblyView : undefined}
          onAssemblyViewChange={setAssemblyView}>
          {showPhysical ? (
            <PhysicalBoard layout={layout} connections={connections} priorConnections={priorConnections} assembly={assemblyFrame} />
          ) : (
            <SchematicFigure layout={layout} wires={wires} />
          )}
        </DiagramViewer>
      ) : null}
    </View>
  );
}

function VisualWiringCanvas({ layout, wires }: { layout: WiringLayout; wires: RoutedWire[] }) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const fitted = fitContentSize(canvasWidth, PREVIEW_MAX_HEIGHT, layout.width, layout.height);
  const legendKinds = useMemo(() => {
    const present = new Set(wires.map((wire) => wire.kind));
    return WIRE_KIND_LABELS.filter((item) => present.has(item.kind)).map((item) => ({
      ...item,
      label: layout.wireLabels?.[item.kind] ?? item.label,
    }));
  }, [wires, layout.wireLabels]);

  return (
    <View style={styles.canvas} onLayout={(event) => setCanvasWidth(event.nativeEvent.layout.width)}>
      <View style={styles.previewFrame}>
        <View style={{ width: fitted.width, height: fitted.height }}>
          <SchematicFigure layout={layout} wires={wires} />
        </View>
      </View>
      {legendKinds.length > 0 ? (
        <View style={styles.legend}>
          {legendKinds.map((item) => (
            <LegendKey key={item.kind} kind={item.kind} label={item.label} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SchematicFigure({ layout, wires }: { layout: WiringLayout; wires: RoutedWire[] }) {
  const used = useMemo(() => usedElementIds(wires), [wires]);
  const visibleElements = useMemo(
    () =>
      layout.elements.filter(
        (element) =>
          element.kind === 'arduino-uno' ||
          element.kind === 'esp32-devkit' ||
          element.kind === 'breadboard' ||
          used.has(element.id),
      ),
    [layout.elements, used],
  );

  return (
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
    case 'rgb-led':
      return <RgbLedSymbol element={element} />;
    case 'npn':
      return <NpnSymbol element={element} />;
    case 'servo':
      return <ServoSymbol element={element} />;
    case 'joystick':
      return <JoystickSymbol element={element} />;
    case 'esp32-devkit':
      return <Esp32DevkitSymbol element={element} />;
    case 'bme280':
      return <Bme280Symbol element={element} />;
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

function Esp32DevkitSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  return (
    <G>
      <Rect x={x} y={y} width={width} height={height} rx={10} fill={HW.pcbGreen} />
      <Rect x={x + 12} y={y + 12} width={28} height={16} rx={2} fill={HW.usbSilver} />
      <Rect x={x + 48} y={y + 16} width={width - 70} height={28} rx={3} fill={HW.metalDark} />
      <SvgText x={x + 16} y={y + height - 18} fill="#F8FAFC" fontSize={13} fontWeight="700">
        {element.label}
      </SvgText>
      {element.ports.map((port) => (
        <G key={port.id}>
          <Rect x={x + width - 54} y={y + port.dy - 8} width={54} height={16} rx={2} fill={HW.pcbGreenMid} />
          <SvgText x={x + width - 8} y={y + port.dy + 4} fill="#ECFDF5" fontSize={10} fontWeight="700" textAnchor="end">
            {port.label}
          </SvgText>
        </G>
      ))}
    </G>
  );
}

const CABLE_LEAD_COLORS: Record<string, string> = {
  vin: '#EF4444',
  gnd: '#111827',
  sdi: '#2563EB',
  sck: '#CA8A04',
};

function Bme280Symbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  if (!element.cableLabel) {
    return (
      <G>
        <Rect x={x} y={y} width={width} height={height} rx={8} fill={HW.pcbBlue} />
        <Rect x={x + width - 42} y={y + 14} width={24} height={18} rx={2} fill={HW.metalLight} />
        <Circle cx={x + width - 30} cy={y + 23} r={4} fill={HW.screenMid} />
        <SvgText x={x + 44} y={y + 22} fill="#F8FAFC" fontSize={12} fontWeight="700">
          {element.label}
        </SvgText>
        {element.ports.map((port) => (
          <SvgText key={port.id} x={x + 12} y={y + port.dy + 4} fill="#E2E8F0" fontSize={10} fontWeight="700">
            {port.label}
          </SvgText>
        ))}
      </G>
    );
  }

  const socketX = x;
  const socketY = y + height / 2 - 12;
  return (
    <G>
      {element.ports.map((port) => {
        const pinX = x + port.dx;
        const pinY = y + port.dy;
        const trunkX = socketX - 8;
        const color = CABLE_LEAD_COLORS[port.id] ?? HW.pinSilver;
        return (
          <G key={`${port.id}-lead`}>
            <Line x1={pinX} y1={pinY} x2={trunkX} y2={pinY} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <Line x1={trunkX} y1={pinY} x2={trunkX} y2={socketY + 12} stroke={color} strokeWidth={3} strokeLinecap="round" />
          </G>
        );
      })}
      <Rect x={x} y={y} width={width} height={height} rx={8} fill={HW.pcbBlue} />
      <Rect x={x + 14} y={y + height - 36} width={22} height={16} rx={2} fill={HW.metalLight} />
      <Circle cx={x + 25} cy={y + height - 28} r={3.5} fill={HW.screenMid} />
      <Rect x={socketX - 8} y={socketY} width={16} height={24} rx={3} fill="#111827" />
      <SvgText x={x + 12} y={y + 28} fill="#F8FAFC" fontSize={12} fontWeight="700">
        {element.label}
      </SvgText>
      <SvgText x={x + 14} y={y + 46} fill="#DBEAFE" fontSize={10} fontWeight="700">
        {element.cableLabel}
      </SvgText>
      <SvgText x={x + 12} y={y + 62} fill="#BFDBFE" fontSize={9} fontWeight="700">
        not in holes
      </SvgText>
      {element.ports.map((port) => {
        const pinX = x + port.dx;
        const pinY = y + port.dy;
        const labelY = port.id === 'vin' ? pinY - 23 : port.id === 'gnd' ? pinY + 22 : pinY - 12;
        return (
          <G key={port.id}>
            <Circle cx={pinX} cy={pinY} r={4} fill={CABLE_LEAD_COLORS[port.id] ?? HW.pinSilver} />
            <SvgText x={pinX} y={labelY} fill="#1F2937" fontSize={11} fontWeight="700" textAnchor="middle">
              {port.label}
            </SvgText>
          </G>
        );
      })}
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
        <SvgText
          x={element.powerRailLabel ? x + 16 : x + 18}
          y={element.powerRailLabel ? y - 4 : y + 23}
          fill={element.powerRailLabel ? '#9F1239' : '#FFF7ED'}
          fontSize={element.powerRailLabel ? 12 : 9}
          fontWeight="700">
          {element.powerRailLabel ?? '+ 5V'}
        </SvgText>
      )}
      <SvgText
        x={element.powerRailLabel ? x + 40 : x + 18}
        y={element.powerRailLabel ? y + 70 : y + 47}
        fill={element.powerRailLabel ? '#1E3A8A' : '#EFF6FF'}
          fontSize={element.powerRailLabel ? 12 : 9}
          fontWeight="700">
        {element.powerRailLabel ? 'GND' : '− GND'}
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
      {element.resistorOhms === 1000 ? (
        <>
          <Rect x={x + 34} y={y + 8} width={7} height={height - 16} fill="#7C4A2D" />
          <Rect x={x + 46} y={y + 8} width={7} height={height - 16} fill="#111827" />
          <Rect x={x + 58} y={y + 8} width={7} height={height - 16} fill="#DC2626" />
          <Rect x={x + width - 46} y={y + 8} width={7} height={height - 16} fill={HW.bandGold} />
        </>
      ) : element.resistorOhms === 220 ? (
        <>
          <Rect x={x + 34} y={y + 8} width={7} height={height - 16} fill={HW.bandRed} />
          <Rect x={x + 46} y={y + 8} width={7} height={height - 16} fill={HW.bandRed} />
          <Rect x={x + 58} y={y + 8} width={7} height={height - 16} fill="#7C4A2D" />
          <Rect x={x + width - 46} y={y + 8} width={7} height={height - 16} fill={HW.bandGold} />
        </>
      ) : element.resistorOhms === 100 ? (
        <>
          <Rect x={x + 36} y={y + 8} width={8} height={height - 16} fill="#7C4A2D" />
          <Rect x={x + 50} y={y + 8} width={8} height={height - 16} fill="#111827" />
          <Rect x={x + 64} y={y + 8} width={8} height={height - 16} fill="#7C4A2D" />
          <Rect x={x + width - 48} y={y + 8} width={8} height={height - 16} fill={HW.bandGold} />
        </>
      ) : (
        <>
          <Rect x={x + 40} y={y + 8} width={8} height={height - 16} fill={HW.bandRed} />
          <Rect x={x + 56} y={y + 8} width={8} height={height - 16} fill={HW.bandRed} />
          <Rect x={x + width - 52} y={y + 8} width={8} height={height - 16} fill={HW.bandGold} />
        </>
      )}
      <SvgText x={x + width / 2} y={y - 4} fill="#334155" fontSize={10} fontWeight="700" textAnchor="middle">
        {element.label}
      </SvgText>
      {element.note ? (
        <SvgText x={x + width / 2} y={y - 14} fill="#475569" fontSize={8} fontWeight="600" textAnchor="middle">
          {element.note}
        </SvgText>
      ) : null}
    </G>
  );
}

function NpnSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width, height } = element;
  const baseY = y + height * 0.42;
  const bodyX = x + width * 0.42;
  return (
    <G>
      <SvgText x={x + width / 2} y={y - 3} fill="#334155" fontSize={10} fontWeight="700" textAnchor="middle">
        {element.label}
      </SvgText>
      {element.note ? (
        <SvgText x={x + width / 2} y={y - 14} fill="#475569" fontSize={8} fontWeight="600" textAnchor="middle">
          {element.note}
        </SvgText>
      ) : null}
      <Line x1={x + 2} y1={baseY} x2={bodyX} y2={baseY} stroke="#334155" strokeWidth={2} />
      <Line x1={bodyX} y1={y + 6} x2={bodyX} y2={y + height - 4} stroke="#334155" strokeWidth={2} />
      <Line x1={bodyX} y1={baseY - 7} x2={x + width - 2} y2={y + 8} stroke="#334155" strokeWidth={2} />
      <Line x1={bodyX} y1={baseY + 7} x2={x + width / 2} y2={y + height - 2} stroke="#334155" strokeWidth={2} />
    </G>
  );
}

function RgbLedSymbol({ element }: { element: WiringElementDef }) {
  const { x, y, width } = element;
  const cx = x + width / 2;
  const cy = y + 28;
  return (
    <G>
      <Circle cx={cx} cy={cy} r={20} fill="#F8FAFC" stroke="#334155" strokeWidth={2} />
      <Circle cx={cx - 7} cy={cy - 2} r={4} fill="#DC2626" />
      <Circle cx={cx + 1} cy={cy + 6} r={4} fill="#16A34A" />
      <Circle cx={cx + 8} cy={cy - 2} r={4} fill="#2563EB" />
      {element.ports.map((port) => (
        <Line
          key={`${port.id}-lead`}
          x1={x + port.dx}
          y1={y + port.dy}
          x2={cx}
          y2={cy + 16}
          stroke="#64748B"
          strokeWidth={1.5}
        />
      ))}
      <SvgText x={cx} y={y + 8} fill="#0F172A" fontSize={10} fontWeight="700" textAnchor="middle">
        RGB
      </SvgText>
      {element.note ? (
        <SvgText x={cx} y={y - 2} fill="#475569" fontSize={8} fontWeight="600" textAnchor="middle">
          {element.note}
        </SvgText>
      ) : null}
      {element.ports.map((port) => (
        <SvgText key={port.id} x={x + port.dx + 8} y={y + port.dy + 3} fill="#334155" fontSize={9} fontWeight="700">
          {port.label}
        </SvgText>
      ))}
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
    viewToggle: {
      flexDirection: 'row',
      gap: 8,
    },
    viewOption: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    viewOptionOn: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    viewOptionLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
    },
    viewOptionLabelOn: {
      color: colors.textPrimary,
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
    previewFrame: {
      alignItems: 'center',
      overflow: 'hidden',
    },
    enlarge: {
      alignSelf: 'flex-start',
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    enlargeLabel: { color: colors.accent, fontSize: 14, fontWeight: '700' },
    placementList: { gap: 4 },
    placementLine: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
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
