import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import {
  CIRCUIT_ASPECT,
  CIRCUIT_NODES,
  CIRCUIT_PARTS,
  CIRCUIT_TRACES,
  CIRCUIT_VB_H,
  CIRCUIT_VB_W,
  PULSE_SLOTS,
  getActiveTraces,
  getPulseConfig,
  getTierProgress,
  pointAlongPolyline,
  type CircuitPart,
} from '@/components/onboarding/experience/circuit-layout';
import { HW } from '@/constants/component-illustration-palette';
import type { ExperienceLevel } from '@/constants/onboarding';
import { useSolderiColors } from '@/context/theme-context';

type Props = {
  level: ExperienceLevel | null;
  width: number;
  height: number;
};

const GHOST = '#2E3438';
const GHOST_TRACE = '#252A2E';
const PULSE_MS = 64;
const REVEAL_MS = 750;
const STROKE = 0.68;

type Pulse = { x: number; y: number; opacity: number };

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function PartGraphic({ part, opacity, accent }: { part: CircuitPart; opacity: number; accent: string }) {
  if (opacity <= 0.01) return null;

  const { kind, x, y } = part;

  if (kind === 'battery') {
    return (
      <G opacity={opacity}>
        <Rect x={x} y={y} width={18} height={28} rx={2} fill="#3A4046" stroke={GHOST} strokeWidth={0.6} />
        <Rect x={x + 5} y={y - 3} width={8} height={4} rx={1} fill={GHOST} />
        <Rect x={x + 4} y={y + 8} width={10} height={3} rx={0.5} fill={accent} opacity={0.45} />
      </G>
    );
  }

  if (kind === 'led') {
    return (
      <G opacity={opacity}>
        <Circle cx={x + 6} cy={y + 6} r={5} fill={HW.ledRed} opacity={0.85} />
        <Line x1={x + 6} y1={y + 11} x2={x + 6} y2={y + 16} stroke={HW.pinGold} strokeWidth={1} />
        <Line x1={x + 6} y1={y + 16} x2={x + 6} y2={y + 20} stroke={HW.pinGold} strokeWidth={1} />
      </G>
    );
  }

  if (kind === 'resistor') {
    return (
      <G opacity={opacity}>
        <Path
          d={`M ${x} ${y + 8} L ${x + 4} ${y + 8} L ${x + 7} ${y + 4} L ${x + 12} ${y + 12} L ${x + 16} ${y + 8} L ${x + 22} ${y + 8}`}
          stroke={HW.resistorBody}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  }

  if (kind === 'mcu') {
    return (
      <G opacity={opacity}>
        <Rect x={x} y={y} width={36} height={24} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.6} />
        <Rect x={x + 10} y={y + 6} width={16} height={12} rx={1} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.4} />
      </G>
    );
  }

  if (kind === 'sensor') {
    return (
      <G opacity={opacity}>
        <Rect x={x} y={y} width={28} height={16} rx={2} fill={HW.pcbBlueDark} stroke={HW.pcbBlue} strokeWidth={0.5} />
        <Circle cx={x + 9} cy={y + 8} r={3} fill={accent} opacity={0.5} />
        <Circle cx={x + 19} cy={y + 8} r={3} fill={accent} opacity={0.5} />
      </G>
    );
  }

  if (kind === 'motor') {
    return (
      <G opacity={opacity}>
        <Rect x={x} y={y} width={32} height={22} rx={3} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.55} />
        <Circle cx={x + 26} cy={y + 11} r={5} fill="#2A2E32" stroke={HW.metal} strokeWidth={0.45} />
      </G>
    );
  }

  // ic
  return (
    <G opacity={opacity}>
      <Rect x={x} y={y} width={24} height={18} rx={1.5} fill="#232830" stroke={GHOST} strokeWidth={0.55} />
      <Rect x={x + 6} y={y + 5} width={12} height={8} rx={0.8} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.35} />
    </G>
  );
}

