import type { PhysicalEndpoint, WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { StepConnection } from '../constants/walkthrough-content.ts'
import {
  boxesOverlap,
  junctionsFromWires,
  segmentHitsBox,
  segmentHitsLabel,
  segmentIntersection,
  segmentsOf,
  type Box,
  type Point,
  type SchematicJunction,
} from './schematic-geometry.ts'
import { buildSchematicNetlist, netByMember, pinKey, type ElectricalNet, type SchematicNetlist } from './schematic-nets.ts'
import { ledArrowBox } from './schematic-symbols.ts'
import { connectionKey } from './wiring-diagram.ts'

/**
 * Project 8 schematic sheet. Placement is authored. Connectivity comes only from
 * buildSchematicNetlist. Other projects still use the existing schematic figure.
 */

export type PinSide = 'left' | 'right' | 'up' | 'down'

export type SchematicPin = {
  componentId: string
  portId: string
  label: string
  x: number
  y: number
  side: PinSide
  netId: string | null
}

export type SchematicSymbolKind = 'block' | 'resistor' | 'led' | 'buzzer' | 'power' | 'ground'

export type SchematicSymbol = {
  id: string
  kind: SchematicSymbolKind
  x: number
  y: number
  width: number
  height: number
  ref: string
  value: string
  pins: SchematicPin[]
  netId: string | null
  anchor: Point | null
}

export type SchematicWire = {
  netId: string
  netName: string
  points: Point[]
}

export type SchematicLabel = Box & { text: string }

export type SchematicDiagnostic = {
  code: string
  message: string
}

export type SchematicSheet = {
  width: number
  height: number
  symbols: SchematicSymbol[]
  wires: SchematicWire[]
  junctions: SchematicJunction[]
  labels: SchematicLabel[]
  verified: boolean
  issues: SchematicDiagnostic[]
}

type LocalPin = {
  portId: string
  label: string
  x: number
  y: number
  side: PinSide
}

type SymbolTemplate = {
  componentId: string
  kind: Exclude<SchematicSymbolKind, 'power' | 'ground'>
  ref: string
  value: string
  width: number
  height: number
  pins: LocalPin[]
}

const STUB = 28

const TEMPLATES: SymbolTemplate[] = [
  {
    componentId: 'arduino',
    kind: 'block',
    ref: 'U1',
    value: 'Uno R3',
    width: 152,
    height: 280,
    pins: [
      { portId: '5v', label: '5V', x: 76, y: 0, side: 'up' },
      { portId: 'd2', label: 'D2', x: 152, y: 48, side: 'right' },
      { portId: 'd8', label: 'D8', x: 152, y: 164, side: 'right' },
      { portId: 'd9', label: 'D9', x: 152, y: 240, side: 'right' },
      { portId: 'gnd', label: 'GND', x: 76, y: 280, side: 'down' },
    ],
  },
  {
    componentId: 'pir',
    kind: 'block',
    ref: 'U2',
    value: 'PIR',
    width: 128,
    height: 72,
    pins: [
      { portId: 'vcc', label: 'VCC', x: 64, y: 0, side: 'up' },
      { portId: 'out', label: 'OUT', x: 0, y: 48, side: 'left' },
      { portId: 'gnd', label: 'GND', x: 64, y: 72, side: 'down' },
    ],
  },
  {
    componentId: 'resistor',
    kind: 'resistor',
    ref: 'R1',
    value: '220 Ω',
    width: 72,
    height: 16,
    pins: [
      { portId: 'leg1', label: '', x: 0, y: 8, side: 'left' },
      { portId: 'leg2', label: '', x: 72, y: 8, side: 'right' },
    ],
  },
  {
    componentId: 'led',
    kind: 'led',
    ref: 'D1',
    value: 'LED',
    width: 72,
    height: 46,
    pins: [
      { portId: 'anode', label: 'A', x: 0, y: 18, side: 'left' },
      { portId: 'cathode', label: 'K', x: 72, y: 18, side: 'right' },
    ],
  },
  {
    componentId: 'buzzer',
    kind: 'buzzer',
    ref: 'BZ1',
    value: 'Active',
    width: 136,
    height: 80,
    pins: [
      { portId: 'sig', label: 'I/O', x: 0, y: 20, side: 'left' },
      { portId: 'vcc', label: 'VCC', x: 136, y: 20, side: 'right' },
      { portId: 'gnd', label: 'GND', x: 68, y: 80, side: 'down' },
    ],
  },
]

const PLACED: Record<string, Point> = {
  arduino: { x: 24, y: 72 },
  pir: { x: 292, y: 72 },
  resistor: { x: 200, y: 228 },
  led: { x: 304, y: 218 },
  buzzer: { x: 292, y: 292 },
}

const EMPTY: SchematicSheet = {
  width: 320,
  height: 160,
  symbols: [],
  wires: [],
  junctions: [],
  labels: [],
  verified: false,
  issues: [],
}

export function buildMotionSchematic(input: {
  layout: WiringLayout
  connections: readonly StepConnection[]
  priorConnections?: readonly StepConnection[]
  installedPartIds: readonly string[]
  installedJumperIds: readonly string[]
}): SchematicSheet {
  if (input.layout.slug !== '8') {
    return { ...EMPTY, issues: [{ code: 'unsupported-project', message: 'This schematic sheet is only built for Project 8.' }] }
  }

  const visible = mergeConnections(input.priorConnections ?? [], input.connections)
  const probed = buildSchematicNetlist(withoutPlacement(input.layout), visible)
  const resolution = probed.issues.filter((issue) =>
    issue.code === 'unknown-component' ||
    issue.code === 'unknown-pin' ||
    issue.code === 'ambiguous-component' ||
    issue.code === 'ambiguous-pin' ||
    issue.code === 'duplicate-port',
  )
  if (resolution.length > 0) {
    return { ...EMPTY, issues: resolution.map(diagnostic) }
  }

  const connectedPins = new Set(probed.links.flatMap((link) => [pinKey(link.from), pinKey(link.to)]))
  const scoped = scopeLayout(input.layout, new Set(input.installedPartIds), new Set(input.installedJumperIds), connectedPins)
  const netlist = buildSchematicNetlist(scoped, visible)
  if (netlist.issues.length > 0) {
    return { ...EMPTY, issues: netlist.issues.map(diagnostic) }
  }

  const installed = new Set(input.installedPartIds)
  const symbols = TEMPLATES.filter((template) => installed.has(template.componentId)).map((template) =>
    placeSymbol(template, netlist),
  )
  const missing = missingPins(symbols, netlist, installed)
  if (missing.length > 0) {
    return { ...EMPTY, issues: missing }
  }

  const boxes = symbols.map(symbolBox)
  const led = symbols.find((item) => item.id === 'led')
  if (led) {
    const center = led.pins.find((pin) => pin.portId === 'anode')
    if (center) {
      boxes.push(ledArrowBox({ x: led.x, y: led.y }, led.width, center.y - led.y))
    }
  }
  const wires: SchematicWire[] = []
  const powerSymbols: SchematicSymbol[] = []
  const issues: SchematicDiagnostic[] = []

  for (const symbol of symbols) {
    for (const pin of symbol.pins) {
      if (!pin.netId) {
        continue
      }
      const net = netlist.nets.find((item) => item.id === pin.netId)
      if (!net || net.kind === 'signal') {
        continue
      }
      const run = supplyRun(pin)
      const anchor = run.points[run.points.length - 1]
      const supply = supplySymbol(pin, net, netlist, anchor, run.approach)
      if (boxes.some((box) => boxesOverlap(symbolBox(supply), box)) || powerSymbols.some((item) => boxesOverlap(symbolBox(supply), symbolBox(item)))) {
        issues.push({ code: 'symbol-overlap', message: `${supply.value} on ${pin.componentId} ${pin.portId} overlaps another symbol.` })
        continue
      }
      if (!pathClear(run.points, boxes)) {
        issues.push({ code: 'wire-blocked', message: `${net.name} from ${pin.componentId} ${pin.portId} enters a symbol.` })
        continue
      }
      powerSymbols.push(supply)
      boxes.push(symbolBox(supply))
      wires.push({ netId: net.id, netName: net.name, points: run.points })
    }
  }

  const signalPins = symbols.flatMap((symbol) => symbol.pins.filter((pin) => pin.netId && netlist.nets.find((net) => net.id === pin.netId)?.kind === 'signal'))
  const byNet = new Map<string, SchematicPin[]>()
  for (const pin of signalPins) {
    const list = byNet.get(pin.netId as string) ?? []
    list.push(pin)
    byNet.set(pin.netId as string, list)
  }
  for (const [netId, pins] of byNet) {
    const net = netlist.nets.find((item) => item.id === netId)
    if (!net) {
      continue
    }
    if (pins.length !== 2) {
      issues.push({
        code: 'unsupported-fanout',
        message: `${net.name} has ${pins.length} drawn signal pins. This sheet routes two-pin signal nets.`,
      })
      continue
    }
    const [from, to] = pins
    const path = routeSignal(from, to, boxes)
    if (!path) {
      issues.push({ code: 'wire-blocked', message: `${net.name} has no orthogonal route that stays outside the symbols.` })
      continue
    }
    wires.push({ netId: net.id, netName: net.name, points: path })
  }

  const labels = outsideLabels([...symbols, ...powerSymbols])
  for (const wire of wires) {
    for (let index = 1; index < wire.points.length; index += 1) {
      const from = wire.points[index - 1]
      const to = wire.points[index]
      for (const label of labels) {
        if (segmentHitsLabel(from, to, label)) {
          issues.push({ code: 'label-overlap', message: `"${label.text}" crosses the ${wire.netName} wire.` })
        }
      }
    }
  }

  const geometry = geometryFaults(wires)
  issues.push(...geometry)
  if (issues.length > 0) {
    return { ...EMPTY, issues }
  }

  const drawn = [...symbols, ...powerSymbols]
  const junctions = junctionsFromWires(wires)
  const size = sheetSize(drawn, labels, wires)
  return {
    width: size.width,
    height: size.height,
    symbols: drawn,
    wires,
    junctions,
    labels,
    verified: true,
    issues: [],
  }
}

export function mergeConnections(prior: readonly StepConnection[], current: readonly StepConnection[]): StepConnection[] {
  const seen = new Set<string>()
  const rows: StepConnection[] = []
  for (const connection of [...prior, ...current]) {
    const key = connectionKey(connection)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    rows.push(connection)
  }
  return rows
}

function diagnostic(issue: { code: string; message: string }): SchematicDiagnostic {
  return { code: issue.code, message: issue.message }
}

function withoutPlacement(layout: WiringLayout): WiringLayout {
  if (!layout.physical) {
    return layout
  }
  return { ...layout, physical: { ...layout.physical, leads: [], jumpers: [] } }
}

function modulePin(endpoint: PhysicalEndpoint): string | null {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return `${endpoint.elementId}:${endpoint.portId}`
  }
  return null
}

