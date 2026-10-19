import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { WiringLayout } from '@/constants/wiring-diagrams';
import type { StepConnection } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';
import { buildPhysicalScene, type AssemblyFrame, type Point, type ScenePart, type SceneWire } from '@/lib/physical-scene';

type PhysicalBreadboardProps = {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections?: StepConnection[];
  assembly?: AssemblyFrame | null;
};

export function PhysicalBreadboard({ layout, connections, priorConnections = [], assembly = null }: PhysicalBreadboardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scene = useMemo(
    () => buildPhysicalScene(layout, connections, priorConnections, assembly),
    [assembly, connections, layout, priorConnections],
  );
  if (!scene) {
    return null;
  }

  return (
    <View style={[styles.canvas, { aspectRatio: scene.width / scene.height }]}>
      <BoardSvg layout={layout} connections={connections} priorConnections={priorConnections} assembly={assembly} />
    </View>
  );
}

export function PhysicalBoard(props: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections?: StepConnection[];
  assembly?: AssemblyFrame | null;
}) {
  return <BoardSvg {...props} priorConnections={props.priorConnections ?? []} assembly={props.assembly ?? null} />;
}

function BoardSvg({
  layout,
  connections,
  priorConnections,
  assembly,
}: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections: StepConnection[];
  assembly: AssemblyFrame | null;
}) {
  const scene = buildPhysicalScene(layout, connections, priorConnections, assembly);
  if (!scene) {
    return null;
  }
  const { board } = scene;

  return (
    <View style={{ flex: 1 }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${scene.width} ${scene.height}`}>
        <Rect x={board.x} y={board.y} width={board.width} height={board.height} rx={14} fill="#F4E7C8" stroke="#D6C4A3" strokeWidth={2} />
        <Rail x={board.x + 6} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#F43F5E" />
        <Rail x={board.x + 24} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#2563EB" />
        <Rail x={board.x + board.width - 40} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#F43F5E" />
        <Rail x={board.x + board.width - 22} y={board.y + 8} height={board.height - 16} splitY={board.splitY} fill="#2563EB" />
        <Rect x={board.trench.x} y={board.trench.y} width={board.trench.width} height={board.trench.height} rx={4} fill="#E7D3A8" />
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
        {scene.wires.map((wire) => (
          <WirePath key={wire.id} wire={wire} />
        ))}
        {scene.parts.map((part) => (
          <PartShape key={part.id} part={part} />
        ))}
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

function WirePath({ wire }: { wire: SceneWire }) {
  const opacity = wire.emphasis === 'context' ? 0.4 : 1;
  return (
    <G opacity={opacity}>
      {wire.emphasis === 'active' ? (
        <Path d={wire.d} fill="none" stroke="#FDE68A" strokeWidth={7} strokeLinecap="round" />
      ) : null}
      <Path d={wire.d} fill="none" stroke={wire.color} strokeWidth={wire.emphasis === 'active' ? 3.4 : 2.4} strokeLinecap="round" />
      <Circle cx={wire.from.x} cy={wire.from.y} r={3.2} fill={wire.color} />
      <Circle cx={wire.to.x} cy={wire.to.y} r={3.2} fill={wire.color} />
      {wire.socketAt === 'from' ? <Socket at={wire.from} /> : null}
      {wire.socketAt === 'to' ? <Socket at={wire.to} /> : null}
    </G>
  );
}

function Socket({ at }: { at: Point }) {
  return <Rect x={at.x - 5} y={at.y - 5} width={10} height={10} rx={2} fill="none" stroke="#0F172A" strokeWidth={1.4} />;
}

function PartShape({ part }: { part: ScenePart }) {
  const opacity = part.emphasis === 'context' ? 0.5 : 1;
  return (
    <IntroOpacity isNew={part.emphasis === 'active'}>
      <G opacity={opacity}>
        {part.emphasis === 'active' ? <Highlight part={part} /> : null}
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
  if (part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick') {
    return <ModuleOnHoles part={part} />;
  }
  if (part.kind === 'esp32' || part.kind === 'uno' || part.kind === 'servo' || part.kind === 'psu' || part.kind === 'bme280') {
    return <OffBoard part={part} />;
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
  const bands =
    ohms === 1000
      ? ['#92400E', '#111827', '#DC2626', '#CA8A04']
      : ohms === 220
        ? ['#DC2626', '#DC2626', '#92400E', '#CA8A04']
        : ['#92400E', '#111827', '#111827', '#CA8A04'];
  const short = ohms === 1000 ? '1k' : ohms === 220 ? '220' : label;
  const nx = -uy;
  const ny = ux;
  const flip = ny > 0.2;
  const labelAt = {
    x: (start.x + end.x) / 2 + (flip ? -nx : nx) * 12,
    y: (start.y + end.y) / 2 + (flip ? -ny : ny) * 12 + 3,
    anchor: 'middle' as const,
  };
  return (
    <G>
      <Line x1={a.x} y1={a.y} x2={start.x} y2={start.y} stroke="#94A3B8" strokeWidth={1.6} />
      <Line x1={end.x} y1={end.y} x2={b.x} y2={b.y} stroke="#94A3B8" strokeWidth={1.6} />
      <G transform={`translate(${(start.x + end.x) / 2} ${(start.y + end.y) / 2}) rotate(${angle})`}>
        <Rect x={-length / 2} y={-5} width={length} height={10} rx={5} fill="#D6B98A" stroke="#8C7348" strokeWidth={1.2} />
        {bands.map((fill, index) => (
          <Rect key={`${fill}-${index}`} x={-length / 2 + 3 + index * 4} y={-5} width={2.4} height={10} fill={fill} />
        ))}
      </G>
      <SvgText x={labelAt.x} y={labelAt.y} fill="#334155" fontSize={9} fontWeight="700" textAnchor={labelAt.anchor} stroke="#F4E7C8" strokeWidth={2}>
        {short}
      </SvgText>
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
        <SvgText key={lead.name} x={x - 1} y={lead.at.y + 3} fill="#0F172A" fontSize={8} fontWeight="700" textAnchor="end" stroke="#F4E7C8" strokeWidth={2}>
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

function ModuleOnHoles({ part }: { part: Extract<ScenePart, { kind: 'pir' | 'buzzer' | 'joystick' }> }) {
  const top = Math.min(...part.leads.map((lead) => lead.at.y));
  const bottom = Math.max(...part.leads.map((lead) => lead.at.y));
  const x = part.leads[0].at.x + 12;
  const height = Math.max(36, bottom - top + 16);
  return (
    <G>
      {part.leads.map((lead) => (
        <Line key={lead.portId} x1={lead.at.x} y1={lead.at.y} x2={x} y2={lead.at.y} stroke={lead.color} strokeWidth={1.7} />
      ))}
      <Rect x={x} y={top - 8} width={part.kind === 'joystick' ? 72 : 58} height={height} rx={8} fill={part.kind === 'buzzer' ? '#111827' : '#14532D'} stroke="#0F172A" strokeWidth={1.4} />
      {part.kind === 'pir' ? <Circle cx={x + 29} cy={top + height / 2 - 8} r={12} fill="#E2E8F0" stroke="#334155" strokeWidth={1.2} /> : null}
      {part.kind === 'joystick' ? <Circle cx={x + 36} cy={top + 16} r={10} fill="#0F172A" /> : null}
      {part.kind === 'buzzer' ? (
        <SvgText x={x + 8} y={top + 8} fill="#F8FAFC" fontSize={11} fontWeight="700">
          +
        </SvgText>
      ) : null}
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

function OffBoard({ part }: { part: Extract<ScenePart, { kind: 'esp32' | 'uno' | 'servo' | 'psu' | 'bme280' }> }) {
  const fill = part.kind === 'uno' ? '#0F6E56' : part.kind === 'esp32' ? '#111827' : part.kind === 'bme280' ? '#1D4ED8' : part.kind === 'psu' ? '#1E293B' : '#334155';
  const title = part.kind === 'esp32' ? 'ESP32-DevKitC' : part.kind === 'uno' ? 'Arduino Uno' : part.kind === 'bme280' ? 'BME280' : part.label;
  return (
    <G>
      <Rect x={part.x} y={part.y} width={part.width} height={part.height} rx={8} fill={fill} stroke="#0F172A" strokeWidth={1.5} />
      <SvgText x={part.x + 8} y={part.y + 16} fill="#F8FAFC" fontSize={11} fontWeight="700">
        {title}
      </SvgText>
      {part.kind === 'esp32' || part.kind === 'uno' ? (
        <Rect x={part.x + part.width / 2 - 14} y={part.y + part.height - 10} width={28} height={8} rx={2} fill="#CBD5E1" />
      ) : null}
      {part.kind === 'bme280' ? <Rect x={part.x + 8} y={part.y + part.height - 18} width={22} height={10} rx={2} fill="#F8FAFC" /> : null}
      {part.kind === 'servo' ? (
        <SvgText x={part.x + 8} y={part.y + part.height - 6} fill="#F8FAFC" fontSize={8}>
          brown red orange
        </SvgText>
      ) : null}
      {part.dots.map((dot, index) => (
        <Circle key={`${dot.x}-${dot.y}-${index}`} cx={dot.x} cy={dot.y} r={2.1} fill="#E2E8F0" />
      ))}
      {part.pins.map((pin) => (
        <G key={pin.label}>
          <Circle cx={pin.at.x} cy={pin.at.y} r={3.4} fill="#F8FAFC" stroke="#0F172A" strokeWidth={1} />
          <SvgText
            x={pin.at.x + (pin.at.x > part.x + part.width / 2 ? -8 : 8)}
            y={pin.at.y + 3}
            fill="#F8FAFC"
            fontSize={10}
            fontWeight="700"
            textAnchor={pin.at.x > part.x + part.width / 2 ? 'end' : 'start'}>
            {pin.label}
          </SvgText>
        </G>
      ))}
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
  });
}
