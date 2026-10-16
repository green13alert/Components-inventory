import type { WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type {
  BreadboardColumn,
  BreadboardHole,
  PhysicalEndpoint,
  PhysicalJumper,
  PhysicalLayout,
} from '../constants/wiring-diagrams/types.ts'
import type { StepConnection } from '../constants/walkthrough-content.ts'
import { findElement, findPort } from './wiring-diagram.ts'

const COLUMNS: BreadboardColumn[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

/** Column centres in 0.1 inch units. f–j sit across the centre channel. */
const COLUMN_X: Record<BreadboardColumn, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 6.2,
  g: 7.2,
  h: 8.2,
  i: 9.2,
  j: 10.2,
}

export const BREADBOARD_PITCH = 16

const MIN_AXIAL_SPAN = 3.2
const MAX_AXIAL_SPAN = 12

export function holeKey(hole: BreadboardHole, splitAfter: number | null): string {
  if (hole.kind === 'strip') {
    const side = hole.column < 'f' ? 'L' : 'R'
    return `strip:${side}:${hole.row}`
  }
  return `rail:${hole.side}:${hole.polarity}:${railSegment(hole.row, splitAfter)}`
}

export function holeLabel(hole: BreadboardHole): string {
  if (hole.kind === 'strip') {
    return `${hole.column}${hole.row}`
  }
  const polarity = hole.polarity === 'plus' ? '+' : '−'
  return `${hole.side} ${polarity} rail, row ${hole.row}`
}

export function railSegment(row: number, splitAfter: number | null): 'upper' | 'lower' | 'all' {
  if (splitAfter == null) {
    return 'all'
  }
  return row <= splitAfter ? 'upper' : 'lower'
}

function endpointKey(endpoint: PhysicalEndpoint, splitAfter: number | null): string {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return `${endpoint.elementId}:${endpoint.portId}`
  }
  return holeKey(endpoint as BreadboardHole, splitAfter)
}

function occupancyKey(endpoint: PhysicalEndpoint): string | null {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return null
  }
  const hole = endpoint as BreadboardHole
  if (hole.kind === 'strip') {
    return `hole:${hole.column}${hole.row}`
  }
  return `hole:rail:${hole.side}:${hole.polarity}:${hole.row}`
}

class UnionFind {
  private parent = new Map<string, string>()

  add(key: string) {
    if (!this.parent.has(key)) {
      this.parent.set(key, key)
    }
  }

  find(key: string): string {
    this.add(key)
    let current = key
    while (this.parent.get(current) !== current) {
      current = this.parent.get(current) as string
    }
    let cursor = key
    while (cursor !== current) {
      const next = this.parent.get(cursor) as string
      this.parent.set(cursor, current)
      cursor = next
    }
    return current
  }

  union(a: string, b: string) {
    const left = this.find(a)
    const right = this.find(b)
    if (left !== right) {
      this.parent.set(right, left)
    }
  }

  same(a: string, b: string) {
    return this.find(a) === this.find(b)
  }
}

function axialSpan(holes: BreadboardHole[]): number | null {
  const strips = holes.filter((hole) => hole.kind === 'strip')
  if (strips.length !== 2) {
    return null
  }
  const dx = COLUMN_X[strips[0].column] - COLUMN_X[strips[1].column]
  const dy = strips[0].row - strips[1].row
  return Math.hypot(dx, dy)
}

function portKey(layout: WiringLayout, component: string, pin: string): string | null {
  const element = findElement(layout, component)
  const port = element ? findPort(element, pin) : null
  if (!element || !port) {
    return null
  }
  return `${element.id}:${port.id}`
}

export type JumperInventory = {
  maleMale: number
  maleFemale: number
}

export function jumperInventory(physical: PhysicalLayout): JumperInventory {
  return {
    maleMale: physical.jumpers.filter((jumper) => jumper.gender === 'male-male').length,
    maleFemale: physical.jumpers.filter((jumper) => jumper.gender === 'male-female').length,
  }
}

