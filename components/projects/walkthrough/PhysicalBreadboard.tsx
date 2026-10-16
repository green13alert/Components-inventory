import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { WiringLayout } from '@/constants/wiring-diagrams';
import type { BreadboardHole } from '@/constants/wiring-diagrams/types';
import type { StepConnection } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';
import {
  activePortIds,
  BREADBOARD_PITCH,
  holeKey,
  holePosition,
  PHYSICAL_BOARD_WIDTH,
  physicalBoardHeight,
} from '@/lib/breadboard-layout';

const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const;

type PhysicalBreadboardProps = {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections?: StepConnection[];
};

export function PhysicalBreadboard({ layout, connections, priorConnections = [] }: PhysicalBreadboardProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const physical = layout.physical;

  if (!physical) {
    return null;
  }

  return (
    <View style={[styles.canvas, { aspectRatio: PHYSICAL_BOARD_WIDTH / physicalBoardHeight(physical.rows) }]}>
      <BoardSvg layout={layout} connections={connections} priorConnections={priorConnections} />
    </View>
  );
}

export function PhysicalBoard(props: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections?: StepConnection[];
}) {
  return <BoardSvg {...props} priorConnections={props.priorConnections ?? []} />;
}

function BoardSvg({
  layout,
  connections,
  priorConnections,
}: {
  layout: WiringLayout;
  connections: StepConnection[];
  priorConnections: StepConnection[];
}) {
  const physical = layout.physical;
  if (!physical) {
    return null;
  }
  const height = physicalBoardHeight(physical.rows);
  const active = activePortIds(layout, connections);
  const prior = activePortIds(layout, priorConnections);
  const splitY = physical.railSplitAfter == null ? null : holePosition({ kind: 'strip', column: 'a', row: physical.railSplitAfter }).y + BREADBOARD_PITCH / 2;

  const holeState = (hole: BreadboardHole) => {
    const node = holeKey(hole, physical.railSplitAfter);
    const leadActive = physical.leads.some(
      (lead) => active.has(`${lead.elementId}:${lead.portId}`) && holeKey(lead.hole, physical.railSplitAfter) === node,
    );
    const leadPrior = physical.leads.some(
      (lead) => prior.has(`${lead.elementId}:${lead.portId}`) && holeKey(lead.hole, physical.railSplitAfter) === node,
    );
    return leadActive ? 1 : leadPrior ? 0.45 : 0.2;
  };

  return (
    <View style={{ flex: 1 }}>
    <Svg width="100%" height="100%" viewBox={`0 0 ${PHYSICAL_BOARD_WIDTH} ${height}`}>
      <Rect x={8} y={24} width={276} height={height - 36} rx={12} fill="#F8F1E3" stroke="#E7D7B8" strokeWidth={2} />
      <Rect x={12} y={30} width={14} height={height - 52} rx={4} fill="#F43F5E" />
      <Rect x={30} y={30} width={14} height={height - 52} rx={4} fill="#2563EB" />
      <Rect x={242} y={30} width={14} height={height - 52} rx={4} fill="#F43F5E" />
      <Rect x={260} y={30} width={14} height={height - 52} rx={4} fill="#2563EB" />
      <SvgText x={14} y={18} fill="#9F1239" fontSize={12} fontWeight="700">
        +
      </SvgText>
      <SvgText x={244} y={18} fill="#9F1239" fontSize={12} fontWeight="700">
        +
      </SvgText>
      {COLUMNS.map((column) => {
        const point = holePosition({ kind: 'strip', column, row: 1 });
        return (
          <SvgText key={column} x={point.x} y={16} fill="#334155" fontSize={14} fontWeight="700" textAnchor="middle">
            {column}
          </SvgText>
        );
      })}
      {Array.from({ length: physical.rows }, (_, index) => {
        const row = index + 1;
        const y = holePosition({ kind: 'strip', column: 'a', row }).y;
        return (
          <G key={row}>
            <SvgText x={286} y={y + 4} fill="#475569" fontSize={13} fontWeight="700">
              {row}
            </SvgText>
            {COLUMNS.map((column) => {
              const hole = { kind: 'strip' as const, column, row };
              const point = holePosition(hole);
              return <Circle key={column} cx={point.x} cy={point.y} r={3.2} fill="#111827" opacity={holeState(hole)} />;
            })}
            {(['left', 'right'] as const).map((side) =>
              (['plus', 'minus'] as const).map((polarity) => {
                const hole = { kind: 'rail' as const, side, polarity, row };
                const point = holePosition(hole);
                return <Circle key={`${side}-${polarity}`} cx={point.x} cy={point.y} r={2.4} fill="#FFFFFF" opacity={0.85} />;
              }),
            )}
          </G>
        );
      })}
      {splitY != null ? (
        <G>
          <Line x1={12} y1={splitY} x2={274} y2={splitY} stroke="#B45309" strokeWidth={2} strokeDasharray="4 3" />
        </G>
      ) : null}
      {physical.jumpers.map((jumper, index) => {
        const from = endpointPoint(jumper.from);
        const to = endpointPoint(jumper.to);
        const involved = jumperInvolved(jumper, active, prior);
        if (!from || !to) {
          const anchor = from ?? to;
          if (!anchor) {
            return null;
          }
          return (
            <Circle
              key={jumper.id}
              cx={anchor.x}
              cy={anchor.y}
              r={5}
              fill="none"
              stroke={jumperColor(jumper.id)}
              strokeWidth={2}
              opacity={involved === 'active' ? 1 : 0.35}
            />
          );
        }
        const distance = Math.hypot(to.x - from.x, to.y - from.y);
        const nearTop = from.y < 50 && to.y < 50;
        const plusBridge = from.x < 28 || (from.x > 240 && from.x < 258);
        const bend = nearTop ? 0 : (distance > 70 ? 34 : 16) * (index % 2 === 0 ? 1 : -1);
        const midX = (from.x + to.x) / 2 + bend;
        const midY = nearTop ? (plusBridge ? 44 : 56) : (from.y + to.y) / 2 - (distance > 70 ? 28 : 0);
        return (
          <Path
            key={jumper.id}
            d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
            fill="none"
            stroke={jumperColor(jumper.id)}
            strokeWidth={involved === 'active' ? 3 : 2}
            strokeLinecap="round"
            opacity={involved === 'active' ? 1 : involved === 'prior' ? 0.4 : 0.18}
          />
        );
      })}
      {layout.elements
        .filter((element) => physical.leads.some((lead) => lead.elementId === element.id))
        .map((element) => {
          const leads = physical.leads.filter((lead) => lead.elementId === element.id);
          const points = leads.map((lead) => holePosition(lead.hole));
          const on = leads.some((lead) => active.has(`${lead.elementId}:${lead.portId}`));
          const opacity = on || active.size === 0 ? 1 : 0.35;
          if (element.kind === 'resistor' && points.length === 2) {
            return <ResistorBody key={element.id} a={points[0]} b={points[1]} ohms={element.resistorOhms} opacity={opacity} />;
          }
          if (element.kind === 'npn' || element.kind === 'led' || element.kind === 'rgb-led') {
            return <PartMark key={element.id} element={element} leads={leads} points={points} opacity={opacity} />;
          }
          return null;
        })}
    </Svg>
    </View>
  );
}

