import type { WiringElementDef, WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { BreadboardHole, PhysicalEndpoint, PhysicalJumper } from '../constants/wiring-diagrams/types.ts'
import type { StepConnection } from '../constants/walkthrough-content.ts'
import {
  activePortIds,
  BREADBOARD_PITCH,
  endpointMatchesPorts,
  holeKey,
  holePosition,
  PHYSICAL_BOARD_WIDTH,
  physicalBoardHeight,
} from './breadboard-layout.ts'

export type Emphasis = 'active' | 'prior' | 'context'

type RoutedGeometry = {
  scene: PhysicalScene
  holes: BreadboardHole[]
  jumpers: readonly PhysicalJumper[]
  partKeys: string[][]
}

// Wire paths depend on the layout, not on which step is open. The first build routes them.
// Later step changes only refresh emphasis and assembly visibility.
const routedGeometry = new WeakMap<WiringLayout, RoutedGeometry>()

export type AssemblyFrame = {
  installedParts: ReadonlySet<string>
  newParts: ReadonlySet<string>
  installedJumpers: ReadonlySet<string>
  newJumpers: ReadonlySet<string>
}
export type Point = { x: number; y: number }

export type SceneObstacle =
  | { id: string; kind: 'rect'; x: number; y: number; width: number; height: number }
  | { id: string; kind: 'capsule'; x1: number; y1: number; x2: number; y2: number; radius: number }

export type SceneWire = {
  id: string
  d: string
  color: string
  emphasis: Emphasis
  gender: 'male-male' | 'male-female' | 'stemma-female'
  role: 'jumper' | 'cable'
  from: Point
  to: Point
  socketAt: 'from' | 'to' | 'none'
  touches: string[]
}

export type SceneLead = { portId: string; label: string; at: Point; color: string }

export type ScenePart =
  | { kind: 'resistor'; id: string; label: string; ohms?: number; a: Point; b: Point; emphasis: Emphasis }
  | { kind: 'npn'; id: string; label: string; emitter: Point; base: Point; collector: Point; emphasis: Emphasis }
  | { kind: 'led'; id: string; label: string; anode: Point; cathode: Point; emphasis: Emphasis }
  | { kind: 'rgb-led'; id: string; label: string; leads: SceneLead[]; emphasis: Emphasis }
  | { kind: 'pir' | 'buzzer' | 'joystick' | 'led-matrix'; id: string; label: string; leads: SceneLead[]; emphasis: Emphasis }
  | {
      kind: 'esp32' | 'uno' | 'servo' | 'psu' | 'bme280' | 'led-matrix' | 'joystick'
      id: string
      label: string
      x: number
      y: number
      width: number
      height: number
      pins: { label: string; at: Point }[]
      dots: Point[]
      emphasis: Emphasis
      cable?: { from: Point; leads: SceneLead[] }
    }

export type PhysicalScene = {
  width: number
  height: number
  board: {
    x: number
    y: number
    width: number
    height: number
    splitY: number | null
    rows: number
    leftPlus: string
    rightPlus: string
    leftMinus: string
    rightMinus: string
    trench: { x: number; y: number; width: number; height: number }
  }
  columnLabels: { text: string; at: Point }[]
  rowLabels: { text: string; at: Point }[]
  holes: { at: Point; radius: number; rail: boolean; emphasis: Emphasis }[]
  wires: SceneWire[]
  parts: ScenePart[]
  obstacles: SceneObstacle[]
}

const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const

function shiftPoint(point: Point, dx: number, dy: number): Point {
  return { x: point.x + dx, y: point.y + dy }
}

function resolveEndpoint(layout: WiringLayout, endpoint: PhysicalEndpoint): Point | null {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    const frame = layout.physical?.modules?.find((item) => item.elementId === endpoint.elementId)
    const pin = frame?.pins.find((item) => item.portId === endpoint.portId)
    return pin ? { x: pin.x, y: pin.y } : null
  }
  return holePosition(endpoint as BreadboardHole)
}

function isModule(endpoint: PhysicalEndpoint): endpoint is { kind: 'module'; elementId: string; portId: string } {
  return 'kind' in endpoint && endpoint.kind === 'module'
}

export function wireColor(jumper: PhysicalJumper): string {
  if (jumper.id === 'cable-sdi') {
    return '#2563EB'
  }
  if (jumper.id === 'cable-sck') {
    return '#CA8A04'
  }
  const ports = [jumper.from, jumper.to]
    .filter(isModule)
    .map((end) => (end as { portId: string }).portId)
  const id = `${jumper.id} ${ports.join(' ')}`
  if (/vcc|5v|3v3|plus|anode|vin/.test(id)) {
    return '#DC2626'
  }
  if (/gnd|minus|emitter/.test(id)) {
    return '#111827'
  }
  if (/sig|d9|d10/.test(id) && /pan|tilt|servo/.test(id)) {
    return '#EA580C'
  }
  if (/25|red|d8/.test(id)) {
    return '#EA580C'
  }
  if (/26|green|d9|sdi|sda/.test(id)) {
    return '#15803D'
  }
  if (/io21/.test(id)) {
    return '#2563EB'
  }
  if (/io22/.test(id)) {
    return '#CA8A04'
  }
  if (/27|blue|d10|sck|scl/.test(id)) {
    return '#1D4ED8'
  }
  if (/matrix-clk|\bclk\b/.test(id)) {
    return '#0369A1'
  }
  if (/matrix-din|\bdin\b/.test(id)) {
    return '#0F766E'
  }
  if (/\bvrx\b/.test(id)) {
    return '#7C3AED'
  }
  if (/\bvry\b/.test(id)) {
    return '#DB2777'
  }
  if (/\bsw\b/.test(id)) {
    return '#C2410C'
  }
  if (/d2|out/.test(id)) {
    return '#7C3AED'
  }
  return '#334155'
}

