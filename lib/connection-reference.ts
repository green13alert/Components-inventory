import type { WiringElementDef, WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { PhysicalEndpoint, PhysicalJumper } from '../constants/wiring-diagrams/types.ts'
import type { StepConnection, WiringSignal } from '../constants/walkthrough-content.ts'
import { holeLabel } from './breadboard-layout.ts'
import { findPort } from './wiring-diagram.ts'

export type ConnectionStatus = 'this-step' | 'installed'

export type ConnectionEntry = {
  id: string
  group: string
  title: string
  detail: string
  status: ConnectionStatus
}

const GROUP_ORDER = ['Power', 'Ground', 'Red channel', 'Green channel', 'Blue channel', 'Signals']

const SIGNAL_LABEL: Record<WiringSignal, string> = {
  power: 'Power',
  ground: 'Ground',
  signal: 'Signal',
}

function connectionKey(row: StepConnection) {
  return `${row.fromComponent}|${row.fromPin}|${row.toComponent}|${row.toPin}`
}

function groupFor(row: StepConnection) {
  if (row.signal === 'power') {
    return 'Power'
  }
  if (row.signal === 'ground') {
    return 'Ground'
  }
  const text = `${row.fromComponent} ${row.fromPin} ${row.toComponent} ${row.toPin}`
  if (/red|io25|gpio25/i.test(text)) {
    return 'Red channel'
  }
  if (/green|io26|gpio26/i.test(text)) {
    return 'Green channel'
  }
  if (/blue|io27|gpio27/i.test(text)) {
    return 'Blue channel'
  }
  return 'Signals'
}

function findElement(layout: WiringLayout, name: string): WiringElementDef | undefined {
  const key = name.trim().toLowerCase()
  return layout.elements.find(
    (element) => element.label.toLowerCase() === key || element.aliases?.some((alias) => alias.toLowerCase() === key),
  )
}

function endpointHole(layout: WiringLayout, endpoint: PhysicalEndpoint): string | null {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return null
  }
  return holeLabel(endpoint)
}

function jumperTouching(layout: WiringLayout, elementId: string, portId: string): PhysicalJumper | undefined {
  return layout.physical?.jumpers.find((jumper) =>
    [jumper.from, jumper.to].some((endpoint) => 'kind' in endpoint && endpoint.kind === 'module' && endpoint.elementId === elementId && endpoint.portId === portId),
  )
}

function holeFor(layout: WiringLayout | null, component: string, pin: string): string | null {
  if (!layout?.physical) {
    return null
  }
  const element = findElement(layout, component)
  const port = element ? findPort(element, pin) : null
  if (!element || !port) {
    return null
  }
  const lead = layout.physical.leads.find((item) => item.elementId === element.id && item.portId === port.id)
  if (lead) {
    return holeLabel(lead.hole)
  }
  const jumper = jumperTouching(layout, element.id, port.id)
  if (!jumper) {
    return null
  }
  const other = 'kind' in jumper.from && jumper.from.kind === 'module' && jumper.from.elementId === element.id && jumper.from.portId === port.id ? jumper.to : jumper.from
  return endpointHole(layout, other)
}

function wireKind(layout: WiringLayout | null, row: StepConnection): string | null {
  if (!layout?.physical) {
    return null
  }
  const from = findElement(layout, row.fromComponent)
  const fromPort = from ? findPort(from, row.fromPin) : null
  const jumper = from && fromPort ? jumperTouching(layout, from.id, fromPort.id) : undefined
  if (!jumper) {
    return null
  }
  return jumper.gender === 'male-female' ? 'Male-to-female' : 'Male-to-male'
}

/**
 * Connections already introduced, taken from the step netlist.
 * A later step's wires are absent until that step is reached.
 */
export function connectionReference(
  layout: WiringLayout | null,
  current: readonly StepConnection[],
  prior: readonly StepConnection[] = [],
): ConnectionEntry[] {
  const seen = new Set<string>()
  const entries: ConnectionEntry[] = []
  const add = (row: StepConnection, status: ConnectionStatus) => {
    const id = connectionKey(row)
    if (seen.has(id)) {
      return
    }
    seen.add(id)
    const holes = [holeFor(layout, row.fromComponent, row.fromPin), holeFor(layout, row.toComponent, row.toPin)].filter(
      (hole): hole is string => Boolean(hole),
    )
    const detail = [row.signal ? SIGNAL_LABEL[row.signal] : null, wireKind(layout, row), holes.length > 0 ? holes.join(' → ') : null]
      .filter((part): part is string => Boolean(part))
      .join(' · ')
    entries.push({
      id,
      group: groupFor(row),
      title: `${row.fromComponent} ${row.fromPin} → ${row.toComponent} ${row.toPin}`,
      detail,
      status,
    })
  }
  for (const row of current) {
    add(row, 'this-step')
  }
  for (const row of prior) {
    add(row, 'installed')
  }
  return entries.sort((a, b) => {
    const group = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
    if (group !== 0) {
      return group
    }
    if (a.status !== b.status) {
      return a.status === 'this-step' ? -1 : 1
    }
    return a.title.localeCompare(b.title)
  })
}