/** Evolving circuit — same system grows from simple → complex with draw-in traces. */
export function EvolvingCircuitVisual({ level, width, height }: Props) {
  const colors = useSolderiColors();
  const accent = colors.accent;
  const pulseCfg = useMemo(() => getPulseConfig(level), [level]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [reveal, setReveal] = useState(1);

  const prevLevel = useRef<ExperienceLevel | null>(level);
  const fromLevel = useRef<ExperienceLevel | null>(level);

  const traceMap = useMemo(() => new Map(CIRCUIT_TRACES.map((t) => [t.id, t])), []);
  const activeIds = useMemo(() => new Set(getActiveTraces(level).map((t) => t.id)), [level]);

  useEffect(() => {
    if (level === prevLevel.current) return;
    fromLevel.current = prevLevel.current;
    prevLevel.current = level;
    setReveal(0);
    const start = Date.now();
    const id = setInterval(() => {
      const raw = Math.min(1, (Date.now() - start) / REVEAL_MS);
      setReveal(easeOutCubic(raw));
      if (raw >= 1) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [level]);

  useEffect(() => {
    const start = Date.now();
    const slots = PULSE_SLOTS.filter((s) => activeIds.has(s.traceId)).slice(0, pulseCfg.count);
    const id = setInterval(() => {
      const phase = ((Date.now() - start) % pulseCfg.durationMs) / pulseCfg.durationMs;
      setPulses(
        slots.map((slot, i) => {
          const trace = traceMap.get(slot.traceId);
          if (!trace) return { x: 0, y: 0, opacity: 0 };
          const t = (phase + slot.offset + i * 0.12) % 1;
          const pos = pointAlongPolyline(trace.signalPoints, t);
          const fade = Math.sin(t * Math.PI);
          return { x: pos.x, y: pos.y, opacity: 0.2 + fade * 0.5 };
        }),
      );
    }, PULSE_MS);
    return () => clearInterval(id);
  }, [activeIds, pulseCfg.count, pulseCfg.durationMs, traceMap]);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${CIRCUIT_VB_W} ${CIRCUIT_VB_H}`} preserveAspectRatio="xMidYMid meet">
        {/* Ghost hints of full system */}
        {CIRCUIT_TRACES.map((trace) => (
          <Path
            key={`ghost-${trace.id}`}
            d={trace.d}
            stroke={GHOST_TRACE}
            strokeWidth={trace.width * STROKE * 0.85}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.07}
          />
        ))}

        {/* Active traces — draw-in via dash offset */}
        {CIRCUIT_TRACES.map((trace) => {
          const p = getTierProgress(trace.tier, level, fromLevel.current, reveal);
          if (p <= 0.01) return null;
          const w = trace.width * STROKE;
          const dash = trace.length;
          return (
            <G key={trace.id}>
              <Path
                d={trace.d}
                stroke={accent}
                strokeWidth={w + 0.35}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={p * 0.12}
                strokeDasharray={`${dash} ${dash}`}
                strokeDashoffset={dash * (1 - p)}
              />
              <Path
                d={trace.d}
                stroke={accent}
                strokeWidth={w}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={p * 0.55}
                strokeDasharray={`${dash} ${dash}`}
                strokeDashoffset={dash * (1 - p)}
              />
            </G>
          );
        })}

        {/* Components */}
        {CIRCUIT_PARTS.map((part) => {
          const p = getTierProgress(part.tier, level, fromLevel.current, reveal);
          return <PartGraphic key={part.id} part={part} opacity={p} accent={accent} />;
        })}

        {/* Nodes */}
        {CIRCUIT_NODES.map((node) => {
          const p = getTierProgress(node.tier, level, fromLevel.current, reveal);
          if (p <= 0.01) return null;
          return (
            <G key={node.id}>
              <Circle cx={node.cx} cy={node.cy} r={node.r + 2} fill={accent} opacity={p * 0.08} />
              <Circle cx={node.cx} cy={node.cy} r={node.r * 0.85} fill={accent} opacity={p * 0.6} />
            </G>
          );
        })}

        {/* Pulses on active traces */}
        {pulses.map((pulse, i) => (
          <G key={`p-${i}`}>
            <Circle cx={pulse.x} cy={pulse.y} r={4} fill={accent} opacity={pulse.opacity * 0.1} />
            <Circle cx={pulse.x} cy={pulse.y} r={1.6} fill={accent} opacity={pulse.opacity * 0.7} />
          </G>
        ))}
      </Svg>
    </View>
  );
}

export { CIRCUIT_ASPECT };

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