function leadColor(portId: string) {
  if (portId === 'red' || portId === 'vcc' || portId === 'vin' || portId === '5v' || portId === 'anode') {
    return '#DC2626'
  }
  if (portId === 'green') {
    return '#16A34A'
  }
  if (portId === 'blue' || portId === 'sdi') {
    return '#2563EB'
  }
  if (portId === 'sck') {
    return '#CA8A04'
  }
  if (portId === 'gnd' || portId === 'cathode' || portId === 'emitter') {
    return '#111827'
  }
  if (portId === 'sig') {
    return '#EA580C'
  }
  return '#334155'
}

function wireEmphasis(layout: WiringLayout, jumper: PhysicalJumper, active: Set<string>, prior: Set<string>): Emphasis {
  if (active.size === 0) {
    return 'active'
  }
  if ([jumper.from, jumper.to].some((end) => endpointMatchesPorts(layout, end, active))) {
    return 'active'
  }
  if ([jumper.from, jumper.to].some((end) => endpointMatchesPorts(layout, end, prior))) {
    return 'prior'
  }
  return 'context'
}

function partEmphasis(portKeys: string[], active: Set<string>, prior: Set<string>): Emphasis {
  if (active.size === 0 || portKeys.some((key) => active.has(key))) {
    return 'active'
  }
  if (portKeys.some((key) => prior.has(key))) {
    return 'prior'
  }
  return 'context'
}

function railCaptions(layout: WiringLayout) {
  const board = layout.elements.find((element) => element.kind === 'breadboard')
  const labelFor = (side: 'left' | 'right', polarity: 'plus' | 'minus') => {
    const binding = layout.physical?.railBindings.find((item) => item.side === side && item.polarity === polarity)
    if (!binding) {
      return ''
    }
    if (polarity === 'plus' && board?.powerRailLabel) {
      return board.powerRailLabel
    }
    return board?.ports.find((port) => port.id === binding.portId)?.label ?? (polarity === 'plus' ? '5V' : 'GND')
  }
  const bridge = (polarity: 'plus' | 'minus') => layout.physical?.jumpers.some((jumper) => jumper.id === `bridge-${polarity === 'plus' ? 'plus' : 'minus'}`)
  const leftPlus = labelFor('left', 'plus')
  const leftMinus = labelFor('left', 'minus')
  return {
    leftPlus,
    rightPlus: labelFor('right', 'plus') || (bridge('plus') ? leftPlus : ''),
    leftMinus,
    rightMinus: labelFor('right', 'minus') || (bridge('minus') ? leftMinus : ''),
  }
}

function pathHitsBodies(path: string, from: Point, to: Point, obstacles: SceneObstacle[]) {
  for (const point of pathSamples(path)) {
    const nearEnd = Math.hypot(point.x - from.x, point.y - from.y) < 22 || Math.hypot(point.x - to.x, point.y - to.y) < 22
    if (nearEnd) {
      continue
    }
    if (obstacles.some((item) => pointHits(point, item))) {
      return true
    }
  }
  return false
}

function polyline(points: Point[]) {
  const kept: Point[] = []
  for (const point of points) {
    const next = { x: Math.round(point.x), y: Math.round(point.y) }
    const last = kept[kept.length - 1]
    if (last && Math.hypot(next.x - last.x, next.y - last.y) <= 0.5) {
      continue
    }
    const before = kept[kept.length - 2]
    const straight =
      before && last && ((before.x === last.x && last.x === next.x) || (before.y === last.y && last.y === next.y))
    if (straight) {
      kept.pop()
    }
    kept.push(next)
  }
  return `M ${kept.map((point) => `${point.x} ${point.y}`).join(' L ')}`
}

function pathVertexLength(path: string) {
  const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  let length = 0
  for (let index = 2; index + 1 < numbers.length; index += 2) {
    length += Math.hypot(numbers[index] - numbers[index - 2], numbers[index + 1] - numbers[index - 1])
  }
  return length
}

function hostOf(point: Point, obstacles: SceneObstacle[]) {
  let best: { item: Extract<SceneObstacle, { kind: 'rect' }>; distance: number } | null = null
  for (const item of obstacles) {
    if (item.kind !== 'rect') {
      continue
    }
    const inside = pointHits(point, item)
    const dx = point.x < item.x ? item.x - point.x : point.x > item.x + item.width ? point.x - (item.x + item.width) : 0
    const dy = point.y < item.y ? item.y - point.y : point.y > item.y + item.height ? point.y - (item.y + item.height) : 0
    const distance = inside ? 0 : Math.hypot(dx, dy)
    if (distance <= 24 && (!best || distance < best.distance)) {
      best = { item, distance }
    }
  }
  return best?.item ?? null
}

