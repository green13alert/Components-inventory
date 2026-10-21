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
}

export type SceneLead = { portId: string; label: string; at: Point; color: string }

export type ScenePart =
  | { kind: 'resistor'; id: string; label: string; ohms?: number; a: Point; b: Point; emphasis: Emphasis }
  | { kind: 'npn'; id: string; label: string; emitter: Point; base: Point; collector: Point; emphasis: Emphasis }
  | { kind: 'led'; id: string; label: string; anode: Point; cathode: Point; emphasis: Emphasis }
  | { kind: 'rgb-led'; id: string; label: string; leads: SceneLead[]; emphasis: Emphasis }
  | { kind: 'pir' | 'buzzer' | 'joystick'; id: string; label: string; leads: SceneLead[]; emphasis: Emphasis }
  | {
      kind: 'esp32' | 'uno' | 'servo' | 'psu' | 'bme280'
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

function isModule(endpoint: PhysicalEndpoint) {
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
  if (/d2|out|vrx|vry|sw/.test(id)) {
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

function departX(point: Point, obstacles: SceneObstacle[], lane: number) {
  const host = obstacles.find((item) => item.kind === 'rect' && pointHits(point, item))
  if (!host || host.kind !== 'rect') {
    return point.x
  }
  const spread = (lane % 4) * 5
  const nearerLeft = point.x - host.x <= host.x + host.width - point.x
  return nearerLeft ? host.x - 16 - spread : host.x + host.width + 16 + spread
}

function approachX(point: Point, obstacles: SceneObstacle[], lane: number) {
  const host = obstacles.find((item) => item.kind === 'rect' && pointHits(point, item))
  if (host) {
    return departX(point, obstacles, lane)
  }
  const stagger = (lane % 3) * 4
  if (point.x < 28) {
    return 2 - stagger
  }
  if (point.x < 100) {
    return 49 + stagger
  }
  if (point.x > 240) {
    return 330 + stagger
  }
  if (point.x > 200) {
    return 236 + stagger
  }
  return point.x
}

function floorChannel(from: Point, to: Point, obstacles: SceneObstacle[], lane: number) {
  let maxY = Math.max(from.y, to.y)
  for (const item of obstacles) {
    maxY = Math.max(maxY, item.kind === 'rect' ? item.y + item.height : Math.max(item.y1, item.y2) + item.radius)
  }
  const floor = maxY + 22 + lane * 14
  const fromX = approachX(from, obstacles, lane)
  const toX = approachX(to, obstacles, lane + 1)
  return `M ${from.x} ${from.y} L ${fromX} ${from.y} L ${fromX} ${floor} L ${toX} ${floor} L ${toX} ${to.y} L ${to.x} ${to.y}`
}

function crossesBody(from: Point, to: Point, obstacles: SceneObstacle[], selfId: string) {
  for (let step = 1; step < 8; step += 1) {
    const t = step / 8
    const point = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
    if (obstacles.some((item) => item.id !== selfId && pointHits(point, item))) {
      return true
    }
  }
  return false
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

function gutterPath(from: Point, to: Point, obstacles: SceneObstacle[], lane: number) {
  const fromX = approachX(from, obstacles, lane)
  const toX = approachX(to, obstacles, lane + 1)
  const path = `M ${from.x} ${from.y} L ${fromX} ${from.y} L ${fromX} ${to.y} L ${toX} ${to.y} L ${to.x} ${to.y}`
  return pathHitsBodies(path, from, to, obstacles) ? null : path
}

function routeWire(from: Point, to: Point, id: string, obstacles: SceneObstacle[], lane: number): string {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  const insideBoard = (point: Point) => obstacles.some((item) => item.kind === 'rect' && pointHits(point, item))
  const alongTop = from.y < 70 && to.y < 70 && Math.abs(from.x - to.x) > 80 && !insideBoard(from) && !insideBoard(to)
  if (alongTop) {
    const lift = Math.min(from.y, to.y) - 28
    return `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${lift} ${to.x} ${to.y}`
  }
  const gutter = gutterPath(from, to, obstacles, lane)
  if (gutter) {
    return gutter
  }
  const sameColumn = Math.abs(from.x - to.x) < 20
  const long = !sameColumn && (distance > 150 || /cathode|bridge/.test(id))
  if (long || crossesBody(from, to, obstacles, id)) {
    return floorChannel(from, to, obstacles, lane)
  }
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = distance || 1
  const bow = (length > 70 ? 26 : 14) * (lane % 2 === 0 ? 1 : -1)
  const mx = (from.x + to.x) / 2 + (-dy / length) * bow
  const my = (from.y + to.y) / 2 + (dx / length) * bow
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
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
  const physical = layout.physical
  if (!physical) {
    return null
  }
  const active = activePortIds(layout, connections)
  const prior = activePortIds(layout, priorConnections)
  const height = physicalBoardHeight(physical.rows)
  const captions = railCaptions(layout)
  const rawHoles: { at: Point; radius: number; rail: boolean; emphasis: Emphasis; label?: string }[] = []
  for (let row = 1; row <= physical.rows; row += 1) {
    for (const column of COLUMNS) {
      const hole: BreadboardHole = { kind: 'strip', column, row }
      rawHoles.push({ at: holePosition(hole), radius: 2.2, rail: false, emphasis: holeEmphasis(layout, hole, active, prior) })
    }
    for (const side of ['left', 'right'] as const) {
      for (const polarity of ['plus', 'minus'] as const) {
        const hole: BreadboardHole = { kind: 'rail', side, polarity, row }
        rawHoles.push({ at: holePosition(hole), radius: 2, rail: true, emphasis: holeEmphasis(layout, hole, active, prior) })
      }
    }
  }

  const obstacles: SceneObstacle[] = []
  const parts: ScenePart[] = []
  for (const element of layout.elements) {
    const leads = physical.leads.filter((lead) => lead.elementId === element.id)
    const keys = leads.map((lead) => `${lead.elementId}:${lead.portId}`)
    const emphasis = partEmphasis(keys, active, prior)
    if (element.kind === 'resistor' && leads.length === 2) {
      const a = holePosition(leads[0].hole)
      const b = holePosition(leads[1].hole)
      parts.push({ kind: 'resistor', id: element.id, label: element.label, ohms: element.resistorOhms, a, b, emphasis })
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
        const top = Math.min(emitter.y, base.y, collector.y)
        const bottom = Math.max(emitter.y, base.y, collector.y)
        obstacles.push({ id: element.id, kind: 'rect', x: emitter.x - 30, y: top - 6, width: 24, height: bottom - top + 12 })
      }
    } else if (element.kind === 'led' && leads.length === 2) {
      const anode = leadPoint(layout, element.id, 'anode')
      const cathode = leadPoint(layout, element.id, 'cathode')
      if (anode && cathode) {
        parts.push({ kind: 'led', id: element.id, label: element.label, anode, cathode, emphasis })
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
        const mid = drawn.reduce((sum, lead) => sum + lead.at.y, 0) / drawn.length
        obstacles.push({ id: element.id, kind: 'rect', x: drawn[0].at.x - 34, y: mid - 16, width: 28, height: 32 })
      }
    } else if ((element.kind === 'pir' || element.kind === 'buzzer' || element.kind === 'joystick') && leads.length > 0) {
      const drawn = leads.map((lead) => ({
        portId: lead.portId,
        label: portLabel(element, lead.portId),
        at: holePosition(lead.hole),
        color: leadColor(lead.portId),
      }))
      parts.push({ kind: element.kind, id: element.id, label: element.label, leads: drawn, emphasis })
      const top = Math.min(...drawn.map((lead) => lead.at.y))
      const left = drawn[0].at.x + 10
      obstacles.push({ id: element.id, kind: 'rect', x: left, y: top - 8, width: element.kind === 'joystick' ? 70 : 58, height: drawn.length * BREADBOARD_PITCH + 8 })
    }
  }

  for (const frame of physical.modules ?? []) {
    const element = layout.elements.find((item) => item.id === frame.elementId)
    const kind = element?.kind
    if (kind !== 'esp32-devkit' && kind !== 'arduino-uno' && kind !== 'servo' && kind !== 'breadboard-psu' && kind !== 'dc-jack' && kind !== 'bme280') {
      continue
    }
    const mapped = kind === 'esp32-devkit' ? 'esp32' : kind === 'arduino-uno' ? 'uno' : kind === 'breadboard-psu' || kind === 'dc-jack' ? 'psu' : kind
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
    const emphasis = partEmphasis([...pinKeys, ...cableLeads.map((lead) => `${frame.elementId}:${lead.portId}`)], active, prior)
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
    obstacles.push({ id: frame.elementId, kind: 'rect', x: frame.x, y: frame.y, width: frame.width, height: frame.height })
  }

  const wires: SceneWire[] = []
  let lane = 0
  const addWire = (wire: Omit<SceneWire, 'd'> & { id: string }) => {
    const long = Math.hypot(wire.to.x - wire.from.x, wire.to.y - wire.from.y) > 150 || /cathode/.test(wire.id)
    wires.push({ ...wire, d: routeWire(wire.from, wire.to, wire.id, obstacles, long ? lane++ : lane) })
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
    })
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
      })
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
        return { ...wire, emphasis: introduced ? 'active' : 'prior' }
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
  if (part.kind === 'rgb-led' || part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick') {
    return part.leads.map((lead) => lead.at)
  }
  if (part.kind === 'esp32' || part.kind === 'uno' || part.kind === 'servo' || part.kind === 'psu' || part.kind === 'bme280') {
    return [
      { x: part.x, y: part.y },
      { x: part.x + part.width, y: part.y + part.height },
      ...part.pins.map((pin) => pin.at),
      ...part.dots,
      ...(part.cable ? [part.cable.from, ...part.cable.leads.map((lead) => lead.at)] : []),
    ]
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
  if (part.kind === 'rgb-led' || part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick') {
    return { ...part, leads: part.leads.map((lead) => ({ ...lead, at: move(lead.at) })) }
  }
  if (part.kind === 'esp32' || part.kind === 'uno' || part.kind === 'servo' || part.kind === 'psu' || part.kind === 'bme280') {
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
