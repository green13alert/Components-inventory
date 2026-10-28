import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { WiringLayout } from '@/constants/wiring-diagrams';
import type { StepConnection } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';
import { moduleArt, type ArtMark } from '@/lib/diagram-art';
import { hitTestSceneTarget, partHitBox, sceneTouchRadius, WIRE_TOUCH_POINTS } from '@/lib/diagram-hit';
import { focusedPartOpacity, paintConnectionWires, type WirePaint } from '@/lib/diagram-selection';
import { buildPhysicalScene, type AssemblyFrame, type Point, type ScenePart, type SceneWire } from '@/lib/physical-scene';
import { RESISTOR_COLORS, resistorColorCode } from '@/lib/resistor-bands';

type PhysicalBreadboardProps = {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections?: StepConnection[];
  assembly?: AssemblyFrame | null;
  selectedIds?: ReadonlySet<string>;
  focusedWireIds?: readonly string[];
  onSelectPart?: (id: string) => void;
  onSelectWire?: (id: string) => void;
  onClear?: () => void;
};

export function PhysicalBreadboard({
  layout,
  connections,
  priorConnections = [],
  assembly = null,
  selectedIds,
  focusedWireIds,
  onSelectPart,
  onSelectWire,
  onClear,
}: PhysicalBreadboardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const scene = useMemo(
    () => buildPhysicalScene(layout, connections, priorConnections, assembly),
    [assembly, connections, layout, priorConnections],
  );
  if (!scene) {
    return null;
  }

  return (
    <Pressable
      accessible={false}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((current) => (current.width === width && current.height === height ? current : { width, height }));
      }}
      onPress={(event) => {
        if (box.width <= 0 || box.height <= 0) {
          return;
        }
        const point = {
          x: (event.nativeEvent.locationX / box.width) * scene.width,
          y: (event.nativeEvent.locationY / box.height) * scene.height,
        };
        const hit = hitTestSceneTarget(scene, point, sceneTouchRadius(WIRE_TOUCH_POINTS, box.width, scene.width));
        if (!hit) {
          onClear?.();
          return;
        }
        if (hit.kind === 'wire') {
          onSelectWire?.(hit.id);
          return;
        }
        onSelectPart?.(hit.id);
      }}
      style={[styles.canvas, { aspectRatio: scene.width / scene.height }]}>
      <View pointerEvents="none" style={styles.board}>
        <BoardSvg
          layout={layout}
          connections={connections}
          priorConnections={priorConnections}
          assembly={assembly}
          selectedIds={selectedIds}
          focusedWireIds={focusedWireIds}
        />
      </View>
    </Pressable>
  );
}

export function PhysicalBoard(props: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections?: StepConnection[];
  assembly?: AssemblyFrame | null;
  selectedIds?: ReadonlySet<string>;
  focusedWireIds?: readonly string[];
}) {
  return (
    <BoardSvg
      layout={props.layout}
      connections={props.connections}
      priorConnections={props.priorConnections ?? []}
      assembly={props.assembly ?? null}
      selectedIds={props.selectedIds}
      focusedWireIds={props.focusedWireIds}
    />
  );
}

