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

export function ledDrawing(width: number, centerY: number): LedDrawing {
  const scale = width / PIN_SPAN_MM
  const map = (point: { x: number; y: number }): Point => ({
    x: (point.x - KICAD_LED_ANODE_LEFT.anode.x) * scale,
    y: centerY - point.y * scale,
  })
  return {
    scale,
    anode: map(KICAD_LED_ANODE_LEFT.anode),
    cathode: map(KICAD_LED_ANODE_LEFT.cathode),
    lead: KICAD_LED_ANODE_LEFT.lead.map(map),
    bar: KICAD_LED_ANODE_LEFT.bar.map(map),
    triangle: KICAD_LED_ANODE_LEFT.triangle.map(map),
    arrows: KICAD_LED_ANODE_LEFT.arrows.map((arrow) => arrow.map(map)),
  }
}

export function ledArrowBox(origin: Point, width: number, centerY: number): Box {
  const drawing = ledDrawing(width, centerY)
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