/** Step just outside the part the terminal belongs to, on the side the terminal already faces. */
function leaveHost(point: Point, obstacles: SceneObstacle[], lane: number): Point {
  const host = hostOf(point, obstacles)
  if (!host) {
    return point
  }
  const pad = 20 + (lane % 4) * 8
  if (pointHits(point, host)) {
    const left = point.x - host.x
    const right = host.x + host.width - point.x
    const top = point.y - host.y
    const bottom = host.y + host.height - point.y
    const nearest = Math.min(left, right, top, bottom)
    if (nearest === left) {
      return { x: host.x - pad, y: point.y }
    }
    if (nearest === right) {
      return { x: host.x + host.width + pad, y: point.y }
    }
    if (nearest === top) {
      return { x: point.x, y: host.y - pad }
    }
    return { x: point.x, y: host.y + host.height + pad }
  }
  const dx = point.x - (host.x + host.width / 2)
  const dy = point.y - (host.y + host.height / 2)
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: point.x + Math.sign(dx || 1) * pad, y: point.y }
  }
  return { x: point.x, y: point.y + Math.sign(dy || 1) * pad }
}

function obstacleBox(item: SceneObstacle) {
  if (item.kind === 'rect') {
    return { left: item.x, top: item.y, right: item.x + item.width, bottom: item.y + item.height }
  }
  return {
    left: Math.min(item.x1, item.x2) - item.radius,
    right: Math.max(item.x1, item.x2) + item.radius,
    top: Math.min(item.y1, item.y2) - item.radius,
    bottom: Math.max(item.y1, item.y2) + item.radius,
  }
}

function obstaclesNear(points: Point[], obstacles: SceneObstacle[]) {
  const minX = Math.min(...points.map((point) => point.x)) - 20
  const maxX = Math.max(...points.map((point) => point.x)) + 20
  const minY = Math.min(...points.map((point) => point.y)) - 20
  const maxY = Math.max(...points.map((point) => point.y)) + 20
  return obstacles.filter((item) => {
    const box = obstacleBox(item)
    return box.left < maxX && box.right > minX && box.top < maxY && box.bottom > minY
  })
}

type WireRun = { x1: number; y1: number; x2: number; y2: number }

function pathRuns(path: string): WireRun[] {
  const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  const runs: WireRun[] = []
  for (let index = 0; index + 3 < numbers.length; index += 2) {
    runs.push({ x1: numbers[index], y1: numbers[index + 1], x2: numbers[index + 2], y2: numbers[index + 3] })
  }
  return runs
}

function runLength(run: WireRun) {
  return Math.hypot(run.x2 - run.x1, run.y2 - run.y1)
}

/** Shorten both ends so a shared arrival at a pin does not count as a crowded corridor. */
function trimmedRun(run: WireRun, trim: number): WireRun | null {
  const length = runLength(run)
  if (length <= trim * 2) {
    return null
  }
  const scale = trim / length
  return {
    x1: run.x1 + (run.x2 - run.x1) * scale,
    y1: run.y1 + (run.y2 - run.y1) * scale,
    x2: run.x2 - (run.x2 - run.x1) * scale,
    y2: run.y2 - (run.y2 - run.y1) * scale,
  }
}

function parallelApproach(a: WireRun, b: WireRun) {
  const aHorizontal = Math.abs(a.y2 - a.y1) <= 1.5
  const bHorizontal = Math.abs(b.y2 - b.y1) <= 1.5
  const aVertical = Math.abs(a.x2 - a.x1) <= 1.5
  const bVertical = Math.abs(b.x2 - b.x1) <= 1.5
  if (aHorizontal && bHorizontal) {
    const start = Math.max(Math.min(a.x1, a.x2), Math.min(b.x1, b.x2))
    const end = Math.min(Math.max(a.x1, a.x2), Math.max(b.x1, b.x2))
    return { span: Math.max(0, end - start), distance: Math.abs(a.y1 - b.y1) }
  }
  if (aVertical && bVertical) {
    const start = Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2))
    const end = Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2))
    return { span: Math.max(0, end - start), distance: Math.abs(a.x1 - b.x1) }
  }
  return { span: 0, distance: Number.POSITIVE_INFINITY }
}

function collinearOverlap(a: WireRun, b: WireRun, gap: number) {
  const approach = parallelApproach(a, b)
  return approach.distance <= gap ? approach.span : 0
}

function runsCross(a: WireRun, b: WireRun) {
  const cross = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)
  const d1 = cross(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1)
  const d2 = cross(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2)
  const d3 = cross(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1)
  const d4 = cross(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2)
  if (Math.abs(d1) < 0.5 && Math.abs(d2) < 0.5) {
    return false
  }
  return d1 * d2 < 0 && d3 * d4 < 0
}

function corridorCost(path: string, occupied: readonly WireRun[]) {
  let shared = 0
  let crossings = 0
  for (const run of pathRuns(path)) {
    const trimmed = trimmedRun(run, 26)
    for (const other of occupied) {
      const otherTrimmed = trimmedRun(other, 26)
      if (trimmed && otherTrimmed) {
        const approach = parallelApproach(trimmed, otherTrimmed)
        if (approach.distance <= 12 && approach.span > 0) {
          const weight = approach.distance < 3 ? 5 : approach.distance < 8 ? 2 : 0.4
          shared += approach.span * weight
        }
      }
      if (runsCross(run, other)) {
        crossings += 1
      }
    }
  }
  return shared * 3 + crossings * 12
}

