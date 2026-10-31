export type Point = { x: number; y: number }

export type Box = { x: number; y: number; width: number; height: number }

export type NetSegment = {
  netId: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export type SchematicJunction = {
  x: number
  y: number
  netId: string
}

const EPS = 0.01

export function pointKey(point: Point): string {
  return `${point.x},${point.y}`
}

export function segmentsOf(wires: { netId: string; points: Point[] }[]): NetSegment[] {
  const segments: NetSegment[] = []
  for (const wire of wires) {
    for (let index = 1; index < wire.points.length; index += 1) {
      const from = wire.points[index - 1]
      const to = wire.points[index]
      if (Math.abs(from.x - to.x) < EPS && Math.abs(from.y - to.y) < EPS) {
        continue
      }
      segments.push({ netId: wire.netId, x1: from.x, y1: from.y, x2: to.x, y2: to.y })
    }
  }
  return segments
}

function keyOf(x: number, y: number): string {
  return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`
}

function isEndpoint(x: number, y: number, segment: NetSegment): boolean {
  return (Math.abs(x - segment.x1) < EPS && Math.abs(y - segment.y1) < EPS) || (Math.abs(x - segment.x2) < EPS && Math.abs(y - segment.y2) < EPS)
}

export function onSegmentInterior(x: number, y: number, segment: NetSegment): boolean {
  if (isEndpoint(x, y, segment)) {
    return false
  }
  const cross = (y - segment.y1) * (segment.x2 - segment.x1) - (x - segment.x1) * (segment.y2 - segment.y1)
  if (Math.abs(cross) > 0.5) {
    return false
  }
  const withinX = x >= Math.min(segment.x1, segment.x2) - EPS && x <= Math.max(segment.x1, segment.x2) + EPS
  const withinY = y >= Math.min(segment.y1, segment.y2) - EPS && y <= Math.max(segment.y1, segment.y2) + EPS
  return withinX && withinY
}

/**
 * A junction is a point where one net's routed wires branch.
 * A crossing of two nets is not a junction, and a pin count is not one either.
 */
export function junctionsFromWires(wires: { netId: string; points: Point[] }[]): SchematicJunction[] {
  const segments = segmentsOf(wires)
  const degree = new Map<string, { x: number; y: number; netId: string; count: number; mixed: boolean }>()
  const add = (x: number, y: number, netId: string, count: number) => {
    const key = keyOf(x, y)
    const existing = degree.get(key)
    if (!existing) {
      degree.set(key, { x, y, netId, count, mixed: false })
      return
    }
    existing.count += count
    if (existing.netId !== netId) {
      existing.mixed = true
    }
  }

  for (const segment of segments) {
    add(segment.x1, segment.y1, segment.netId, 1)
    add(segment.x2, segment.y2, segment.netId, 1)
  }

  for (const segment of segments) {
    for (const end of [
      { x: segment.x1, y: segment.y1 },
      { x: segment.x2, y: segment.y2 },
    ]) {
      for (const other of segments) {
        if (other === segment || other.netId !== segment.netId) {
          continue
        }
        if (onSegmentInterior(end.x, end.y, other)) {
          add(end.x, end.y, segment.netId, 2)
        }
      }
    }
  }

  return [...degree.values()]
    .filter((point) => !point.mixed && point.count >= 3)
    .map((point) => ({ x: point.x, y: point.y, netId: point.netId }))
    .sort((left, right) => left.y - right.y || left.x - right.x || left.netId.localeCompare(right.netId))
}

export function segmentIntersection(left: NetSegment, right: NetSegment): Point | null {
  const dx1 = left.x2 - left.x1
  const dy1 = left.y2 - left.y1
  const dx2 = right.x2 - right.x1
  const dy2 = right.y2 - right.y1
  const denom = dx1 * dy2 - dy1 * dx2
  if (Math.abs(denom) < EPS) {
    return null
  }
  const t = ((right.x1 - left.x1) * dy2 - (right.y1 - left.y1) * dx2) / denom
  const u = ((right.x1 - left.x1) * dy1 - (right.y1 - left.y1) * dx1) / denom
  if (t <= EPS || t >= 1 - EPS || u <= EPS || u >= 1 - EPS) {
    return null
  }
  return { x: left.x1 + t * dx1, y: left.y1 + t * dy1 }
}

export function boxesOverlap(left: Box, right: Box, gap = 0): boolean {
  return left.x < right.x + right.width + gap && left.x + left.width + gap > right.x && left.y < right.y + right.height + gap && left.y + left.height + gap > right.y
}

function strictlyInside(point: Point, box: Box): boolean {
  return point.x > box.x + 0.5 && point.x < box.x + box.width - 0.5 && point.y > box.y + 0.5 && point.y < box.y + box.height - 0.5
}

export function segmentHitsBox(from: Point, to: Point, box: Box): boolean {
  if (strictlyInside(from, box) || strictlyInside(to, box)) {
    return true
  }
  const edges: NetSegment[] = [
    { netId: '', x1: box.x, y1: box.y, x2: box.x + box.width, y2: box.y },
    { netId: '', x1: box.x + box.width, y1: box.y, x2: box.x + box.width, y2: box.y + box.height },
    { netId: '', x1: box.x, y1: box.y + box.height, x2: box.x + box.width, y2: box.y + box.height },
    { netId: '', x1: box.x, y1: box.y, x2: box.x, y2: box.y + box.height },
  ]
  const wire = { netId: '', x1: from.x, y1: from.y, x2: to.x, y2: to.y }
  return edges.some((edge) => segmentIntersection(wire, edge) != null)
}

export function segmentHitsLabel(from: Point, to: Point, label: Box): boolean {
  return segmentHitsBox(from, to, label) || strictlyInside(from, label) || strictlyInside(to, label)
}
