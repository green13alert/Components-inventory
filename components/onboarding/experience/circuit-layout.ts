/** Evolving electronics circuit — shared geometry, tier-gated parts & traces. */

import type { ExperienceLevel } from '@/constants/onboarding';

export const CIRCUIT_VB_W = 390;
export const CIRCUIT_VB_H = 300;
export const CIRCUIT_ASPECT = CIRCUIT_VB_H / CIRCUIT_VB_W;

export type PathTier = 'beginner' | 'intermediate' | 'advanced';

export type CircuitTrace = {
  id: string;
  d: string;
  width: number;
  tier: PathTier;
  /** Approximate length for stroke draw animation. */
  length: number;
  signalPoints: readonly (readonly [number, number])[];
};

export type CircuitPart = {
  id: string;
  tier: PathTier;
  kind: 'battery' | 'led' | 'resistor' | 'mcu' | 'sensor' | 'motor' | 'ic';
  x: number;
  y: number;
};

export type CircuitNode = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  tier: PathTier;
};

const TIER_RANK: Record<PathTier, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function levelRank(level: ExperienceLevel | null): number {
  if (level === 'advanced') return 3;
  if (level === 'intermediate') return 2;
  if (level === 'beginner') return 1;
  return 0;
}

/** 0 = hidden, 1 = fully shown — supports fade/draw-in on tier changes. */
export function getTierProgress(
  tier: PathTier,
  level: ExperienceLevel | null,
  prevLevel: ExperienceLevel | null,
  reveal: number,
): number {
  if (level === null) {
    return tier === 'beginner' ? 0.38 : 0;
  }

  const tr = TIER_RANK[tier];
  const current = levelRank(level);
  const prev = levelRank(prevLevel);

  if (current >= tr) {
    if (prev >= tr) return 1;
    return reveal;
  }
  if (prev >= tr) return 1 - reveal;
  return 0;
}

export function getPulseConfig(level: ExperienceLevel | null) {
  switch (level) {
    case 'advanced':
      return { count: 5, durationMs: 3200 };
    case 'intermediate':
      return { count: 3, durationMs: 4800 };
    case 'beginner':
      return { count: 1, durationMs: 6500 };
    default:
      return { count: 1, durationMs: 8000 };
  }
}

export function isTierActive(tier: PathTier, level: ExperienceLevel | null): boolean {
  if (level === null) return tier === 'beginner';
  return levelRank(level) >= TIER_RANK[tier];
}

/** Beginner: battery → LED + resistor. Intermediate: + MCU + sensor. Advanced: + driver + motor mesh. */
export const CIRCUIT_TRACES: CircuitTrace[] = [
  // Beginner — simple loop
  {
    id: 'pwr-bus',
    d: 'M 48 228 H 128',
    width: 1.6,
    tier: 'beginner',
    length: 80,
    signalPoints: [
      [48, 228],
      [128, 228],
    ],
  },
  {
    id: 'to-led',
    d: 'M 128 228 V 198',
    width: 1.4,
    tier: 'beginner',
    length: 30,
    signalPoints: [
      [128, 228],
      [128, 198],
    ],
  },
  {
    id: 'led-res',
    d: 'M 128 198 H 168',
    width: 1.3,
    tier: 'beginner',
    length: 40,
    signalPoints: [
      [128, 198],
      [168, 198],
    ],
  },
  {
    id: 'return',
    d: 'M 168 198 V 248 H 48',
    width: 1.2,
    tier: 'beginner',
    length: 130,
    signalPoints: [
      [168, 198],
      [168, 248],
      [48, 248],
    ],
  },

  // Intermediate — extend through MCU & sensor
  {
    id: 'to-mcu',
    d: 'M 128 228 H 210',
    width: 1.4,
    tier: 'intermediate',
    length: 82,
    signalPoints: [
      [128, 228],
      [210, 228],
    ],
  },
  {
    id: 'mcu-up',
    d: 'M 210 228 V 178',
    width: 1.3,
    tier: 'intermediate',
    length: 50,
    signalPoints: [
      [210, 228],
      [210, 178],
    ],
  },
  {
    id: 'to-sensor',
    d: 'M 210 178 H 278',
    width: 1.3,
    tier: 'intermediate',
    length: 68,
    signalPoints: [
      [210, 178],
      [278, 178],
    ],
  },
  {
    id: 'sensor-up',
    d: 'M 278 178 V 138',
    width: 1.2,
    tier: 'intermediate',
    length: 40,
    signalPoints: [
      [278, 178],
      [278, 138],
    ],
  },
  {
    id: 'mcu-branch',
    d: 'M 210 178 L 248 148',
    width: 1.1,
    tier: 'intermediate',
    length: 48,
    signalPoints: [
      [210, 178],
      [248, 148],
    ],
  },

  // Advanced — motor driver subsystem + extra routing
  {
    id: 'drv-feed',
    d: 'M 210 228 V 262 H 290',
    width: 1.3,
    tier: 'advanced',
    length: 72,
    signalPoints: [
      [210, 228],
      [210, 262],
      [290, 262],
    ],
  },
  {
    id: 'to-motor',
    d: 'M 290 262 H 348',
    width: 1.3,
    tier: 'advanced',
    length: 58,
    signalPoints: [
      [290, 262],
      [348, 262],
    ],
  },
  {
    id: 'motor-up',
    d: 'M 348 262 V 218',
    width: 1.2,
    tier: 'advanced',
    length: 44,
    signalPoints: [
      [348, 262],
      [348, 218],
    ],
  },
  {
    id: 'mesh-a',
    d: 'M 278 178 V 218 H 348',
    width: 1.1,
    tier: 'advanced',
    length: 88,
    signalPoints: [
      [278, 178],
      [278, 218],
      [348, 218],
    ],
  },
  {
    id: 'mesh-b',
    d: 'M 248 148 H 318 V 118',
    width: 1.1,
    tier: 'advanced',
    length: 98,
    signalPoints: [
      [248, 148],
      [318, 148],
      [318, 118],
    ],
  },
  {
    id: 'mesh-c',
    d: 'M 168 198 L 198 148 L 248 148',
    width: 1.1,
    tier: 'advanced',
    length: 95,
    signalPoints: [
      [168, 198],
      [198, 148],
      [248, 148],
    ],
  },
  {
    id: 'aux-ic',
    d: 'M 318 118 H 358 V 88',
    width: 1,
    tier: 'advanced',
    length: 72,
    signalPoints: [
      [318, 118],
      [358, 118],
      [358, 88],
    ],
  },
];