function scopeLayout(
  layout: WiringLayout,
  installedParts: Set<string>,
  installedJumpers: Set<string>,
  connectedPins: Set<string>,
): WiringLayout {
  const physical = layout.physical
  if (!physical) {
    return layout
  }
  return {
    ...layout,
    physical: {
      ...physical,
      leads: physical.leads.filter((lead) => installedParts.has(lead.elementId)),
      jumpers: physical.jumpers.filter((jumper) => {
        if (!installedJumpers.has(jumper.id)) {
          return false
        }
        const modules = [modulePin(jumper.from), modulePin(jumper.to)].filter((pin): pin is string => pin != null)
        return modules.every((pin) => connectedPins.has(pin))
      }),
    },
  }
}

function placeSymbol(template: SymbolTemplate, netlist: SchematicNetlist): SchematicSymbol {
  const origin = PLACED[template.componentId]
  return {
    id: template.componentId,
    kind: template.kind,
    x: origin.x,
    y: origin.y,
    width: template.width,
    height: template.height,
    ref: template.ref,
    value: template.value,
    netId: null,
    anchor: null,
    pins: template.pins.map((pin) => {
      const net = netByMember(netlist, template.componentId, pin.portId)
      return {
        componentId: template.componentId,
        portId: pin.portId,
        label: pin.label,
        x: origin.x + pin.x,
        y: origin.y + pin.y,
        side: pin.side,
        netId: net?.id ?? null,
      }
    }),
  }
}