export function validatePhysicalLayout(layout: WiringLayout, connections: readonly StepConnection[]): string[] {
  const physical = layout.physical
  if (!physical) {
    return ['This project has connections and no physical layout.']
  }
  const errors: string[] = []
  const split = physical.railSplitAfter

  const occupy = new Map<string, string>()
  const claim = (key: string | null, owner: string) => {
    if (!key) {
      return
    }
    const previous = occupy.get(key)
    if (previous) {
      errors.push(`${key} is used by ${previous} and ${owner}.`)
    } else {
      occupy.set(key, owner)
    }
  }

  const checkHole = (hole: BreadboardHole, owner: string) => {
    if (hole.kind === 'strip') {
      if (!COLUMNS.includes(hole.column) || hole.row < 1 || hole.row > physical.rows) {
        errors.push(`${owner} uses ${holeLabel(hole)}, which is outside the ${physical.rows}-row board.`)
      }
    } else if (hole.row < 1 || hole.row > physical.rows) {
      errors.push(`${owner} uses a rail hole on row ${hole.row}, outside the board.`)
    }
  }

  for (const lead of physical.leads) {
    const element = layout.elements.find((item) => item.id === lead.elementId)
    if (!element) {
      errors.push(`Lead ${lead.elementId} ${lead.portId} is not a diagram component.`)
      continue
    }
    if (!findPort(element, lead.portId)) {
      errors.push(`${element.label} has no terminal ${lead.portId}.`)
    }
    checkHole(lead.hole, `${element.label} ${lead.portId}`)
    claim(occupancyKey(lead.hole), `${element.label} ${lead.portId}`)
  }

  for (const jumper of physical.jumpers) {
    for (const end of [jumper.from, jumper.to]) {
      if ('kind' in end && end.kind === 'module') {
        const element = layout.elements.find((item) => item.id === end.elementId)
        if (!element || !findPort(element, end.portId)) {
          errors.push(`Jumper ${jumper.id} ends at missing pin ${end.elementId} ${end.portId}.`)
        }
      } else {
        checkHole(end as BreadboardHole, jumper.id)
        claim(occupancyKey(end), jumper.id)
      }
    }
  }

  const nets = buildPhysicalNets(layout, physical)
  const schematic = new UnionFind()
  const placed = new Set<string>()
  for (const lead of physical.leads) {
    placed.add(`${lead.elementId}:${lead.portId}`)
  }
  for (const binding of physical.railBindings) {
    placed.add(`${binding.elementId}:${binding.portId}`)
  }
  for (const jumper of physical.jumpers) {
    for (const end of [jumper.from, jumper.to]) {
      if ('kind' in end && end.kind === 'module') {
        placed.add(`${end.elementId}:${end.portId}`)
      }
    }
  }

  for (const connection of connections) {
    const from = portKey(layout, connection.fromComponent, connection.fromPin)
    const to = portKey(layout, connection.toComponent, connection.toPin)
    if (!from || !to) {
      continue
    }
    schematic.add(from)
    schematic.add(to)
    schematic.union(from, to)
    if (!placed.has(from)) {
      errors.push(`${connection.fromComponent} ${connection.fromPin} is not placed on the physical layout.`)
    }
    if (!placed.has(to)) {
      errors.push(`${connection.toComponent} ${connection.toPin} is not placed on the physical layout.`)
    }
    if (placed.has(from) && placed.has(to) && !nets.same(from, to)) {
      errors.push(`${connection.fromComponent} ${connection.fromPin} does not reach ${connection.toComponent} ${connection.toPin} on the breadboard.`)
    }
  }

  const schematicNets = new Map<string, string>()
  for (const connection of connections) {
    const from = portKey(layout, connection.fromComponent, connection.fromPin)
    const to = portKey(layout, connection.toComponent, connection.toPin)
    if (!from || !to || !placed.has(from) || !placed.has(to)) {
      continue
    }
    const group = schematic.find(from)
    const physicalNet = nets.find(from)
    const previous = schematicNets.get(group)
    if (previous && previous !== physicalNet) {
      errors.push(`Schematic net ${connection.fromPin} is split across two breadboard nets.`)
    }
    schematicNets.set(group, physicalNet)
  }
  const seenPhysical = new Map<string, string>()
  for (const [group, physicalNet] of schematicNets) {
    const previous = seenPhysical.get(physicalNet)
    if (previous && previous !== group) {
      errors.push('Two schematic nets share one breadboard strip or rail.')
    }
    seenPhysical.set(physicalNet, group)
  }

  for (const element of layout.elements) {
    const leads = physical.leads.filter((lead) => lead.elementId === element.id)
    if (element.kind === 'resistor' && leads.length === 2) {
      const span = axialSpan(leads.map((lead) => lead.hole))
      if (span != null && (span < MIN_AXIAL_SPAN || span > MAX_AXIAL_SPAN)) {
        errors.push(`${element.label} spans ${span.toFixed(1)} breadboard units. A 1/4 W resistor needs about 3.2 to 12.`)
      }
    }
    if (element.kind === 'npn' && leads.length === 3) {
      const strips = leads.map((lead) => lead.hole).filter((hole) => hole.kind === 'strip')
      if (strips.length === 3) {
        const columns = new Set(strips.map((hole) => hole.column))
        const rows = strips.map((hole) => hole.row).sort((a, b) => a - b)
        if (columns.size !== 1 || rows[1] !== rows[0] + 1 || rows[2] !== rows[1] + 1) {
          errors.push(`${element.label} leads are not in three neighbouring holes of one column.`)
        }
      }
    }
    if (element.kind === 'rgb-led' && leads.length === 4) {
      const byPort = new Map(leads.map((lead) => [lead.portId, lead.hole]))
      const order = ['red', 'anode', 'blue', 'green'].map((portId) => byPort.get(portId))
      if (order.every((hole) => hole && hole.kind === 'strip')) {
        const strips = order as Extract<BreadboardHole, { kind: 'strip' }>[]
        const columns = new Set(strips.map((hole) => hole.column))
        const rows = strips.map((hole) => hole.row)
        const increasing = rows.every((row, index) => index === 0 || row === rows[index - 1] + 1)
        if (columns.size !== 1 || !increasing) {
          errors.push('RGB LED leads are not in column order red, anode, blue, green on neighbouring rows.')
        }
      }
    }
    if (element.kind === 'led' && leads.length === 2) {
      const strips = leads.map((lead) => lead.hole).filter((hole) => hole.kind === 'strip')
      if (strips.length === 2) {
        const sameColumn = strips[0].column === strips[1].column
        const adjacent = Math.abs(strips[0].row - strips[1].row) === 1
        if (!sameColumn || !adjacent) {
          errors.push(`${element.label} leads are not in neighbouring holes of one column.`)
        }
      }
    }
  }

  errors.push(...jumperGenderErrors(layout, physical.jumpers))
  return errors
}