export const CIRCUIT_PARTS: CircuitPart[] = [
  { id: 'bat', tier: 'beginner', kind: 'battery', x: 28, y: 214 },
  { id: 'led', tier: 'beginner', kind: 'led', x: 118, y: 186 },
  { id: 'res', tier: 'beginner', kind: 'resistor', x: 158, y: 186 },
  { id: 'mcu', tier: 'intermediate', kind: 'mcu', x: 192, y: 208 },
  { id: 'sns', tier: 'intermediate', kind: 'sensor', x: 262, y: 122 },
  { id: 'drv', tier: 'advanced', kind: 'ic', x: 272, y: 244 },
  { id: 'mot', tier: 'advanced', kind: 'motor', x: 332, y: 200 },
  { id: 'ic2', tier: 'advanced', kind: 'ic', x: 338, y: 72 },
];

export const CIRCUIT_NODES: CircuitNode[] = [
  { id: 'n0', cx: 48, cy: 228, r: 3, tier: 'beginner' },
  { id: 'n1', cx: 128, cy: 228, r: 3, tier: 'beginner' },
  { id: 'n2', cx: 128, cy: 198, r: 2.5, tier: 'beginner' },
  { id: 'n3', cx: 168, cy: 198, r: 2.5, tier: 'beginner' },
  { id: 'n4', cx: 210, cy: 228, r: 2.8, tier: 'intermediate' },
  { id: 'n5', cx: 210, cy: 178, r: 2.5, tier: 'intermediate' },
  { id: 'n6', cx: 278, cy: 178, r: 2.5, tier: 'intermediate' },
  { id: 'n7', cx: 248, cy: 148, r: 2.2, tier: 'intermediate' },
  { id: 'n8', cx: 290, cy: 262, r: 2.5, tier: 'advanced' },
  { id: 'n9', cx: 348, cy: 218, r: 2.2, tier: 'advanced' },
  { id: 'n10', cx: 318, cy: 118, r: 2, tier: 'advanced' },
];

export const PULSE_SLOTS = [
  { traceId: 'pwr-bus', offset: 0.1 },
  { traceId: 'to-mcu', offset: 0.3 },
  { traceId: 'to-sensor', offset: 0.5 },
  { traceId: 'drv-feed', offset: 0.2 },
  { traceId: 'mesh-a', offset: 0.65 },
  { traceId: 'mesh-b', offset: 0.4 },
  { traceId: 'aux-ic', offset: 0.75 },
];

export function pointAlongPolyline(
  points: readonly (readonly [number, number])[],
  t: number,
): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { x: points[0][0], y: points[0][1] };

  const segments: { len: number; ax: number; ay: number; bx: number; by: number }[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    segments.push({ len, ax, ay, bx, by });
    total += len;
  }
  if (total === 0) return { x: points[0][0], y: points[0][1] };

  let dist = ((t % 1) + 1) % 1 * total;
  for (const seg of segments) {
    if (dist <= seg.len) {
      const f = seg.len === 0 ? 0 : dist / seg.len;
      return { x: seg.ax + (seg.bx - seg.ax) * f, y: seg.ay + (seg.by - seg.ay) * f };
    }
    dist -= seg.len;
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1] };
}

export function getActiveTraces(level: ExperienceLevel | null): CircuitTrace[] {
  return CIRCUIT_TRACES.filter((t) => isTierActive(t.tier, level));
}
