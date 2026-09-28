import type { WiringElementDef, WiringLayout, WiringPortDef } from '@/constants/wiring-diagrams';
import type { StepBlock, StepConnection } from '@/constants/walkthrough-content';

export type WireKind = 'powerLogic' | 'powerServo' | 'ground' | 'digital' | 'analog' | 'pwm';

export type ResolvedPort = {
  element: WiringElementDef;
  port: WiringPortDef;
  x: number;
  y: number;
};

export type RoutedWire = {
  key: string;
  connection: StepConnection;
  from: ResolvedPort;
  to: ResolvedPort;
  kind: WireKind;
  active: boolean;
  d: string;
};

const WIRE_COLORS: Record<WireKind, string> = {
  powerLogic: '#EF4444',
  powerServo: '#F59E0B',
  ground: '#2563EB',
  digital: '#22C55E',
  analog: '#A855F7',
  pwm: '#06B6D4',
};

export const WIRE_KIND_LABELS: { kind: WireKind; label: string }[] = [
  { kind: 'powerLogic', label: 'Uno 5V' },
  { kind: 'powerServo', label: 'PSU 5V' },
  { kind: 'ground', label: 'GND' },
  { kind: 'digital', label: 'Digital' },
  { kind: 'analog', label: 'Analog' },
  { kind: 'pwm', label: 'PWM' },
];

export function wireKindColor(kind: WireKind): string {
  return WIRE_COLORS[kind];
}

export function normalizeWiringToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ωΩ]/g, 'ohm')
    .replace(/[−–—]/g, '-')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]+/g, '');
}

export function connectionKey(connection: StepConnection): string {
  return [
    normalizeWiringToken(connection.fromComponent),
    normalizeWiringToken(connection.fromPin),
    normalizeWiringToken(connection.toComponent),
    normalizeWiringToken(connection.toPin),
  ].join('|');
}

export function collectPriorWiringConnections(
  steps: { blocks: StepBlock[] }[],
  currentIndex: number,
): StepConnection[] {
  const seen = new Set<string>();
  const rows: StepConnection[] = [];

  for (let index = 0; index < currentIndex; index += 1) {
    for (const block of steps[index]?.blocks ?? []) {
      const list =
        block.type === 'wiring' ? block.connections : block.type === 'connections' ? block.rows : null;
      if (!list) {
        continue;
      }
      for (const row of list) {
        const key = connectionKey(row);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        rows.push(row);
      }
    }
  }

  return rows;
}

function scoreAlias(name: string, aliases: string[]): number {
  const key = normalizeWiringToken(name);
  let best = 0;
  for (const alias of aliases) {
    const compact = normalizeWiringToken(alias);
    if (!compact) {
      continue;
    }
    if (compact === key) {
      best = Math.max(best, 100);
    } else if (key.includes(compact) && compact.length >= 3) {
      best = Math.max(best, 72);
    } else if (compact.includes(key) && key.length >= 3) {
      best = Math.max(best, 64);
    }
  }
  return best;
}

export function findElement(layout: WiringLayout, componentName: string): WiringElementDef | null {
  let best: { element: WiringElementDef; score: number } | null = null;
  for (const element of layout.elements) {
    const score = scoreAlias(componentName, [element.label, element.id, ...element.aliases]);
    if (score > 0 && (!best || score > best.score)) {
      best = { element, score };
    }
  }
  return best && best.score >= 64 ? best.element : null;
}

export function findPort(element: WiringElementDef, pinName: string): WiringPortDef | null {
  let best: { port: WiringPortDef; score: number } | null = null;
  for (const port of element.ports) {
    const score = scoreAlias(pinName, [port.id, port.label, ...port.aliases]);
    if (score > 0 && (!best || score > best.score)) {
      best = { port, score };
    }
  }
  return best && best.score >= 64 ? best.port : null;
}

export function resolvePort(
  layout: WiringLayout,
  componentName: string,
  pinName: string,
): ResolvedPort | null {
  const element = findElement(layout, componentName);
  if (!element) {
    return null;
  }
  const port = findPort(element, pinName);
  if (!port) {
    return null;
  }
  return {
    element,
    port,
    x: element.x + port.dx,
    y: element.y + port.dy,
  };
}