/** Longest near-parallel overlap between two different wires, ignoring the last approach to each pin. */
export function longestSharedRun(scene: PhysicalScene, gap = 8) {
  let longest = 0
  const runs = scene.wires.map((wire) => pathRuns(wire.d))
  for (let left = 0; left < runs.length; left += 1) {
    for (let right = left + 1; right < runs.length; right += 1) {
      for (const a of runs[left]) {
        for (const b of runs[right]) {
          const trimmedA = trimmedRun(a, 26)
          const trimmedB = trimmedRun(b, 26)
          if (trimmedA && trimmedB) {
            longest = Math.max(longest, collinearOverlap(trimmedA, trimmedB, gap))
          }
        }
      }
    }
  }
  return longest
}

function routeCandidates(from: Point, to: Point, obstacles: SceneObstacle[], lane: number, margin: number) {
  const spread = Math.min(lane, 4) * 9
  const start = leaveHost(from, obstacles, lane)
  const end = leaveHost(to, obstacles, lane + 1)
  const candidates = [
    polyline([from, to]),
    polyline([from, start, { x: end.x, y: start.y }, end, to]),
    polyline([from, start, { x: start.x, y: end.y }, end, to]),
  ]
  const portalsX: number[] = []
  const portalsY: number[] = []
  const spreads = spread === 0 ? [0] : [0, spread]
  for (const item of obstaclesNear([from, to, start, end], obstacles)) {
    const box = obstacleBox(item)
    for (const extra of spreads) {
      portalsY.push(box.top - margin - extra, box.bottom + margin + extra)
      portalsX.push(box.left - margin - extra, box.right + margin + extra)
    }
  }
  for (const y of portalsY) {
    candidates.push(polyline([from, start, { x: start.x, y }, { x: end.x, y }, end, to]))
  }
  for (const x of portalsX) {
    candidates.push(polyline([from, start, { x, y: start.y }, { x, y: end.y }, end, to]))
  }
  for (const y of portalsY) {
    for (const x of portalsX) {
      candidates.push(polyline([from, start, { x: start.x, y }, { x, y }, { x, y: end.y }, end, to]))
    }
  }
  return candidates
}

function boardCrossings(path: string, from: Point, to: Point, board: SceneObstacle) {
  let crossings = 0
  for (const point of pathSamples(path)) {
    const nearEnd = Math.hypot(point.x - from.x, point.y - from.y) < 36 || Math.hypot(point.x - to.x, point.y - to.y) < 36
    if (!nearEnd && pointHits(point, board)) {
      crossings += 1
    }
  }
  return crossings
}

function routeWire(
  from: Point,
  to: Point,
  obstacles: SceneObstacle[],
  lane: number,
  board: SceneObstacle | null,
  occupied: readonly WireRun[],
): string {
  const candidates = [16, 28].flatMap((margin) => routeCandidates(from, to, obstacles, lane, margin))
  const clear = candidates.filter((path) => !pathHitsBodies(path, from, to, obstacles))
  const pool = clear.length > 0 ? clear : candidates
  const shortest = Math.min(...pool.map((path) => pathVertexLength(path)))
  const near = pool.filter((path) => pathVertexLength(path) <= shortest + 120)
  const score = (path: string) => pathVertexLength(path) + (board ? boardCrossings(path, from, to, board) * 40 : 0) + corridorCost(path, occupied)
  return near.reduce((best, path) => (score(path) < score(best) ? path : best))
}

function pointHits(point: Point, obstacle: SceneObstacle) {
  if (obstacle.kind === 'rect') {
    return point.x >= obstacle.x && point.x <= obstacle.x + obstacle.width && point.y >= obstacle.y && point.y <= obstacle.y + obstacle.height
  }
  const dx = obstacle.x2 - obstacle.x1
  const dy = obstacle.y2 - obstacle.y1
  const lengthSq = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((point.x - obstacle.x1) * dx + (point.y - obstacle.y1) * dy) / lengthSq))
  const x = obstacle.x1 + dx * t
  const y = obstacle.y1 + dy * t
  return Math.hypot(point.x - x, point.y - y) <= obstacle.radius
}

export function wireBodyHits(scene: PhysicalScene): string[] {
  const hits: string[] = []
  for (const wire of scene.wires) {
    const numbers = wire.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
    if (numbers.length < 4) {
      continue
    }
    for (const point of pathSamples(wire.d)) {
      const nearEnd = Math.hypot(point.x - wire.from.x, point.y - wire.from.y) < 22 || Math.hypot(point.x - wire.to.x, point.y - wire.to.y) < 22
      if (nearEnd) {
        continue
      }
      if (scene.obstacles.some((item) => pointHits(point, item))) {
        hits.push(wire.id)
        break
      }
    }
  }
  return hits
}