function jumperGenderErrors(layout: WiringLayout, jumpers: PhysicalJumper[]): string[] {
  const errors: string[] = []
  for (const jumper of jumpers) {
    const ends = [jumper.from, jumper.to]
    const moduleEnds = ends.filter((end) => 'kind' in end && end.kind === 'module') as Extract<
      PhysicalEndpoint,
      { kind: 'module' }
    >[]
    const holeEnds = ends.length - moduleEnds.length
    if (holeEnds === 2 && jumper.gender !== 'male-male') {
      errors.push(`${jumper.id} joins two breadboard holes and must be male-to-male.`)
    }
    if (moduleEnds.length === 2 && jumper.gender !== 'male-male') {
      errors.push(`${jumper.id} joins two module pins and must be male-to-male.`)
    }
    if (moduleEnds.length === 1 && holeEnds === 1) {
      const element = layout.elements.find((item) => item.id === moduleEnds[0].elementId)
      const expectsFemale = element?.kind === 'esp32-devkit'
      if (expectsFemale && jumper.gender !== 'male-female') {
        errors.push(`${jumper.id} leaves a male DevKit header and must be male-to-female.`)
      }
      if (element && element.kind !== 'esp32-devkit' && jumper.gender !== 'male-male') {
        errors.push(`${jumper.id} leaves ${element.label} and must be male-to-male.`)
      }
    }
  }
  return errors
}

function buildPhysicalNets(layout: WiringLayout, physical: PhysicalLayout): UnionFind {
  const nets = new UnionFind()
  const split = physical.railSplitAfter
  for (const lead of physical.leads) {
    const terminal = `${lead.elementId}:${lead.portId}`
    const node = holeKey(lead.hole, split)
    nets.union(terminal, node)
  }
  for (const binding of physical.railBindings) {
    const terminal = `${binding.elementId}:${binding.portId}`
    const segment = split == null ? 'all' : binding.segment
    nets.union(terminal, `rail:${binding.side}:${binding.polarity}:${segment}`)
  }
  for (const jumper of physical.jumpers) {
    nets.union(endpointKey(jumper.from, split), endpointKey(jumper.to, split))
  }
  // A rail hole belongs to its segment node.
  for (const jumper of physical.jumpers) {
    for (const end of [jumper.from, jumper.to]) {
      if (!('kind' in end) || end.kind !== 'module') {
        const hole = end as BreadboardHole
        if (hole.kind === 'rail') {
          nets.union(holeKey(hole, split), endpointKey(hole, split))
        }
      }
    }
  }
  void layout
  return nets
}