function missingPins(symbols: SchematicSymbol[], netlist: SchematicNetlist, installed: Set<string>): SchematicDiagnostic[] {
  const issues: SchematicDiagnostic[] = []
  for (const net of netlist.nets) {
    for (const member of net.members) {
      if (member.componentId === 'breadboard' || !installed.has(member.componentId)) {
        continue
      }
      const symbol = symbols.find((item) => item.id === member.componentId)
      if (!symbol) {
        issues.push({ code: 'missing-symbol', message: `${member.componentId} is on a net and has no schematic symbol.` })
        continue
      }
      if (!symbol.pins.some((pin) => pin.portId === member.portId)) {
        issues.push({
          code: 'missing-symbol-pin',
          message: `${symbol.ref} has no pin for ${member.componentId} ${member.portId}.`,
        })
      }
    }
  }
  return issues
}

function supplyRun(pin: SchematicPin): { points: Point[]; approach: PinSide } {
  if (pin.componentId === 'led' && pin.portId === 'cathode') {
    const bend = { x: pin.x + 36, y: pin.y }
    return { points: [pointOf(pin), bend, { x: bend.x, y: pin.y + 32 }], approach: 'down' }
  }
  if (pin.componentId === 'buzzer' && pin.portId === 'vcc') {
    const bend = { x: pin.x + 32, y: pin.y }
    return { points: [pointOf(pin), bend, { x: bend.x, y: pin.y - 56 }], approach: 'up' }
  }
  return { points: [pointOf(pin), step(pin, pin.side, STUB)], approach: pin.side }
}

