import type { PhysicalEndpoint, WiringLayout } from '../constants/wiring-diagrams/types.ts'
import { physicalElectricalGroups } from './breadboard-layout.ts'
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
import { ledArrowBox, npnDrawing, RGB_DIODE_WIDTH } from './schematic-symbols.ts'
import { connectionKey } from './wiring-diagram.ts'

/**
 * Schematic sheets for Projects 8, 18, 23, 24, and 25. Placement is authored.
 * Connectivity comes only from buildSchematicNetlist. Other projects still use
 * the existing schematic figure.
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

export type SchematicSymbolKind = 'block' | 'resistor' | 'led' | 'rgb-led' | 'npn' | 'buzzer' | 'servo' | 'connector' | 'power' | 'ground'

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

type SchematicProject = {
  slug: string
  templates: SymbolTemplate[]
  placed: Record<string, Point>
  powerLabels: Record<string, string>
}

const MOTION: SchematicProject = {
  slug: '8',
  templates: TEMPLATES,
  placed: PLACED,
  powerLabels: {},
}

const SERVO_TEMPLATES: SymbolTemplate[] = [
  {
    componentId: 'arduino',
    kind: 'block',
    ref: 'U1',
    value: 'Uno R3',
    width: 168,
    height: 440,
    pins: [
      { portId: '5v', label: '5V', x: 84, y: 0, side: 'up' },
      { portId: 'a0', label: 'A0', x: 168, y: 48, side: 'right' },
      { portId: 'a1', label: 'A1', x: 168, y: 104, side: 'right' },
      { portId: 'd2', label: 'D2', x: 168, y: 160, side: 'right' },
      { portId: 'd9', label: 'D9', x: 168, y: 232, side: 'right' },
      { portId: 'd10', label: 'D10', x: 168, y: 384, side: 'right' },
      { portId: 'gnd', label: 'GND', x: 84, y: 440, side: 'down' },
    ],
  },
  {
    componentId: 'joystick',
    kind: 'block',
    ref: 'U2',
    value: 'KY-023',
    width: 156,
    height: 176,
    pins: [
      { portId: '5v', label: '+5V', x: 78, y: 0, side: 'up' },
      { portId: 'vrx', label: 'VRx', x: 0, y: 48, side: 'left' },
      { portId: 'vry', label: 'VRy', x: 0, y: 104, side: 'left' },
      { portId: 'sw', label: 'SW', x: 0, y: 160, side: 'left' },
      { portId: 'gnd', label: 'GND', x: 78, y: 176, side: 'down' },
    ],
  },
  {
    componentId: 'psu',
    kind: 'connector',
    ref: 'J1',
    value: '2.1 mm jack',
    width: 148,
    height: 80,
    pins: [
      { portId: '5v', label: '+', x: 74, y: 0, side: 'up' },
      { portId: 'gnd', label: '−', x: 74, y: 80, side: 'down' },
    ],
  },
  {
    componentId: 'pan',
    kind: 'servo',
    ref: 'M1',
    value: 'Pan',
    width: 156,
    height: 88,
    pins: [
      { portId: 'sig', label: 'SIG', x: 0, y: 40, side: 'left' },
      { portId: 'vcc', label: 'VCC', x: 156, y: 24, side: 'right' },
      { portId: 'gnd', label: 'GND', x: 78, y: 88, side: 'down' },
    ],
  },
  {
    componentId: 'tilt',
    kind: 'servo',
    ref: 'M2',
    value: 'Tilt',
    width: 156,
    height: 88,
    pins: [
      { portId: 'sig', label: 'SIG', x: 0, y: 40, side: 'left' },
      { portId: 'vcc', label: 'VCC', x: 156, y: 24, side: 'right' },
      { portId: 'gnd', label: 'GND', x: 78, y: 88, side: 'down' },
    ],
  },
]

const SERVO_PLACED: Record<string, Point> = {
  arduino: { x: 20, y: 64 },
  joystick: { x: 248, y: 64 },
  psu: { x: 460, y: 56 },
  pan: { x: 460, y: 256 },
  tilt: { x: 460, y: 408 },
}

const SERVO: SchematicProject = {
  slug: '18',
  templates: SERVO_TEMPLATES,
  placed: SERVO_PLACED,
  powerLabels: {
    'arduino:5v': '+5V_LOGIC',
    'psu:5v': '+5V_SERVO',
  },
}

const WEATHER_TEMPLATES: SymbolTemplate[] = [
  {
    componentId: 'esp32',
    kind: 'block',
    ref: 'U1',
    value: 'ESP32-DevKitC V4',
    width: 220,
    height: 144,
    pins: [
      { portId: '3v3', label: '3V3', x: 110, y: 0, side: 'up' },
      { portId: 'io21', label: 'IO21', x: 220, y: 36, side: 'right' },
      { portId: 'io22', label: 'IO22', x: 220, y: 108, side: 'right' },
      { portId: 'gnd', label: 'GND', x: 110, y: 144, side: 'down' },
    ],
  },
  {
    componentId: 'bme280',
    kind: 'block',
    ref: 'U2',
    value: 'BME280',
    width: 156,
    height: 144,
    pins: [
      { portId: 'vin', label: 'Vin', x: 78, y: 0, side: 'up' },
      { portId: 'sdi', label: 'SDI', x: 0, y: 36, side: 'left' },
      { portId: 'sck', label: 'SCK', x: 0, y: 108, side: 'left' },
      { portId: 'gnd', label: 'GND', x: 78, y: 144, side: 'down' },
    ],
  },
]

const WEATHER_PLACED: Record<string, Point> = {
  esp32: { x: 16, y: 56 },
  bme280: { x: 308, y: 56 },
}

const WEATHER: SchematicProject = {
  slug: '23',
  templates: WEATHER_TEMPLATES,
  placed: WEATHER_PLACED,
  powerLabels: {},
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
  return buildProjectSchematic(MOTION, input)
}

export function buildServoSchematic(input: {
  layout: WiringLayout
  connections: readonly StepConnection[]
  priorConnections?: readonly StepConnection[]
  installedPartIds: readonly string[]
  installedJumperIds: readonly string[]
}): SchematicSheet {
  return buildProjectSchematic(SERVO, input)
}

export function buildWeatherSchematic(input: {
  layout: WiringLayout
  connections: readonly StepConnection[]
  priorConnections?: readonly StepConnection[]
  installedPartIds: readonly string[]
  installedJumperIds: readonly string[]
}): SchematicSheet {
  return buildProjectSchematic(WEATHER, input)
}

const NPN = npnDrawing()
const RGB_PITCH = 176
const RGB_RED_BASE = 188
const RGB_ESP_X = 20
const RGB_ESP_Y = 64
const RGB_ESP_W = 224
const RGB_BASE_X = 288
const RGB_Q_X = 396
const RGB_LIMIT_X = RGB_Q_X + NPN.collector.x + 36
const RGB_LED_X = RGB_LIMIT_X + 72 + 32
const RGB_CATHODE_Y = 40

function rgbChannel(index: number): { base: number; collector: number } {
  const base = RGB_RED_BASE + index * RGB_PITCH
  return { base, collector: base - NPN.base.y }
}

function rgbResistor(componentId: string, ref: string, ohms: string): SymbolTemplate {
  return {
    componentId,
    kind: 'resistor',
    ref,
    value: ohms,
    width: 72,
    height: 16,
    pins: [
      { portId: 'leg1', label: '', x: 0, y: 8, side: 'left' },
      { portId: 'leg2', label: '', x: 72, y: 8, side: 'right' },
    ],
  }
}

function rgbTransistor(componentId: string, ref: string): SymbolTemplate {
  return {
    componentId,
    kind: 'npn',
    ref,
    value: 'NPN',
    width: NPN.width,
    height: NPN.height,
    pins: [
      { portId: 'base', label: 'B', x: NPN.base.x, y: NPN.base.y, side: 'left' },
      { portId: 'collector', label: 'C', x: NPN.collector.x, y: NPN.collector.y, side: 'up' },
      { portId: 'emitter', label: 'E', x: NPN.emitter.x, y: NPN.emitter.y, side: 'down' },
    ],
  }
}

const RGB_CHANNELS = [
  { colour: 'red', gpio: 'io25', label: 'IO25', index: 0, baseRef: 'R1', limitRef: 'R2', transistor: 'Q1' },
  { colour: 'green', gpio: 'io26', label: 'IO26', index: 1, baseRef: 'R3', limitRef: 'R4', transistor: 'Q2' },
  { colour: 'blue', gpio: 'io27', label: 'IO27', index: 2, baseRef: 'R5', limitRef: 'R6', transistor: 'Q3' },
] as const

const RGB_TEMPLATES: SymbolTemplate[] = [
  {
    componentId: 'esp32',
    kind: 'block',
    ref: 'U1',
    value: 'ESP32-DevKitC V4',
    width: RGB_ESP_W,
    height: rgbChannel(2).base + 56 - RGB_ESP_Y,
    pins: [
      { portId: 'v5', label: '5V', x: RGB_ESP_W / 2, y: 0, side: 'up' },
      ...RGB_CHANNELS.map((channel) => ({
        portId: channel.gpio,
        label: channel.label,
        x: RGB_ESP_W,
        y: rgbChannel(channel.index).base - RGB_ESP_Y,
        side: 'right' as const,
      })),
      { portId: 'gnd', label: 'GND', x: RGB_ESP_W / 2, y: rgbChannel(2).base + 56 - RGB_ESP_Y, side: 'down' },
    ],
  },
  ...RGB_CHANNELS.flatMap((channel) => [
    rgbResistor(`base-${channel.colour}`, channel.baseRef, '1 kΩ'),
    rgbTransistor(`q-${channel.colour}`, channel.transistor),
    rgbResistor(`limit-${channel.colour}`, channel.limitRef, '220 Ω'),
  ]),
  {
    componentId: 'led',
    kind: 'rgb-led',
    ref: 'D1',
    value: 'RGB',
    width: RGB_DIODE_WIDTH,
    height: RGB_CATHODE_Y + (RGB_CHANNELS.length - 1) * RGB_PITCH + 36,
    pins: [
      { portId: 'anode', label: 'A', x: RGB_DIODE_WIDTH, y: 0, side: 'up' },
      { portId: 'red', label: 'R', x: 0, y: RGB_CATHODE_Y, side: 'left' },
      { portId: 'green', label: 'G', x: 0, y: RGB_CATHODE_Y + RGB_PITCH, side: 'left' },
      { portId: 'blue', label: 'B', x: 0, y: RGB_CATHODE_Y + 2 * RGB_PITCH, side: 'left' },
    ],
  },
]

const RGB_PLACED: Record<string, Point> = {
  esp32: { x: RGB_ESP_X, y: RGB_ESP_Y },
  led: { x: RGB_LED_X, y: rgbChannel(0).collector - RGB_CATHODE_Y },
}
for (const channel of RGB_CHANNELS) {
  const row = rgbChannel(channel.index)
  RGB_PLACED[`base-${channel.colour}`] = { x: RGB_BASE_X, y: row.base - 8 }
  RGB_PLACED[`q-${channel.colour}`] = { x: RGB_Q_X, y: row.base - NPN.base.y }
  RGB_PLACED[`limit-${channel.colour}`] = { x: RGB_LIMIT_X, y: row.collector - 8 }
}

const RGB: SchematicProject = {
  slug: '24',
  templates: RGB_TEMPLATES,
  placed: RGB_PLACED,
  powerLabels: {},
}

export function buildRgbSchematic(input: {
  layout: WiringLayout
  connections: readonly StepConnection[]
  priorConnections?: readonly StepConnection[]
  installedPartIds: readonly string[]
  installedJumperIds: readonly string[]
}): SchematicSheet {
  return buildProjectSchematic(RGB, input)
}

const MAZE_UNO_X = 20
const MAZE_UNO_Y = 64
const MAZE_UNO_W = 168
const MAZE_MOD_X = 292
const MAZE_MAT_W = 208
const MAZE_MAT_H = 208
const MAZE_JOY_W = 156
const MAZE_JOY_H = 176
const MAZE_JOY_Y = 392
const MAZE_UNO_H = MAZE_JOY_Y + 160 - MAZE_UNO_Y + 56

const MAZE_TEMPLATES: SymbolTemplate[] = [
  {
    componentId: 'arduino',
    kind: 'block',
    ref: 'U1',
    value: 'Uno R3',
    width: MAZE_UNO_W,
    height: MAZE_UNO_H,
    pins: [
      { portId: '5v', label: '5V', x: MAZE_UNO_W / 2, y: 0, side: 'up' },
      { portId: 'd13', label: 'D13', x: MAZE_UNO_W, y: 48, side: 'right' },
      { portId: 'd10', label: 'D10', x: MAZE_UNO_W, y: 104, side: 'right' },
      { portId: 'd11', label: 'D11', x: MAZE_UNO_W, y: 160, side: 'right' },
      { portId: 'a0', label: 'A0', x: MAZE_UNO_W, y: MAZE_JOY_Y + 48 - MAZE_UNO_Y, side: 'right' },
      { portId: 'a1', label: 'A1', x: MAZE_UNO_W, y: MAZE_JOY_Y + 104 - MAZE_UNO_Y, side: 'right' },
      { portId: 'd2', label: 'D2', x: MAZE_UNO_W, y: MAZE_JOY_Y + 160 - MAZE_UNO_Y, side: 'right' },
      { portId: 'gnd', label: 'GND', x: MAZE_UNO_W / 2, y: MAZE_UNO_H, side: 'down' },
    ],
  },
  {
    componentId: 'matrix',
    kind: 'block',
    ref: 'U2',
    value: 'FC-16 MAX7219 8×8',
    width: MAZE_MAT_W,
    height: MAZE_MAT_H,
    pins: [
      { portId: 'vcc', label: 'VCC', x: MAZE_MAT_W / 2, y: 0, side: 'up' },
      { portId: 'clk', label: 'CLK', x: 0, y: 48, side: 'left' },
      { portId: 'cs', label: 'CS', x: 0, y: 104, side: 'left' },
      { portId: 'din', label: 'DIN', x: 0, y: 160, side: 'left' },
      { portId: 'gnd', label: 'GND', x: MAZE_MAT_W / 2, y: MAZE_MAT_H, side: 'down' },
    ],
  },
  {
    componentId: 'joystick',
    kind: 'block',
    ref: 'U3',
    value: 'KY-023',
    width: MAZE_JOY_W,
    height: MAZE_JOY_H,
    pins: [
      { portId: 'vcc', label: '+5V', x: MAZE_JOY_W / 2, y: 0, side: 'up' },
      { portId: 'vrx', label: 'VRx', x: 0, y: 48, side: 'left' },
      { portId: 'vry', label: 'VRy', x: 0, y: 104, side: 'left' },
      { portId: 'sw', label: 'SW', x: 0, y: 160, side: 'left' },
      { portId: 'gnd', label: 'GND', x: MAZE_JOY_W / 2, y: MAZE_JOY_H, side: 'down' },
    ],
  },
]

const MAZE_PLACED: Record<string, Point> = {
  arduino: { x: MAZE_UNO_X, y: MAZE_UNO_Y },
  matrix: { x: MAZE_MOD_X, y: MAZE_UNO_Y },
  joystick: { x: MAZE_MOD_X, y: MAZE_JOY_Y },
}

const MAZE: SchematicProject = {
  slug: '25',
  templates: MAZE_TEMPLATES,
  placed: MAZE_PLACED,
  powerLabels: {},
}

export function buildMazeSchematic(input: {
  layout: WiringLayout
  connections: readonly StepConnection[]
  priorConnections?: readonly StepConnection[]
  installedPartIds: readonly string[]
  installedJumperIds: readonly string[]
}): SchematicSheet {
  return buildProjectSchematic(MAZE, input)
}

function buildProjectSchematic(project: SchematicProject, input: {
  layout: WiringLayout
  connections: readonly StepConnection[]
  priorConnections?: readonly StepConnection[]
  installedPartIds: readonly string[]
  installedJumperIds: readonly string[]
}): SchematicSheet {
  if (input.layout.slug !== project.slug) {
    return { ...EMPTY, issues: [{ code: 'unsupported-project', message: `This schematic sheet is only built for project ${project.slug}.` }] }
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
  const placed = placedPinKeys(scoped)
  if (probed.links.length !== visible.length) {
    return {
      ...EMPTY,
      issues: [{ code: 'unresolved-link', message: 'A listed connection could not be matched to its pins.' }],
    }
  }
  // A connections table can preview the finished pin map before those jumpers
  // exist. Only rows whose pins are on the assembled board are drawn.
  const wired = visible.filter((_, index) => {
    const link = probed.links[index]
    return link != null && placed.has(pinKey(link.from)) && placed.has(pinKey(link.to))
  })
  const netlist = buildSchematicNetlist(scoped, wired)
  if (netlist.issues.length > 0) {
    return { ...EMPTY, issues: netlist.issues.map(diagnostic) }
  }

  const installed = new Set(input.installedPartIds)
  const symbols = project.templates.filter((template) => installed.has(template.componentId)).map((template) =>
    placeSymbol(template, netlist, project.placed),
  )
  const missing = missingPins(symbols, netlist, installed)
  if (missing.length > 0) {
    return { ...EMPTY, issues: missing }
  }

  const boxes = symbols.map(symbolBox)
  const led = symbols.find((item) => item.kind === 'led')
  if (led) {
    const center = led.pins.find((pin) => pin.portId === 'anode')
    if (center) {
      boxes.push(ledArrowBox({ x: led.x, y: led.y }, led.width, center.y - led.y))
    }
  }
  for (const rgb of symbols.filter((item) => item.kind === 'rgb-led')) {
    for (const pin of rgb.pins) {
      if (pin.portId === 'anode') {
        continue
      }
      boxes.push(ledArrowBox({ x: pin.x, y: rgb.y }, RGB_DIODE_WIDTH, pin.y - rgb.y, true))
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
      const supply = supplySymbol(pin, net, netlist, anchor, run.approach, project)
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

function placedPinKeys(layout: WiringLayout): Set<string> {
  const keys = new Set<string>()
  for (const members of physicalElectricalGroups(layout).values()) {
    for (const member of members) {
      keys.add(member)
    }
  }
  return keys
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
      leads: physical.leads.filter((lead) => installedParts.has(lead.elementId) && connectedPins.has(`${lead.elementId}:${lead.portId}`)),
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

function placeSymbol(template: SymbolTemplate, netlist: SchematicNetlist, placed: Record<string, Point>): SchematicSymbol {
  const origin = placed[template.componentId]
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
  if ((pin.componentId === 'pan' || pin.componentId === 'tilt') && pin.portId === 'vcc') {
    const bend = { x: pin.x + 36, y: pin.y }
    return { points: [pointOf(pin), bend, { x: bend.x, y: pin.y - 48 }], approach: 'up' }
  }
  return { points: [pointOf(pin), step(pin, pin.side, STUB)], approach: pin.side }
}

function supplySymbol(pin: SchematicPin, net: ElectricalNet, netlist: SchematicNetlist, anchor: Point, approach: PinSide, project: SchematicProject): SchematicSymbol {
  const power = net.kind === 'power'
  const text = power ? powerCaption(net, netlist, project) : groundCaption(net, netlist, project)
  const width = power ? Math.max(52, text.length * 8) : 36
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

function powerCaption(net: ElectricalNet, netlist: SchematicNetlist, project: SchematicProject): string {
  const source = net.sources[0]
  const named = source ? project.powerLabels[`${source.componentId}:${source.portId}`] : undefined
  if (named) {
    return named
  }
  const volts = source?.portId === '3v3' ? '+3.3V' : '+5V'
  const matches = netlist.nets.filter((item) => item.kind === 'power' && (item.sources[0]?.portId === '3v3' ? '+3.3V' : '+5V') === volts)
  if (matches.length < 2 || !source) {
    return volts
  }
  const ref = project.templates.find((item) => item.componentId === source.componentId)?.ref
  return `${volts} ${ref ?? source.componentId}`
}

function groundCaption(net: ElectricalNet, netlist: SchematicNetlist, project: SchematicProject): string {
  const grounds = netlist.nets.filter((item) => item.kind === 'ground')
  if (grounds.length < 2) {
    return 'GND'
  }
  const source = net.members.find((member) => member.portId === 'gnd')
  const ref = source ? project.templates.find((item) => item.componentId === source.componentId)?.ref : null
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
    if (symbol.kind === 'npn' && symbol.ref) {
      labels.push({ x: symbol.x + symbol.width + 6, y: symbol.y + symbol.height / 2 - 8, width: 28, height: 16, text: symbol.ref })
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