export function inferWireKind(
  connection: StepConnection,
  from: ResolvedPort,
  to: ResolvedPort,
): WireKind {
  const fromPin = normalizeWiringToken(connection.fromPin);
  const toPin = normalizeWiringToken(connection.toPin);
  const pins = `${fromPin}${toPin}`;

  if (
    connection.signal === 'ground' ||
    pins.includes('gnd') ||
    fromPin.includes('minus') ||
    toPin.includes('minus')
  ) {
    return 'ground';
  }

  if (/a0|a1|vrx|vry/.test(pins)) {
    return 'analog';
  }

  const touchesServo = from.element.kind === 'servo' || to.element.kind === 'servo';
  if (touchesServo && /d9|d10|sig/.test(pins)) {
    return 'pwm';
  }

  const isPower =
    connection.signal === 'power' ||
    fromPin === '5v' ||
    toPin === '5v' ||
    fromPin.includes('vcc') ||
    toPin.includes('vcc') ||
    fromPin.includes('plus') ||
    toPin.includes('plus');

  if (isPower) {
    const joystickLogic =
      (from.element.kind === 'arduino-uno' && to.element.kind === 'joystick') ||
      (to.element.kind === 'arduino-uno' && from.element.kind === 'joystick');
    if (joystickLogic) {
      return 'powerLogic';
    }

    const servoPower =
      from.element.kind === 'servo' ||
      to.element.kind === 'servo' ||
      from.element.kind === 'breadboard-psu' ||
      to.element.kind === 'breadboard-psu' ||
      from.element.railDomain === 'servo' ||
      to.element.railDomain === 'servo' ||
      fromPin.includes('servo') ||
      toPin.includes('servo');

    if (servoPower && !fromPin.includes('logic') && !toPin.includes('logic')) {
      return 'powerServo';
    }
    return 'powerLogic';
  }

  return 'digital';
}

type Point = { x: number; y: number };
type Box = { x1: number; y1: number; x2: number; y2: number };

const ROUTE_STUB = 22;
const ROUTE_PAD = 10;
const CHANNEL_STEP = 18;

function elementBox(element: WiringElementDef): Box {
  return {
    x1: element.x,
    y1: element.y,
    x2: element.x + element.width,
    y2: element.y + element.height,
  };
}

function inflateBox(box: Box, pad: number): Box {
  return { x1: box.x1 - pad, y1: box.y1 - pad, x2: box.x2 + pad, y2: box.y2 + pad };
}

function elementContains(outer: WiringElementDef, inner: WiringElementDef): boolean {
  return (
    inner.x >= outer.x - 2 &&
    inner.y >= outer.y - 2 &&
    inner.x + inner.width <= outer.x + outer.width + 2 &&
    inner.y + inner.height <= outer.y + outer.height + 2
  );
}

function exitSign(port: ResolvedPort): 1 | -1 {
  return port.port.dx >= port.element.width / 2 ? 1 : -1;
}

function hSegHitsBox(y: number, x1: number, x2: number, box: Box): boolean {
  const lo = Math.min(x1, x2);
  const hi = Math.max(x1, x2);
  return y >= box.y1 && y <= box.y2 && hi >= box.x1 && lo <= box.x2;
}

function vSegHitsBox(x: number, y1: number, y2: number, box: Box): boolean {
  const lo = Math.min(y1, y2);
  const hi = Math.max(y1, y2);
  return x >= box.x1 && x <= box.x2 && hi >= box.y1 && lo <= box.y2;
}

function pathHits(points: Point[], boxes: Box[]): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const next = points[index];
    const horizontal = Math.abs(prev.y - next.y) < 0.5;
    for (const box of boxes) {
      if (horizontal ? hSegHitsBox(prev.y, prev.x, next.x, box) : vSegHitsBox(prev.x, prev.y, next.y, box)) {
        return true;
      }
    }
  }
  return false;
}

function strictlyInsideElement(point: Point, element: WiringElementDef): boolean {
  return (
    point.x > element.x + 2 &&
    point.x < element.x + element.width - 2 &&
    point.y > element.y + 2 &&
    point.y < element.y + element.height - 2
  );
}

function cutsEndpointBody(points: Point[], from: ResolvedPort, to: ResolvedPort): boolean {
  return points
    .slice(1, -1)
    .some((point) => strictlyInsideElement(point, from.element) || strictlyInsideElement(point, to.element));
}

function pathLength(points: Point[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.abs(points[index].x - points[index - 1].x) + Math.abs(points[index].y - points[index - 1].y);
  }
  return total;
}

function inBounds(points: Point[], layout: WiringLayout): boolean {
  return points.every(
    (point) => point.x >= 4 && point.y >= 4 && point.x <= layout.width - 4 && point.y <= layout.height - 4,
  );
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values.map((value) => Math.round(value)))].sort((a, b) => a - b);
}

function channelOptions(preferred: number): number[] {
  const base = Math.round(preferred / CHANNEL_STEP) * CHANNEL_STEP;
  const options = [preferred, base];
  for (let step = 1; step <= 8; step += 1) {
    options.push(base - step * CHANNEL_STEP, base + step * CHANNEL_STEP);
  }
  return options;
}

function replaceCoord(points: Point[], axis: 'x' | 'y', from: number, to: number): Point[] {
  return points.map((point) => (Math.abs(point[axis] - from) < 0.5 ? { ...point, [axis]: to } : point));
}