function supplySymbol(pin: SchematicPin, net: ElectricalNet, netlist: SchematicNetlist, anchor: Point, approach: PinSide): SchematicSymbol {
  const power = net.kind === 'power'
  const text = power ? powerCaption(net, netlist) : groundCaption(net, netlist)
  const width = power ? 52 : 36
  const height = power ? 22 : 20
  const box = bodyBeside(anchor, approach, width, height)
  return {
    id: `${power ? 'power' : 'ground'}:${pin.componentId}:${pin.portId}`,
    kind: power ? 'power' : 'ground',
    x: box.x,
    y: box.y,
    width,
    height,
    ref: '',
    value: text,
    pins: [],
    netId: net.id,
    anchor,
  }
}

function powerCaption(net: ElectricalNet, netlist: SchematicNetlist): string {
  const volts = net.sources[0]?.portId === '3v3' ? '+3.3V' : '+5V'
  const matches = netlist.nets.filter((item) => item.kind === 'power' && (item.sources[0]?.portId === '3v3' ? '+3.3V' : '+5V') === volts)
  if (matches.length < 2 || !net.sources[0]) {
    return volts
  }
  const ref = TEMPLATES.find((item) => item.componentId === net.sources[0].componentId)?.ref
  return `${volts} ${ref ?? net.sources[0].componentId}`
}

function groundCaption(net: ElectricalNet, netlist: SchematicNetlist): string {
  const grounds = netlist.nets.filter((item) => item.kind === 'ground')
  if (grounds.length < 2) {
    return 'GND'
  }
  const source = net.members.find((member) => member.portId === 'gnd')
  const ref = source ? TEMPLATES.find((item) => item.componentId === source.componentId)?.ref : null
  return ref ? `GND ${ref}` : 'GND'
}

function bodyBeside(anchor: Point, side: PinSide, width: number, height: number): Point {
  if (side === 'up') {
    return { x: anchor.x - width / 2, y: anchor.y - height }
  }
  if (side === 'down') {
    return { x: anchor.x - width / 2, y: anchor.y }
  }
  if (side === 'right') {
    return { x: anchor.x, y: anchor.y - height / 2 }
  }
  return { x: anchor.x - width, y: anchor.y - height / 2 }
}

function step(pin: Point & { side: PinSide }, side: PinSide, distance: number): Point {
  if (side === 'right') {
    return { x: pin.x + distance, y: pin.y }
  }
  if (side === 'left') {
    return { x: pin.x - distance, y: pin.y }
  }
  if (side === 'up') {
    return { x: pin.x, y: pin.y - distance }
  }
  return { x: pin.x, y: pin.y + distance }
}

function routeSignal(from: SchematicPin, to: SchematicPin, boxes: Box[]): Point[] | null {
  const start = step(from, from.side, STUB)
  const end = step(to, to.side, STUB)
  const candidates = [
    [pointOf(from), pointOf(to)],
    [pointOf(from), start, end, pointOf(to)],
    [pointOf(from), start, { x: end.x, y: start.y }, end, pointOf(to)],
    [pointOf(from), start, { x: start.x, y: end.y }, end, pointOf(to)],
  ]
  for (const candidate of candidates) {
    const path = simplify(candidate)
    if (pathClear(path, boxes)) {
      return path
    }
  }
  return null
}