function pathSamples(path: string): Point[] {
  const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  const points: Point[] = []
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    points.push({ x: numbers[index], y: numbers[index + 1] })
  }
  if (path.includes(' C ') && points.length >= 4) {
    return curveSamples(points[0], points[1], points[2], points[3])
  }
  if (path.includes(' Q ') && points.length >= 3) {
    const [start, control, end] = points
    const sampled = [start]
    for (let step = 1; step <= 6; step += 1) {
      const t = step / 7
      const u = 1 - t
      sampled.push({
        x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
        y: u * u * start.y + 2 * u * t * control.y + t * t * end.y,
      })
    }
    return sampled
  }
  const sampled: Point[] = []
  for (let index = 0; index + 1 < points.length; index += 1) {
    const start = points[index]
    const end = points[index + 1]
    for (let step = 1; step <= 4; step += 1) {
      const t = step / 5
      sampled.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t })
    }
  }
  return sampled
}

function curveSamples(start: Point, c1: Point, c2: Point, end: Point) {
  const sampled = [start]
  for (let step = 1; step <= 6; step += 1) {
    const t = step / 7
    const u = 1 - t
    sampled.push({
      x: u * u * u * start.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * end.x,
      y: u * u * u * start.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * end.y,
    })
  }
  return sampled
}

function leadPoint(layout: WiringLayout, elementId: string, portId: string): Point | null {
  const lead = layout.physical?.leads.find((item) => item.elementId === elementId && item.portId === portId)
  return lead ? holePosition(lead.hole) : null
}

function portLabel(element: WiringElementDef, portId: string) {
  return element.ports.find((port) => port.id === portId)?.label ?? portId
}

export function buildPhysicalScene(
  layout: WiringLayout,
  connections: readonly StepConnection[] = [],
  priorConnections: readonly StepConnection[] = [],
  frame?: AssemblyFrame | null,
): PhysicalScene | null {
  const cached = routedGeometry.get(layout)
  if (cached) {
    return emphasizeRoutedScene(cached, layout, connections, priorConnections, frame ?? null)
  }
  const routed = routePhysicalGeometry(layout, connections, priorConnections)
  if (!routed) {
    return null
  }
  routedGeometry.set(layout, routed)
  return emphasizeRoutedScene(routed, layout, connections, priorConnections, frame ?? null)
}

