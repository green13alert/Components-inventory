import type { Box, Point } from './schematic-geometry.ts'

/**
 * KiCad 9.0.7 `Device:LED`, mirrored on X so the anode is on the left.
 * Source coordinates are millimetres with Y up. The cathode bar meets the
 * triangle tip. The two polylines are the library's outward emission arrows.
 * A photodiode uses the same body with the arrows reversed.
 */
const KICAD_LED_ANODE_LEFT = {
  anode: { x: -3.81, y: 0 },
  cathode: { x: 3.81, y: 0 },
  lead: [
    { x: -1.27, y: 0 },
    { x: 1.27, y: 0 },
  ],
  bar: [
    { x: 1.27, y: 1.27 },
    { x: 1.27, y: -1.27 },
  ],
  triangle: [
    { x: -1.27, y: -1.27 },
    { x: -1.27, y: 1.27 },
    { x: 1.27, y: 0 },
  ],
  arrows: [
    [
      { x: 3.048, y: -0.762 },
      { x: 4.572, y: -2.286 },
      { x: 3.81, y: -2.286 },
      { x: 4.572, y: -2.286 },
      { x: 4.572, y: -1.524 },
    ],
    [
      { x: 1.778, y: -0.762 },
      { x: 3.302, y: -2.286 },
      { x: 2.54, y: -2.286 },
      { x: 3.302, y: -2.286 },
      { x: 3.302, y: -1.524 },
    ],
  ],
}

const PIN_SPAN_MM = KICAD_LED_ANODE_LEFT.cathode.x - KICAD_LED_ANODE_LEFT.anode.x

export type LedDrawing = {
  scale: number
  anode: Point
  cathode: Point
  lead: Point[]
  bar: Point[]
  triangle: Point[]
  arrows: Point[][]
}

export function ledDrawing(width: number, centerY: number, cathodeOnLeft = false): LedDrawing {
  const scale = width / PIN_SPAN_MM
  const map = (point: { x: number; y: number }): Point => ({
    x: (point.x - KICAD_LED_ANODE_LEFT.anode.x) * scale,
    y: centerY - point.y * scale,
  })
  const drawing: LedDrawing = {
    scale,
    anode: map(KICAD_LED_ANODE_LEFT.anode),
    cathode: map(KICAD_LED_ANODE_LEFT.cathode),
    lead: KICAD_LED_ANODE_LEFT.lead.map(map),
    bar: KICAD_LED_ANODE_LEFT.bar.map(map),
    triangle: KICAD_LED_ANODE_LEFT.triangle.map(map),
    arrows: KICAD_LED_ANODE_LEFT.arrows.map((arrow) => arrow.map(map)),
  }
  if (!cathodeOnLeft) {
    return drawing
  }
  const flip = (point: Point): Point => ({ x: width - point.x, y: point.y })
  return {
    scale,
    anode: flip(drawing.anode),
    cathode: flip(drawing.cathode),
    lead: drawing.lead.map(flip),
    bar: drawing.bar.map(flip),
    triangle: drawing.triangle.map(flip),
    arrows: drawing.arrows.map((arrow) => arrow.map(flip)),
  }
}

export function ledArrowBox(origin: Point, width: number, centerY: number, cathodeOnLeft = false): Box {
  const drawing = ledDrawing(width, centerY, cathodeOnLeft)
  const points = drawing.arrows.flat()
  const left = Math.min(...points.map((point) => point.x))
  const right = Math.max(...points.map((point) => point.x))
  const top = Math.min(...points.map((point) => point.y))
  const bottom = Math.max(...points.map((point) => point.y))
  return {
    x: origin.x + left,
    y: origin.y + top,
    width: right - left,
    height: bottom - top,
  }
}

export function kicadLedSource(): typeof KICAD_LED_ANODE_LEFT {
  return KICAD_LED_ANODE_LEFT
}

/**
 * KiCad 9.0.7 `Device:Q_NPN`. Coordinates are millimetres, Y up.
 * The collector pin is up, the base pin is left, and the emitter pin is down.
 * The filled triangle is the library emitter arrow; its tip is the vertex
 * nearest the emitter pin, so the arrow points outward.
 * Each pin graphic is 2.54 mm. The body strokes stop at the inner end of that
 * pin, so the lead is drawn as well. Without it the routed wire ends at the
 * pin and a gap remains before the body.
 * `Device:LED_RGB` is a six-pin symbol with a separate anode per colour, so a
 * common-anode package is three `Device:LED` bodies on one anode instead.
 */
const KICAD_NPN = {
  scale: 10,
  basePin: { x: -5.08, y: 0 },
  collectorPin: { x: 2.54, y: 5.08 },
  emitterPin: { x: 2.54, y: -5.08 },
  circle: { x: 1.27, y: 0, r: 2.8194 },
  leads: [
    [{ x: -5.08, y: 0 }, { x: -2.54, y: 0 }],
    [{ x: 2.54, y: 5.08 }, { x: 2.54, y: 2.54 }],
    [{ x: 2.54, y: -5.08 }, { x: 2.54, y: -2.54 }],
  ],
  lines: [
    [{ x: -2.54, y: 0 }, { x: 0.635, y: 0 }],
    [{ x: 0.635, y: 1.905 }, { x: 0.635, y: -1.905 }],
    [{ x: 0.635, y: 0.635 }, { x: 2.54, y: 2.54 }],
    [{ x: 0.635, y: -0.635 }, { x: 2.54, y: -2.54 }],
  ],
  arrow: [
    { x: 1.27, y: -1.778 },
    { x: 1.778, y: -1.27 },
    { x: 2.286, y: -2.286 },
  ],
}

export type NpnDrawing = {
  width: number
  height: number
  base: Point
  collector: Point
  emitter: Point
  lines: Point[][]
  arrow: Point[]
  circle: { cx: number; cy: number; r: number }
}

function mapNpn(point: { x: number; y: number }): Point {
  return {
    x: (point.x - KICAD_NPN.basePin.x) * KICAD_NPN.scale,
    y: (KICAD_NPN.collectorPin.y - point.y) * KICAD_NPN.scale,
  }
}

export function npnDrawing(): NpnDrawing {
  const circleRight = mapNpn({ x: KICAD_NPN.circle.x + KICAD_NPN.circle.r, y: 0 })
  const emitter = mapNpn(KICAD_NPN.emitterPin)
  return {
    width: circleRight.x,
    height: emitter.y,
    base: mapNpn(KICAD_NPN.basePin),
    collector: mapNpn(KICAD_NPN.collectorPin),
    emitter,
    lines: [...KICAD_NPN.leads, ...KICAD_NPN.lines].map((line) => line.map(mapNpn)),
    arrow: KICAD_NPN.arrow.map(mapNpn),
    circle: { cx: mapNpn(KICAD_NPN.circle).x, cy: mapNpn(KICAD_NPN.circle).y, r: KICAD_NPN.circle.r * KICAD_NPN.scale },
  }
}

export function kicadNpnSource(): typeof KICAD_NPN {
  return KICAD_NPN
}

export const RGB_DIODE_WIDTH = 56