function PartMark({
  element,
  leads,
  points,
  opacity,
}: {
  element: { id: string; kind: string };
  leads: { portId: string; hole: BreadboardHole }[];
  points: { x: number; y: number }[];
  opacity: number;
}) {
  if (element.kind === 'rgb-led') {
    const midY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    return (
      <G opacity={opacity}>
        <Circle cx={144} cy={midY} r={12} fill="#F8FAFC" stroke="#334155" strokeWidth={2} />
        {leads.map((lead) => {
          const point = holePosition(lead.hole);
          const fill = lead.portId === 'red' ? '#DC2626' : lead.portId === 'green' ? '#16A34A' : lead.portId === 'blue' ? '#2563EB' : '#F59E0B';
          return <Circle key={lead.portId} cx={point.x} cy={point.y} r={4.5} fill={fill} />;
        })}
      </G>
    );
  }

  const x = points[0].x;
  const towardCenter = x < 160 ? 8 : -8;
  const top = Math.min(...points.map((point) => point.y));
  const bottom = Math.max(...points.map((point) => point.y));
  const span = Math.max(10, bottom - top - 10);
  return (
    <Rect
      x={x + towardCenter - 3}
      y={top + 5}
      width={6}
      height={span}
      rx={2}
      fill={element.kind === 'led' ? '#FEF3C7' : '#E2E8F0'}
      stroke="#334155"
      strokeWidth={1.5}
      opacity={opacity}
    />
  );
}

function ResistorBody({
  a,
  b,
  ohms,
  opacity,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  ohms?: number;
  opacity: number;
}) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const span = Math.hypot(dx, dy) || 1;
  let nx = -dy / span;
  let ny = dx / span;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const lift = 11;
  const length = Math.max(28, span - 12);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const bands =
    ohms === 1000
      ? ['#92400E', '#111827', '#DC2626', '#CA8A04']
      : ohms === 220
        ? ['#DC2626', '#DC2626', '#92400E', '#CA8A04']
        : ['#92400E', '#DC2626', '#CA8A04', '#CA8A04'];
  return (
    <G opacity={opacity} transform={`translate(${(a.x + b.x) / 2 + nx * lift} ${(a.y + b.y) / 2 + ny * lift}) rotate(${angle})`}>
      <Rect x={-length / 2} y={-5} width={length} height={10} rx={4} fill="#E7D3A1" stroke="#B8A888" />
      {bands.map((fill, index) => (
        <Rect key={fill + index} x={-length / 2 + 6 + index * 5} y={-5} width={3} height={10} fill={fill} />
      ))}
    </G>
  );
}

function endpointPoint(endpoint: { kind: string; row?: number; column?: string; side?: 'left' | 'right'; polarity?: 'plus' | 'minus' }) {
  if (endpoint.kind === 'module') {
    return null;
  }
  return holePosition(endpoint as BreadboardHole);
}

function jumperInvolved(
  jumper: { from: { kind: string; elementId?: string; portId?: string }; to: { kind: string; elementId?: string; portId?: string } },
  active: Set<string>,
  prior: Set<string>,
) {
  const keys = [jumper.from, jumper.to]
    .filter((end) => end.kind === 'module' && end.elementId && end.portId)
    .map((end) => `${end.elementId}:${end.portId}`);
  if (keys.some((key) => active.has(key))) {
    return 'active';
  }
  if (keys.some((key) => prior.has(key))) {
    return 'prior';
  }
  return 'idle';
}

function jumperColor(id: string) {
  if (id.includes('5v') || id.includes('3v3') || id.includes('plus') || id.includes('anode') || id.includes('vcc')) {
    return '#DC2626';
  }
  if (id.includes('gnd') || id.includes('minus') || id.includes('emitter') || id.includes('cathode')) {
    return '#111827';
  }
  if (id.includes('25') || id.includes('red') || id.includes('d8')) {
    return '#EA580C';
  }
  if (id.includes('26') || id.includes('green') || id.includes('d9')) {
    return '#15803D';
  }
  if (id.includes('27') || id.includes('blue') || id.includes('d10')) {
    return '#1D4ED8';
  }
  return '#7C3AED';
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