export function holePosition(hole: BreadboardHole): { x: number; y: number } {
  const y = 36 + (hole.row - 1) * BREADBOARD_PITCH
  if (hole.kind === 'rail') {
    const x =
      hole.side === 'left'
        ? hole.polarity === 'plus'
          ? 18
          : 36
        : hole.polarity === 'plus'
          ? 248
          : 266
    return { x, y }
  }
  const index = COLUMNS.indexOf(hole.column)
  const x = index < 5 ? 62 + index * BREADBOARD_PITCH : 62 + 5 * BREADBOARD_PITCH + 20 + (index - 5) * BREADBOARD_PITCH
  return { x, y }
}

export const PHYSICAL_BOARD_WIDTH = 340
export const physicalBoardHeight = (rows: number) => 52 + rows * BREADBOARD_PITCH

export function describePlacements(layout: WiringLayout, connections: readonly StepConnection[]): string[] {
  const physical = layout.physical
  if (!physical) {
    return []
  }
  const active = activePortIds(layout, connections)
  const lines: string[] = []
  for (const lead of physical.leads) {
    const key = `${lead.elementId}:${lead.portId}`
    if (!active.has(key)) {
      continue
    }
    const element = layout.elements.find((item) => item.id === lead.elementId)
    const port = element ? findPort(element, lead.portId) : null
    lines.push(`${element?.label ?? lead.elementId} ${port?.label ?? lead.portId}: ${holeLabel(lead.hole)}`)
  }
  for (const jumper of physical.jumpers) {
    const ends = [jumper.from, jumper.to]
    const touches = ends.some((end) => 'kind' in end && end.kind === 'module' && active.has(`${end.elementId}:${end.portId}`))
    const holeTouchesActiveLead = ends.some((end) => {
      if ('kind' in end && end.kind === 'module') {
        return false
      }
      return physical.leads.some((lead) => active.has(`${lead.elementId}:${lead.portId}`) && holeKey(lead.hole, physical.railSplitAfter) === holeKey(end as BreadboardHole, physical.railSplitAfter))
    })
    if (!touches && !holeTouchesActiveLead && connections.length > 0) {
      const bindingHit = physical.railBindings.some((binding) => {
        if (!active.has(`${binding.elementId}:${binding.portId}`)) {
          return false
        }
        return ends.some((end) => {
          if ('kind' in end && end.kind === 'module') {
            return false
          }
          const hole = end as BreadboardHole
          return hole.kind === 'rail' && hole.side === binding.side && hole.polarity === binding.polarity
        })
      })
      if (!bindingHit) {
        continue
      }
    }
    if (connections.length === 0) {
      continue
    }
    lines.push(jumperLine(layout, jumper))
  }
  return lines
}

function jumperLine(layout: WiringLayout, jumper: PhysicalJumper): string {
  const end = (endpoint: PhysicalEndpoint) => {
    if ('kind' in endpoint && endpoint.kind === 'module') {
      const element = layout.elements.find((item) => item.id === endpoint.elementId)
      const port = element ? findPort(element, endpoint.portId) : null
      return `${element?.label ?? endpoint.elementId} ${port?.label ?? endpoint.portId}`
    }
    return holeLabel(endpoint)
  }
  const gender = jumper.gender === 'male-female' ? 'male-to-female' : 'male-to-male'
  return `${gender}: ${end(jumper.from)} → ${end(jumper.to)}`
}

export function activePortIds(layout: WiringLayout, connections: readonly StepConnection[]): Set<string> {
  const ids = new Set<string>()
  for (const connection of connections) {
    const from = portKey(layout, connection.fromComponent, connection.fromPin)
    const to = portKey(layout, connection.toComponent, connection.toPin)
    if (from) {
      ids.add(from)
    }
    if (to) {
      ids.add(to)
    }
  }
  return ids
}