function pathClear(path: Point[], boxes: Box[]): boolean {
  for (let index = 1; index < path.length; index += 1) {
    if (boxes.some((box) => segmentHitsBox(path[index - 1], path[index], box))) {
      return false
    }
  }
  return true
}

function simplify(points: Point[]): Point[] {
  const cleaned = points.filter((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y)
  const simplified: Point[] = []
  for (const point of cleaned) {
    const previous = simplified[simplified.length - 1]
    const before = simplified[simplified.length - 2]
    if (previous && before && colinear(before, previous, point)) {
      simplified[simplified.length - 1] = point
    } else {
      simplified.push(point)
    }
  }
  return simplified
}

function colinear(a: Point, b: Point, c: Point): boolean {
  return (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)
}

function outsideLabels(symbols: SchematicSymbol[]): SchematicLabel[] {
  const labels: SchematicLabel[] = []
  for (const symbol of symbols) {
    if (symbol.kind === 'resistor' || symbol.kind === 'led') {
      labels.push({ x: symbol.x, y: symbol.y - 18, width: symbol.width, height: 14, text: symbol.ref })
      labels.push({ x: symbol.x, y: symbol.y + symbol.height + 4, width: Math.max(symbol.width, 48), height: 14, text: symbol.value })
    }
    if (symbol.kind === 'block' && symbol.height < 80 && symbol.value) {
      labels.push({ x: symbol.x + symbol.width + 8, y: symbol.y + symbol.height / 2 - 8, width: 40, height: 16, text: symbol.value })
    }
  }
  return labels
}

function geometryFaults(wires: SchematicWire[]): SchematicDiagnostic[] {
  const issues: SchematicDiagnostic[] = []
  const segments = segmentsOf(wires)
  for (let index = 0; index < segments.length; index += 1) {
    for (let other = index + 1; other < segments.length; other += 1) {
      const left = segments[index]
      const right = segments[other]
      const hit = segmentIntersection(left, right)
      if (!hit) {
        continue
      }
      if (left.netId === right.netId) {
        issues.push({ code: 'same-net-cross', message: `${left.netId} crosses itself.` })
      }
    }
    for (const end of [
      { x: segments[index].x1, y: segments[index].y1 },
      { x: segments[index].x2, y: segments[index].y2 },
    ]) {
      for (const other of segments) {
        if (other.netId === segments[index].netId || !onInterior(end, other)) {
          continue
        }
        issues.push({ code: 'nets-touch', message: `${segments[index].netId} meets ${other.netId} at ${end.x},${end.y}.` })
      }
    }
  }
  return issues
}

function onInterior(point: Point, segment: { x1: number; y1: number; x2: number; y2: number }): boolean {
  const cross = (point.y - segment.y1) * (segment.x2 - segment.x1) - (point.x - segment.x1) * (segment.y2 - segment.y1)
  if (Math.abs(cross) > 0.5) {
    return false
  }
  const endpoint =
    (Math.abs(point.x - segment.x1) < 0.01 && Math.abs(point.y - segment.y1) < 0.01) ||
    (Math.abs(point.x - segment.x2) < 0.01 && Math.abs(point.y - segment.y2) < 0.01)
  if (endpoint) {
    return false
  }
  return point.x >= Math.min(segment.x1, segment.x2) && point.x <= Math.max(segment.x1, segment.x2) && point.y >= Math.min(segment.y1, segment.y2) && point.y <= Math.max(segment.y1, segment.y2)
}

function sheetSize(symbols: SchematicSymbol[], labels: SchematicLabel[], wires: SchematicWire[]): { width: number; height: number } {
  let width = 16
  let height = 16
  const grow = (x: number, y: number) => {
    width = Math.max(width, x + 16)
    height = Math.max(height, y + 16)
  }
  for (const symbol of symbols) {
    grow(symbol.x + symbol.width, symbol.y + symbol.height)
  }
  for (const label of labels) {
    grow(label.x + label.width, label.y + label.height)
  }
  for (const wire of wires) {
    for (const point of wire.points) {
      grow(point.x, point.y)
    }
  }
  return { width, height }
}

function symbolBox(symbol: SchematicSymbol): Box {
  return { x: symbol.x, y: symbol.y, width: symbol.width, height: symbol.height }
}

function pointOf(pin: Point): Point {
  return { x: pin.x, y: pin.y }
}
