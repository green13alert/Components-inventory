import type { PhysicalScene, Point, ScenePart } from './physical-scene.ts'

export type HitBox = { id: string; x: number; y: number; width: number; height: number }

function box(id: string, x: number, y: number, width: number, height: number, pad = 8): HitBox {
  return { id, x: x - pad, y: y - pad, width: width + pad * 2, height: height + pad * 2 }
}

export function partHitBox(part: ScenePart): HitBox {
  if (part.kind === 'resistor') {
    const x = Math.min(part.a.x, part.b.x)
    const y = Math.min(part.a.y, part.b.y)
    return box(part.id, x, y, Math.abs(part.b.x - part.a.x) || 18, Math.abs(part.b.y - part.a.y) || 18, 10)
  }
  if (part.kind === 'npn') {
    const top = Math.min(part.emitter.y, part.base.y, part.collector.y)
    const bottom = Math.max(part.emitter.y, part.base.y, part.collector.y)
    return box(part.id, part.emitter.x - 40, top - 4, 48, bottom - top + 8, 6)
  }
  if (part.kind === 'led') {
    const top = Math.min(part.anode.y, part.cathode.y)
    return box(part.id, part.anode.x, top - 8, 36, Math.abs(part.cathode.y - part.anode.y) + 16, 8)
  }
  if (part.kind === 'rgb-led') {
    const ys = part.leads.map((lead) => lead.at.y)
    const top = Math.min(...ys)
    const bottom = Math.max(...ys)
    return box(part.id, part.leads[0].at.x - 48, top, 56, bottom - top, 6)
  }
  if ('width' in part && 'x' in part) {
    return box(part.id, part.x, part.y, part.width, part.height, 6)
  }
  if (part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick' || part.kind === 'led-matrix') {
    const ys = part.leads.map((lead) => lead.at.y)
    const top = Math.min(...ys)
    const bottom = Math.max(...ys)
    const width = part.kind === 'led-matrix' ? 112 : part.kind === 'joystick' ? 84 : 72
    return box(part.id, part.leads[0].at.x, top - 8, width, bottom - top + 16, 6)
  }
  return box(part.id, 0, 0, 28, 28)
}

export const WIRE_HIT_RADIUS = 16

function pointSegmentDistance(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSq = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq))
  return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t))
}

export function distanceToWire(wire: { d: string }, point: Point) {
  const numbers = wire.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  let best = Number.POSITIVE_INFINITY
  for (let index = 0; index + 3 < numbers.length; index += 2) {
    best = Math.min(
      best,
      pointSegmentDistance(point, { x: numbers[index], y: numbers[index + 1] }, { x: numbers[index + 2], y: numbers[index + 3] }),
    )
  }
  return best
}

/** Closest wire whose path passes within the touch radius. A near-tie keeps the earlier wire. */
export function hitTestWire(scene: PhysicalScene, point: Point, radius = WIRE_HIT_RADIUS): string | null {
  let best: { id: string; distance: number } | null = null
  for (const wire of scene.wires) {
    const distance = distanceToWire(wire, point)
    if (distance > radius) {
      continue
    }
    if (!best || distance < best.distance - 0.5) {
      best = { id: wire.id, distance }
    }
  }
  return best?.id ?? null
}

function pointInPartBody(part: ScenePart, point: Point) {
  if ('width' in part && 'x' in part) {
    return point.x >= part.x && point.x <= part.x + part.width && point.y >= part.y && point.y <= part.y + part.height
  }
  return false
}

export type SceneHit = { kind: 'wire'; id: string } | { kind: 'part'; id: string }

/**
 * A tap on a wire corridor selects that wire. A tap inside a module body selects the module,
 * unless the finger is sitting on the wire itself. The breadboard does not steal a wire tap.
 */
export function hitTestSceneTarget(scene: PhysicalScene, point: Point): SceneHit | null {
  const wireId = hitTestWire(scene, point)
  const partId = hitTestScene(scene, point)
  if (wireId) {
    const wire = scene.wires.find((item) => item.id === wireId)
    const distance = wire ? distanceToWire(wire, point) : Number.POSITIVE_INFINITY
    const part = partId ? scene.parts.find((item) => item.id === partId) : undefined
    if (part && pointInPartBody(part, point) && distance > 10) {
      return { kind: 'part', id: part.id }
    }
    return { kind: 'wire', id: wireId }
  }
  if (partId) {
    return { kind: 'part', id: partId }
  }
  return null
}

export function hitTestScene(scene: PhysicalScene, point: Point): string | null {
  const hits = scene.parts
    .map(partHitBox)
    .filter((item) => point.x >= item.x && point.x <= item.x + item.width && point.y >= item.y && point.y <= item.y + item.height)
    .sort((a, b) => a.width * a.height - b.width * b.height)
  if (hits[0]) {
    return hits[0].id
  }
  const board = scene.board
  if (point.x >= board.x && point.x <= board.x + board.width && point.y >= board.y && point.y <= board.y + board.height) {
    return 'breadboard'
  }
  return null
}

/** Maps a viewport tap back to scene coordinates. Scale is applied about the viewport centre, then translation. */
export function viewerPointToScene(input: {
  x: number
  y: number
  scale: number
  translateX: number
  translateY: number
  viewportWidth: number
  viewportHeight: number
  fittedWidth: number
  fittedHeight: number
  sceneWidth: number
  sceneHeight: number
}) {
  const scale = input.scale || 1
  const centerX = input.viewportWidth / 2
  const centerY = input.viewportHeight / 2
  const layoutX = centerX + (input.x - input.translateX - centerX) / scale
  const layoutY = centerY + (input.y - input.translateY - centerY) / scale
  const originX = (input.viewportWidth - input.fittedWidth) / 2
  const originY = (input.viewportHeight - input.fittedHeight) / 2
  return {
    x: ((layoutX - originX) / input.fittedWidth) * input.sceneWidth,
    y: ((layoutY - originY) / input.fittedHeight) * input.sceneHeight,
  }
}