function cleanPolyline(points: Point[]): Point[] {
  const collapsed: Point[] = [];
  for (const point of points) {
    const last = collapsed[collapsed.length - 1];
    if (last && Math.abs(last.x - point.x) < 0.5 && Math.abs(last.y - point.y) < 0.5) {
      continue;
    }
    collapsed.push(point);
  }
  const merged: Point[] = [];
  for (const point of collapsed) {
    const last = merged[merged.length - 1];
    const prev = merged[merged.length - 2];
    if (last && prev && ((prev.x === last.x && last.x === point.x) || (prev.y === last.y && last.y === point.y))) {
      merged[merged.length - 1] = point;
      continue;
    }
    merged.push(point);
  }
  return merged;
}

function polylinePath(points: Point[]): string {
  return cleanPolyline(points)
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${Math.round(point.x)} ${Math.round(point.y)}`)
    .join(' ');
}

function verticalGutters(obstacles: Box[], layout: WiringLayout): number[] {
  const xs: number[] = [];
  for (const box of obstacles) {
    xs.push(box.x1 - ROUTE_PAD, box.x2 + ROUTE_PAD);
  }
  return uniqueSorted(xs).filter((x) => x >= 8 && x <= layout.width - 8);
}

function horizontalGutters(obstacles: Box[], layout: WiringLayout): number[] {
  const ys = [8, layout.height - 8];
  for (const box of obstacles) {
    ys.push(box.y1 - ROUTE_PAD, box.y2 + ROUTE_PAD);
  }
  return uniqueSorted(ys).filter((y) => y >= 8 && y <= layout.height - 8);
}

function candidatePaths(from: ResolvedPort, to: ResolvedPort, obstacles: Box[], layout: WiringLayout): Point[][] {
  const fromDir = exitSign(from);
  const toDir = exitSign(to);
  const start = { x: from.x + fromDir * ROUTE_STUB, y: from.y };
  const end = { x: to.x + toDir * ROUTE_STUB, y: to.y };
  const pinStart = { x: from.x, y: from.y };
  const pinEnd = { x: to.x, y: to.y };
  const wrap = (middle: Point[]) => [pinStart, start, ...middle, end, pinEnd];

  const paths: Point[][] = [];
  const topY = obstacles.length > 0 ? Math.min(...obstacles.map((box) => box.y1), 8) : 8;
  const botY = obstacles.length > 0 ? Math.max(...obstacles.map((box) => box.y2), layout.height - 8) : layout.height - 8;
  paths.push(wrap([{ x: start.x, y: topY }, { x: end.x, y: topY }]));
  paths.push(wrap([{ x: start.x, y: botY }, { x: end.x, y: botY }]));

  const midsX = uniqueSorted([
    (start.x + end.x) / 2,
    start.x,
    end.x,
    ...verticalGutters(obstacles, layout),
  ]);
  for (const midX of midsX) {
    paths.push(wrap([{ x: midX, y: start.y }, { x: midX, y: end.y }]));
  }

  const midsY = uniqueSorted([
    (start.y + end.y) / 2,
    ...horizontalGutters(obstacles, layout),
  ]);
  for (const midY of midsY) {
    paths.push(wrap([{ x: start.x, y: midY }, { x: end.x, y: midY }]));
  }

  for (const gutterX of verticalGutters(obstacles, layout)) {
    for (const detourY of [topY, botY, ...horizontalGutters(obstacles, layout)]) {
      paths.push(
        wrap([
          { x: gutterX, y: start.y },
          { x: gutterX, y: detourY },
          { x: end.x, y: detourY },
        ]),
      );
    }
  }

  return paths;
}

function routingObstacles(layout: WiringLayout, from: ResolvedPort, to: ResolvedPort): Box[] {
  return layout.elements
    .filter((element) => {
      if (element.id === from.element.id || element.id === to.element.id) {
        return false;
      }
      return !elementContains(element, from.element) && !elementContains(element, to.element);
    })
    .map((element) => inflateBox(elementBox(element), ROUTE_PAD));
}

function pathClear(points: Point[], obstacles: Box[], from: ResolvedPort, to: ResolvedPort, layout: WiringLayout): boolean {
  return !pathHits(points, obstacles) && !cutsEndpointBody(points, from, to) && inBounds(points, layout);
}

function occupyChannels(
  points: Point[],
  obstacles: Box[],
  from: ResolvedPort,
  to: ResolvedPort,
  layout: WiringLayout,
  usedX: Set<number>,
  usedY: Set<number>,
): Point[] | null {
  const cleaned = cleanPolyline(points);
  const verticals = new Set<number>();
  const horizontals = new Set<number>();
  for (let index = 1; index < cleaned.length; index += 1) {
    const prev = cleaned[index - 1];
    const next = cleaned[index];
    if (Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) > ROUTE_STUB) {
      verticals.add(prev.x);
    }
    if (Math.abs(prev.y - next.y) < 0.5 && Math.abs(prev.x - next.x) > ROUTE_STUB) {
      horizontals.add(prev.y);
    }
  }

  let nextPoints = points;
  const allocatedX: number[] = [];
  const allocatedY: number[] = [];

  for (const x of verticals) {
    const chosen = channelOptions(x).find((option) => {
      if (usedX.has(option)) {
        return false;
      }
      const trial = option === x ? nextPoints : replaceCoord(nextPoints, 'x', x, option);
      return pathClear(trial, obstacles, from, to, layout);
    });
    if (chosen == null) {
      return null;
    }
    allocatedX.push(chosen);
    if (chosen !== x) {
      nextPoints = replaceCoord(nextPoints, 'x', x, chosen);
    }
  }

  for (const y of horizontals) {
    const chosen = channelOptions(y).find((option) => {
      if (usedY.has(option)) {
        return false;
      }
      const trial = option === y ? nextPoints : replaceCoord(nextPoints, 'y', y, option);
      return pathClear(trial, obstacles, from, to, layout);
    });
    if (chosen == null) {
      return null;
    }
    allocatedY.push(chosen);
    if (chosen !== y) {
      nextPoints = replaceCoord(nextPoints, 'y', y, chosen);
    }
  }

  for (const x of allocatedX) {
    usedX.add(x);
  }
  for (const y of allocatedY) {
    usedY.add(y);
  }
  return nextPoints;
}

function routeConnection(
  from: ResolvedPort,
  to: ResolvedPort,
  layout: WiringLayout,
  usedX: Set<number>,
  usedY: Set<number>,
): string {
  const obstacles = routingObstacles(layout, from, to);
  const ranked = candidatePaths(from, to, obstacles, layout)
    .map((points) => ({
      points,
      length: pathLength(points),
      hits: !pathClear(points, obstacles, from, to, layout),
    }))
    .sort((a, b) => Number(a.hits) - Number(b.hits) || a.length - b.length);
  const pool = ranked.some((candidate) => !candidate.hits)
    ? ranked.filter((candidate) => !candidate.hits)
    : ranked;

  for (const candidate of pool) {
    const occupied = occupyChannels(candidate.points, obstacles, from, to, layout, usedX, usedY);
    if (occupied) {
      return polylinePath(occupied);
    }
  }

  const clear = pool.find((candidate) => pathClear(candidate.points, obstacles, from, to, layout));
  if (clear) {
    return polylinePath(clear.points);
  }

  const fromDir = exitSign(from);
  const toDir = exitSign(to);
  const startX = from.x + fromDir * ROUTE_STUB;
  const endX = to.x + toDir * ROUTE_STUB;
  const topY = 8;
  return polylinePath([
    { x: from.x, y: from.y },
    { x: startX, y: from.y },
    { x: startX, y: topY },
    { x: endX, y: topY },
    { x: endX, y: to.y },
    { x: to.x, y: to.y },
  ]);
}

export function routeWiringDiagram(
  layout: WiringLayout,
  active: StepConnection[],
  prior: StepConnection[],
): RoutedWire[] {
  const activeKeys = new Set(active.map(connectionKey));
  const merged: { connection: StepConnection; active: boolean }[] = [];
  const seen = new Set<string>();

  for (const connection of active) {
    const key = connectionKey(connection);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push({ connection, active: true });
  }

  for (const connection of prior) {
    const key = connectionKey(connection);
    if (seen.has(key) || activeKeys.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push({ connection, active: false });
  }

  const resolved = merged.flatMap(({ connection, active: isActive }) => {
    const from = resolvePort(layout, connection.fromComponent, connection.fromPin);
    const to = resolvePort(layout, connection.toComponent, connection.toPin);
    if (!from || !to) {
      return [];
    }
    return [
      {
        connection,
        from,
        to,
        active: isActive,
        span: Math.abs(from.x - to.x) + Math.abs(from.y - to.y),
      },
    ];
  });

  resolved.sort((a, b) => a.span - b.span);

  const usedX = new Set<number>();
  const usedY = new Set<number>();
  return resolved.map(({ connection, from, to, active: isActive }) => ({
    key: connectionKey(connection),
    connection,
    from,
    to,
    kind: inferWireKind(connection, from, to),
    active: isActive,
    d: routeConnection(from, to, layout, usedX, usedY),
  }));
}

export function usedElementIds(wires: RoutedWire[]): Set<string> {
  const ids = new Set<string>();
  for (const wire of wires) {
    ids.add(wire.from.element.id);
    ids.add(wire.to.element.id);
  }
  return ids;
}