function routePhysicalGeometry(
  layout: WiringLayout,
  connections: readonly StepConnection[] = [],
  priorConnections: readonly StepConnection[] = [],
): RoutedGeometry | null {
  const physical = layout.physical
  if (!physical) {
    return null
  }
  const active = activePortIds(layout, connections)
  const prior = activePortIds(layout, priorConnections)
  const height = physicalBoardHeight(physical.rows)
  const captions = railCaptions(layout)
  const holeRefs: BreadboardHole[] = []
  const rawHoles: { at: Point; radius: number; rail: boolean; emphasis: Emphasis; label?: string }[] = []
  for (let row = 1; row <= physical.rows; row += 1) {
    for (const column of COLUMNS) {
      const hole: BreadboardHole = { kind: 'strip', column, row }
      holeRefs.push(hole)
      rawHoles.push({ at: holePosition(hole), radius: 2.2, rail: false, emphasis: holeEmphasis(layout, hole, active, prior) })
    }
    for (const side of ['left', 'right'] as const) {
      for (const polarity of ['plus', 'minus'] as const) {
        const hole: BreadboardHole = { kind: 'rail', side, polarity, row }
        holeRefs.push(hole)
        rawHoles.push({ at: holePosition(hole), radius: 2, rail: true, emphasis: holeEmphasis(layout, hole, active, prior) })
      }
    }
  }

  const obstacles: SceneObstacle[] = []
  const parts: ScenePart[] = []
  const partKeys: string[][] = []
  for (const element of layout.elements) {
    const leads = physical.leads.filter((lead) => lead.elementId === element.id)
    const keys = leads.map((lead) => `${lead.elementId}:${lead.portId}`)
    const emphasis = partEmphasis(keys, active, prior)
    if (element.kind === 'resistor' && leads.length === 2) {
      const a = holePosition(leads[0].hole)
      const b = holePosition(leads[1].hole)
      parts.push({ kind: 'resistor', id: element.id, label: element.label, ohms: element.resistorOhms, a, b, emphasis })
      partKeys.push(keys)
      const inset = 0.22
      obstacles.push({
        id: element.id,
        kind: 'capsule',
        x1: a.x + (b.x - a.x) * inset,
        y1: a.y + (b.y - a.y) * inset,
        x2: a.x + (b.x - a.x) * (1 - inset),
        y2: a.y + (b.y - a.y) * (1 - inset),
        radius: 7,
      })
    } else if (element.kind === 'npn' && leads.length === 3) {
      const emitter = leadPoint(layout, element.id, 'emitter')
      const base = leadPoint(layout, element.id, 'base')
      const collector = leadPoint(layout, element.id, 'collector')
      if (emitter && base && collector) {
        parts.push({ kind: 'npn', id: element.id, label: element.label, emitter, base, collector, emphasis })
        partKeys.push(keys)
        const top = Math.min(emitter.y, base.y, collector.y)
        const bottom = Math.max(emitter.y, base.y, collector.y)
        obstacles.push({ id: element.id, kind: 'rect', x: emitter.x - 30, y: top - 6, width: 24, height: bottom - top + 12 })
      }
    } else if (element.kind === 'led' && leads.length === 2) {
      const anode = leadPoint(layout, element.id, 'anode')
      const cathode = leadPoint(layout, element.id, 'cathode')
      if (anode && cathode) {
        parts.push({ kind: 'led', id: element.id, label: element.label, anode, cathode, emphasis })
        partKeys.push(keys)
        obstacles.push({ id: element.id, kind: 'rect', x: anode.x + 8, y: Math.min(anode.y, cathode.y) - 4, width: 22, height: 28 })
      }
    } else if (element.kind === 'rgb-led' && leads.length === 4) {
      const order = ['red', 'anode', 'blue', 'green']
      const drawn = order
        .map((portId) => {
          const at = leadPoint(layout, element.id, portId)
          return at ? { portId, label: portLabel(element, portId), at, color: leadColor(portId) } : null
        })
        .filter((lead): lead is SceneLead => lead != null)
      if (drawn.length === 4) {
        parts.push({ kind: 'rgb-led', id: element.id, label: element.label, leads: drawn, emphasis })
        partKeys.push(keys)
        const mid = drawn.reduce((sum, lead) => sum + lead.at.y, 0) / drawn.length
        obstacles.push({ id: element.id, kind: 'rect', x: drawn[0].at.x - 34, y: mid - 16, width: 28, height: 32 })
      }
    } else if ((element.kind === 'pir' || element.kind === 'buzzer' || element.kind === 'joystick' || element.kind === 'led-matrix') && leads.length > 0) {
      const drawn = leads.map((lead) => ({
        portId: lead.portId,
        label: portLabel(element, lead.portId),
        at: holePosition(lead.hole),
        color: leadColor(lead.portId),
      }))
      parts.push({ kind: element.kind, id: element.id, label: element.label, leads: drawn, emphasis })
      partKeys.push(keys)
      const top = Math.min(...drawn.map((lead) => lead.at.y))
      const left = drawn[0].at.x + 10
      const bodyWidth = element.kind === 'led-matrix' ? 96 : element.kind === 'joystick' ? 70 : 58
      obstacles.push({ id: element.id, kind: 'rect', x: left, y: top - 8, width: bodyWidth, height: drawn.length * BREADBOARD_PITCH + 8 })
    }
  }

  for (const frame of physical.modules ?? []) {
    const element = layout.elements.find((item) => item.id === frame.elementId)
    const kind = element?.kind
    if (
      kind !== 'esp32-devkit' &&
      kind !== 'arduino-uno' &&
      kind !== 'servo' &&
      kind !== 'breadboard-psu' &&
      kind !== 'dc-jack' &&
      kind !== 'bme280' &&
      kind !== 'led-matrix' &&
      kind !== 'joystick'
    ) {
      continue
    }
    const mapped =
      kind === 'esp32-devkit'
        ? 'esp32'
        : kind === 'arduino-uno'
          ? 'uno'
          : kind === 'breadboard-psu' || kind === 'dc-jack'
            ? 'psu'
            : kind
    const pinKeys = frame.pins.map((item) => `${frame.elementId}:${item.portId}`)
    const cableLeads = frame.cableFrom
      ? physical.leads
          .filter((lead) => lead.elementId === frame.elementId)
          .map((lead) => ({
            portId: lead.portId,
            label: element ? portLabel(element, lead.portId) : lead.portId,
            at: holePosition(lead.hole),
            color: leadColor(lead.portId),
          }))
      : []
    const moduleKeys = [...pinKeys, ...cableLeads.map((lead) => `${frame.elementId}:${lead.portId}`)]
    const emphasis = partEmphasis(moduleKeys, active, prior)
    parts.push({
      kind: mapped,
      id: frame.elementId,
      label: element?.label ?? frame.elementId,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      pins: frame.pins.map((item) => ({ label: item.label, at: { x: item.x, y: item.y } })),
      dots: (frame.dots ?? []).map((dot) => ({ x: dot.x, y: dot.y })),
      emphasis,
      cable: frame.cableFrom ? { from: frame.cableFrom, leads: cableLeads } : undefined,
    })
    partKeys.push(moduleKeys)
    obstacles.push({ id: frame.elementId, kind: 'rect', x: frame.x, y: frame.y, width: frame.width, height: frame.height })
  }

  const wires: SceneWire[] = []
  let lane = 0
  const occupied: WireRun[] = []
  const boardBody: SceneObstacle | null =
    physical.rows > 0
      ? { id: 'breadboard-body', kind: 'rect', x: 8, y: 24, width: 276, height: physicalBoardHeight(physical.rows) - 36 }
      : null
  const addWire = (wire: Omit<SceneWire, 'd'> & { id: string }, avoidBoard: boolean) => {
    const long = Math.hypot(wire.to.x - wire.from.x, wire.to.y - wire.from.y) > 150 || /cathode/.test(wire.id)
    const d = routeWire(wire.from, wire.to, obstacles, long ? lane++ : lane, avoidBoard ? boardBody : null, occupied)
    wires.push({ ...wire, d })
    for (const run of pathRuns(d)) {
      if (runLength(run) > 36) {
        occupied.push(run)
      }
    }
  }
  for (const jumper of physical.jumpers) {
    const from = resolveEndpoint(layout, jumper.from)
    const to = resolveEndpoint(layout, jumper.to)
    if (!from || !to) {
      continue
    }
    addWire({
      id: jumper.id,
      color: wireColor(jumper),
      emphasis: wireEmphasis(layout, jumper, active, prior),
      gender: jumper.gender,
      role: 'jumper',
      from,
      to,
      socketAt: jumper.gender === 'male-female' || jumper.gender === 'stemma-female' ? (isModule(jumper.from) ? 'from' : 'to') : 'none',
      touches: [...new Set([isModule(jumper.from) ? jumper.from.elementId : 'breadboard', isModule(jumper.to) ? jumper.to.elementId : 'breadboard'])],
    }, isModule(jumper.from) || isModule(jumper.to))
  }
  for (const part of parts) {
    if (!('cable' in part) || !part.cable) {
      continue
    }
    for (const lead of part.cable.leads) {
      addWire({
        id: `${part.id}-${lead.portId}`,
        color: lead.color,
        emphasis: part.emphasis,
        gender: 'male-male',
        role: 'cable',
        from: part.cable.from,
        to: lead.at,
        socketAt: 'none',
        touches: [part.id],
      }, true)
    }
  }

  const points: Point[] = [
    { x: 0, y: 0 },
    { x: PHYSICAL_BOARD_WIDTH, y: height },
    ...rawHoles.map((hole) => hole.at),
    ...wires.flatMap((wire) => {
      const nums = wire.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
      const sampled: Point[] = [wire.from, wire.to]
      for (let index = 0; index + 1 < nums.length; index += 2) {
        sampled.push({ x: nums[index], y: nums[index + 1] })
      }
      return sampled
    }),
    ...parts.flatMap(partPoints),
  ]
  const minX = Math.min(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxX = Math.max(...points.map((point) => point.x))
  const maxY = Math.max(...points.map((point) => point.y))
  const dx = 20 - minX
  const dy = 28 - minY
  const move = <T extends Point>(point: T) => shiftPoint(point, dx, dy)
  const splitY =
    physical.railSplitAfter == null
      ? null
      : holePosition({ kind: 'strip', column: 'a', row: physical.railSplitAfter }).y + BREADBOARD_PITCH / 2 + dy
  const trenchX = holePosition({ kind: 'strip', column: 'e', row: 1 }).x + 8 + dx
  const trenchW = holePosition({ kind: 'strip', column: 'f', row: 1 }).x - holePosition({ kind: 'strip', column: 'e', row: 1 }).x - 16

  const scene: PhysicalScene = {
    width: maxX + dx + 28,
    height: maxY + dy + 36,
    board: {
      x: 8 + dx,
      y: 24 + dy,
      width: 276,
      height: height - 36,
      splitY,
      rows: physical.rows,
      ...captions,
      trench: { x: trenchX, y: 36 + dy, width: trenchW, height: (physical.rows - 1) * BREADBOARD_PITCH },
    },
    columnLabels: COLUMNS.map((column) => ({
      text: column,
      at: move(holePosition({ kind: 'strip', column, row: 1 })),
    })).map((item) => ({ text: item.text, at: { x: item.at.x, y: item.at.y - BREADBOARD_PITCH - 6 } })),
    rowLabels: Array.from({ length: physical.rows }, (_, index) => {
      const row = index + 1
      const at = move(holePosition({ kind: 'strip', column: 'j', row }))
      return { text: String(row), at: { x: at.x + 62, y: at.y } }
    }),
    holes: rawHoles.map((hole) => ({ ...hole, at: move(hole.at) })),
    wires: wires.map((wire) => ({ ...wire, from: move(wire.from), to: move(wire.to), d: translatePath(wire.d, dx, dy) })),
    parts: parts.map((part) => shiftPart(part, dx, dy)),
    obstacles: obstacles.map((item) => shiftObstacle(item, dx, dy)),
  }
  return { scene, holes: holeRefs, jumpers: physical.jumpers, partKeys }
}

function emphasizeRoutedScene(
  routed: RoutedGeometry,
  layout: WiringLayout,
  connections: readonly StepConnection[],
  priorConnections: readonly StepConnection[],
  frame: AssemblyFrame | null,
): PhysicalScene {
  const active = activePortIds(layout, connections)
  const prior = activePortIds(layout, priorConnections)
  const holes = routed.scene.holes.map((hole, index) => ({
    ...hole,
    emphasis: holeEmphasis(layout, routed.holes[index], active, prior),
  }))
  const parts = routed.scene.parts.map((part, index) => ({
    ...part,
    emphasis: partEmphasis(routed.partKeys[index] ?? [], active, prior),
  }))
  const partIds = new Set(parts.map((part) => part.id))
  const emphasisByPart = new Map(parts.map((part) => [part.id, part.emphasis]))
  const jumperById = new Map(routed.jumpers.map((jumper) => [jumper.id, jumper]))
  const wires = routed.scene.wires.map((wire) => {
    if (wire.role === 'cable') {
      const owner = cableOwner(wire.id, partIds)
      return { ...wire, emphasis: owner ? emphasisByPart.get(owner) ?? wire.emphasis : wire.emphasis }
    }
    const jumper = jumperById.get(wire.id)
    return jumper ? { ...wire, emphasis: wireEmphasis(layout, jumper, active, prior) } : { ...wire }
  })
  const scene: PhysicalScene = { ...routed.scene, holes, parts, wires }
  return frame ? applyAssemblyFrame(scene, frame) : scene
}

function cableOwner(wireId: string, parts: ReadonlySet<string>) {
  for (const id of parts) {
    if (wireId.startsWith(`${id}-`)) {
      return id
    }
  }
  return null
}

export function applyAssemblyFrame(scene: PhysicalScene, frame: AssemblyFrame): PhysicalScene {
  return {
    ...scene,
    parts: scene.parts
      .filter((part) => frame.installedParts.has(part.id))
      .map((part) => ({ ...part, emphasis: frame.newParts.has(part.id) ? 'active' : 'prior' }) as ScenePart),
    wires: scene.wires
      .filter((wire) => (wire.role === 'cable' ? cableOwner(wire.id, frame.installedParts) != null : frame.installedJumpers.has(wire.id)))
      .map((wire) => {
        const owner = wire.role === 'cable' ? cableOwner(wire.id, frame.newParts) : null
        const introduced = frame.newJumpers.has(wire.id) || owner != null
        const overview = frame.newJumpers.size === 0 && frame.newParts.size === 0
        return { ...wire, emphasis: introduced || overview ? 'active' : 'prior' }
      }),
  }
}

function holeEmphasis(layout: WiringLayout, hole: BreadboardHole, active: Set<string>, prior: Set<string>): Emphasis {
  if (active.size === 0) {
    return 'active'
  }
  if (endpointMatchesPorts(layout, hole, active) || jumperUsesHole(layout, hole, active)) {
    return 'active'
  }
  if (endpointMatchesPorts(layout, hole, prior) || jumperUsesHole(layout, hole, prior)) {
    return 'prior'
  }
  return 'context'
}

function jumperUsesHole(layout: WiringLayout, hole: BreadboardHole, ports: Set<string>) {
  const physical = layout.physical
  if (!physical) {
    return false
  }
  return physical.jumpers.some((jumper) => {
    if (![jumper.from, jumper.to].some((end) => endpointMatchesPorts(layout, end, ports))) {
      return false
    }
    return [jumper.from, jumper.to].some(
      (end) => !isModule(end) && holeKey(end as BreadboardHole, physical.railSplitAfter) === holeKey(hole, physical.railSplitAfter),
    )
  })
}

function partPoints(part: ScenePart): Point[] {
  if (part.kind === 'resistor') {
    return [part.a, part.b]
  }
  if (part.kind === 'npn') {
    return [part.emitter, part.base, part.collector]
  }
  if (part.kind === 'led') {
    return [part.anode, part.cathode]
  }
  if ('width' in part && 'x' in part) {
    return [
      { x: part.x, y: part.y },
      { x: part.x + part.width, y: part.y + part.height },
      ...part.pins.map((pin) => pin.at),
      ...part.dots,
      ...(part.cable ? [part.cable.from, ...part.cable.leads.map((lead) => lead.at)] : []),
    ]
  }
  if (part.kind === 'rgb-led' || part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick' || part.kind === 'led-matrix') {
    return part.leads.map((lead) => lead.at)
  }
  return []
}

function shiftPart(part: ScenePart, dx: number, dy: number): ScenePart {
  const move = (point: Point) => shiftPoint(point, dx, dy)
  if (part.kind === 'resistor') {
    return { ...part, a: move(part.a), b: move(part.b) }
  }
  if (part.kind === 'npn') {
    return { ...part, emitter: move(part.emitter), base: move(part.base), collector: move(part.collector) }
  }
  if (part.kind === 'led') {
    return { ...part, anode: move(part.anode), cathode: move(part.cathode) }
  }
  if ('width' in part && 'x' in part) {
    return {
      ...part,
      x: part.x + dx,
      y: part.y + dy,
      pins: part.pins.map((pin) => ({ ...pin, at: move(pin.at) })),
      dots: part.dots.map(move),
      cable: part.cable
        ? { from: move(part.cable.from), leads: part.cable.leads.map((lead) => ({ ...lead, at: move(lead.at) })) }
        : undefined,
    }
  }
  if (part.kind === 'rgb-led' || part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick' || part.kind === 'led-matrix') {
    return { ...part, leads: part.leads.map((lead) => ({ ...lead, at: move(lead.at) })) }
  }
  return part
}

function shiftObstacle(item: SceneObstacle, dx: number, dy: number): SceneObstacle {
  if (item.kind === 'rect') {
    return { ...item, x: item.x + dx, y: item.y + dy }
  }
  return { ...item, x1: item.x1 + dx, y1: item.y1 + dy, x2: item.x2 + dx, y2: item.y2 + dy }
}

function translatePath(path: string, dx: number, dy: number) {
  const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  let index = 0
  return path.replace(/-?\d+(\.\d+)?/g, () => {
    const value = numbers[index] ?? 0
    const shifted = index % 2 === 0 ? value + dx : value + dy
    index += 1
    return String(Math.round(shifted * 10) / 10)
  })
}

export function physicalSceneSize(layout: WiringLayout) {
  const scene = buildPhysicalScene(layout)
  return { width: scene?.width ?? PHYSICAL_BOARD_WIDTH, height: scene?.height ?? physicalBoardHeight(layout.physical?.rows ?? 1) }
}