function BoardSvg({
  layout,
  connections,
  priorConnections,
  assembly,
  selectedIds = new Set<string>(),
  focusedWireIds = [],
}: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections: StepConnection[];
  assembly: AssemblyFrame | null;
  selectedIds?: ReadonlySet<string>;
  focusedWireIds?: readonly string[];
}) {
  const scene = buildPhysicalScene(layout, connections, priorConnections, assembly);
  if (!scene) {
    return null;
  }
  const { board } = scene;
  const isolating = focusedWireIds.length > 0;
  const selecting = !isolating && selectedIds.size > 0;
  const introducing = Boolean(assembly && (assembly.newJumpers.size > 0 || assembly.newParts.size > 0));
  const related = (wire: SceneWire) => wire.touches.some((id) => selectedIds.has(id)) || cableSelected(wire, selectedIds);
  const paint = paintConnectionWires(
    scene.wires.map((wire) => ({ id: wire.id, emphasis: wire.emphasis, related: related(wire) })),
    focusedWireIds,
    { introducing, selecting },
  );
  const wires = new Map(scene.wires.map((wire) => [wire.id, wire]));

  return (
    <View style={{ flex: 1 }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${scene.width} ${scene.height}`}>
        {board.rows > 0 ? (
        <>
        <Rect
          x={board.x}
          y={board.y}
          width={board.width}
          height={board.height}
          rx={14}
          fill="#F7F4EE"
          stroke={selectedIds.has('breadboard') ? '#0F766E' : '#D6D3D1'}
          strokeWidth={selectedIds.has('breadboard') ? 3 : 2}
        />
        <Rail x={board.x + 6} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#F43F5E" />
        <Rail x={board.x + 24} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#2563EB" />
        <Rail x={board.x + board.width - 40} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#F43F5E" />
        <Rail x={board.x + board.width - 22} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#2563EB" />
        <Rect x={board.trench.x} y={board.trench.y} width={board.trench.width} height={board.trench.height} rx={4} fill="#E7E5E4" />
        <SvgText x={board.x + 8} y={board.y - 6} fill="#9F1239" fontSize={12} fontWeight="700">
          {board.leftPlus}
        </SvgText>
        <SvgText x={board.x + board.width - 78} y={board.y - 6} fill="#9F1239" fontSize={12} fontWeight="700">
          {board.rightPlus}
        </SvgText>
        <SvgText x={board.x + 22} y={board.y + board.height + 16} fill="#1E3A8A" fontSize={12} fontWeight="700">
          {board.leftMinus}
        </SvgText>
        <SvgText x={board.x + board.width - 64} y={board.y + board.height + 16} fill="#1E3A8A" fontSize={12} fontWeight="700">
          {board.rightMinus}
        </SvgText>
        {scene.columnLabels.map((label) => (
          <SvgText key={label.text} x={label.at.x} y={label.at.y} fill="#334155" fontSize={13} fontWeight="700" textAnchor="middle">
            {label.text}
          </SvgText>
        ))}
        {scene.rowLabels.map((label) => (
          <SvgText key={label.text} x={label.at.x} y={label.at.y + 4} fill="#475569" fontSize={12} fontWeight="700">
            {label.text}
          </SvgText>
        ))}
        {scene.holes.map((hole, index) => (
          <Circle
            key={`${hole.at.x}-${hole.at.y}-${index}`}
            cx={hole.at.x}
            cy={hole.at.y}
            r={hole.radius}
            fill={hole.rail ? '#F8FAFC' : '#1F2937'}
            opacity={hole.emphasis === 'active' ? 0.9 : hole.emphasis === 'prior' ? 0.45 : 0.28}
          />
        ))}
        </>
        ) : null}
        {paint.map((style) => {
          const wire = wires.get(style.id);
          return wire ? <WirePath key={wire.id} wire={wire} style={style} /> : null;
        })}
        {scene.parts.map((part) => (
          <PartShape
            key={part.id}
            part={part}
            opacity={focusedPartOpacity(isolating, selecting, selectedIds.has(part.id), part.emphasis)}
            selected={selectedIds.has(part.id)}
          />
        ))}
        {paint
          .filter((style) => style.focused)
          .map((style) => {
            const wire = wires.get(style.id);
            return wire ? (
              <G key={`ends-${wire.id}`}>
                <Endpoint at={wire.from} color={wire.color} strong />
                <Endpoint at={wire.to} color={wire.color} strong />
              </G>
            ) : null;
          })}
      </Svg>
    </View>
  );
}

function Rail({ x, y, height, splitY, fill }: { x: number; y: number; height: number; splitY: number | null; fill: string }) {
  if (splitY == null || splitY <= y || splitY >= y + height) {
    return <Rect x={x} y={y} width={12} height={height} rx={4} fill={fill} />;
  }
  const gap = 8;
  return (
    <G>
      <Rect x={x} y={y} width={12} height={Math.max(4, splitY - y - gap)} rx={4} fill={fill} />
      <Rect x={x} y={splitY + gap} width={12} height={Math.max(4, y + height - splitY - gap)} rx={4} fill={fill} />
    </G>
  );
}

function cableSelected(wire: SceneWire, selectedIds: ReadonlySet<string>) {
  if (wire.role !== 'cable') {
    return false;
  }
  for (const id of selectedIds) {
    if (wire.id.startsWith(`${id}-`)) {
      return true;
    }
  }
  return false;
}

function WirePath({ wire, style }: { wire: SceneWire; style: WirePaint }) {
  return (
    <G opacity={style.opacity}>
      {style.halo === 'focus' ? <Path d={wire.d} fill="none" stroke="#0F766E" strokeWidth={8} strokeLinecap="round" /> : null}
      {style.halo === 'new' ? <Path d={wire.d} fill="none" stroke="#FDE68A" strokeWidth={7} strokeLinecap="round" /> : null}
      <Path d={wire.d} fill="none" stroke={wire.color} strokeWidth={style.strokeWidth} strokeLinecap="round" />
      <Endpoint at={wire.from} color={wire.color} strong={style.ends} />
      <Endpoint at={wire.to} color={wire.color} strong={style.ends} />
      {wire.socketAt === 'from' ? <Socket at={wire.from} /> : null}
      {wire.socketAt === 'to' ? <Socket at={wire.to} /> : null}
    </G>
  );
}

function Endpoint({ at, color, strong }: { at: Point; color: string; strong: boolean }) {
  if (!strong) {
    return <Circle cx={at.x} cy={at.y} r={2.6} fill={color} />;
  }
  return (
    <G>
      <Circle cx={at.x} cy={at.y} r={8} fill="#FFFFFF" stroke={color} strokeWidth={2.4} />
      <Circle cx={at.x} cy={at.y} r={2.4} fill={color} />
    </G>
  );
}

function Socket({ at }: { at: Point }) {
  return <Rect x={at.x - 5} y={at.y - 5} width={10} height={10} rx={2} fill="none" stroke="#0F172A" strokeWidth={1.4} />;
}

function PartShape({ part, opacity, selected }: { part: ScenePart; opacity: number; selected: boolean }) {
  const hit = partHitBox(part);
  return (
    <IntroOpacity isNew={part.emphasis === 'active' && opacity === 1}>
      <G opacity={opacity}>
        {part.emphasis === 'active' && opacity === 1 ? <Highlight part={part} /> : null}
        {selected ? (
          <Rect
            x={hit.x}
            y={hit.y}
            width={hit.width}
            height={hit.height}
            rx={8}
            fill="none"
            stroke="#0F766E"
            strokeWidth={2.5}
            strokeDasharray="5 3"
          />
        ) : null}
        <PartArt part={part} />
      </G>
    </IntroOpacity>
  );
}

function IntroOpacity({ isNew, children }: { isNew: boolean; children: ReactNode }) {
  const [opacity, setOpacity] = useState(isNew ? 0.45 : 1);
  useEffect(() => {
    if (!isNew) {
      setOpacity(1);
      return undefined;
    }
    let cancelled = false;
    let frame = 0;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) {
        return;
      }
      if (reduced) {
        setOpacity(1);
        return;
      }
      const start = Date.now();
      const tick = () => {
        if (cancelled) {
          return;
        }
        const t = Math.min(1, (Date.now() - start) / 160);
        setOpacity(0.45 + 0.55 * t);
        if (t < 1) {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [isNew]);
  return <G opacity={opacity}>{children}</G>;
}

function Highlight({ part }: { part: ScenePart }) {
  if (part.kind === 'resistor') {
    return <Line x1={part.a.x} y1={part.a.y} x2={part.b.x} y2={part.b.y} stroke="#FDE68A" strokeWidth={14} strokeLinecap="round" />;
  }
  if (part.kind === 'npn') {
    const top = Math.min(part.emitter.y, part.base.y, part.collector.y);
    const bottom = Math.max(part.emitter.y, part.base.y, part.collector.y);
    return <Rect x={part.emitter.x - 40} y={top - 8} width={36} height={bottom - top + 16} rx={8} fill="none" stroke="#F59E0B" strokeWidth={2} />;
  }
  if (part.kind === 'rgb-led') {
    const mid = part.leads.reduce((sum, lead) => sum + lead.at.y, 0) / part.leads.length;
    return <Circle cx={part.leads[0].at.x - 26} cy={mid} r={22} fill="none" stroke="#F59E0B" strokeWidth={2} />;
  }
  if (part.kind === 'led') {
    return <Circle cx={part.anode.x + 18} cy={(part.anode.y + part.cathode.y) / 2} r={16} fill="none" stroke="#F59E0B" strokeWidth={2} />;
  }
  if ('x' in part) {
    return <Rect x={part.x - 4} y={part.y - 4} width={part.width + 8} height={part.height + 8} rx={10} fill="none" stroke="#F59E0B" strokeWidth={2} />;
  }
  return null;
}

function PartArt({ part }: { part: ScenePart }) {
  if (part.kind === 'resistor') {
    return <Resistor a={part.a} b={part.b} ohms={part.ohms} label={part.label} />;
  }
  if (part.kind === 'npn') {
    return <Transistor emitter={part.emitter} base={part.base} collector={part.collector} label={part.label} />;
  }
  if (part.kind === 'led') {
    return <Led anode={part.anode} cathode={part.cathode} />;
  }
  if (part.kind === 'rgb-led') {
    return <RgbLed leads={part.leads} />;
  }
  if ('width' in part && 'x' in part) {
    return <OffBoard part={part} />;
  }
  if (part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick' || part.kind === 'led-matrix') {
    return <ModuleOnHoles part={part} />;
  }
  return null;
}

function Resistor({ a, b, ohms, label }: { a: Point; b: Point; ohms?: number; label: string }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const span = Math.hypot(dx, dy) || 1;
  const ux = dx / span;
  const uy = dy / span;
  const inset = Math.min(14, span * 0.28);
  const start = { x: a.x + ux * inset, y: a.y + uy * inset };
  const end = { x: b.x - ux * inset, y: b.y - uy * inset };
  const length = Math.max(18, span - inset * 2);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const code = ohms == null ? null : resistorColorCode(ohms);
  const bands = code ? code.colors.map((color) => RESISTOR_COLORS[color]) : [];
  const body = code?.body === 'blue' ? '#1D4ED8' : '#E7D3A8';
  const short = ohms === 1000 ? '1k' : ohms === 100 ? '100' : ohms === 220 ? '220' : label;
  return (
    <G>
      <Line x1={a.x} y1={a.y} x2={start.x} y2={start.y} stroke="#94A3B8" strokeWidth={1.6} />
      <Line x1={end.x} y1={end.y} x2={b.x} y2={b.y} stroke="#94A3B8" strokeWidth={1.6} />
      <G transform={`translate(${(start.x + end.x) / 2} ${(start.y + end.y) / 2}) rotate(${angle})`}>
        <Rect x={-length / 2} y={-5} width={length} height={10} rx={5} fill={body} stroke="#8C7348" strokeWidth={1.2} />
        {bands.map((fill, index) => (
          <Rect key={`${fill}-${index}`} x={-length / 2 + 3 + index * (length / (bands.length + 1))} y={-5} width={2.2} height={10} fill={fill} />
        ))}
        <SvgText x={0} y={-8} fill="#334155" fontSize={8} fontWeight="700" textAnchor="middle" stroke="#F4E7C8" strokeWidth={2}>
          {short}
        </SvgText>
      </G>
    </G>
  );
}

function Transistor({ emitter, base, collector, label }: { emitter: Point; base: Point; collector: Point; label: string }) {
  const x = emitter.x - 36;
  const top = Math.min(emitter.y, base.y, collector.y);
  const bottom = Math.max(emitter.y, base.y, collector.y);
  const mid = (top + bottom) / 2;
  const leads = [
    { name: 'E', at: emitter },
    { name: 'B', at: base },
    { name: 'C', at: collector },
  ];
  return (
    <G>
      {leads.map((lead) => (
        <Line key={lead.name} x1={x + 18} y1={lead.at.y} x2={lead.at.x} y2={lead.at.y} stroke="#94A3B8" strokeWidth={2} />
      ))}
      <Path
        d={`M ${x + 20} ${top - 2} L ${x + 8} ${top - 2} Q ${x} ${top - 2} ${x} ${mid} Q ${x} ${bottom + 2} ${x + 8} ${bottom + 2} L ${x + 20} ${bottom + 2} Z`}
        fill="#1E293B"
        stroke="#0F172A"
        strokeWidth={1.4}
      />
      <Line x1={x + 20} y1={top - 4} x2={x + 20} y2={bottom + 4} stroke="#E2E8F0" strokeWidth={2.4} />
      {leads.map((lead) => (
        <SvgText key={lead.name} x={x - 2} y={lead.at.y + 3} fill="#0F172A" fontSize={9} fontWeight="700" textAnchor="end" stroke="#F4E7C8" strokeWidth={2}>
          {lead.name}
        </SvgText>
      ))}
      <SvgText x={x + 10} y={mid + 3} fill="#F8FAFC" fontSize={7} fontWeight="700" textAnchor="middle">
        {label.replace(/^Q\s*/, '')}
      </SvgText>
    </G>
  );
}

function Led({ anode, cathode }: { anode: Point; cathode: Point }) {
  const top = Math.min(anode.y, cathode.y);
  const cx = anode.x + 18;
  const cy = (anode.y + cathode.y) / 2;
  return (
    <G>
      <Line x1={anode.x} y1={anode.y} x2={cx - 8} y2={anode.y} stroke="#DC2626" strokeWidth={2} />
      <Line x1={cathode.x} y1={cathode.y} x2={cx - 8} y2={cathode.y} stroke="#111827" strokeWidth={1.5} />
      <Circle cx={cx} cy={cy} r={11} fill="#FEF3C7" stroke="#B45309" strokeWidth={1.6} />
      <Path d={`M ${cx - 6} ${top - 2} L ${cx} ${top - 10} L ${cx + 6} ${top - 2}`} fill="none" stroke="#B45309" strokeWidth={1.4} />
      <SvgText x={cx + 16} y={anode.y + 3} fill="#9F1239" fontSize={9} fontWeight="700">
        +
      </SvgText>
    </G>
  );
}

function RgbLed({ leads }: { leads: { portId: string; label: string; at: Point; color: string }[] }) {
  const midY = leads.reduce((sum, lead) => sum + lead.at.y, 0) / leads.length;
  const cx = leads[0].at.x - 26;
  return (
    <G>
      {leads.map((lead) => (
        <Line key={lead.portId} x1={lead.at.x} y1={lead.at.y} x2={cx + 10} y2={lead.at.y} stroke={lead.color} strokeWidth={lead.portId === 'anode' ? 3.2 : 1.6} />
      ))}
      <Circle cx={cx} cy={midY} r={18} fill="#E2E8F0" stroke="#334155" strokeWidth={1.4} />
      <Circle cx={cx} cy={midY} r={13} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1} />
      <Path d={`M ${cx - 10} ${midY - 14} L ${cx + 10} ${midY - 14}`} stroke="#0F172A" strokeWidth={2.2} strokeLinecap="round" />
      {leads.map((lead) => (
        <SvgText key={`${lead.portId}-label`} x={cx - 20} y={lead.at.y + 3} fill={lead.color} fontSize={8} fontWeight="700" textAnchor="end" stroke="#F8FAFC" strokeWidth={2}>
          {lead.portId === 'anode' ? 'A' : lead.label.slice(0, 1)}
        </SvgText>
      ))}
    </G>
  );
}

function ModuleOnHoles({ part }: { part: Extract<ScenePart, { kind: 'pir' | 'buzzer' | 'joystick' | 'led-matrix' }> }) {
  const top = Math.min(...part.leads.map((lead) => lead.at.y));
  const bottom = Math.max(...part.leads.map((lead) => lead.at.y));
  const x = part.leads[0].at.x + 12;
  const height = Math.max(36, bottom - top + 16);
  const width = part.kind === 'led-matrix' ? 88 : part.kind === 'joystick' ? 72 : 58;
  return (
    <G>
      {part.leads.map((lead) => (
        <Line key={lead.portId} x1={lead.at.x} y1={lead.at.y} x2={x} y2={lead.at.y} stroke={lead.color} strokeWidth={1.7} />
      ))}
      <Art marks={moduleArt(part.kind, x, top - 8, width, height)} />
      <SvgText x={x + 4} y={top + height + 12} fill="#0F172A" fontSize={10} fontWeight="700">
        {part.label}
      </SvgText>
      {part.leads.map((lead) => (
        <SvgText key={`${lead.portId}-name`} x={x + 4} y={lead.at.y + 3} fill="#F8FAFC" fontSize={8} fontWeight="700">
          {lead.label}
        </SvgText>
      ))}
    </G>
  );
}

function OffBoard({ part }: { part: Extract<ScenePart, { x: number; width: number }> }) {
  return (
    <G>
      <Art marks={moduleArt(part.kind, part.x, part.y, part.width, part.height)} />
      {part.dots.map((dot, index) => (
        <Circle key={`${dot.x}-${dot.y}-${index}`} cx={dot.x} cy={dot.y} r={2.1} fill="#E2E8F0" />
      ))}
      {part.pins.map((pin) => {
        const outsideRight = pin.at.x > part.x + part.width;
        const outsideLeft = pin.at.x < part.x;
        const onRightHalf = pin.at.x > part.x + part.width / 2;
        const labelLeft = outsideRight || (!outsideLeft && onRightHalf);
        return (
          <G key={pin.label}>
            <Circle cx={pin.at.x} cy={pin.at.y} r={3.4} fill="#F8FAFC" stroke="#0F172A" strokeWidth={1} />
            <SvgText
              x={labelLeft ? pin.at.x - 8 : pin.at.x + 8}
              y={pin.at.y + 3}
              fill={outsideLeft ? '#0F172A' : '#F8FAFC'}
              stroke={outsideLeft ? '#F4E7C8' : 'none'}
              strokeWidth={outsideLeft ? 2 : 0}
              fontSize={10}
              fontWeight="700"
              textAnchor={labelLeft ? 'end' : 'start'}>
              {pin.label}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}

function Art({ marks }: { marks: ArtMark[] }) {
  return (
    <G>
      {marks.map((mark, index) => {
        const key = `${mark.kind}-${index}`;
        if (mark.kind === 'rect') {
          return (
            <Rect
              key={key}
              x={mark.x}
              y={mark.y}
              width={mark.width}
              height={mark.height}
              rx={mark.rx}
              fill={mark.fill}
              stroke={mark.stroke}
              strokeWidth={mark.strokeWidth}
            />
          );
        }
        if (mark.kind === 'circle') {
          return <Circle key={key} cx={mark.cx} cy={mark.cy} r={mark.r} fill={mark.fill} stroke={mark.stroke} strokeWidth={mark.strokeWidth} />;
        }
        if (mark.kind === 'line') {
          return <Line key={key} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} stroke={mark.stroke} strokeWidth={mark.strokeWidth} />;
        }
        return (
          <SvgText key={key} x={mark.x} y={mark.y} fill={mark.fill} fontSize={mark.size} fontWeight="700" textAnchor={mark.anchor ?? 'start'}>
            {mark.text}
          </SvgText>
        );
      })}
    </G>
  );
}

function createStyles(colors: { surface: string; border: string }) {
  return StyleSheet.create({
    canvas: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    board: { flex: 1 },
  });
}
