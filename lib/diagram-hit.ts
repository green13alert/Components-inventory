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
  if (part.kind === 'pir' || part.kind === 'buzzer' || part.kind === 'joystick') {
    const ys = part.leads.map((lead) => lead.at.y)
    const top = Math.min(...ys)
    const bottom = Math.max(...ys)
    return box(part.id, part.leads[0].at.x, top - 8, part.kind === 'joystick' ? 84 : 72, bottom - top + 16, 6)
  }
  if (part.kind === 'esp32' || part.kind === 'uno' || part.kind === 'servo' || part.kind === 'psu' || part.kind === 'bme280') {
    return box(part.id, part.x, part.y, part.width, part.height, 6)
  }
  return box(part.id, 0, 0, 28, 28)
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
